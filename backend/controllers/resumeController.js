import { extractText, parseResume } from '../services/parser.js';
import { analyze } from '../services/analyzer.js';
import { aiReview } from '../services/ai.js';
import { saveAnalysis, listAnalyses, getAnalysis, deleteAnalysis } from '../services/storage.js';
import { streamReport } from '../services/report.js';
import { verifySignature, httpError } from '../middleware/upload.js';

export async function analyzeResume(req, res) {
  if (!req.file) throw httpError(400, 'Please upload a resume file (field name "resume").');
  const ext = verifySignature(req.file);
  const jobDescription = String(req.body.jobDescription || '').slice(0, 20000);

  let raw;
  try {
    raw = await extractText(req.file.buffer, ext);
  } catch {
    throw httpError(422, 'Could not read the file. It may be corrupted or password-protected.');
  }
  if (!raw || raw.trim().length < 50) {
    throw httpError(422, 'Very little text could be extracted. Scanned/image-only resumes are not supported; please upload a text-based PDF or DOCX.');
  }

  const parsed = parseResume(raw);
  const result = analyze(parsed, jobDescription);
  result.ai = await aiReview(parsed.text, result.jobMatch ? jobDescription.trim() : '');
  const saved = await saveAnalysis({
    userId: req.user.id,
    fileName: req.file.originalname,
    fileType: ext.slice(1),
    candidateName: result.candidate.name,
    candidateEmail: result.candidate.email,
    resumeScore: result.score.overall,
    jobMatch: result.jobMatch?.matchPercent ?? null,
    jobDescription,
    result,
  });
  res.status(201).json({ success: true, data: saved });
}

export async function history(req, res) {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  res.json({ success: true, data: await listAnalyses(req.user.id, limit) });
}

async function findOr404(req) {
  const record = await getAnalysis(req.params.id, req.user.id);
  if (!record) throw httpError(404, 'Analysis not found.');
  return record;
}

export async function getOne(req, res) {
  res.json({ success: true, data: await findOr404(req) });
}

export async function removeOne(req, res) {
  if (!(await deleteAnalysis(req.params.id, req.user.id))) throw httpError(404, 'Analysis not found.');
  res.json({ success: true });
}

export async function report(req, res) {
  streamReport(await findOr404(req), res);
}
