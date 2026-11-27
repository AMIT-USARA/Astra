import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, X, Briefcase, ScanSearch, AlertCircle } from 'lucide-react';
import { analyzeResume } from '../services/api.js';
import { Card, PageHeader, Spinner, ErrorBox } from '../components/ui.jsx';
import { MAX_FILE_MB } from '../config.js';
import { usePageMeta } from '../seo.js';

const SAMPLE_JD = `We are hiring a Full Stack Developer Intern. The candidate will build and maintain web applications using React and Node.js with Express. Required skills: JavaScript, TypeScript, React, Node.js, Express, MongoDB, REST API design, Git. Experience with Docker, AWS and CI/CD pipelines is a plus. Knowledge of unit testing with Jest and writing clean, maintainable code is preferred. Strong communication and teamwork skills are required.`;

const EXT = ['.pdf', '.docx'];

function validate(file) {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!EXT.includes(ext)) return 'Only PDF and DOCX files are supported.';
  if (file.size > MAX_FILE_MB * 1024 * 1024) return `File is larger than ${MAX_FILE_MB} MB.`;
  if (file.size === 0) return 'File is empty.';
  return null;
}

export default function Analyze() {
  usePageMeta('Analyze Resume & Check Score | astrACode');
  const navigate = useNavigate();
  const input = useRef(null);
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('idle'); // idle | uploading | analyzing

  const pick = (f) => {
    if (!f) return;
    const err = validate(f);
    setError(err || '');
    setFile(err ? null : f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please choose a resume file first.');
    setError('');
    setStage('uploading');
    setProgress(0);
    try {
      const saved = await analyzeResume(file, jd, (p) => {
        setProgress(p);
        if (p === 100) setStage('analyzing');
      });
      navigate(`/results/${saved.id}`);
    } catch (err) {
      setError(err.message);
      setStage('idle');
    }
  };

  const busy = stage !== 'idle';
  const jdShort = jd.trim().length > 0 && jd.trim().length < 30;

  return (
    <div className="fade-in mx-auto max-w-4xl px-4 py-12">
      <PageHeader title="Analyze your resume" subtitle="Upload a resume and, optionally, the job description you are targeting." />

      <form onSubmit={submit} className="space-y-6">
        <Card title="1. Resume file" icon={FileText}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => !busy && input.current.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !busy && input.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); if (!busy) pick(e.dataTransfer.files[0]); }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center
              ${drag ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-slate-800/50'}`}
          >
            <UploadCloud size={40} className="text-indigo-500 dark:text-indigo-400" />
            <p className="mt-3 font-semibold text-slate-800 dark:text-slate-100">Drag & drop your resume here</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">or click to browse · PDF or DOCX · max {MAX_FILE_MB} MB</p>
            <input ref={input} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => { pick(e.target.files[0]); e.target.value = ''; }} />
          </div>

          {file && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <FileText className="text-indigo-600 dark:text-indigo-400" size={22} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              {!busy && (
                <button type="button" onClick={() => setFile(null)} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200" aria-label="Remove file">
                  <X size={18} />
                </button>
              )}
            </div>
          )}
        </Card>

        <Card
          title="2. Job description (optional)"
          icon={Briefcase}
          action={<button type="button" onClick={() => setJd(SAMPLE_JD)} className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">Use sample JD</button>}
        >
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={8}
            maxLength={20000}
            disabled={busy}
            placeholder="Paste the job description here to get a job match percentage, matching keywords and missing skills…"
            className="w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-900"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-400 dark:text-slate-500">
            <span className={jdShort ? 'text-amber-600 dark:text-amber-400' : ''}>
              {jdShort ? 'Too short to compare — add at least 30 characters.' : 'Without a job description you still get the resume score and suggestions.'}
            </span>
            <span>{jd.length.toLocaleString()} / 20,000</span>
          </div>
        </Card>

        {error && <ErrorBox message={<span className="flex items-center gap-2"><AlertCircle size={16} />{error}</span>} />}

        {busy && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/60">
            <div className="flex items-center gap-3 text-sm font-medium text-indigo-800 dark:text-indigo-200">
              <Spinner className="size-4" />
              {stage === 'uploading' ? `Uploading… ${progress}%` : 'Extracting text and analysing resume…'}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900">
              <div className={`h-full rounded-full bg-indigo-600 transition-all ${stage === 'analyzing' ? 'animate-pulse' : ''}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !file}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
        >
          {busy ? <Spinner className="size-5" /> : <ScanSearch size={20} />}
          {busy ? 'Analysing…' : 'Analyze Resume'}
        </button>
      </form>
    </div>
  );
}
