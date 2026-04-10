const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function loginAs(agent, identifier) {
  await agent.post('/login').type('form').send({ identifier, password: USER_PASSWORD }).expect(302);
}

test('professor can view assigned offering rosters including filter and sort behavior', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  const offeringId = context.db.prepare('SELECT id FROM class_offerings WHERE offering_code = ?').get('O_ROSTER').id;

  await loginAs(agent, 'professor@example.com');
  const response = await agent.get('/teaching/rosters').query({ offeringId, program: 'Software Engineering', sort: 'student_id' });

  assert.equal(response.status, 200);
  assert.match(response.text, /Alex Example/);
  assert.doesNotMatch(response.text, /Hold Student/);
  assert.match(response.text, /Software Engineering/);

  context.cleanup();
});

test('empty, unauthorized, and error roster states are surfaced safely', async () => {
  const emptyContext = createTestContext();
  const emptyAgent = request.agent(emptyContext.app);
  const emptyOfferingId = emptyContext.db.prepare('SELECT id FROM class_offerings WHERE offering_code = ?').get('O_EMPTY').id;
  await loginAs(emptyAgent, 'professor@example.com');
  const empty = await emptyAgent.get('/teaching/rosters').query({ offeringId: emptyOfferingId });
  assert.equal(empty.status, 200);
  assert.match(empty.text, /No students are currently enrolled/);
  emptyContext.cleanup();

  const unauthorizedContext = createTestContext();
  const unauthorizedAgent = request.agent(unauthorizedContext.app);
  const unauthorizedOfferingId = unauthorizedContext.db.prepare('SELECT id FROM class_offerings WHERE offering_code = ?').get('O_HYBRID').id;
  await loginAs(unauthorizedAgent, 'professor@example.com');
  const forbidden = await unauthorizedAgent.get('/teaching/rosters').query({ offeringId: unauthorizedOfferingId });
  assert.equal(forbidden.status, 403);
  assert.match(forbidden.text, /Access denied/);
  unauthorizedContext.cleanup();

  const errorContext = createTestContext({
    courseRosterTestState: { failureIdentifiers: ['professor@example.com'] }
  });
  const errorAgent = request.agent(errorContext.app);
  const rosterOfferingId = errorContext.db.prepare('SELECT id FROM class_offerings WHERE offering_code = ?').get('O_ROSTER').id;
  await loginAs(errorAgent, 'professor@example.com');
  const failed = await errorAgent.get('/teaching/rosters').query({ offeringId: rosterOfferingId });
  assert.equal(failed.status, 503);
  assert.match(failed.text, /temporarily unavailable/);
  errorContext.cleanup();
});
