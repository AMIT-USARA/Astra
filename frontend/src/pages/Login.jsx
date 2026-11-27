import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../auth.jsx';
import { ErrorBox, Spinner } from '../components/ui.jsx';

export default function Login() {
  const { user, login, register } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Only follow same-site paths, never an absolute URL from the query string.
  const nextParam = params.get('next') || '';
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/analyze';
  if (user) return <Navigate to={next} replace />;

  const isLogin = mode === 'login';
  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await (isLogin ? login : register)(email, password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const input = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-900';
  return (
    <div className="fade-in mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{isLogin ? 'Log in' : 'Create an account'}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {isLogin ? 'Log in to analyze resumes and see your history.' : 'Your analyses are saved to your account and visible only to you.'}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
            <input type="password" required minLength={8} maxLength={128} autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
            {!isLogin && <span className="mt-1 block text-xs font-normal text-slate-400 dark:text-slate-500">At least 8 characters.</span>}
          </label>
          {error && <ErrorBox message={error} />}
          <button type="submit" disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60">
            {busy ? <Spinner /> : isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {isLogin ? 'Log in' : 'Sign up'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" onClick={() => { setMode(isLogin ? 'register' : 'login'); setError(''); }} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
