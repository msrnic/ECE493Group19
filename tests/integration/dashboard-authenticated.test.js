const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

test('GET /dashboard redirects unauthenticated users to /login', async () => {
  const context = createTestContext();
  const response = await request(context.app).get('/dashboard');

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, '/login');

  context.cleanup();
});

test('GET /dashboard renders authenticated account data, security actions, and logout control', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await agent
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' })
    .expect(302);

  const response = await agent.get('/dashboard');
  assert.equal(response.status, 200);
  assert.match(response.text, /Welcome, userA/);
  assert.match(response.text, /ECE493/);
  assert.match(response.text, /Permitted account functions/);
  assert.match(response.text, /Change password/);
  assert.match(response.text, /Log out/);

  context.cleanup();
});

test('POST /logout revokes the current session and redirects future dashboard requests to /login', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await agent
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' })
    .expect(302);

  const logoutResponse = await agent.post('/logout');
  assert.equal(logoutResponse.status, 302);
  assert.equal(logoutResponse.headers.location, '/login');
  assert.match((logoutResponse.headers['set-cookie'] || []).join('\n'), /connect\.sid=.*Expires=/);

  const sessionRecord = context.db
    .prepare(
      `SELECT invalidation_reason, revoked_at
       FROM user_sessions
       WHERE account_id = (SELECT id FROM accounts WHERE email = ?)
       ORDER BY created_at DESC
       LIMIT 1`
    )
    .get('userA@example.com');

  assert.equal(sessionRecord.invalidation_reason, 'logout');
  assert.notEqual(sessionRecord.revoked_at, null);

  const dashboardResponse = await agent.get('/dashboard');
  assert.equal(dashboardResponse.status, 302);
  assert.equal(dashboardResponse.headers.location, '/login');

  context.cleanup();
});
