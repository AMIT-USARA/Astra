import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

// ---------- 1. Text extraction ----------

export async function extractText(buffer, ext) {
  if (ext === '.pdf') {
    const parser = new PDFParse({ data: buffer });
    try {
      return (await parser.getText()).text;
    } finally {
      await parser.destroy();
    }
  }
  if (ext === '.docx') return (await mammoth.extractRawText({ buffer })).value;
  throw new Error(`Unsupported file type: ${ext}`);
}

export function cleanText(raw) {
  return raw
    .replace(/\r/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B\uFEFF]/g, '')
    .replace(/ﬀ/g, 'ff')
    .replace(/ﬁ/g, 'fi')
    .replace(/ﬂ/g, 'fl')
    .replace(/ﬃ/g, 'ffi')
    .replace(/ﬄ/g, 'ffl')
    .replace(/-- \d+ of \d+ --/g, '') // pdf-parse page markers
    .replace(/[•●▪‣⁃◦➢✓]/g, '•')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ---------- 2. Section detection ----------

// Heading keyword -> canonical section. A line is a heading when it is short and
// consists (almost) only of one of these phrases.
const HEADINGS = {
  summary: ['summary', 'professional summary', 'executive summary', 'career summary', 'profile summary', 'profile', 'objective', 'career objective', 'about me', 'about'],
  education: ['education', 'academic background', 'academics', 'educational qualification', 'educational qualifications', 'academic qualifications', 'education & training', 'qualifications', 'qualification'],
  experience: ['experience', 'work experience', 'professional experience', 'relevant experience', 'industry experience', 'professional background', 'employment', 'employment history', 'internships', 'internship', 'work history'],
  projects: ['projects', 'academic projects', 'personal projects', 'key projects', 'selected projects', 'major projects', 'software projects', 'relevant projects', 'project'],
  skills: ['skills', 'technical skills', 'key skills', 'core competencies', 'technical proficiencies', 'skills summary', 'areas of expertise', 'technologies', 'tech stack', 'skills & tools', 'skills and tools', 'tools & technologies', 'programming languages'],
  certifications: ['certifications', 'certification', 'certificates', 'courses', 'licenses & certifications', 'licenses and certifications', 'certifications & courses', 'licenses'],
  achievements: ['achievements', 'awards', 'honors', 'accomplishments', 'awards & achievements'],
  activities: ['extracurricular activities', 'activities', 'positions of responsibility', 'leadership', 'volunteering'],
};

const HEADING_LOOKUP = new Map(
  Object.entries(HEADINGS).flatMap(([section, words]) => words.map((w) => [w, section])),
);

function headingOf(line) {
  const t = line.toLowerCase().replace(/[^a-z& ]/g, '').replace(/\s+/g, ' ').trim();
  if (!t || t.length > 40) return null;
  return HEADING_LOOKUP.get(t) || null;
}

export function splitSections(text) {
  const sections = {};
  let current = 'header';
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const h = headingOf(line);
    if (h) {
      current = h;
      sections[current] ||= [];
      continue;
    }
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0 && colonIdx < 35) {
      const prefixHeading = headingOf(line.slice(0, colonIdx));
      if (prefixHeading) {
        current = prefixHeading;
        sections[current] ||= [];
        const rest = line.slice(colonIdx + 1).trim();
        if (rest) sections[current].push(rest);
        continue;
      }
    }
    (sections[current] ||= []).push(line);
  }
  return sections;
}

// ---------- 3. Field extraction ----------

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE_RE = /\(?\+?\(?\d[\d\s().-]{8,17}\d/g;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9._-]+/i;
const GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+/i;
const DEGREE_RE = /\b(B\.?\s?Tech|M\.?\s?Tech|B\.?E\.?|M\.?E\.?|B\.?Sc|M\.?Sc|BCA|MCA|MBA|BBA|B\.?Com|Ph\.?D|Bachelor(?:'s)?(?: of [A-Za-z ]+)?|Master(?:'s)?(?: of [A-Za-z ]+)?|Diploma|Higher Secondary|Senior Secondary|Class (?:X|XII|10|12)(?:th)?|HSC|SSC|CBSE|ICSE)\b/i;
const GRADE_RE = /\b(?:CGPA|GPA|SGPA|Percentage)\s*[:\-]?\s*\d{1,2}(?:\.\d{1,2})?(?:\s*\/\s*10)?|\b\d{2}(?:\.\d{1,2})?\s?%/i;
const YEAR_RE = /\b(19|20)\d{2}\b/;
const DATE_RANGE_RE = /\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+|(?:0?[1-9]|1[0-2])\/)?(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+|(?:0?[1-9]|1[0-2])\/)?(?:19|20)\d{2}|Present|Current|Now|Ongoing)\b/gi;

const first = (re, text) => text.match(re)?.[0]?.trim() || null;

function extractPhone(text) {
  // 10-13 digits; skips year ranges like "2022 - 2026" (only 8 digits).
  for (const m of text.match(PHONE_RE) || []) {
    const digits = m.replace(/\D/g, '').length;
    if (digits >= 10 && digits <= 13 && !DATE_RANGE_RE.test(m)) return m.trim();
    DATE_RANGE_RE.lastIndex = 0;
  }
  return null;
}

const NON_NAME_WORDS = new Set([
  'resume', 'curriculum', 'vitae', 'cv', 'profile', 'portfolio', 'page',
  'developer', 'engineer', 'designer', 'analyst', 'intern', 'manager', 'architect',
  'consultant', 'student', 'fresher', 'software', 'full', 'stack', 'frontend', 'backend',
]);

// Name heuristic: first line in the header block that looks like 2-4 capitalised
// words with no digits, symbols or section/title keywords. Returns null rather than guessing.
function extractName(sections) {
  const candidates = (sections.header || []).slice(0, 8);
  for (const line of candidates) {
    const clean = line.split(/[|,•]/)[0].trim();
    if (/[\d@:/]/.test(clean)) continue;
    const words = clean.split(/\s+/);
    if (words.length < 2 || words.length > 4) continue;
    if (words.some((w) => NON_NAME_WORDS.has(w.toLowerCase().replace(/[^a-z]/g, '')))) continue;
    if (words.every((w) => /^[A-Z][A-Za-z.'-]*$/.test(w) || /^[A-Z.'-]+$/.test(w))) {
      return words.map((w) => (w === w.toUpperCase() && w.length > 2 ? w[0] + w.slice(1).toLowerCase() : w)).join(' ');
    }
  }
  return null;
}

const VERB_START = /^(developed|built|designed|implemented|created|led|managed|optimi[sz]ed|improved|reduced|increased|automated|deployed|engineered|worked|collaborated|integrated|wrote|analy[sz]ed|trained|achieved|conducted|participated|organi[sz]ed|used|responsible)\b/i;

// Group a section's lines into entries ({title, bullets}). Bullet glyphs are often lost in
// extraction, so a line counts as a bullet if it had a glyph, starts with an action verb,
// ends with a period or is long. Lowercase-starting lines continue the previous bullet.
function entries(lines = [], max = 8) {
  const out = [];
  for (const line of lines) {
    const hadGlyph = /^[•\-*–]/.test(line);
    const text = line.replace(/^[•\-*–]\s*/, '');
    const last = out.at(-1);
    if (last && /^[a-z]/.test(text)) {
      if (last.bullets.length) last.bullets[last.bullets.length - 1] += ` ${text}`;
      else last.title += ` ${text}`;
      continue;
    }
    const isBullet = hadGlyph || VERB_START.test(text) || /\.$/.test(text) || text.split(/\s+/).length > 14;
    if (last && isBullet) last.bullets.push(text);
    else out.push({ title: text, bullets: [] });
  }
  return out.slice(0, max);
}

export function parseResume(rawText) {
  const text = cleanText(rawText);
  const sections = splitSections(text);
  const eduText = (sections.education || []).join('\n');

  return {
    text,
    sections,
    candidate: {
      name: extractName(sections),
      email: first(EMAIL_RE, text),
      phone: extractPhone(text),
      linkedin: first(LINKEDIN_RE, text),
      github: first(GITHUB_RE, text),
    },
    education: {
      entries: entries(sections.education),
      degree: first(DEGREE_RE, eduText || text),
      grade: first(GRADE_RE, eduText || text),
      year: first(YEAR_RE, eduText),
    },
    experience: { entries: entries(sections.experience), dateRanges: text.match(DATE_RANGE_RE) || [] },
    projects: { entries: entries(sections.projects) },
    certifications: { entries: entries(sections.certifications, 10) },
    achievements: { entries: entries(sections.achievements) },
  };
}
