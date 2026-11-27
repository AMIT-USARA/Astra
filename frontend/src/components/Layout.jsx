import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun, User, X } from 'lucide-react';
import { useAuth } from '../auth.jsx';

const LINKS = [
  ['/analyze', 'Analyze'],
  ['/history', 'History'],
  ['/about', 'About'],
  ['/help', 'Help'],
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
      <img src="/favicon.svg" alt="astrACode logo" className="h-[43px] w-auto rounded-lg object-contain dark:hidden" />
      <img src="/favicon-dark.svg" alt="astrACode logo" className="hidden h-[43px] w-auto rounded-lg object-contain dark:block" />
      astrACode
    </Link>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('arc_theme', next ? 'dark' : 'light');
    document.querySelector('link[rel="icon"]')?.setAttribute('href', next ? '/favicon-dark.svg' : '/favicon.svg');
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function Account({ onClick }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return <NavLink to="/login" onClick={onClick} className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Log in</NavLink>;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Profile menu"
        title="Profile"
        className="grid size-9 place-items-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
      >
        <User size={17} />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-60 rounded-xl border border-slate-200 bg-[#fffdf8] p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Signed in as</p>
          <p className="mt-0.5 truncate text-sm font-medium text-slate-800 dark:text-slate-100" title={user.email}>{user.email}</p>
          <div className="mt-3 border-t border-slate-100 pt-2 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setOpen(false); logout(); onClick?.(); }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const cls = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
    }`;
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map(([to, label]) => <NavLink key={to} to={to} className={cls}>{label}</NavLink>)}
          <Account />
          <ThemeToggle />
          <Link to="/analyze" className="ml-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
            Check my resume
          </Link>
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button className="p-1 text-slate-700 dark:text-slate-200" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
        </div>
      </nav>
      {open && (
        <div className="flex flex-col gap-1 border-t border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-900">
          {LINKS.map(([to, label]) => <NavLink key={to} to={to} className={cls} onClick={() => setOpen(false)}>{label}</NavLink>)}
          <Account onClick={() => setOpen(false)} />
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Explainable resume analysis using NLP, TF-IDF, cosine similarity and an optional OpenAI review. Built as a B.Tech CSE minor project.</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-slate-900 dark:text-white">Product</p>
          <ul className="mt-3 space-y-2 text-slate-500 dark:text-slate-400">
            <li><Link to="/analyze" className="hover:text-indigo-600 dark:hover:text-indigo-400">Analyze a resume</Link></li>
            <li><Link to="/history" className="hover:text-indigo-600 dark:hover:text-indigo-400">Analysis history</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-slate-900 dark:text-white">Project</p>
          <ul className="mt-3 space-y-2 text-slate-500 dark:text-slate-400">
            <li><Link to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400">About & algorithms</Link></li>
            <li><Link to="/help" className="hover:text-indigo-600 dark:hover:text-indigo-400">Help & FAQ</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-slate-100 py-4 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
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
