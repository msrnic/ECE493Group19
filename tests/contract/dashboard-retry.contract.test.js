const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const USER_PASSWORD = 'CorrectPass' + '!234';

async function loginAs(agent, identifier, password = USER_PASSWORD) {
  await agent
    .post('/login')
    .type('form')
    .send({ identifier, password })
    .expect(302);
}

test('POST /dashboard/retry returns auth_error for unauthenticated JSON requests', async () => {
  const context = createTestContext();

  const response = await request(context.app)
    .post('/dashboard/retry')
    .set('Accept', 'application/json')
    .send({ sectionIds: [1] });

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, {
    loginUrl: '/login',
    returnTo: '/dashboard',
    status: 'auth_error'
  });

  context.cleanup();
});

test('POST /dashboard/retry returns a 400 contract payload for invalid retry requests', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  context.dashboardTestState.unavailableSectionsByIdentifier['usera@example.com'] = ['financial-summary'];

  await loginAs(agent, 'userA@example.com');
  await agent.get('/dashboard').set('Accept', 'application/json').expect(200);

  const response = await agent
    .post('/dashboard/retry')
    .set('Accept', 'application/json')
    .send({ sectionIds: ['invalid'] });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    errorCode: 'invalid_retry_request',
    message: 'Retry section IDs must be positive integers.',
    status: 'error'
  });

  context.cleanup();
});

test('POST /dashboard/retry returns a partial payload when only some unavailable sections recover', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  context.dashboardTestState.unavailableSectionsByIdentifier['usera@example.com'] = [
    'student-academics',
    'financial-summary'
  ];

  await loginAs(agent, 'userA@example.com');
  const initialResponse = await agent
    .get('/dashboard')
    .set('Accept', 'application/json');

  assert.equal(initialResponse.body.status, 'partial');
  assert.equal(initialResponse.body.unavailableSectionIds.length, 2);

  context.dashboardTestState.unavailableSectionsByIdentifier['usera@example.com'] = ['financial-summary'];
  const retryResponse = await agent
    .post('/dashboard/retry')
    .set('Accept', 'application/json')
    .send({ sectionIds: initialResponse.body.unavailableSectionIds });

  assert.equal(retryResponse.status, 200);
  assert.equal(retryResponse.body.status, 'partial');
  assert.equal(retryResponse.body.unavailableSectionIds.length, 1);
  assert.equal(
    retryResponse.body.sections.some(
      (section) => section.sectionKey === 'student-academics' && section.availabilityStatus === 'available'
    ),
    true
  );

  context.cleanup();
});

test('POST /dashboard/retry returns success when all requested sections recover', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  context.dashboardTestState.unavailableSectionsByIdentifier.usera = ['security-center'];

  await loginAs(agent, 'userA@example.com');
  const initialResponse = await agent
    .get('/dashboard')
    .set('Accept', 'application/json');

  assert.equal(initialResponse.body.status, 'partial');
  assert.deepEqual(initialResponse.body.unavailableSectionIds.length, 1);

  context.resetDashboardTestState();
  const retryResponse = await agent
    .post('/dashboard/retry')
    .set('Accept', 'application/json')
    .send({ sectionIds: initialResponse.body.unavailableSectionIds });

  assert.equal(retryResponse.status, 200);
  assert.equal(retryResponse.body.status, 'success');
  assert.deepEqual(retryResponse.body.unavailableSectionIds, []);
  assert.equal(
    retryResponse.body.sections.every((section) => section.availabilityStatus === 'available'),
    true
  );

  context.cleanup();
});

test('POST /dashboard/retry returns failure when every section remains unavailable', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  context.dashboardTestState.unavailableSectionsByIdentifier['usera@example.com'] = [
    'inbox',
    'security-center',
    'student-academics',
    'schedule-builder',
    'enrollment-hub',
    'financial-summary'
  ];

  await loginAs(agent, 'userA@example.com');
  const initialResponse = await agent
    .get('/dashboard')
    .set('Accept', 'application/json');

  assert.equal(initialResponse.body.status, 'failure');
  assert.equal(initialResponse.body.unavailableSectionIds.length, 6);

  const retryResponse = await agent
    .post('/dashboard/retry')
    .set('Accept', 'application/json')
    .send({ sectionIds: initialResponse.body.unavailableSectionIds });

  assert.equal(retryResponse.status, 200);
  assert.equal(retryResponse.body.status, 'failure');
  assert.equal(retryResponse.body.retryAvailable, true);
  assert.equal(
    retryResponse.body.modules.every((module) => module.navigationState === 'disabled_unavailable'),
    true
  );

  context.cleanup();
});
