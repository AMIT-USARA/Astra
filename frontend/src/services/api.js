const BASE = import.meta.env.VITE_API_URL || '';
const OFFLINE = 'Cannot reach the server. Make sure the backend is running on port 5000.';
// The Vite dev proxy answers 502-504 when the backend is down.
const isOffline = (status) => status >= 502 && status <= 504;

const TOKEN_KEY = 'arc_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));
const authHeader = () => (getToken() ? { Authorization: `Bearer ${getToken()}` } : {});

// A rejected token (expired, or the server's secret changed) sends the user back to login.
function onUnauthorized() {
  if (!getToken()) return;
  setToken(null);
  window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
}

async function send(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers: { ...authHeader(), ...options.headers } });
  } catch {
    throw new Error(OFFLINE);
  }
  if (isOffline(res.status)) throw new Error(OFFLINE);
  if (res.status === 401) onUnauthorized();
  return res;
}

async function request(path, options) {
  const res = await send(path, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) throw new Error(body.message || `Request failed (${res.status})`);
  return body;
}

const postJson = (path, data) => request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

export const login = (email, password) => postJson('/api/auth/login', { email, password }).then((b) => b.data);
export const register = (email, password) => postJson('/api/auth/register', { email, password }).then((b) => b.data);
export const getMe = () => request('/api/auth/me').then((b) => b.data.user);

export const getHealth = () => request('/api/health');
export const getHistory = () => request('/api/resume/history').then((b) => b.data);
export const getAnalysis = (id) => request(`/api/resume/${id}`).then((b) => b.data);
export const deleteAnalysis = (id) => request(`/api/resume/${id}`, { method: 'DELETE' });

// The report needs the auth header, so it is fetched as a blob instead of a plain link.
export async function downloadReport(id) {
  const res = await send(`/api/resume/${id}/report`);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `Download failed (${res.status})`);
  const name = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'Resume_Report.pdf';
  const url = URL.createObjectURL(await res.blob());
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// XHR instead of fetch because fetch cannot report upload progress.
export function analyzeResume(file, jobDescription, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('resume', file);
    form.append('jobDescription', jobDescription);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/api/resume/analyze`);
    if (getToken()) xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let body = {};
      try { body = JSON.parse(xhr.responseText); } catch { /* non-JSON error page */ }
      if (xhr.status === 401) onUnauthorized();
      if (xhr.status >= 200 && xhr.status < 300 && body.success) resolve(body.data);
      else reject(new Error(isOffline(xhr.status) ? OFFLINE : body.message || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error(OFFLINE));
    xhr.send(form);
  });
}
