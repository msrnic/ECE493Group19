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

test('GET /dashboard redirects unauthenticated users to the login page with returnTo', async () => {
  const context = createTestContext();
  const response = await request(context.app).get('/dashboard');

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, '/login?returnTo=%2Fdashboard');

  context.cleanup();
});

test('GET /dashboard renders authenticated account data, available navigation, and student dashboard sections', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');

  const response = await agent.get('/dashboard');
  assert.equal(response.status, 200);
  assert.equal(response.text.includes('Welcome, userA'), true);
  assert.equal(response.text.includes('Available navigation'), true);
  assert.equal(response.text.includes('Inbox'), true);
  assert.equal(response.text.includes('Personal Profile'), true);
  assert.equal(response.text.includes('Academic Records'), true);
  assert.equal(response.text.includes('Schedule Builder'), true);
  assert.equal(response.text.includes('Enrollment Hub'), true);
  assert.equal(response.text.includes('Financial Summary'), true);
  assert.equal(response.text.includes('Outstanding balance: $1,245.67'), true);
  assert.equal(response.text.includes('Outstanding fees: $325.00'), true);
  assert.equal(response.text.includes('Payment status: Pending confirmation'), true);
  assert.equal(response.text.includes('Security Center'), false);
  assert.equal(response.text.includes('Make a payment'), false);
  assert.equal(response.text.includes('Change Password'), true);
  assert.equal(response.text.includes('Log out'), true);
  assert.equal(response.text.includes('Admin Operations'), false);
  assert.equal(response.text.indexOf('Inbox') < response.text.indexOf('Personal Profile'), true);
  assert.equal(response.text.indexOf('Personal Profile') < response.text.indexOf('Academic Records'), true);
  assert.equal(response.text.indexOf('Academic Records') < response.text.indexOf('Schedule Builder'), true);
  assert.equal(response.text.indexOf('Schedule Builder') < response.text.indexOf('Enrollment Hub'), true);
  assert.equal(response.text.indexOf('Enrollment Hub') < response.text.indexOf('Financial Summary'), true);

  context.cleanup();
});

test('GET /dashboard shows only the signed-in student financial snapshot and does not leak another account snapshot', async () => {
  const context = createTestContext();
  const outageAccountId = context.db
    .prepare('SELECT id FROM accounts WHERE email = ?')
    .get('outage.user@example.com').id;
  context.db.prepare(`
    INSERT INTO financial_summary_snapshots (
      account_id,
      balance_due_cents,
      outstanding_fees_cents,
      payment_status,
      source_state,
      last_confirmed_at,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    outageAccountId,
    999999,
    999999,
    'overdue',
    'stale',
    '2026-03-07T11:30:00.000Z',
    '2026-03-07T12:00:00.000Z'
  );
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');

  const response = await agent.get('/dashboard');
  assert.equal(response.status, 200);
  assert.equal(response.text.includes('Outstanding balance: $1,245.67'), true);
  assert.equal(response.text.includes('Outstanding balance: $9,999.99'), false);

  context.cleanup();
});

test('POST /logout revokes the current session and redirects future dashboard requests to the login page with returnTo', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');

  const logoutResponse = await agent.post('/logout');
  assert.equal(logoutResponse.status, 302);
  assert.equal(logoutResponse.headers.location, '/login');
  assert.match((logoutResponse.headers['set-cookie'] || []).join('\n'), /connect\.sid=.*Expires=/);

  const sessionRecord = context.db
    .prepare('SELECT invalidation_reason, revoked_at FROM user_sessions WHERE account_id = (SELECT id FROM accounts WHERE email = ?) ORDER BY created_at DESC LIMIT 1')
    .get('userA@example.com');

  assert.equal(sessionRecord.invalidation_reason, 'logout');
  assert.notEqual(sessionRecord.revoked_at, null);

  const dashboardResponse = await agent.get('/dashboard');
  assert.equal(dashboardResponse.status, 302);
  assert.equal(dashboardResponse.headers.location, '/login?returnTo=%2Fdashboard');

  context.cleanup();
});
