import { lazy, Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import { RequireAuth } from './auth.jsx';
import { Spinner } from './components/ui.jsx';

const Analyze = lazy(() => import('./pages/Analyze.jsx'));
const Results = lazy(() => import('./pages/Results.jsx'));
const History = lazy(() => import('./pages/History.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Help = lazy(() => import('./pages/Help.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));

function PageLoader() {
  return (
    <div className="grid place-items-center py-32 text-indigo-600 dark:text-indigo-400">
      <Spinner className="size-8" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">404</p>
      <p className="mt-3 text-slate-500 dark:text-slate-400">This page does not exist.</p>
      <Link to="/" className="mt-6 inline-block font-semibold text-indigo-600 dark:text-indigo-400">Go home</Link>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="analyze" element={<RequireAuth><Analyze /></RequireAuth>} />
          <Route path="results/:id" element={<RequireAuth><Results /></RequireAuth>} />
          <Route path="history" element={<RequireAuth><History /></RequireAuth>} />
          <Route path="about" element={<About />} />
          <Route path="help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
