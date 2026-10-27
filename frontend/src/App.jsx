import { Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Analyze from './pages/Analyze.jsx';
import Results from './pages/Results.jsx';
import History from './pages/History.jsx';
import About from './pages/About.jsx';
import Help from './pages/Help.jsx';
import Login from './pages/Login.jsx';
import { RequireAuth } from './auth.jsx';

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-5xl font-bold text-indigo-600">404</p>
      <p className="mt-3 text-slate-500">This page does not exist.</p>
      <Link to="/" className="mt-6 inline-block font-semibold text-indigo-600">Go home</Link>
    </div>
  );
}

export default function App() {
  return (
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
  );
}
