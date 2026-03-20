const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

test('POST /login returns 503 when the authentication service is unavailable', async () => {
  const context = createTestContext({
    unavailableIdentifiers: ['outage.user@example.com']
  });

  const response = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'outage.user@example.com', password: 'CorrectPass!234' });

  assert.equal(response.status, 503);
  assert.match(response.text, /Login service is unavailable/);
  assert.equal(context.db.prepare('SELECT COUNT(*) AS count FROM user_sessions').get().count, 0);

  const attempts = context.db
    .prepare('SELECT outcome FROM login_attempts WHERE submitted_identifier = ?')
    .all('outage.user@example.com');
  assert.equal(attempts.at(-1).outcome, 'service_unavailable');

  context.cleanup();
});
