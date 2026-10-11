import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'test-secret';
const { createToken, verifyToken, hashPassword, checkPassword } = await import('../middleware/auth.js');

test('password hashing: right password passes, wrong fails, salts differ', () => {
  const h = hashPassword('correct horse');
  assert.ok(checkPassword('correct horse', h));
  assert.ok(!checkPassword('wrong horse', h));
  assert.notEqual(h, hashPassword('correct horse'));
  assert.ok(!checkPassword('x', 'garbage'));
});

test('token round-trips and rejects tampering', () => {
  const token = createToken({ id: 'u1', email: 'a@b.co' });
  assert.deepEqual(verifyToken(token), { id: 'u1', email: 'a@b.co' });
  const [payload, sig] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ sub: 'u2', email: 'x@y.co', exp: Date.now() + 1e6 })).toString('base64url');
  assert.equal(verifyToken(`${forged}.${sig}`), null);
  assert.equal(verifyToken(`${payload}.${sig.slice(0, -2)}xx`), null);
  assert.equal(verifyToken(''), null);
  assert.equal(verifyToken('a.b.c'), null);
});
