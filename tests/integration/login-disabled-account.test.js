const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

test('POST /login returns 403 for disabled accounts and does not create a session', async () => {
  const context = createTestContext();
  const response = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'disabled.user@example.com', password: 'CorrectPass!234' });

  assert.equal(response.status, 403);
  assert.match(response.text, /Please contact support/);
  assert.equal(context.db.prepare('SELECT COUNT(*) AS count FROM user_sessions').get().count, 0);

  const disabledAccount = context.db.prepare('SELECT id FROM accounts WHERE email = ?').get('disabled.user@example.com');
  const attempts = context.db
    .prepare('SELECT outcome FROM login_attempts WHERE account_id = ?')
    .all(disabledAccount.id);
  assert.equal(attempts.at(-1).outcome, 'disabled');

  context.cleanup();
});
