import { extractSkills, ALL_CATEGORIES } from '../utils/skills.js';
import { compareKeywords } from './nlp.js';

const ACTION_VERBS = /\b(developed|built|designed|implemented|created|led|managed|optimi[sz]ed|improved|reduced|increased|automated|deployed|engineered|architected|launched|delivered|analy[sz]ed|integrated|migrated|collaborated|mentored|resolved|streamlined|achieved|established|trained|researched|published|coordinated|organi[sz]ed)\b/gi;
const QUANTIFIED = /\b\d+(?:\.\d+)?\s?(?:%|percent|x|k\+?|\+|users|ms|seconds|hours|students|members|projects|clients|requests)(?![A-Za-z])|\b(?:over|more than|reduced|increased|improved)\s+(?:by\s+)?\d+/gi;

const clamp = (v, max) => Math.max(0, Math.min(max, v));
const round1 = (v) => Math.round(v * 10) / 10;

// Each criterion returns { key, label, score, max, details }. The overall score is
// the sum of earned points / sum of max points, so it is fully explainable.
function scoreResume(parsed, skills, words, jd) {
  const { candidate, sections, education, experience, projects, certifications } = parsed;
  const text = parsed.text;
  const actionVerbs = new Set((text.match(ACTION_VERBS) || []).map((v) => v.toLowerCase()));
  const quantified = text.match(QUANTIFIED) || [];
  const criteria = [];

  const contact = (candidate.email ? 4 : 0) + (candidate.phone ? 3 : 0) + (candidate.linkedin || candidate.github ? 3 : 0);
  criteria.push({ key: 'contact', label: 'Contact information', score: contact, max: 10,
    details: 'Email (4), phone (3), LinkedIn or GitHub link (3).' });

  const core = ['education', 'experience', 'projects', 'skills'];
  const present = core.filter((s) => sections[s]?.length);
  const structure = present.length * 2 + (sections.summary?.length ? 1 : 0) + (words >= 250 && words <= 1100 ? 1 : 0);
  criteria.push({ key: 'structure', label: 'Resume structure', score: structure, max: 10,
    details: `Core sections found: ${present.join(', ') || 'none'} (2 each), summary (1), length 250-1100 words (1). Current length: ${words} words.` });

  const techPts = clamp((skills.technical.length / 12) * 12, 12);
  const breadth = clamp(Object.keys(skills.byCategory).length * 1.0, 4);
  const softPts = clamp(skills.soft.length, 4);
  criteria.push({ key: 'skills', label: 'Skills', score: round1(techPts + breadth + softPts), max: 20,
    details: `${skills.technical.length} technical skills (12 pts at 12+), ${Object.keys(skills.byCategory).length} skill categories (up to 4), ${skills.soft.length} soft skills (up to 4).` });

  const edu = (sections.education?.length ? 5 : 0) + (education.degree ? 3 : 0) + (education.grade || education.year ? 2 : 0);
  criteria.push({ key: 'education', label: 'Education', score: edu, max: 10,
    details: 'Education section (5), recognisable degree (3), grade or year (2).' });

  const expBullets = experience.entries.reduce((n, e) => n + e.bullets.length, 0);
  const exp = (sections.experience?.length ? 6 : 0) + (experience.dateRanges.length ? 4 : 0) + clamp(expBullets, 5);
  criteria.push({ key: 'experience', label: 'Experience', score: exp, max: 15,
    details: 'Experience/internship section (6), dated entries (4), descriptive bullet points (1 each, up to 5).' });

  const proj = (sections.projects?.length ? 5 : 0) + clamp(projects.entries.length * 2, 5);
  criteria.push({ key: 'projects', label: 'Projects', score: proj, max: 10,
    details: 'Projects section (5), 2 points per project entry (up to 5).' });

  const cert = sections.certifications?.length ? clamp(2 + certifications.entries.length, 5) : 0;
  criteria.push({ key: 'certifications', label: 'Certifications', score: cert, max: 5,
    details: 'Certifications section (2) plus 1 per certificate (up to 5).' });

  const impact = clamp(actionVerbs.size * 0.75, 6) + clamp(quantified.length, 4);
  criteria.push({ key: 'impact', label: 'Impact & language', score: round1(impact), max: 10,
    details: `${actionVerbs.size} distinct action verbs (0.75 each, up to 6), ${quantified.length} quantified results (1 each, up to 4).` });

  if (jd) {
    const kw = jd.keywordCoverage * 5 + jd.skillCoverage * 5;
    criteria.push({ key: 'keywords', label: 'Keyword relevance', score: round1(kw), max: 10,
      details: 'Share of top job-description keywords (5) and job-description skills (5) found in the resume.' });
  }

  const earned = criteria.reduce((s, c) => s + c.score, 0);
  const max = criteria.reduce((s, c) => s + c.max, 0);
  return { overall: Math.round((earned / max) * 100), criteria, actionVerbs: [...actionVerbs], quantified: quantified.length };
}

// Job description matching: TF-IDF cosine similarity + skill coverage.
function matchJob(text, skills, jobDescription) {
  const kw = compareKeywords(text, jobDescription);
  const jdSkills = extractSkills(jobDescription);
  const jdAll = [...jdSkills.technical, ...jdSkills.soft];
  const have = new Set([...skills.technical, ...skills.soft]);
  const matchedSkills = jdAll.filter((s) => have.has(s));
  const missingSkills = jdAll.filter((s) => !have.has(s));

  const total = kw.matching.length + kw.missing.length;
  const keywordCoverage = total ? kw.matching.length / total : 0;
  const skillCoverage = jdAll.length ? matchedSkills.length / jdAll.length : keywordCoverage;

  // Final match = 40% cosine similarity + 40% skill coverage + 20% keyword coverage.
  const matchPercent = Math.round((0.4 * kw.similarity + 0.4 * skillCoverage + 0.2 * keywordCoverage) * 100);

  return {
    matchPercent,
    cosineSimilarity: Math.round(kw.similarity * 1000) / 1000,
    skillCoverage: Math.round(skillCoverage * 100),
    keywordCoverage: Math.round(keywordCoverage * 100),
    matchingKeywords: kw.matching,
    // A JD word already satisfied by a matched skill (e.g. "teamwork" via "collaborated") is not missing.
    missingKeywords: kw.missing.filter((w) => !matchedSkills.some((s) => s.toLowerCase() === w)),
    matchedSkills,
    missingSkills,
    jdSkillCount: jdAll.length,
  };
}

// Strengths / weaknesses / recommendations are generated from the measured criteria.
function feedback(parsed, skills, score, job) {
  const strengths = [];
  const weaknesses = [];
  const tips = [];
  const by = Object.fromEntries(score.criteria.map((c) => [c.key, c]));
  const pct = (k) => (by[k] ? by[k].score / by[k].max : 0);

  if (skills.technical.length >= 10) strengths.push(`Broad technical skill set (${skills.technical.length} skills across ${Object.keys(skills.byCategory).length} categories).`);
  if (pct('experience') >= 0.7) strengths.push('Experience section is well documented with dates and bullet points.');
  if (pct('projects') >= 0.9) strengths.push(`Projects section present with ${parsed.projects.entries.length} project entries.`);
  if (pct('impact') >= 0.6) strengths.push(`Uses strong action verbs (${score.actionVerbs.slice(0, 5).join(', ')}).`);
  if (score.quantified >= 3) strengths.push(`Includes ${score.quantified} quantified achievements — results are measurable.`);
  if (pct('contact') === 1) strengths.push('Complete contact details including a professional profile link.');
  if (pct('certifications') >= 0.6) strengths.push('Certifications add credibility to your skills.');
  if (job && job.matchPercent >= 60) strengths.push(`Good alignment with the job description (${job.matchPercent}% match).`);

  const missingSections = ['education', 'experience', 'projects', 'skills', 'certifications', 'summary']
    .filter((s) => !parsed.sections[s]?.length);

  if (!parsed.candidate.email) { weaknesses.push('No email address detected.'); tips.push('Add a professional email address at the top of the resume.'); }
  if (!parsed.candidate.phone) { weaknesses.push('No phone number detected.'); tips.push('Add a phone number with country code.'); }
  if (!parsed.candidate.linkedin && !parsed.candidate.github) { weaknesses.push('No LinkedIn or GitHub profile link.'); tips.push('Add LinkedIn and GitHub URLs so recruiters can verify your work.'); }
  for (const s of missingSections) {
    weaknesses.push(`Missing "${s}" section (or its heading was not recognised).`);
    tips.push(`Add a clearly titled "${s[0].toUpperCase() + s.slice(1)}" section heading.`);
  }
  if (skills.technical.length < 6) { weaknesses.push(`Only ${skills.technical.length} technical skills detected.`); tips.push('List your technical skills explicitly in a Skills section grouped by category (languages, frameworks, tools).'); }
  if (skills.soft.length < 2) { weaknesses.push('Few soft skills are demonstrated.'); tips.push('Show soft skills through bullet points, e.g. "Collaborated with a team of 4 to ..." or "Led ...".'); }
  if (score.actionVerbs.length < 5) { weaknesses.push('Limited use of action verbs.'); tips.push('Start bullet points with verbs like Developed, Implemented, Optimised, Led.'); }
  if (score.quantified < 2) { weaknesses.push('Achievements are not quantified.'); tips.push('Add numbers: performance gains (%), users served, dataset size, time saved.'); }
  if (!parsed.education.grade && parsed.sections.education?.length) tips.push('Mention your CGPA/percentage if it is a strength.');
  const words = parsed.text.split(/\s+/).length;
  if (words < 250) { weaknesses.push(`Resume is short (${words} words).`); tips.push('Expand project and experience descriptions with what you built, how, and the outcome.'); }
  if (words > 1100) { weaknesses.push(`Resume is long (${words} words).`); tips.push('Trim to 1-2 pages; keep the most relevant, recent work.'); }

  if (job) {
    if (job.missingSkills.length) tips.push(`Job-specific: if you have experience with ${job.missingSkills.slice(0, 6).join(', ')}, mention it explicitly.`);
    if (job.matchPercent < 40) weaknesses.push(`Low alignment with the job description (${job.matchPercent}% match).`);
    if (job.missingKeywords.length) tips.push(`Consider reflecting these job-description terms where truthful: ${job.missingKeywords.slice(0, 8).join(', ')}.`);
  }

  // Suggest skill categories the resume does not touch at all.
  const suggestedSkills = job?.missingSkills.length
    ? job.missingSkills
    : ['Databases', 'Cloud & DevOps', 'Tools'].filter((c) => !skills.byCategory[c]).map((c) => ({
      Databases: 'SQL / MongoDB', 'Cloud & DevOps': 'Docker / AWS basics', Tools: 'Git & GitHub',
    })[c]);

  return { strengths, weaknesses, recommendations: [...new Set(tips)], missingSections, suggestedSkills };
}

export function analyze(parsed, jobDescription = '') {
  const skills = extractSkills(parsed.text);
  const words = parsed.text.split(/\s+/).filter(Boolean).length;
  const jd = jobDescription.trim().length >= 30 ? jobDescription.trim() : '';
  const job = jd ? matchJob(parsed.text, skills, jd) : null;
  const score = scoreResume(parsed, skills, words, job && {
    keywordCoverage: job.keywordCoverage / 100,
    skillCoverage: job.skillCoverage / 100,
  });

  const skillDistribution = ALL_CATEGORIES.map((c) => ({ category: c, count: skills.byCategory[c]?.length || 0 }));

  return {
    candidate: parsed.candidate,
    education: parsed.education,
    experience: parsed.experience.entries,
    projects: parsed.projects.entries,
    certifications: parsed.certifications.entries,
    achievements: parsed.achievements.entries,
    sectionsFound: Object.keys(parsed.sections).filter((s) => s !== 'header'),
    wordCount: words,
    skills: { technical: skills.technical, soft: skills.soft, byCategory: skills.byCategory, distribution: skillDistribution },
    score,
    jobMatch: job,
    feedback: feedback(parsed, skills, score, job),
  };
}
