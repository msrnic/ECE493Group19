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

test('GET /dashboard renders authenticated account data and permitted functions', async () => {
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

  context.cleanup();
});
