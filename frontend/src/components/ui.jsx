// Small shared UI pieces used across pages.

export function Card({ title, icon: Icon, action, className = '', children }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            {Icon && <Icon size={18} className="text-indigo-600" />} {title}
          </h3>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const TONES = {
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  red: 'bg-rose-50 text-rose-700 ring-rose-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export function Chip({ children, tone = 'slate' }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}>{children}</span>;
}

export function Chips({ items, tone, empty = 'None found' }) {
  if (!items?.length) return <p className="text-sm text-slate-400">{empty}</p>;
  return <div className="flex flex-wrap gap-2">{items.map((s) => <Chip key={s} tone={tone}>{s}</Chip>)}</div>;
}

export const scoreTone = (v) => (v >= 75 ? 'green' : v >= 50 ? 'amber' : 'red');
const RING = { green: '#059669', amber: '#d97706', red: '#e11d48' };

// Circular progress indicator drawn with an SVG stroke-dasharray.
export function ScoreRing({ value, size = 132, label }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const color = RING[scoreTone(value)];
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${value}%`}>
      <svg viewBox="0 0 120 120" className="-rotate-90" width={size} height={size}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="text-3xl font-bold text-slate-900">{value}<span className="text-base text-slate-400">%</span></span>
      </div>
    </div>
  );
}

export function Spinner({ className = 'size-5' }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} />;
}

export function ErrorBox({ message, children }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      {message} {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
