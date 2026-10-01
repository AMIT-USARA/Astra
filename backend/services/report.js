import PDFDocument from 'pdfkit';

const C = { primary: '#4338ca', text: '#0f172a', muted: '#64748b', line: '#e2e8f0', good: '#059669', bad: '#dc2626', warn: '#d97706' };
const scoreColor = (v) => (v >= 75 ? C.good : v >= 50 ? C.warn : C.bad);

// Streams a formatted PDF report for one saved analysis.
export function streamReport(record, res) {
  const r = record.result;
  const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: 'AI Resume Checker Report' } });
  const safeName = (r.candidate.name || record.fileName.replace(/\.[^.]+$/, '')).replace(/[^\w-]+/g, '_');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Resume_Report_${safeName}.pdf"`);
  doc.pipe(res);

  const W = doc.page.width - 100;

  const heading = (t) => {
    if (doc.y > doc.page.height - 120) doc.addPage();
    doc.moveDown(0.8).fontSize(13).fillColor(C.primary).font('Helvetica-Bold').text(t);
    doc.moveTo(50, doc.y + 2).lineTo(50 + W, doc.y + 2).strokeColor(C.line).stroke();
    doc.moveDown(0.5).font('Helvetica').fontSize(10).fillColor(C.text);
  };
  const bullets = (items, empty = 'None detected.') => {
    if (!items?.length) return doc.fillColor(C.muted).text(empty).fillColor(C.text);
    items.forEach((i) => doc.text(`•  ${i}`, { indent: 4, paragraphGap: 3 }));
  };
  const kv = (k, v) => doc.font('Helvetica-Bold').text(`${k}: `, { continued: true }).font('Helvetica').text(v || 'Not found');

  // Header band
  doc.rect(0, 0, doc.page.width, 90).fill(C.primary);
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(22).text('AI Resume Checker', 50, 28);
  doc.font('Helvetica').fontSize(10).text(`Resume Analysis Report  ·  ${new Date(record.createdAt).toLocaleString('en-IN')}`, 50, 58);
  doc.fillColor(C.text).y = 110;

  heading('Candidate Information');
  kv('Name', r.candidate.name);
  kv('Email', r.candidate.email);
  kv('Phone', r.candidate.phone);
  kv('LinkedIn', r.candidate.linkedin);
  kv('GitHub', r.candidate.github);
  kv('Resume file', record.fileName);
  kv('Education', [r.education.degree, r.education.grade].filter(Boolean).join(' · '));

  // Score boxes
  heading('Scores');
  const y = doc.y;
  const box = (x, label, display, color, sub) => {
    doc.roundedRect(x, y, 160, 70, 6).strokeColor(C.line).stroke();
    doc.fontSize(9).fillColor(C.muted).text(label, x + 12, y + 10);
    doc.fontSize(24).font('Helvetica-Bold').fillColor(color).text(display, x + 12, y + 24);
    doc.fontSize(8).font('Helvetica').fillColor(C.muted).text(sub, x + 12, y + 54);
  };
  const jm = r.jobMatch?.matchPercent;
  box(50, 'RESUME SCORE', `${r.score.overall}%`, scoreColor(r.score.overall), 'Out of 100');
  box(225, 'JOB MATCH', jm == null ? 'N/A' : `${jm}%`, jm == null ? C.muted : scoreColor(jm),
    r.jobMatch ? `Cosine similarity ${r.jobMatch.cosineSimilarity}` : 'No job description given');
  box(400, 'SKILLS FOUND', String(r.skills.technical.length + r.skills.soft.length), C.primary,
    `${r.skills.technical.length} technical · ${r.skills.soft.length} soft`);
  doc.x = 50;
  doc.y = y + 85;

  heading('Score Breakdown');
  doc.fontSize(9);
  r.score.criteria.forEach((c) => {
    const rowY = doc.y;
    doc.fillColor(C.text).font('Helvetica-Bold').text(c.label, 50, rowY, { width: 150 });
    doc.rect(205, rowY + 2, 200, 7).fill(C.line);
    doc.rect(205, rowY + 2, (200 * c.score) / c.max, 7).fill(scoreColor((c.score / c.max) * 100));
    doc.fillColor(C.text).font('Helvetica').text(`${c.score} / ${c.max}`, 415, rowY);
    doc.fillColor(C.muted).fontSize(8).text(c.details, 50, doc.y + 1, { width: W });
    doc.fontSize(9).moveDown(0.5);
  });
  doc.x = 50;

  heading('Extracted Skills');
  Object.entries(r.skills.byCategory).forEach(([cat, list]) => kv(cat, list.join(', ')));
  kv('Soft skills', r.skills.soft.join(', '));

  if (r.jobMatch) {
    heading('Job Description Match');
    kv('Skill coverage', `${r.jobMatch.skillCoverage}%`);
    kv('Keyword coverage', `${r.jobMatch.keywordCoverage}%`);
    kv('Matched skills', r.jobMatch.matchedSkills.join(', '));
    doc.fillColor(C.bad);
    kv('Missing skills', r.jobMatch.missingSkills.join(', ') || 'None');
    kv('Missing keywords', r.jobMatch.missingKeywords.join(', ') || 'None');
    doc.fillColor(C.text);
  }

  if (r.ai && !r.ai.error) {
    heading(`AI Review (OpenAI ${r.ai.model})`);
    doc.text(r.ai.summary, { paragraphGap: 6 });
    if (r.ai.jobFit) kv('AI job fit', `${r.ai.jobFit.score}% · ${r.ai.jobFit.verdict}`);
    bullets(r.ai.improvements.map((i) => `${i.section}: ${i.issue} ${i.suggestion}`));
    r.ai.rewrittenBullets.forEach((b) => {
      doc.moveDown(0.3).fillColor(C.muted).text(`Before: ${b.original}`).fillColor(C.good).text(`After: ${b.improved}`).fillColor(C.text);
    });
  }

  heading('Strengths');
  bullets(r.feedback.strengths);
  heading('Weaknesses');
  bullets(r.feedback.weaknesses);
  heading('Improvement Suggestions');
  bullets(r.feedback.recommendations);

  doc.moveDown(1.5).fontSize(8).fillColor(C.muted).text(
    'Scores are computed by rule-based NLP and TF-IDF cosine similarity; the AI review, when present, is generated by an OpenAI model and may contain mistakes. They indicate resume completeness and keyword alignment only; they do not guarantee ATS compatibility or hiring outcomes.',
    { width: W },
  );
  doc.end();
}
