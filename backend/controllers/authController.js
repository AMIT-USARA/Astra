import { createToken, hashPassword, checkPassword } from '../middleware/auth.js';
import { httpError } from '../middleware/upload.js';
import { createUser, findUserByEmail } from '../services/storage.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readCredentials(body = {}) {
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!EMAIL_RE.test(email)) throw httpError(400, 'Please enter a valid email address.');
  if (password.length < 8 || password.length > 128) throw httpError(400, 'Password must be 8 to 128 characters long.');
  return { email, password };
}

const session = (user) => ({ token: createToken(user), user: { id: user.id, email: user.email } });

export async function register(req, res) {
  const { email, password } = readCredentials(req.body);
  if (await findUserByEmail(email)) throw httpError(409, 'An account with this email already exists. Please log in.');
  const user = await createUser({ email, passwordHash: hashPassword(password) });
  res.status(201).json({ success: true, data: session(user) });
}

export async function login(req, res) {
  const { email, password } = readCredentials(req.body);
  const user = await findUserByEmail(email);
  if (!user || !checkPassword(password, user.passwordHash)) throw httpError(401, 'Incorrect email or password.');
  res.json({ success: true, data: session(user) });
}

export function me(req, res) {
  res.json({ success: true, data: { user: req.user } });
}
