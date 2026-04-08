const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function loginAs(agent, identifier, password = USER_PASSWORD) {
  await agent.post('/login').type('form').send({ identifier, password }).expect(302);
}

test('enrollment page renders offerings and schedule for authenticated students', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');
  const response = await agent.get('/enrollment');

  assert.equal(response.status, 200);
  assert.match(response.text, /Class Enrollment/);
  assert.match(response.text, /O_OPEN/);
  assert.match(response.text, /Current Schedule/);

  context.cleanup();
});

test('eligible student enrolls successfully and schedule updates', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');
  const response = await agent.post('/enrollment').type('form').send({ offeringId: '1' });

  assert.equal(response.status, 200);
  assert.match(response.text, /enrolled successfully/);
  assert.match(response.text, /Fee assessment change: \$450\.00/);
  assert.equal(
    context.db.prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = 1 AND offering_id = 1').get().count,
    1
  );

  context.cleanup();
});

test('enrollment blocks prerequisites, full classes, holds, duplicate/conflict, and missing offerings', async () => {
  const prereqContext = createTestContext();
  const prereqAgent = request.agent(prereqContext.app);
  await loginAs(prereqAgent, 'prereq.student@example.com');
  const prereq = await prereqAgent.post('/enrollment').type('form').send({ offeringId: '1' });
  assert.equal(prereq.status, 409);
  assert.match(prereq.text, /Unmet prerequisite: CMPUT301/);
  prereqContext.cleanup();

  const fullContext = createTestContext();
  const fullAgent = request.agent(fullContext.app);
  await loginAs(fullAgent, 'userA@example.com');
  const full = await fullAgent.post('/enrollment').type('form').send({ offeringId: '2' });
  assert.equal(full.status, 409);
  assert.match(full.text, /0 seats remaining/);
  fullContext.cleanup();

  const holdContext = createTestContext();
  const holdAgent = request.agent(holdContext.app);
  await loginAs(holdAgent, 'hold.student@example.com');
  const hold = await holdAgent.post('/enrollment').type('form').send({ offeringId: '1' });
  assert.equal(hold.status, 409);
  assert.match(hold.text, /Outstanding fees must be cleared before enrolling in new classes\./);
  holdContext.cleanup();

  const conflictContext = createTestContext();
  const conflictAgent = request.agent(conflictContext.app);
  await loginAs(conflictAgent, 'conflict.student@example.com');
  const conflict = await conflictAgent.post('/enrollment').type('form').send({ offeringId: '3' });
  assert.equal(conflict.status, 409);
  assert.match(conflict.text, /already enrolled|Schedule conflict/);
  conflictContext.cleanup();

  const missingContext = createTestContext();
  const missingAgent = request.agent(missingContext.app);
  await loginAs(missingAgent, 'userA@example.com');
  const missing = await missingAgent.post('/enrollment').type('form').send({ offeringId: '999' });
  assert.equal(missing.status, 404);
  missingContext.cleanup();
});

test('enrollment error leaves schedule unchanged and professor access redirects through auth flow', async () => {
  const context = createTestContext({
    enrollmentTestState: { failureIdentifiers: ['outage.user@example.com'] }
  });
  const agent = request.agent(context.app);

  await loginAs(agent, 'outage.user@example.com');
  const before = context.db.prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = 8').get().count;
  const failure = await agent.post('/enrollment').type('form').send({ offeringId: '4' });

  assert.equal(failure.status, 500);
  assert.match(failure.text, /Please retry/);
  assert.equal(
    context.db.prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = 8').get().count,
    before
  );

  const professorAgent = request.agent(context.app);
  await loginAs(professorAgent, 'professor@example.com');
  const professorPage = await professorAgent.get('/enrollment');
  assert.equal(professorPage.status, 302);

  context.cleanup();
});
