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

function assertDashboardPayload(payload) {
  assert.equal(typeof payload.actorId, 'number');
  assert.equal(typeof payload.message, 'string');
  assert.equal(Array.isArray(payload.modules), true);
  assert.equal(Array.isArray(payload.sections), true);
  assert.equal(typeof payload.retryAvailable, 'boolean');
  assert.equal(Array.isArray(payload.unavailableSectionIds), true);
  assert.match(payload.status, /^(success|partial|failure|auth_error|empty_access|role_data_error)$/);

  for (const module of payload.modules) {
    assert.equal(typeof module.moduleId, 'number');
    assert.equal(typeof module.moduleKey, 'string');
    assert.equal(typeof module.displayName, 'string');
    assert.equal(typeof module.routePath, 'string');
    assert.match(module.navigationState, /^(enabled|disabled_unavailable)$/);
  }

  for (const section of payload.sections) {
    assert.equal(typeof section.sectionId, 'number');
    assert.equal(typeof section.sectionKey, 'string');
    assert.equal(typeof section.title, 'string');
    assert.match(section.availabilityStatus, /^(available|unavailable)$/);
    if (section.availabilityStatus === 'unavailable') {
      assert.equal(section.unavailableLabel, 'Unavailable');
    }
  }
}

test('GET /dashboard returns an auth redirect payload for unauthenticated JSON requests', async () => {
  const context = createTestContext();

  const response = await request(context.app)
    .get('/dashboard')
    .set('Accept', 'application/json');

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, {
    loginUrl: '/login',
    returnTo: '/dashboard',
    status: 'auth_error'
  });

  context.cleanup();
});

test('GET /dashboard returns a success payload matching the contract for a student actor', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');
  const response = await agent
    .get('/dashboard')
    .set('Accept', 'application/json');

  assert.equal(response.status, 200);
  assertDashboardPayload(response.body);
  assert.equal(response.body.status, 'success');
  assert.equal(response.body.retryAvailable, false);
  assert.deepEqual(
    response.body.modules.map((module) => module.moduleKey),
    ['inbox', 'security-center', 'student-academics', 'schedule-builder', 'enrollment-hub', 'financial-summary']
  );
  assert.deepEqual(
    response.body.sections.map((section) => section.sectionKey),
    ['inbox', 'security-center', 'student-academics', 'schedule-builder', 'enrollment-hub', 'financial-summary']
  );

  context.cleanup();
});

test('GET /dashboard returns empty_access when the actor has no assigned dashboard modules', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'nomodule.student@example.com');
  const response = await agent
    .get('/dashboard')
    .set('Accept', 'application/json');

  assert.equal(response.status, 200);
  assertDashboardPayload(response.body);
  assert.equal(response.body.status, 'empty_access');
  assert.equal(response.body.message, 'Your account has no assigned dashboard modules. Contact an administrator.');
  assert.deepEqual(response.body.modules, []);
  assert.deepEqual(response.body.sections, []);
  assert.equal(response.body.retryAvailable, false);

  context.cleanup();
});

test('GET /dashboard returns role_data_error when role retrieval fails for the authenticated actor', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  context.dashboardTestState.roleFailureIdentifiers.push('userA');

  await loginAs(agent, 'userA@example.com');
  const response = await agent
    .get('/dashboard')
    .set('Accept', 'application/json');

  assert.equal(response.status, 200);
  assertDashboardPayload(response.body);
  assert.equal(response.body.status, 'role_data_error');
  assert.equal(response.body.retryAvailable, true);
  assert.deepEqual(response.body.modules, []);
  assert.deepEqual(response.body.sections, []);
  assert.equal(response.body.message, 'We could not load your role assignments. Retry to continue.');

  context.cleanup();
});
