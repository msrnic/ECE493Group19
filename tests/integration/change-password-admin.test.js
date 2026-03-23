const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

test('admin can open the target form and change another user password without target verification fields', async () => {
  const context = createTestContext();
  const adminAgent = request.agent(context.app);

  await adminAgent
    .post('/login')
    .type('form')
    .send({ identifier: 'admin@example.com', password: 'AdminPass!234' })
    .expect(302);

  const page = await adminAgent.get('/admin/users/1/password');
  assert.equal(page.status, 200);
  assert.match(page.text, /Administrative authorization is sufficient/);
  assert.match(page.text, /AdminSet!234/);
  assert.doesNotMatch(page.text, /Current password/);
  assert.doesNotMatch(page.text, /Reset token/);

  const response = await adminAgent
    .post('/admin/users/1/password')
    .set('Accept', 'application/json')
    .send({ newPassword: 'AdminSet!234' });
  assert.equal(response.status, 200);
  assert.equal(response.body.notificationQueued, true);

  const oldLogin = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' });
  assert.equal(oldLogin.status, 401);

  const newLogin = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'AdminSet!234' });
  assert.equal(newLogin.status, 302);

  context.cleanup();
});

test('admin endpoints reject unauthorized access and missing targets', async () => {
  const context = createTestContext();
  const userAgent = request.agent(context.app);
  await userAgent
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' })
    .expect(302);

  const deniedPage = await userAgent.get('/admin/users/1/password');
  assert.equal(deniedPage.status, 403);
  assert.match(deniedPage.text, /Administrative authorization is required/);

  const deniedJson = await userAgent
    .post('/admin/users/1/password')
    .set('Accept', 'application/json')
    .send({ newPassword: 'AdminSet!234' });
  assert.equal(deniedJson.status, 403);

  const adminAgent = request.agent(context.app);
  await adminAgent
    .post('/login')
    .type('form')
    .send({ identifier: 'admin@example.com', password: 'AdminPass!234' })
    .expect(302);

  const missing = await adminAgent.get('/admin/users/999/password');
  assert.equal(missing.status, 404);

  context.cleanup();
});
