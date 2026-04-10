const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

async function loginAs(agent, identifier, password = 'CorrectPass!234') {
  await agent.post('/login').type('form').send({ identifier, password }).expect(302);
}

test('professor can open final grade entry, save draft, submit grades, and export summary', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    await loginAs(agent, 'professor@example.com');

    const dashboard = await agent.get('/dashboard');
    assert.equal(dashboard.status, 200);
    assert.match(dashboard.text, /Enter final grades for ECE493/);
    assert.match(dashboard.text, /View grade submission summary/);

    const page = await agent.get('/grades/offerings/1');
    assert.equal(page.status, 200);
    assert.match(page.text, /Save as Draft/);

    const draft = await agent
      .post('/grades/offerings/1')
      .type('form')
      .send({ grade_1: 'A', grade_9: 'B+', grade_10: 'A-', intent: 'draft' });
    assert.equal(draft.status, 200);
    assert.match(draft.text, /saved as draft/);

    const submitted = await agent
      .post('/grades/offerings/1')
      .type('form')
      .send({ grade_1: 'A', grade_9: 'B+', grade_10: 'A-', intent: 'submit' });
    assert.equal(submitted.status, 200);
    assert.match(submitted.text, /submitted successfully/);

    const summary = await agent.get('/grades/summary?offeringId=1');
    assert.equal(summary.status, 200);
    assert.match(summary.text, /Grade Distribution/);

    const apiSummary = await agent.get('/api/grades/summary?offeringId=1');
    assert.equal(apiSummary.status, 200);
    assert.equal(apiSummary.body.totalStudents, 3);

    const exportResponse = await agent.get('/grades/offerings/1/export-summary');
    assert.equal(exportResponse.status, 200);
    assert.match(exportResponse.text, /ECE493,2026WINTER,userA/);
  } finally {
    context.cleanup();
  }
});

test('gradebook handles invalid grade, deadline passed, save failure, summary outage, and unauthorized access', async () => {
  const context = createTestContext({
    gradebookTestState: {
      auditFailureIdentifiersByFeature: { grade_entry: ['professor@example.com'] },
      saveFailureIdentifiers: ['professor@example.com'],
      summaryFailureIdentifiers: ['professor@example.com']
    }
  });

  try {
    const agent = request.agent(context.app);
    await loginAs(agent, 'professor@example.com');

    const invalid = await agent
      .post('/grades/offerings/1')
      .type('form')
      .send({ grade_1: 'ZZ', grade_9: 'B+', grade_10: 'A-', intent: 'submit' });
    assert.equal(invalid.status, 400);
    assert.match(invalid.text, /Please correct the highlighted final grades/);

    const failed = await agent
      .post('/grades/offerings/1')
      .type('form')
      .send({ grade_1: 'A', grade_9: 'B+', grade_10: 'A-', intent: 'submit' });
    assert.equal(failed.status, 500);
    assert.match(failed.text, /could not save final grades/);

    context.resetGradebookTestState();
    await agent
      .post('/grades/offerings/1')
      .type('form')
      .send({ grade_1: 'A', grade_9: 'B+', grade_10: 'A-', intent: 'submit' });
    context.advanceTime(40 * 24 * 60 * 60 * 1000);
    const deadline = await agent
      .post('/grades/offerings/1')
      .type('form')
      .send({ grade_1: 'B', grade_9: 'B+', grade_10: 'A-', intent: 'submit' });
    assert.equal(deadline.status, 409);
    assert.match(deadline.text, /deadline has passed/);

    context.gradebookTestState.summaryFailureIdentifiers = ['professor@example.com'];
    const unavailable = await agent.get('/grades/summary?offeringId=1');
    assert.equal(unavailable.status, 503);
    assert.match(unavailable.text, /temporarily unavailable/);

    context.gradebookTestState.auditFailureIdentifiersByFeature = {
      grade_entry: ['professor@example.com']
    };
    const unauthorizedPage = await agent.get('/grades/offerings/2');
    assert.equal(unauthorizedPage.status, 403);
    const unauthorizedExport = await agent.get('/grades/offerings/2/export-summary');
    assert.equal(unauthorizedExport.status, 403);

    const audits = context.db
      .prepare("SELECT degraded_logging FROM gradebook_access_audits WHERE feature_key = 'grade_entry' ORDER BY id ASC")
      .all();
    assert.equal(audits.length >= 1, true);
    assert.equal(audits[0].degraded_logging, 1);
  } finally {
    context.cleanup();
  }
});
