const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

test('repeated invalid credentials trigger a temporary lock and later recover after expiry', async () => {
  const context = createTestContext();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await request(context.app)
      .post('/login')
      .type('form')
      .send({ identifier: 'userA@example.com', password: 'WrongPass!000' });
    assert.equal(response.status, 401);
  }

  const lockedResponse = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' });
  assert.equal(lockedResponse.status, 423);
  assert.match(lockedResponse.text, /temporarily locked/);

  const lockedAccount = context.db
    .prepare('SELECT status, locked_until FROM accounts WHERE email = ?')
    .get('userA@example.com');
  assert.equal(lockedAccount.status, 'locked');

  context.advanceTime(15 * 60 * 1000 + 1000);
  const recoveredResponse = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' });

  assert.equal(recoveredResponse.status, 302);
  assert.equal(recoveredResponse.headers.location, '/dashboard');

  context.cleanup();
});
