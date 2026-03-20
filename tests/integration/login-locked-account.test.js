const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

test('POST /login returns 423 for pre-locked accounts with valid credentials', async () => {
  const context = createTestContext();
  const response = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'locked.user@example.com', password: 'CorrectPass!234' });

  assert.equal(response.status, 423);
  assert.match(response.text, /temporarily locked/);
  assert.equal(context.db.prepare('SELECT COUNT(*) AS count FROM user_sessions').get().count, 0);

  const attempts = context.db
    .prepare('SELECT outcome FROM login_attempts WHERE account_id = 2')
    .all();
  assert.equal(attempts.at(-1).outcome, 'locked');

  context.cleanup();
});
