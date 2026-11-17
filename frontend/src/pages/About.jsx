import { Layers, Cpu, Database, Sigma, Users, Target } from 'lucide-react';
import { Card, PageHeader } from '../components/ui.jsx';
import { PROJECT } from '../config.js';

const STACK = [
  ['Frontend', 'React 19, Vite, Tailwind CSS, Recharts, Lucide icons, React Router'],
  ['Backend', 'Node.js, Express 5, Multer (in-memory uploads)'],
  ['Parsing', 'pdf-parse (PDF), mammoth (DOCX)'],
  ['Analysis', 'Custom NLP pipeline: tokenisation, stop-word removal, stemming, TF-IDF, cosine similarity, rule-based extraction'],
  ['AI review', 'OpenAI Chat Completions with Structured Outputs (strict JSON schema)'],
  ['Auth', 'Email + password, scrypt hashing, HMAC-signed tokens (Node crypto)'],
  ['Storage', 'MongoDB with Mongoose, automatic fallback to a local JSON file'],
  ['Report', 'PDFKit (server-generated PDF)'],
];

const CRITERIA = [
  ['Contact information', 10], ['Resume structure', 10], ['Skills', 20], ['Education', 10], ['Experience', 15],
  ['Projects', 10], ['Certifications', 5], ['Impact & language', 10], ['Keyword relevance (with JD)', 10],
];

export default function About() {
  return (
    <div className="fade-in mx-auto max-w-5xl px-4 py-12">
      <PageHeader title="About the project" subtitle={`${PROJECT.title} · ${PROJECT.course}`} />

      <div className="grid gap-6">
        <Card title="Objective" icon={Target}>
          <p className="text-sm leading-relaxed text-slate-600">
            Build a web application that analyses a resume, extracts candidate information and skills, scores the resume with
            explainable criteria, and measures how well it matches a job description using TF-IDF and cosine similarity, adds an OpenAI review that judges fit by meaning, then
            turns the findings into concrete improvement suggestions and a downloadable report.
          </p>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Technology stack" icon={Layers}>
            <dl className="divide-y divide-slate-100 text-sm">
              {STACK.map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-2 py-2"><dt className="font-medium text-slate-800">{k}</dt><dd className="col-span-2 text-slate-600">{v}</dd></div>
              ))}
            </dl>
          </Card>
          <Card title="Resume score criteria" icon={Cpu}>
            <ul className="divide-y divide-slate-100 text-sm">
              {CRITERIA.map(([k, v]) => <li key={k} className="flex justify-between py-2"><span className="text-slate-700">{k}</span><span className="font-semibold text-slate-900">{v}</span></li>)}
            </ul>
            <p className="mt-3 text-xs text-slate-500">Score = earned ÷ maximum × 100. Without a job description, keyword relevance is excluded (maximum 90).</p>
          </Card>
        </div>

        <Card title="Algorithms" icon={Sigma}>
          <ol className="list-decimal space-y-3 pl-5 text-sm text-slate-600">
            <li><b className="text-slate-800">Preprocessing:</b> lowercase, tokenise (keeping tokens like <code>c++</code>, <code>node.js</code>), remove stop-words, and apply a light suffix-stripping stemmer.</li>
            <li><b className="text-slate-800">TF-IDF:</b> term frequency tf(t,d) = count(t,d) / |d|; smoothed inverse document frequency idf(t) = ln((1+N)/(1+df(t))) + 1; weight = tf × idf.</li>
            <li><b className="text-slate-800">Cosine similarity:</b> cos(A,B) = (A·B) / (‖A‖‖B‖) between the resume and job-description TF-IDF vectors.</li>
            <li><b className="text-slate-800">Keyword gap:</b> the job description&apos;s top 25 TF-IDF terms (excluding generic job-posting words) are checked against the resume.</li>
            <li><b className="text-slate-800">Skill extraction:</b> regex matching with token boundaries over a dictionary of skills and aliases (e.g. “ReactJS” → React), with case-sensitive rules for ambiguous names like “Go” and “R”.</li>
            <li><b className="text-slate-800">Entity extraction:</b> regular expressions for email, phone, LinkedIn/GitHub, degree, CGPA and date ranges; section headings are detected to split the resume.</li>
            <li><b className="text-slate-800">Job match:</b> 40% cosine similarity + 40% skill coverage + 20% keyword coverage.</li>
          </ol>
        </Card>

        <Card title="Storage" icon={Database}>
          <p className="text-sm text-slate-600">If <code>MONGODB_URI</code> is set and reachable, analyses are stored in MongoDB. Otherwise the server falls back to <code>backend/data/analyses.json</code>, so the application always works. The active mode is shown on the Help page.</p>
        </Card>

        {(PROJECT.team.length > 0 || PROJECT.guide || PROJECT.institution) && (
          <Card title="Project team" icon={Users}>
            {PROJECT.institution && <p className="text-sm text-slate-600">{PROJECT.institution}</p>}
            {PROJECT.guide && (
              <div className="mt-3 flex items-center gap-3">
                {PROJECT.guidePhoto && <img src={PROJECT.guidePhoto} alt={PROJECT.guide} className="size-16 rounded-full object-cover object-top ring-2 ring-indigo-100" />}
                <div className="text-sm text-slate-600">Guide<p className="font-bold text-slate-900">{PROJECT.guide}</p></div>
              </div>
            )}
            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
              {PROJECT.team.map((m) => <li key={m.name} className="rounded-lg bg-slate-50 px-3 py-2 text-sm"><b>{m.name}</b>{m.roll && <span className="text-slate-500"> · {m.roll}</span>}</li>)}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
