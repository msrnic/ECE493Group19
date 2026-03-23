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

test('dashboard renders a partial view and selective retry restores recovered sections', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  context.dashboardTestState.unavailableSectionsByIdentifier['usera@example.com'] = ['financial-summary'];

  await loginAs(agent, 'userA@example.com');
  const htmlResponse = await agent.get('/dashboard');

  assert.equal(htmlResponse.status, 200);
  assert.equal(htmlResponse.text.includes('Some dashboard sections are currently unavailable.'), true);
  assert.equal(htmlResponse.text.includes('Retry unavailable sections'), true);
  assert.equal(htmlResponse.text.includes('Financial Summary <span class="dashboard-pill">Unavailable</span>'), true);
  assert.equal(htmlResponse.text.includes('Academic Records'), true);

  const initialPayload = await agent
    .get('/dashboard')
    .set('Accept', 'application/json');
  context.resetDashboardTestState();

  const retryResponse = await agent
    .post('/dashboard/retry')
    .set('Accept', 'application/json')
    .send({ sectionIds: initialPayload.body.unavailableSectionIds });

  assert.equal(retryResponse.status, 200);
  assert.equal(retryResponse.body.status, 'success');
  assert.deepEqual(retryResponse.body.unavailableSectionIds, []);

  const accountId = context.db.prepare('SELECT id FROM accounts WHERE email = ?').get('userA@example.com').id;
  const unavailableStates = context.app.locals.services.dashboardSectionStateModel.listUnavailableSectionIds(accountId);
  assert.deepEqual(unavailableStates, []);

  context.cleanup();
});

test('dashboard renders a failure state when every section is unavailable', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  context.dashboardTestState.unavailableSectionsByIdentifier.usera = [
    'inbox',
    'security-center',
    'student-academics',
    'schedule-builder',
    'enrollment-hub',
    'financial-summary'
  ];

  await loginAs(agent, 'userA@example.com');
  const response = await agent.get('/dashboard');

  assert.equal(response.status, 200);
  assert.equal(response.text.includes('Dashboard data is unavailable right now. Retry to load your sections again.'), true);
  assert.equal(response.text.includes('Inbox <span class="dashboard-pill">Unavailable</span>'), true);
  assert.equal(response.text.includes('Personal Profile <span class="dashboard-pill">Unavailable</span>'), true);
  assert.equal(response.text.includes('Academic Records <span class="dashboard-pill">Unavailable</span>'), true);
  assert.equal(response.text.includes('Schedule Builder <span class="dashboard-pill">Unavailable</span>'), true);
  assert.equal(response.text.includes('Enrollment Hub <span class="dashboard-pill">Unavailable</span>'), true);
  assert.equal(response.text.includes('Financial Summary <span class="dashboard-pill">Unavailable</span>'), true);

  context.cleanup();
});

test('dashboard retry rejects section IDs that are not currently unavailable', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  context.dashboardTestState.unavailableSectionsByIdentifier['usera@example.com'] = ['security-center'];

  await loginAs(agent, 'userA@example.com');
  await agent.get('/dashboard').set('Accept', 'application/json').expect(200);

  const response = await agent
    .post('/dashboard/retry')
    .set('Accept', 'application/json')
    .send({ sectionIds: [999] });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    errorCode: 'retry_section_unavailable',
    message: 'Retry requests may target only sections that are currently unavailable.',
    status: 'error'
  });

  context.cleanup();
});
