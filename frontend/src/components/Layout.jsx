import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { FileCheck2, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../auth.jsx';

const LINKS = [
  ['/analyze', 'Analyze'],
  ['/history', 'History'],
  ['/about', 'About'],
  ['/help', 'Help'],
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
      <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white"><FileCheck2 size={18} /></span>
      AI Resume Checker
    </Link>
  );
}

function Account({ onClick }) {
  const { user, logout } = useAuth();
  if (!user) return <NavLink to="/login" onClick={onClick} className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Log in</NavLink>;
  return (
    <span className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
      <span className="max-w-40 truncate" title={user.email}>{user.email}</span>
      <button onClick={() => { logout(); onClick?.(); }} className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-rose-600" title="Log out">
        <LogOut size={15} /> Log out
      </button>
    </span>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const cls = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`;
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map(([to, label]) => <NavLink key={to} to={to} className={cls}>{label}</NavLink>)}
          <Account />
          <Link to="/analyze" className="ml-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
            Check my resume
          </Link>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
      </nav>
      {open && (
        <div className="flex flex-col gap-1 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {LINKS.map(([to, label]) => <NavLink key={to} to={to} className={cls} onClick={() => setOpen(false)}>{label}</NavLink>)}
          <Account onClick={() => setOpen(false)} />
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-slate-500">Explainable resume analysis using NLP, TF-IDF, cosine similarity and an optional OpenAI review. Built as a B.Tech CSE minor project.</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-slate-900">Product</p>
          <ul className="mt-3 space-y-2 text-slate-500">
            <li><Link to="/analyze" className="hover:text-indigo-600">Analyze a resume</Link></li>
            <li><Link to="/history" className="hover:text-indigo-600">Analysis history</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-slate-900">Project</p>
          <ul className="mt-3 space-y-2 text-slate-500">
            <li><Link to="/about" className="hover:text-indigo-600">About & algorithms</Link></li>
            <li><Link to="/help" className="hover:text-indigo-600">Help & FAQ</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        Scores indicate completeness and keyword alignment only — not a guarantee of ATS compatibility or hiring outcomes.
      </p>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}
