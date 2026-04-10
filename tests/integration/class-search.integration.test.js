const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function loginAs(agent, identifier, password = USER_PASSWORD) {
  await agent.post('/login').type('form').send({ identifier, password }).expect(302);
}

test('class search shows matching available classes and linked details for authenticated students', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');
  const search = await agent.get('/classes/search').query({ q: 'ENGL' });

  assert.equal(search.status, 200);
  assert.match(search.text, /Technical Communication/);
  assert.match(search.text, /Seat availability last updated/);
  assert.match(search.text, /View class details/);

  const detail = await agent.get('/classes/1');
  assert.equal(detail.status, 200);
  assert.match(detail.text, /ENGL210 Technical Communication/);
  assert.match(detail.text, /Section: O_OPEN/);

  context.cleanup();
});

test('class search reports failures safely when catalog search is unavailable', async () => {
  const context = createTestContext({
    classSearchTestState: { failureIdentifiers: ['userA@example.com'] }
  });
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');
  const response = await agent.get('/classes/search').query({ q: 'ENGL' });

  assert.equal(response.status, 503);
  assert.match(response.text, /Class search cannot be completed right now\. Please retry\./);
  assert.doesNotMatch(response.text, /Technical Communication/);

  context.cleanup();
});

test('class search handles idle state, no-results state, auth redirect, and detail errors', async () => {
  const context = createTestContext({
    classSearchTestState: { failureIdentifiers: ['outage.user@example.com'] }
  });
  const agent = request.agent(context.app);

  const anonymous = await request(context.app).get('/classes/search');
  assert.equal(anonymous.status, 302);
  assert.equal(anonymous.headers.location, '/login?returnTo=%2Fclasses%2Fsearch');

  await loginAs(agent, 'userA@example.com');

  const idle = await agent.get('/classes/search');
  assert.equal(idle.status, 200);
  assert.match(idle.text, /Enter a keyword, subject, or course number/);

  const empty = await agent.get('/classes/search').query({ subject: 'ZZZ' });
  assert.equal(empty.status, 200);
  assert.match(empty.text, /No classes found/);

  const missingDetail = await agent.get('/classes/2');
  assert.equal(missingDetail.status, 404);
  assert.match(missingDetail.text, /Class not found/);

  const outageAgent = request.agent(context.app);
  await loginAs(outageAgent, 'outage.user@example.com');
  const detailError = await outageAgent.get('/classes/4');
  assert.equal(detailError.status, 503);
  assert.match(detailError.text, /Class details cannot be loaded right now/);

  context.cleanup();
});

test('student can enroll in a found class from search results and detail pages', async () => {
  const searchContext = createTestContext();
  const searchAgent = request.agent(searchContext.app);

  await loginAs(searchAgent, 'userA@example.com');
  const search = await searchAgent.get('/classes/search').query({ q: 'ENGL' });
  assert.equal(search.status, 200);
  assert.match(search.text, /<form method="post" action="\/enrollment">/);
  assert.match(search.text, /<button type="submit">Enroll<\/button>/);

  const enrollFromSearch = await searchAgent.post('/enrollment').type('form').send({ offeringId: '1' });
  assert.equal(enrollFromSearch.status, 200);
  assert.match(enrollFromSearch.text, /enrolled successfully/);
  assert.match(enrollFromSearch.text, /ENGL210 Technical Communication \(O_OPEN\)/);
  searchContext.cleanup();

  const detailContext = createTestContext();
  const detailAgent = request.agent(detailContext.app);

  await loginAs(detailAgent, 'prereq.student@example.com');
  const detail = await detailAgent.get('/classes/1');
  assert.equal(detail.status, 200);
  assert.match(detail.text, /Enroll in this class/);

  const blockedFromDetail = await detailAgent.post('/enrollment').type('form').send({ offeringId: '1' });
  assert.equal(blockedFromDetail.status, 409);
  assert.match(blockedFromDetail.text, /Unmet prerequisite: CMPUT301/);
  detailContext.cleanup();
});

test('found-class enrollment shows full-course, hold, and retry-safe error outcomes', async () => {
  const fullContext = createTestContext();
  const fullAgent = request.agent(fullContext.app);
  await loginAs(fullAgent, 'userA@example.com');
  const fullSearch = await fullAgent.get('/classes/search').query({ q: 'STAT' });
  assert.equal(fullSearch.status, 200);
  const full = await fullAgent.post('/enrollment').type('form').send({ offeringId: '2' });
  assert.equal(full.status, 409);
  assert.match(full.text, /0 seats remaining/);
  fullContext.cleanup();

  const holdContext = createTestContext();
  const holdAgent = request.agent(holdContext.app);
  await loginAs(holdAgent, 'hold.student@example.com');
  const holdDetail = await holdAgent.get('/classes/1');
  assert.equal(holdDetail.status, 200);
  const hold = await holdAgent.post('/enrollment').type('form').send({ offeringId: '1' });
  assert.equal(hold.status, 409);
  assert.match(hold.text, /Outstanding fees must be cleared before enrolling in new classes\./);
  holdContext.cleanup();

  const errorContext = createTestContext({
    enrollmentTestState: { failureIdentifiers: ['outage.user@example.com'] }
  });
  const errorAgent = request.agent(errorContext.app);
  await loginAs(errorAgent, 'outage.user@example.com');
  const errorDetail = await errorAgent.get('/classes/4');
  assert.equal(errorDetail.status, 200);
  const before = errorContext.db.prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = 8').get().count;
  const failure = await errorAgent.post('/enrollment').type('form').send({ offeringId: '4' });
  assert.equal(failure.status, 500);
  assert.match(failure.text, /Enrollment could not be completed right now\. Please retry\./);
  assert.match(failure.text, /No enrollment was created\. Refresh your schedule and retry\./);
  assert.equal(
    errorContext.db.prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = 8').get().count,
    before
  );
  errorContext.cleanup();
});
