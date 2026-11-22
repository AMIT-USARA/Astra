import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import * as api from './services/api.js';
import { Spinner } from './components/ui.jsx';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(api.getToken()));

  // Restore the session from a saved token on page load.
  useEffect(() => {
    if (!api.getToken()) return;
    api.getMe().then(setUser).catch(() => api.setToken(null)).finally(() => setLoading(false));
  }, []);

  const start = ({ token, user: u }) => {
    api.setToken(token);
    setUser(u);
  };
  const value = {
    user,
    loading,
    login: (email, password) => api.login(email, password).then(start),
    register: (email, password) => api.register(email, password).then(start),
    logout: () => {
      api.setToken(null);
      setUser(null);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="grid place-items-center py-32 text-indigo-600"><Spinner className="size-8" /></div>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return children;
}
