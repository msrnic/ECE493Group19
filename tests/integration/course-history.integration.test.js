const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

async function loginAs(agent, identifier, password = 'CorrectPass!234') {
  await agent.post('/login').type('form').send({ identifier, password }).expect(302);
}

test('course history renders full and partial views from the dashboard entry points', async () => {
  const context = createTestContext();

  try {
    const userAgent = request.agent(context.app);
    await loginAs(userAgent, 'userA@example.com');

    const dashboard = await userAgent.get('/dashboard');
    assert.equal(dashboard.status, 200);
    assert.match(dashboard.text, /View my course history/);

    const fullPage = await userAgent.get('/academic/course-history');
    assert.equal(fullPage.status, 200);
    assert.match(fullPage.text, /Course History/);
    assert.match(fullPage.text, /CMPUT301/);
    assert.match(fullPage.text, /ECE493/);

    const partialAgent = request.agent(context.app);
    await loginAs(partialAgent, 'prereq.student@example.com');
    const partialPage = await partialAgent.get('/academic/course-history');
    assert.equal(partialPage.status, 200);
    assert.match(partialPage.text, /incomplete/);
    assert.match(partialPage.text, /STAT235/);
  } finally {
    context.cleanup();
  }
});

test('course history renders empty and unavailable states and enforces denial logging', async () => {
  const context = createTestContext({
    courseHistoryTestState: { retrievalFailureIdentifiers: ['outage.user@example.com'] },
    studentRecordTestState: {
      auditFailureIdentifiersByFeature: { course_history: ['professor@example.com'] }
    }
  });

  try {
    const emptyAgent = request.agent(context.app);
    await loginAs(emptyAgent, 'nomodule.student@example.com');
    const emptyPage = await emptyAgent.get('/academic/course-history');
    assert.equal(emptyPage.status, 200);
    assert.match(emptyPage.text, /No course history yet/);

    const outageAgent = request.agent(context.app);
    await loginAs(outageAgent, 'outage.user@example.com');
    const unavailablePage = await outageAgent.get('/academic/course-history');
    assert.equal(unavailablePage.status, 503);
    assert.match(unavailablePage.text, /temporarily unavailable/);

    const apiResponse = await outageAgent.get('/api/students/outageUser/course-history');
    assert.equal(apiResponse.status, 503);
    assert.equal(apiResponse.body.state, 'unavailable');

    const professorAgent = request.agent(context.app);
    await loginAs(professorAgent, 'professor@example.com');
    const deniedPage = await professorAgent.get('/students/userA/course-history');
    assert.equal(deniedPage.status, 403);

    const deniedApi = await professorAgent.get('/api/students/userA/course-history');
    assert.equal(deniedApi.status, 403);

    const audits = context.db
      .prepare("SELECT denial_reason, degraded_logging FROM student_record_access_audits WHERE feature_key = 'course_history' ORDER BY id ASC")
      .all();
    assert.equal(audits.length >= 2, true);
    assert.equal(audits[0].degraded_logging, 1);
  } finally {
    context.cleanup();
  }
});
