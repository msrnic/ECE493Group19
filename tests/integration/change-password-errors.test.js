const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

test('password change enforces cooldown messaging after repeated verification failures', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await agent
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' })
    .expect(302);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await agent
      .post('/account/security/password-change')
      .type('form')
      .send({ currentPassword: 'WrongPass!000', newPassword: 'NewSecure!234' });
    assert.equal(response.status, 401);
  }

  const blocked = await agent
    .post('/account/security/password-change')
    .type('form')
    .send({ currentPassword: 'WrongPass!000', newPassword: 'NewSecure!234' });
  assert.equal(blocked.status, 429);
  assert.match(blocked.text, /Retry after 30 seconds/);

  context.cleanup();
});

test('system failure rollback preserves the existing password', async () => {
  const context = createTestContext({
    simulatedPasswordChangeFailureIdentifiers: ['userA@example.com']
  });
  const agent = request.agent(context.app);

  await agent
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' })
    .expect(302);

  const response = await agent
    .post('/account/security/password-change')
    .type('form')
    .send({ currentPassword: 'CorrectPass!234', newPassword: 'NewSecure!234' });
  assert.equal(response.status, 500);
  assert.match(response.text, /retry later/);

  const oldLogin = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' });
  assert.equal(oldLogin.status, 302);

  context.cleanup();
});
