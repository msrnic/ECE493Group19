const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { RESET_TOKENS } = require('../../src/db/migrations/seed-login-fixtures');
const { createTestContext } = require('../helpers/test-context');

test('reset-token password change succeeds and consumes the token', async () => {
  const context = createTestContext();
  const page = await request(context.app).get(`/auth/reset-password?token=${RESET_TOKENS.valid}`);
  assert.equal(page.status, 200);
  assert.match(page.text, /Reset Password/);
  assert.match(page.text, /TokenSecure!234/);

  const response = await request(context.app)
    .post('/auth/reset-password/confirm')
    .type('form')
    .send({ resetToken: RESET_TOKENS.valid, newPassword: 'TokenSecure!234' });

  assert.equal(response.status, 200);
  assert.match(response.text, /Password reset completed successfully/);

  const tokenRow = context.db.prepare('SELECT * FROM password_reset_tokens WHERE token_digest IS NOT NULL ORDER BY id ASC').all()[0];
  assert.ok(tokenRow.consumed_at);

  const oldLogin = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' });
  assert.equal(oldLogin.status, 401);

  const newLogin = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'TokenSecure!234' });
  assert.equal(newLogin.status, 302);

  context.cleanup();
});

test('reset-token flow rejects expired tokens and supports JSON responses', async () => {
  const context = createTestContext();

  const response = await request(context.app)
    .post('/auth/reset-password/confirm')
    .set('Accept', 'application/json')
    .send({ resetToken: RESET_TOKENS.expired, newPassword: 'TokenSecure!234' });

  assert.equal(response.status, 401);
  assert.equal(response.body.status, 'error');
  assert.deepEqual(response.body.recoveryOptions, [
    'Request a new reset token.',
    'Contact support if recovery keeps failing.'
  ]);

  context.cleanup();
});
