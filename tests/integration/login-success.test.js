const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

test('GET / renders a title page with navigation to the login page', async () => {
  const context = createTestContext();
  const response = await request(context.app).get('/');

  assert.equal(response.status, 200);
  assert.match(response.text, /University Student Information System/);
  assert.match(response.text, /href="\/login"/);

  context.cleanup();
});

test('GET /login renders for unauthenticated users and redirects authenticated users', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  const firstResponse = await agent.get('/login');
  assert.equal(firstResponse.status, 200);
  assert.match(firstResponse.text, /Sign in/);

  await agent
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' })
    .expect(302);

  const secondResponse = await agent.get('/login');
  assert.equal(secondResponse.status, 302);
  assert.equal(secondResponse.headers.location, '/dashboard');

  context.cleanup();
});

test('POST /login succeeds, creates a session cookie, and records audit rows', async () => {
  const context = createTestContext();
  const response = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' });

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, '/dashboard');
  assert.ok(response.headers['set-cookie']);

  const sessionRows = context.db.prepare('SELECT * FROM user_sessions').all();
  assert.equal(sessionRows.length, 1);

  const attemptRows = context.db.prepare('SELECT * FROM login_attempts WHERE outcome = ?').all('success');
  assert.equal(attemptRows.length, 1);

  context.cleanup();
});
