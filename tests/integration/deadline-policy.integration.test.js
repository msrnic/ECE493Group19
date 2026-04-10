const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function createAuthenticatedClient(app, identifier, password = USER_PASSWORD) {
  const loginResponse = await request(app)
    .post('/login')
    .type('form')
    .send({ identifier, password })
    .expect(302);
  const cookies = loginResponse.headers['set-cookie'] || [];

  function withCookies(testRequest) {
    return cookies.length ? testRequest.set('Cookie', cookies) : testRequest;
  }

  return {
    get(pathname) {
      return withCookies(request(app).get(pathname));
    },
    post(pathname) {
      return withCookies(request(app).post(pathname));
    }
  };
}

test('deadline page displays deadline and allows drop progression before cutoff', async () => {
  const context = createTestContext();
  const client = await createAuthenticatedClient(context.app, 'conflict.student@example.com');

  const page = await client.get('/deadlines/drop');
  assert.equal(page.status, 200);
  assert.match(page.text, /Add\/Drop Deadlines/);
  assert.match(page.text, /Drop action is currently allowed before the published deadline/);
  assert.match(page.text, /2026FALL/);

  const evaluation = await client.post('/deadlines/drop').type('form').send({});
  assert.equal(evaluation.status, 200);
  assert.match(evaluation.text, /Drop action may proceed before the published deadline/);

  context.cleanup();
});

test('deadline page blocks drop after cutoff and reports retrieval failures safely', async () => {
  const blockedContext = createTestContext({
    now: new Date('2026-09-16T00:00:00.000Z')
  });
  const blockedClient = await createAuthenticatedClient(blockedContext.app, 'conflict.student@example.com');

  const blockedPage = await blockedClient.get('/deadlines/drop');
  assert.equal(blockedPage.status, 200);
  assert.match(blockedPage.text, /Drop action is blocked because the published deadline has passed/);

  const blockedEval = await blockedClient.post('/deadlines/drop').type('form').send({});
  assert.equal(blockedEval.status, 200);
  assert.match(blockedEval.text, /Drop action cannot proceed after the published deadline/);
  blockedContext.cleanup();

  const errorContext = createTestContext({
    deadlineTestState: { failureIdentifiers: ['conflict.student@example.com'] }
  });
  const errorClient = await createAuthenticatedClient(errorContext.app, 'conflict.student@example.com');

  const errorPage = await errorClient.get('/deadlines/drop');
  assert.equal(errorPage.status, 503);
  assert.match(errorPage.text, /cannot confirm add\/drop deadline information/i);

  const enrollmentCount = errorContext.db.prepare('SELECT COUNT(*) AS count FROM class_enrollments').get().count;
  const errorEval = await errorClient.post('/deadlines/drop').type('form').send({});
  assert.equal(errorEval.status, 503);
  assert.match(errorEval.text, /Drop action remains blocked until deadline information can be confirmed/);
  assert.equal(errorContext.db.prepare('SELECT COUNT(*) AS count FROM class_enrollments').get().count, enrollmentCount);

  errorContext.cleanup();
});
