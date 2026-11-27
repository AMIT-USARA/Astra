import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  Download, RotateCcw, User, Mail, Phone, Link2, GraduationCap, Briefcase, FolderGit2, Award,
  ThumbsUp, AlertTriangle, Lightbulb, Target, Cpu, HeartHandshake, BarChart3, Info, FileText, CheckCircle2, XCircle, Sparkles,
} from 'lucide-react';
import { getAnalysis, downloadReport } from '../services/api.js';
import { Card, Chips, Chip, ScoreRing, Spinner, ErrorBox, scoreTone } from '../components/ui.jsx';
import { usePageMeta } from '../seo.js';

const BAR = { green: '#5b7a3b', amber: '#c8754b', red: '#b84a39' };

function Stat({ label, children, hint }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
      {children}
      {hint && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

function BigNumber({ value, sub }) {
  return (
    <div className="grid h-[132px] place-content-center">
      <p className="text-5xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{sub}</p>
    </div>
  );
}

function List({ items, icon: Icon, color, empty }) {
  if (!items?.length) return <p className="text-sm text-slate-400 dark:text-slate-500">{empty}</p>;
  return (
    <ul className="space-y-2.5">
      {items.map((t) => (
        <li key={t} className="flex gap-2.5 text-sm text-slate-700 dark:text-slate-300">
          <Icon size={16} className={`mt-0.5 shrink-0 ${color}`} /> <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function Entries({ items, empty }) {
  if (!items?.length) return <p className="text-sm text-slate-400 dark:text-slate-500">{empty}</p>;
  return (
    <div className="space-y-4">
      {items.map((e, i) => (
        <div key={i} className="border-l-2 border-indigo-200 pl-3 dark:border-indigo-800">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{e.title}</p>
          {e.bullets.length > 0 && (
            <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-600 dark:text-slate-400">
              {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function AiReview({ ai }) {
  if (!ai) {
    return (
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <Sparkles size={16} className="text-slate-400 dark:text-slate-500" /> AI review is off: the server has no OpenAI API key (set OPENAI_API_KEY in backend/.env).
      </div>
    );
  }
  if (ai.error) {
    return <div className="mt-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"><Sparkles size={16} /> {ai.error}</div>;
  }
  return (
    <Card title="AI review" icon={Sparkles} className="mt-6" action={<Chip tone="indigo">OpenAI · {ai.model}</Chip>}>
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{ai.summary}</p>

      {ai.jobFit && (
        <div className="mt-6 grid gap-6 rounded-xl bg-slate-50 p-5 md:grid-cols-[auto_1fr_1fr] dark:bg-slate-800/60">
          <div className="flex flex-col items-center">
            <ScoreRing value={ai.jobFit.score} size={110} label="AI job fit" />
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">AI job fit</p>
          </div>
          <div>
            <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">{ai.jobFit.verdict}</p>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200"><CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" /> Requirements met</p>
            <List items={ai.jobFit.matchedRequirements} icon={CheckCircle2} color="text-emerald-600 dark:text-emerald-400" empty="None identified." />
          </div>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200"><XCircle size={16} className="text-rose-600 dark:text-rose-400" /> Requirements missing</p>
            <List items={ai.jobFit.missingRequirements} icon={XCircle} color="text-rose-600 dark:text-rose-400" empty="None — every requirement is covered." />
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Strengths</p>
          <List items={ai.strengths} icon={ThumbsUp} color="text-emerald-600 dark:text-emerald-400" empty="None listed." />
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">What to improve</p>
          {ai.improvements.length ? (
            <ul className="space-y-3">
              {ai.improvements.map((i, n) => (
                <li key={n} className="text-sm text-slate-700 dark:text-slate-300">
                  <Chip tone="amber">{i.section}</Chip> <span className="font-medium">{i.issue}</span> <span className="text-slate-600 dark:text-slate-400">{i.suggestion}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-400 dark:text-slate-500">Nothing to improve.</p>}
        </div>
      </div>

      {ai.rewrittenBullets.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Suggested bullet rewrites</p>
          <div className="space-y-3">
            {ai.rewrittenBullets.map((b, n) => (
              <div key={n} className="grid gap-2 rounded-lg border border-slate-200 p-3 text-sm md:grid-cols-2 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400"><span className="mr-1 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">Before</span> {b.original}</p>
                <p className="text-slate-800 dark:text-slate-100"><span className="mr-1 text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">After</span> {b.improved}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mt-5 text-xs text-slate-400 dark:text-slate-500">Generated by an AI model from your resume text. It can make mistakes; check suggestions before using them, and replace any [X] with your real numbers.</p>
    </Card>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={16} className="mt-0.5 text-slate-400 dark:text-slate-500" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
        <p className={`break-words text-sm ${value ? 'font-medium text-slate-800 dark:text-slate-100' : 'italic text-slate-400 dark:text-slate-500'}`}>{value || 'Not found in resume'}</p>
      </div>
    </div>
  );
}

export default function Results() {
  usePageMeta('Resume Score Results | astrACode');
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const download = () => {
    setDownloading(true);
    downloadReport(record.id).catch((e) => setError(e.message)).finally(() => setDownloading(false));
  };

  useEffect(() => {
    getAnalysis(id).then(setRecord).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorBox message={error}> <Link to="/analyze" className="font-semibold underline">Analyze a resume</Link></ErrorBox></div>;
  if (!record) return <div className="grid place-items-center py-32 text-indigo-600"><Spinner className="size-8" /></div>;

  const r = record.result;
  const job = r.jobMatch;
  const criteria = r.score.criteria.map((c) => ({ ...c, pct: Math.round((c.score / c.max) * 100) }));
  const distribution = r.skills.distribution.map((d) => ({ ...d, short: d.category.replace(' & ', '/').replace('Programming ', '') }));
  const jobBars = job && [
    { name: 'Cosine similarity', value: Math.round(job.cosineSimilarity * 100) },
    { name: 'Skill coverage', value: job.skillCoverage },
    { name: 'Keyword coverage', value: job.keywordCoverage },
  ];

  return (
    <div className="fade-in mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><FileText size={14} /> {record.fileName} · {new Date(record.createdAt).toLocaleString()}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{r.candidate.name || 'Resume analysis'}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/analyze" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            <RotateCcw size={16} /> Analyze another
          </Link>
          <button onClick={download} disabled={downloading} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60">
            {downloading ? <Spinner className="size-4" /> : <Download size={16} />} Download PDF report
          </button>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Resume score" hint={`${r.score.criteria.length} criteria · see breakdown`}>
          <ScoreRing value={r.score.overall} label="Resume score" />
        </Stat>
        <Stat label="Job match" hint={job ? `TF-IDF cosine ${job.cosineSimilarity}` : 'No job description provided'}>
          {job ? <ScoreRing value={job.matchPercent} label="Job match" /> : (
            <div className="grid h-[132px] place-content-center text-sm text-slate-400 dark:text-slate-500">
              <Target className="mx-auto mb-2" />
              <Link to="/analyze" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">Add a JD to compare</Link>
            </div>
          )}
        </Stat>
        <Stat label="Technical skills" hint={`${Object.keys(r.skills.byCategory).length} categories`}>
          <BigNumber value={r.skills.technical.length} sub="detected" />
        </Stat>
        <Stat label="Soft skills" hint={`${r.wordCount} words · ${r.sectionsFound.length} sections`}>
          <BigNumber value={r.skills.soft.length} sub="detected" />
        </Stat>
      </div>

      <AiReview ai={r.ai} />

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card title="Score breakdown" icon={BarChart3} className="lg:col-span-3">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={criteria} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid horizontal={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="label" width={130} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', color: 'var(--tooltip-fg)', borderRadius: '0.75rem' }} formatter={(v, n, p) => [`${p.payload.score} / ${p.payload.max} points`, 'Earned']} cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }} />
                <Bar dataKey="pct" radius={[0, 6, 6, 0]} barSize={16}>
                  {criteria.map((c) => <Cell key={c.key} fill={BAR[scoreTone(c.pct)]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-medium text-indigo-600 dark:text-indigo-400">How is the score calculated?</summary>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Score = points earned ÷ maximum points × 100.{!job && ' Keyword relevance is only scored when a job description is given, so the maximum is 90 here.'}
            </p>
            <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
              {criteria.map((c) => (
                <li key={c.key} className="flex justify-between gap-4 py-2">
                  <span><span className="font-medium text-slate-800 dark:text-slate-200">{c.label}</span><br /><span className="text-xs text-slate-500 dark:text-slate-400">{c.details}</span></span>
                  <span className="shrink-0 font-semibold text-slate-700 dark:text-slate-300">{c.score}/{c.max}</span>
                </li>
              ))}
            </ul>
          </details>
        </Card>

        <Card title="Skill distribution" icon={Cpu} className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={distribution} outerRadius="70%">
                <PolarGrid stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
                <PolarAngleAxis dataKey="short" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', color: 'var(--tooltip-fg)', borderRadius: '0.75rem' }} formatter={(v) => [`${v} skills`, 'Detected']} />
                <Radar dataKey="count" stroke="#4b5229" fill="#8f9f54" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Job match */}
      {job && (
        <Card title="Job description match" icon={Target} className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <div className="h-48">
                <ResponsiveContainer>
                  <BarChart data={jobBars} margin={{ top: 10 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={0} />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#94a3b8' }} width={40} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', color: 'var(--tooltip-fg)', borderRadius: '0.75rem' }} formatter={(v) => [`${v}%`]} cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36}>
                      {jobBars.map((b) => <Cell key={b.name} fill={BAR[scoreTone(b.value)]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Match = 40% cosine similarity + 40% skill coverage + 20% keyword coverage.</p>
            </div>
            <div className="space-y-5">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200"><CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" /> Relevant skills you have ({job.matchedSkills.length}/{job.jdSkillCount})</p>
                <Chips items={job.matchedSkills} tone="green" empty="No job skills matched" />
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200"><XCircle size={16} className="text-rose-600 dark:text-rose-400" /> Missing skills</p>
                <Chips items={job.missingSkills} tone="red" empty="You cover every skill detected in the job description" />
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Matching keywords</p>
                <Chips items={job.matchingKeywords} tone="indigo" />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Missing keywords</p>
                <Chips items={job.missingKeywords} tone="amber" empty="No important keywords missing" />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Skills */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Technical skills" icon={Cpu} className="lg:col-span-2">
          {Object.keys(r.skills.byCategory).length ? (
            <div className="space-y-4">
              {Object.entries(r.skills.byCategory).map(([cat, list]) => (
                <div key={cat}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{cat}</p>
                  <Chips items={list} tone="indigo" />
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400 dark:text-slate-500">No technical skills detected.</p>}
        </Card>
        <div className="space-y-6">
          <Card title="Soft skills" icon={HeartHandshake}><Chips items={r.skills.soft} tone="green" empty="No soft skills detected" /></Card>
          <Card title="Suggested skills" icon={Lightbulb}>
            <Chips items={r.feedback.suggestedSkills} tone="amber" empty="No suggestions" />
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">{job ? 'Skills the job asks for that were not found in your resume.' : 'Common skill areas missing from your resume.'}</p>
          </Card>
        </div>
      </div>

      {/* Feedback */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Strengths" icon={ThumbsUp}><List items={r.feedback.strengths} icon={CheckCircle2} color="text-emerald-600 dark:text-emerald-400" empty="No notable strengths detected yet." /></Card>
        <Card title="Weaknesses" icon={AlertTriangle}><List items={r.feedback.weaknesses} icon={AlertTriangle} color="text-amber-500" empty="No major weaknesses found." /></Card>
        <Card title="Recommendations" icon={Lightbulb}><List items={r.feedback.recommendations} icon={Lightbulb} color="text-indigo-500 dark:text-indigo-400" empty="Nothing to improve — nice work." /></Card>
      </div>

      {r.feedback.missingSections.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          <Info size={16} /> Missing sections: {r.feedback.missingSections.map((s) => <Chip key={s} tone="amber">{s}</Chip>)}
        </div>
      )}

      {/* Extracted information */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Candidate" icon={User}>
          <InfoRow icon={User} label="Name" value={r.candidate.name} />
          <InfoRow icon={Mail} label="Email" value={r.candidate.email} />
          <InfoRow icon={Phone} label="Phone" value={r.candidate.phone} />
          <InfoRow icon={Link2} label="LinkedIn" value={r.candidate.linkedin} />
          <InfoRow icon={Link2} label="GitHub" value={r.candidate.github} />
        </Card>
        <Card title="Education" icon={GraduationCap}>
          <div className="mb-3 flex flex-wrap gap-2">
            {r.education.degree && <Chip tone="indigo">{r.education.degree}</Chip>}
            {r.education.grade && <Chip tone="green">{r.education.grade}</Chip>}
          </div>
          <Entries items={r.education.entries} empty="No education section found." />
        </Card>
        <Card title="Experience" icon={Briefcase}><Entries items={r.experience} empty="No experience section found." /></Card>
        <Card title="Projects" icon={FolderGit2} className="lg:col-span-2"><Entries items={r.projects} empty="No projects section found." /></Card>
        <Card title="Certifications" icon={Award}><Entries items={r.certifications} empty="No certifications section found." /></Card>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
        This analysis measures completeness and keyword alignment using rule-based NLP and TF-IDF cosine similarity{r.ai && !r.ai.error ? ', plus an OpenAI review' : ''}. It does not guarantee ATS compatibility or hiring success.
      </p>
    </div>
  );
}
