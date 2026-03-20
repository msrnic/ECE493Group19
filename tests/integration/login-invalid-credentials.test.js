const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

test('POST /login returns 400 when required fields are missing', async () => {
  const context = createTestContext();
  const response = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: '', password: '' });

  assert.equal(response.status, 400);
  assert.match(response.text, /Both username\/email and password are required/);
  assert.equal(context.db.prepare('SELECT COUNT(*) AS count FROM user_sessions').get().count, 0);

  context.cleanup();
});

test('POST /login returns 401 for invalid credentials and allows retry success', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  const firstResponse = await agent
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'WrongPass!000' });

  assert.equal(firstResponse.status, 401);
  assert.match(firstResponse.text, /Invalid username\/email or password/);

  const secondResponse = await agent
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' });

  assert.equal(secondResponse.status, 302);
  assert.equal(secondResponse.headers.location, '/dashboard');

  const account = context.db
    .prepare('SELECT failed_attempt_count, status FROM accounts WHERE email = ?')
    .get('userA@example.com');
  assert.equal(account.failed_attempt_count, 0);
  assert.equal(account.status, 'active');

  context.cleanup();
});

test('POST /login returns 401 for unknown accounts without creating a session', async () => {
  const context = createTestContext();
  const response = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'nobody@example.com', password: 'WrongPass!000' });

  assert.equal(response.status, 401);
  assert.equal(context.db.prepare('SELECT COUNT(*) AS count FROM user_sessions').get().count, 0);

  const attempts = context.db
    .prepare('SELECT outcome, account_id FROM login_attempts WHERE submitted_identifier = ?')
    .all('nobody@example.com');
  assert.equal(attempts.length, 1);
  assert.equal(attempts[0].account_id, null);

  context.cleanup();
});
