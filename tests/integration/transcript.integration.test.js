const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

async function loginAs(agent, identifier, password = 'CorrectPass!234') {
  await agent.post('/login').type('form').send({ identifier, password }).expect(302);
}

test('transcript renders full and partial views from the dashboard entry point', async () => {
  const context = createTestContext();

  try {
    const userAgent = request.agent(context.app);
    await loginAs(userAgent, 'userA@example.com');

    const dashboard = await userAgent.get('/dashboard');
    assert.equal(dashboard.status, 200);
    assert.match(dashboard.text, /View my transcript/);

    const fullPage = await userAgent.get('/academic/transcript');
    assert.equal(fullPage.status, 200);
    assert.match(fullPage.text, /Transcript/);
    assert.match(fullPage.text, /Final result: A-/);

    const partialAgent = request.agent(context.app);
    await loginAs(partialAgent, 'hold.student@example.com');
    const partialPage = await partialAgent.get('/academic/transcript');
    assert.equal(partialPage.status, 200);
    assert.match(partialPage.text, /Some transcript details are incomplete/);
    assert.match(partialPage.text, /STAT151/);
  } finally {
    context.cleanup();
  }
});

test('transcript renders empty and unavailable states and enforces denial logging', async () => {
  const context = createTestContext({
    transcriptTestState: { retrievalFailureIdentifiers: ['outage.user@example.com'] },
    studentRecordTestState: {
      auditFailureIdentifiersByFeature: { transcript: ['professor@example.com'] }
    }
  });

  try {
    const emptyAgent = request.agent(context.app);
    await loginAs(emptyAgent, 'nomodule.student@example.com');
    const emptyPage = await emptyAgent.get('/academic/transcript');
    assert.equal(emptyPage.status, 200);
    assert.match(emptyPage.text, /No transcript entries yet/);

    const outageAgent = request.agent(context.app);
    await loginAs(outageAgent, 'outage.user@example.com');
    const unavailablePage = await outageAgent.get('/academic/transcript');
    assert.equal(unavailablePage.status, 503);
    assert.match(unavailablePage.text, /Transcript data is temporarily unavailable/);

    const apiResponse = await outageAgent.get('/api/students/outageUser/transcript');
    assert.equal(apiResponse.status, 503);
    assert.equal(apiResponse.body.state, 'unavailable');

    const professorAgent = request.agent(context.app);
    await loginAs(professorAgent, 'professor@example.com');
    const deniedPage = await professorAgent.get('/students/userA/transcript');
    assert.equal(deniedPage.status, 403);

    const deniedApi = await professorAgent.get('/api/students/userA/transcript');
    assert.equal(deniedApi.status, 403);

    const audits = context.db
      .prepare("SELECT denial_reason, degraded_logging FROM student_record_access_audits WHERE feature_key = 'transcript' ORDER BY id ASC")
      .all();
    assert.equal(audits.length >= 2, true);
    assert.equal(audits[0].degraded_logging, 1);
  } finally {
    context.cleanup();
  }
});
