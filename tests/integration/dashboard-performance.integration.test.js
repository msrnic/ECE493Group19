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

test('dashboard load telemetry records p95 timings under the SC-001 threshold for initial loads and retries', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  const loadModel = context.app.locals.services.dashboardLoadModel;
  context.dashboardTestState.unavailableSectionsByIdentifier['usera@example.com'] = ['security-center'];

  await loginAs(agent, 'userA@example.com');

  for (let attempt = 0; attempt < 5; attempt += 1) {
    await agent
      .get('/dashboard')
      .set('Accept', 'application/json')
      .expect(200);
  }

  const initialSummary = loadModel.getPerformanceSummary('initial_load', 95);
  assert.equal(initialSummary.sampleSize, 5);
  assert.notEqual(initialSummary.valueMs, null);
  assert.equal(initialSummary.valueMs <= 3000, true);

  const initialPayload = await agent
    .get('/dashboard')
    .set('Accept', 'application/json');
  context.resetDashboardTestState();

  await agent
    .post('/dashboard/retry')
    .set('Accept', 'application/json')
    .send({ sectionIds: initialPayload.body.unavailableSectionIds })
    .expect(200);

  const retrySummary = loadModel.getPerformanceSummary('retry', 95);
  assert.equal(retrySummary.sampleSize >= 1, true);
  assert.notEqual(retrySummary.valueMs, null);
  assert.equal(retrySummary.valueMs <= 3000, true);

  context.cleanup();
});
