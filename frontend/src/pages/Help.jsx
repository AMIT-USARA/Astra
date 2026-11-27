import { useEffect, useState } from 'react';
import { Activity, HelpCircle, LifeBuoy, RefreshCw } from 'lucide-react';
import { getHealth } from '../services/api.js';
import { Card, Chip, PageHeader, Spinner } from '../components/ui.jsx';

const FAQ = [
  ['Which file formats are supported?', 'Text-based PDF and DOCX files up to 5 MB. Scanned (image-only) PDFs cannot be read because no OCR is performed.'],
  ['Why is my name or phone number “Not found”?', 'The parser never guesses. Put your name on the first line and your contact details just below it, in plain text (not inside an image or a header graphic).'],
  ['Why was a section not detected?', 'Sections are found by their headings. Use standard titles such as Education, Experience, Projects, Skills and Certifications on their own line.'],
  ['How is the job match percentage computed?', '40% TF-IDF cosine similarity between resume and job description, 40% share of the job’s skills found in the resume, and 20% share of the job’s top keywords found in the resume.'],
  ['Does a high score guarantee I pass an ATS?', 'No. The score measures completeness and keyword alignment. Real applicant tracking systems and recruiters use their own criteria.'],
  ['Is my resume stored?', 'The file itself is processed in memory and never saved. Only the extracted analysis results are stored, under your account, so they appear in your History; you can delete them there.'],
  ['What does the AI review do?', 'When the server has an OpenAI API key, the extracted resume text (and job description) is sent to OpenAI, which returns a summary, specific improvements, rewritten bullet points and a meaning-based job fit. The rule-based score does not depend on it. AI output can contain mistakes, so check it before acting on it.'],
];

const STEPS = [
  'Backend not reachable: run “npm run dev” inside the backend folder and check it prints the port (default 5000).',
  'Very little text extracted: export your resume again as PDF from Word/Google Docs instead of scanning it.',
  'Want MongoDB? Set MONGODB_URI in backend/.env and restart the backend.',
  'AI review off? Put your key in OPENAI_API_KEY in backend/.env and restart the backend.',
];

export default function Help() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => getHealth().then(setHealth).catch((e) => setHealth({ error: e.message })).finally(() => setLoading(false));
  const check = () => { setLoading(true); load(); };
  useEffect(() => { load(); }, []);

  return (
    <div className="fade-in mx-auto max-w-4xl px-4 py-12">
      <PageHeader title="Help & contact" subtitle="Answers to common questions and a live system status check." />

      <div className="grid gap-6">
        <Card title="System status" icon={Activity} action={
          <button onClick={check} className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"><RefreshCw size={14} /> Recheck</button>
        }>
          {loading ? <Spinner className="size-5 text-indigo-600 dark:text-indigo-400" /> : health?.error ? (
            <div className="flex flex-wrap items-center gap-2 text-sm"><Chip tone="red">Backend offline</Chip><span className="text-slate-500 dark:text-slate-400">{health.error}</span></div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Chip tone="green">Backend online</Chip>
              <Chip tone="indigo">Storage: {health.storage === 'mongodb' ? 'MongoDB' : 'Local JSON file'}</Chip>
              <Chip tone={health.ai ? 'green' : 'amber'}>{health.ai ? `AI review: ${health.ai}` : 'AI review off (no OpenAI key)'}</Chip>
              <span className="text-slate-500 dark:text-slate-400">Uptime {health.uptime}s</span>
            </div>
          )}
        </Card>

        <Card title="Frequently asked questions" icon={HelpCircle}>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-3">
                <summary className="cursor-pointer list-none font-medium text-slate-800 marker:hidden dark:text-slate-200">
                  <span className="mr-2 inline-block text-indigo-500 transition group-open:rotate-90">›</span>{q}
                </summary>
                <p className="mt-2 pl-5 text-sm text-slate-600 dark:text-slate-400">{a}</p>
              </details>
            ))}
          </div>
        </Card>

        <Card title="Troubleshooting" icon={LifeBuoy}>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">{STEPS.map((s) => <li key={s}>{s}</li>)}</ul>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Still stuck? Contact the project team listed on the About page.</p>
        </Card>
      </div>
    </div>
  );
}
