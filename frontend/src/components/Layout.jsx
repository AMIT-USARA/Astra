import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '../auth.jsx';

const LINKS = [
  ['/analyze', 'Analyze'],
  ['/history', 'History'],
  ['/about', 'About'],
  ['/help', 'Help'],
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white">
      <img src="/favicon.svg" alt="Astra logo" className="h-[43px] w-auto rounded-lg object-contain dark:hidden" />
      <img src="/favicon-dark.svg" alt="Astra logo" className="hidden h-[43px] w-auto rounded-lg object-contain dark:block" />
      AI Resume Checker
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
  if (!user) return <NavLink to="/login" onClick={onClick} className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Log in</NavLink>;
  return (
    <span className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
      <span className="max-w-40 truncate" title={user.email}>{user.email}</span>
      <button onClick={() => { logout(); onClick?.(); }} className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400" title="Log out">
        <LogOut size={15} /> Log out
      </button>
    </span>
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
