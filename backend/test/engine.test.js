import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tfidfVectors, cosineSimilarity, stem, tokenize } from '../services/nlp.js';
import { extractSkills } from '../utils/skills.js';
import { extractText, parseResume } from '../services/parser.js';
import { analyze } from '../services/analyzer.js';

const SAMPLES = new URL('../../samples/', import.meta.url);

test('cosine similarity: identical = 1, disjoint = 0', () => {
  const [a, b, c] = tfidfVectors([['react', 'node'], ['react', 'node'], ['java', 'spring']]);
  assert.ok(Math.abs(cosineSimilarity(a, b) - 1) < 1e-9);
  assert.equal(cosineSimilarity(a, c), 0);
});

test('tokenizer keeps tech tokens and stemmer merges inflections', () => {
  assert.deepEqual(tokenize('Built with C++, C# and Node.js.'), ['built', 'c++', 'c#', 'node.js']);
  assert.equal(stem('optimized'), stem('optimize'));
  assert.equal(stem('libraries'), 'library');
});

test('skill extraction avoids false positives', () => {
  const s = extractSkills('I know C++ and Java. Let us go home. Worked on REST APIs with React.js');
  assert.ok(s.technical.includes('C++') && s.technical.includes('Java') && s.technical.includes('React'));
  assert.ok(!s.technical.includes('C') && !s.technical.includes('Go') && !s.technical.includes('JavaScript'));
});

for (const ext of ['.pdf', '.docx']) {
  test(`end-to-end analysis of sample resume ${ext}`, async () => {
    const raw = await extractText(fs.readFileSync(new URL(`sample_resume${ext}`, SAMPLES)), ext);
    const jd = fs.readFileSync(new URL('sample_job_description.txt', SAMPLES), 'utf8');
    const r = analyze(parseResume(raw), jd);
    assert.equal(r.candidate.name, 'Aarav Mehta');
    assert.equal(r.candidate.email, 'aarav.mehta@example.com');
    assert.equal(r.candidate.phone, '+91 98765 43210');
    assert.ok(r.score.overall > 0 && r.score.overall <= 100);
    assert.ok(r.jobMatch.missingSkills.includes('TypeScript'));
    assert.ok(r.jobMatch.matchedSkills.includes('React'));
    assert.equal(r.experience[0].bullets.length, 3);
  });
}

test('phone formats', () => {
  for (const [line, want] of [['Phone: (+91) 91234-56789', '(+91) 91234-56789'], ['+1 (555) 123-4567', '+1 (555) 123-4567'], ['9876543210', '9876543210'], ['B.Tech 2022 - 2026', null]]) {
    assert.equal(parseResume(`Some Name\n${line}`).candidate.phone, want);
  }
});

test('missing info is reported as null, never invented', () => {
  const r = analyze(parseResume('Some text about projects without any contact details at all, repeated a few times to be long enough.'));
  assert.equal(r.candidate.name, null);
  assert.equal(r.candidate.email, null);
  assert.equal(r.candidate.phone, null);
  assert.equal(r.jobMatch, null);
});

test('parser handles ligatures, inline colon headings, dotted LinkedIn and skips Resume/title lines', () => {
  const raw = [
    'Curriculum Vitae',
    'Full Stack Developer',
    'Priya Sharma',
    'priya@example.com | linkedin.com/in/priya.sharma',
    'Skills: React, Node.js, MongoDB',
    'Relevant Experience',
    'Software Intern (05/2024 - Present)',
    '• Built workﬂow and proﬁle APIs.',
  ].join('\n');
  const parsed = parseResume(raw);
  assert.equal(parsed.candidate.name, 'Priya Sharma');
  assert.equal(parsed.candidate.linkedin, 'linkedin.com/in/priya.sharma');
  assert.ok(parsed.sections.skills?.[0].includes('React'));
  assert.equal(parsed.experience.dateRanges[0], '05/2024 - Present');
  assert.ok(parsed.text.includes('workflow') && parsed.text.includes('profile'));
});
