import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter, securityHeaders } from '../middleware/security.js';
import { checkPassword } from '../middleware/auth.js';

function mockRes() {
  const headers = {};
  return {
    statusCode: 200,
    body: null,
    headers,
    setHeader(k, v) { headers[k.toLowerCase()] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
  };
}

test('securityHeaders sets hardening headers and no-store on /api', () => {
  const res = mockRes();
  let nextCalled = false;
  securityHeaders({ path: '/api/health', secure: true, headers: {} }, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(res.headers['x-content-type-options'], 'nosniff');
  assert.equal(res.headers['x-frame-options'], 'DENY');
  assert.equal(res.headers['cache-control'], 'no-store');
  assert.ok(res.headers['strict-transport-security']);
});

test('rateLimiter blocks requests over the limit with 429', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2, message: 'Slow down' });
  const req = { ip: '1.2.3.4' };
  let passed = 0;

  limiter(req, mockRes(), () => { passed += 1; });
  limiter(req, mockRes(), () => { passed += 1; });
  const blockedRes = mockRes();
  limiter(req, blockedRes, () => { passed += 1; });

  assert.equal(passed, 2);
  assert.equal(blockedRes.statusCode, 429);
  assert.equal(blockedRes.body.message, 'Slow down');
  assert.ok(blockedRes.headers['retry-after']);
});

test('checkPassword rejects malformed stored hashes without throwing', () => {
  assert.equal(checkPassword('password123', 'salt:nothex'), false);
  assert.equal(checkPassword('password123', 'salt:abcd'), false);
});
