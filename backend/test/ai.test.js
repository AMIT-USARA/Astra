import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

// Fake OpenAI endpoint so the request/response handling is tested without a real key.
let reply = { status: 200, body: {} };
let lastRequest = null;
const server = http.createServer((req, res) => {
  let data = '';
  req.on('data', (c) => (data += c));
  req.on('end', () => {
    lastRequest = { url: req.url, auth: req.headers.authorization, body: JSON.parse(data) };
    res.writeHead(reply.status, { 'Content-Type': 'application/json' }).end(JSON.stringify(reply.body));
  });
});
await new Promise((r) => server.listen(0, r));
after(() => server.close());

process.env.OPENAI_BASE_URL = `http://127.0.0.1:${server.address().port}`;
process.env.OPENAI_MODEL = 'test-model';
const { aiReview } = await import('../services/ai.js');

const review = {
  summary: 'Solid student resume.',
  strengths: ['Clear projects'],
  improvements: [{ section: 'Experience', issue: 'No metrics.', suggestion: 'Add numbers.' }],
  rewrittenBullets: [{ original: 'Made website', improved: 'Built a React website used by [X] students' }],
  jobFit: { score: 140, verdict: 'Good fit.', matchedRequirements: ['React'], missingRequirements: ['Docker'] },
};
const completion = (content) => ({ model: 'test-model-2026', choices: [{ message: { content: JSON.stringify(content) } }] });

test('no key -> null (feature off)', async () => {
  delete process.env.OPENAI_API_KEY;
  assert.equal(await aiReview('resume', 'jd'), null);
});

test('sends a strict json_schema request and parses the review', async () => {
  process.env.OPENAI_API_KEY = 'sk-test';
  reply = { status: 200, body: completion(review) };
  const out = await aiReview('My resume text', 'Need React and Docker');
  assert.equal(lastRequest.url, '/chat/completions');
  assert.equal(lastRequest.auth, 'Bearer sk-test');
  assert.equal(lastRequest.body.model, 'test-model');
  assert.equal(lastRequest.body.response_format.json_schema.strict, true);
  assert.match(lastRequest.body.messages[1].content, /My resume text[\s\S]*Need React and Docker/);
  assert.equal(out.model, 'test-model-2026');
  assert.equal(out.jobFit.score, 100); // clamped
  assert.equal(out.rewrittenBullets[0].original, 'Made website');
});

test('jobFit forced to null when no JD', async () => {
  reply = { status: 200, body: completion(review) };
  assert.equal((await aiReview('My resume text', '')).jobFit, null);
});

test('API errors become a readable message, not a crash', async () => {
  reply = { status: 401, body: { error: { message: 'Incorrect API key' } } };
  assert.deepEqual(await aiReview('x', ''), { error: 'AI review unavailable: the API key was rejected.' });
  reply = { status: 429, body: {} };
  assert.match((await aiReview('x', '')).error, /rate limit or quota/);
});
