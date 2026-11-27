import crypto from 'node:crypto';
import { httpError } from './upload.js';

// Stateless signed token (same idea as a JWT: payload.signature, HMAC-SHA256), built on
// node:crypto so no extra dependency is needed.
const SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET) console.warn('[auth] JWT_SECRET not set; using a random one, so logins reset on every restart');
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
const sameString = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

export function createToken(user) {
  const payload = b64(JSON.stringify({ sub: user.id, email: user.email, exp: Date.now() + TTL_MS }));
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token = '') {
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !sameString(sig, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? { id: data.sub, email: data.email } : null;
  } catch {
    return null;
  }
}

// scrypt with a random per-user salt, stored as "salt:hash".
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}

export function checkPassword(password, stored = '') {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  if (expected.length !== 64) return false;
  return crypto.timingSafeEqual(crypto.scryptSync(password, salt, 64), expected);
}

export function requireAuth(req, res, next) {
  const user = verifyToken(req.headers.authorization?.replace(/^Bearer /, ''));
  if (!user) throw httpError(401, 'Please log in to continue.');
  req.user = user;
  next();
}
