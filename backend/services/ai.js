// OpenAI review layered on top of the rule-based analysis. Without OPENAI_API_KEY it
// returns null and the app works exactly as before; an API failure never fails the upload.
const MODEL = process.env.OPENAI_MODEL || 'gpt-6-luna';
const BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

const str = { type: 'string' };
const list = (items) => ({ type: 'array', items });
const obj = (properties) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });

const SCHEMA = obj({
  summary: str,
  strengths: list(str),
  improvements: list(obj({ section: str, issue: str, suggestion: str })),
  rewrittenBullets: list(obj({ original: str, improved: str })),
  jobFit: {
    anyOf: [
      obj({ score: { type: 'integer' }, verdict: str, matchedRequirements: list(str), missingRequirements: list(str) }),
      { type: 'null' },
    ],
  },
});

const SYSTEM = `You are an experienced technical recruiter reviewing a student's resume.
Rules:
- Use only facts present in the resume text. Never invent experience, numbers, skills or employers.
- "summary": 2-3 sentences on how the resume reads overall.
- "strengths": 3-5 specific strengths.
- "improvements": 3-6 concrete fixes; "section" is the resume section it applies to.
- "rewrittenBullets": up to 4 weak bullet points copied verbatim as "original", with a stronger "improved" version. Do not add numbers that are not in the original; use [X] as a placeholder where a metric belongs.
- "jobFit": null when no job description is given. Otherwise "score" 0-100 for how well the candidate meets the job's requirements, judged by meaning, not exact wording; "verdict" one sentence; requirements listed in the job's own words.`;

export const aiEnabled = () => Boolean(process.env.OPENAI_API_KEY);
export const aiModel = () => (aiEnabled() ? MODEL : null);

export async function aiReview(resumeText, jobDescription) {
  if (!aiEnabled()) return null;
  const user = `RESUME:\n${resumeText.slice(0, 15000)}\n\nJOB DESCRIPTION:\n${jobDescription || '(none given)'}`;
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }],
        response_format: { type: 'json_schema', json_schema: { name: 'resume_review', strict: true, schema: SCHEMA } },
      }),
      signal: AbortSignal.timeout(60000),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(body.error?.message || `HTTP ${res.status}`), { status: res.status });
    const msg = body.choices?.[0]?.message;
    if (!msg?.content) throw new Error(msg?.refusal || 'Empty response');
    const review = JSON.parse(msg.content);
    if (review.jobFit) review.jobFit.score = Math.max(0, Math.min(100, Math.round(review.jobFit.score)));
    if (!jobDescription) review.jobFit = null;
    return { model: body.model || MODEL, ...review };
  } catch (err) {
    console.warn(`[ai] OpenAI review failed: ${err.message}`);
    const reason = err.status === 401 ? 'the API key was rejected'
      : err.status === 429 ? 'the OpenAI rate limit or quota was reached'
      : err.name === 'TimeoutError' ? 'OpenAI took too long to respond'
      : 'the OpenAI request failed';
    return { error: `AI review unavailable: ${reason}.` };
  }
}
