import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Eye, Download, Trash2, FileText, Inbox, TrendingUp } from 'lucide-react';
import { getHistory, deleteAnalysis, downloadReport } from '../services/api.js';
import { Card, Chip, PageHeader, Spinner, ErrorBox, scoreTone } from '../components/ui.jsx';

export default function History() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getHistory().then(setItems).catch((e) => setError(e.message));
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this analysis?')) return;
    try {
      await deleteAnalysis(id);
      setItems((list) => list.filter((i) => i.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorBox message={error} /></div>;
  if (!items) return <div className="grid place-items-center py-32 text-indigo-600"><Spinner className="size-8" /></div>;

  const trend = [...items].reverse().map((i, n) => ({ n: `#${n + 1}`, Score: i.resumeScore, 'Job match': i.jobMatch ?? null }));
  const avg = items.length ? Math.round(items.reduce((s, i) => s + i.resumeScore, 0) / items.length) : 0;

  return (
    <div className="fade-in mx-auto max-w-6xl px-4 py-10">
      <PageHeader title="Analysis history" subtitle={`${items.length} saved ${items.length === 1 ? 'analysis' : 'analyses'}${items.length ? ` · average score ${avg}` : ''}`}>
        <Link to="/analyze" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">New analysis</Link>
      </PageHeader>

      {!items.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <Inbox className="mx-auto text-slate-300" size={44} />
          <p className="mt-3 font-medium text-slate-700">No analyses yet</p>
          <Link to="/analyze" className="mt-2 inline-block text-sm font-semibold text-indigo-600">Analyze your first resume</Link>
        </div>
      ) : (
        <>
          {items.length > 1 && (
            <Card title="Score trend" icon={TrendingUp} className="mb-6">
              <div className="h-56">
                <ResponsiveContainer>
                  <LineChart data={trend}>
                    <CartesianGrid stroke="#f1f5f9" />
                    <XAxis dataKey="n" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} width={35} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Score" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="Job match" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Resume</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Job match</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-medium text-slate-800"><FileText size={16} className="text-slate-400" />{i.fileName}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{i.candidateName || <span className="italic text-slate-400">Unknown</span>}</td>
                    <td className="px-4 py-3"><Chip tone={scoreTone(i.resumeScore)}>{i.resumeScore}</Chip></td>
                    <td className="px-4 py-3">{i.jobMatch != null ? <Chip tone={scoreTone(i.jobMatch)}>{i.jobMatch}%</Chip> : <span className="text-slate-400">—</span>}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{new Date(i.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link to={`/results/${i.id}`} className="rounded p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600" title="View"><Eye size={16} /></Link>
                        <button onClick={() => downloadReport(i.id).catch((e) => setError(e.message))} className="rounded p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600" title="Download report"><Download size={16} /></button>
                        <button onClick={() => remove(i.id)} className="rounded p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
