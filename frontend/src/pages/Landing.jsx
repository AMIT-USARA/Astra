import { Link } from 'react-router-dom';
import {
  ArrowRight, Upload, ScanText, Brain, Gauge, Target, FileDown, Sparkles,
  ShieldCheck, History, Lightbulb, Clock, Eye,
} from 'lucide-react';

const FEATURES = [
  [ScanText, 'Resume parsing', 'Extracts text from PDF and DOCX, then detects name, contact details, education, experience, projects and certifications.'],
  [Brain, 'Skill extraction', 'Rule-based NLP over a curated dictionary of 120+ skills (plus 60+ aliases) across languages, frameworks, databases, cloud, tools, AI/ML and soft skills.'],
  [Gauge, 'Explainable score', 'A 0–100 resume score built from 9 transparent criteria, each showing the points earned and why.'],
  [Target, 'Job match & gaps', 'TF-IDF and cosine similarity measure alignment with a target job, and list the matched and missing skills and keywords.'],
  [Sparkles, 'AI review', 'An OpenAI model reads your resume like a recruiter: a summary, concrete fixes, rewritten bullet points and a job fit judged by meaning, not exact words.'],
  [FileDown, 'PDF report', 'Download a formatted report of the full analysis to share or keep for later.'],
];

const STEPS = [
  [Upload, 'Upload', 'Drop your PDF or DOCX resume and optionally paste a job description.'],
  [ScanText, 'Parse', 'Text is extracted and split into sections; candidate details are identified.'],
  [Brain, 'Analyse', 'Skills are matched, sections are scored, TF-IDF similarity is computed and the AI review is generated.'],
  [Sparkles, 'Improve', 'Review your dashboard, act on the suggestions and download the report.'],
];

const BENEFITS = [
  [Eye, 'Transparent', 'Every point in the score is traceable to a rule — no black box.'],
  [Lightbulb, 'Actionable', 'Suggestions are tied to what is actually missing from your resume.'],
  [Clock, 'Fast', 'Analysis completes in about a second, entirely on the server.'],
  [ShieldCheck, 'Private', 'Files are processed in memory and never written to disk; your history is visible only to your account.'],
  [History, 'Track progress', 'Every analysis is saved so you can compare revisions over time.'],
];

function Pipeline() {
  const nodes = ['Resume (PDF / DOCX)', 'Text extraction', 'Section & entity detection', 'Skill matching + TF-IDF', 'AI review (OpenAI)', 'Score & suggestions'];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Analysis pipeline</p>
      <ol className="space-y-3">
        {nodes.map((n, i) => (
          <li key={n} className="flex items-center gap-3">
            <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${i === nodes.length - 1 ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'}`}>{i + 1}</span>
            <span className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:text-slate-200">{n}</span>
          </li>
        ))}
      </ol>
      <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
        {['TF-IDF', 'Cosine similarity', 'OpenAI'].map((t) => (
          <span key={t} className="rounded-md bg-slate-50 px-2 py-1.5 font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">{t}</span>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-16 md:grid-cols-[1.15fr_1fr] md:pt-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
            <Sparkles size={14} /> NLP-powered resume analysis
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl dark:text-white">
            Know how your resume reads <span className="text-[#c8754b] dark:text-[#dc8a60]">before a recruiter does.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
            Upload your resume, paste a job description, and get an explainable score, the skills you have, the keywords you are missing and specific steps to improve.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/analyze" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700">
              Analyze my resume <ArrowRight size={18} />
            </Link>
            <a href="#how" className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">How it works</a>
          </div>
          <p className="mt-4 text-sm text-slate-400 dark:text-slate-500">PDF or DOCX · up to 5 MB · free account</p>
        </div>
        <Pipeline />
      </section>

      {/* Intro */}
      <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Why this project?</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Students often send the same resume to every job without knowing whether it covers what the role asks for. AI Resume Checker
            applies classic information-retrieval techniques — tokenisation, TF-IDF weighting and cosine similarity — together with rule-based
            entity extraction to give clear, evidence-based feedback instead of a mysterious number.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">Everything in one analysis</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-500 dark:text-slate-400">Each feature below works on your actual resume content.</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([Icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <span className="grid size-10 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"><Icon size={20} /></span>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 bg-slate-900 text-white dark:border-y dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-bold">How it works</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {STEPS.map(([Icon, title, text], i) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-indigo-500"><Icon size={20} /></span>
                  <span className="text-sm font-semibold text-indigo-300">Step {i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">Benefits</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {BENEFITS.map(([Icon, title, text]) => (
            <div key={title} className="text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"><Icon size={22} /></span>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 rounded-2xl bg-indigo-600 px-6 py-10 text-center text-white">
          <h3 className="text-2xl font-bold">Ready to check your resume?</h3>
          <p className="mt-2 text-indigo-100">It takes less than a minute.</p>
          <Link to="/analyze" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-50">
            Start analysis <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
