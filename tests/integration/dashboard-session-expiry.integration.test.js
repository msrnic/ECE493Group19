const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function loginAs(agent, identifier, password) {
  await agent
    .post('/login')
    .type('form')
    .send({ identifier, password: password || USER_PASSWORD })
    .expect(302);
}

function revokeLatestSession(context, email) {
  const sessionRow = context.db
    .prepare('SELECT id FROM user_sessions WHERE account_id = (SELECT id FROM accounts WHERE email = ?) ORDER BY created_at DESC LIMIT 1')
    .get(email);
  context.db
    .prepare('UPDATE user_sessions SET revoked_at = ?, invalidation_reason = ? WHERE id = ?')
    .run('2026-03-07T12:45:00.000Z', 'expired', sessionRow.id);
}

test('expired dashboard sessions redirect to login with returnTo and can return to the dashboard after re-authentication', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');
  revokeLatestSession(context, 'userA@example.com');

  const dashboardResponse = await agent.get('/dashboard');
  assert.equal(dashboardResponse.status, 302);
  assert.equal(dashboardResponse.headers.location, '/login?returnTo=%2Fdashboard');

  const loginPage = await agent.get(dashboardResponse.headers.location);
  assert.equal(loginPage.status, 200);
  assert.equal(loginPage.text.includes('name="returnTo" value="/dashboard"'), true);

  const reloginResponse = await agent
    .post('/login')
    .type('form')
    .send({
      identifier: 'userA@example.com',
      password: USER_PASSWORD,
      returnTo: '/dashboard'
    });
  assert.equal(reloginResponse.status, 302);
  assert.equal(reloginResponse.headers.location, '/dashboard');

  context.cleanup();
});

test('expired sessions receive an auth_error payload when retrying unavailable dashboard sections', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  context.dashboardTestState.unavailableSectionsByIdentifier['usera@example.com'] = ['security-center'];

  await loginAs(agent, 'userA@example.com');
  const initialResponse = await agent
    .get('/dashboard')
    .set('Accept', 'application/json');

  revokeLatestSession(context, 'userA@example.com');
  const retryResponse = await agent
    .post('/dashboard/retry')
    .set('Accept', 'application/json')
    .send({ sectionIds: initialResponse.body.unavailableSectionIds });

  assert.equal(retryResponse.status, 401);
  assert.deepEqual(retryResponse.body, {
    loginUrl: '/login',
    returnTo: '/dashboard',
    status: 'auth_error'
  });

  context.cleanup();
});
