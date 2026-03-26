const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';
const ADMIN_PASSWORD = 'AdminPass' + String.fromCharCode(33) + '234';

async function loginAs(agent, identifier, password) {
  await agent
    .post('/login')
    .type('form')
    .send({ identifier, password: password || USER_PASSWORD })
    .expect(302);
}

test('dashboard shows a minimal shell without unauthorized modules when a student has no active assignments', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'nomodule.student@example.com');
  const response = await agent.get('/dashboard');

  assert.equal(response.status, 200);
  assert.equal(response.text.includes('Minimal dashboard'), true);
  assert.equal(response.text.includes('Contact an administrator'), true);
  assert.equal(response.text.includes('Inbox'), false);
  assert.equal(response.text.includes('Personal Profile'), false);
  assert.equal(response.text.includes('Academic Records'), false);
  assert.equal(response.text.includes('Schedule Builder'), false);
  assert.equal(response.text.includes('Enrollment Hub'), false);
  assert.equal(response.text.includes('Financial Summary'), false);
  assert.equal(response.text.includes('Current Courses'), false);
  assert.equal(response.text.includes('Admin Operations'), false);

  context.cleanup();
});

test('dashboard re-evaluates role changes and removes modules that are no longer authorized', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');
  const initialResponse = await agent.get('/dashboard');
  assert.equal(initialResponse.text.includes('Financial Summary'), true);

  context.db
    .prepare('UPDATE role_assignments SET is_active = 0 WHERE account_id = (SELECT id FROM accounts WHERE email = ?)')
    .run('userA@example.com');

  const changedResponse = await agent.get('/dashboard');
  assert.equal(changedResponse.status, 200);
  assert.equal(changedResponse.text.includes('Minimal dashboard'), true);
  assert.equal(changedResponse.text.includes('Inbox'), false);
  assert.equal(changedResponse.text.includes('Personal Profile'), false);
  assert.equal(changedResponse.text.includes('Academic Records'), false);
  assert.equal(changedResponse.text.includes('Schedule Builder'), false);
  assert.equal(changedResponse.text.includes('Enrollment Hub'), false);
  assert.equal(changedResponse.text.includes('Financial Summary'), false);
  assert.equal(changedResponse.text.includes('Current Courses'), false);

  context.cleanup();
});

test('dashboard keeps restricted modules hidden even during partial professor loads', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  context.dashboardTestState.unavailableSectionsByIdentifier['professor@example.com'] = ['teaching-workload'];

  await loginAs(agent, 'professor@example.com');
  const response = await agent.get('/dashboard');

  assert.equal(response.status, 200);
  assert.match(response.text, /Current Courses[\s\S]*Unavailable/);
  assert.equal(response.text.includes('Inbox'), true);
  assert.equal(response.text.includes('Personal Profile'), true);
  assert.equal(response.text.includes('Security Center'), false);
  assert.equal(response.text.includes('Grading Queue'), false);
  assert.equal(response.text.includes('Financial Summary'), false);
  assert.equal(response.text.includes('Admin Operations'), false);
  assert.equal(response.text.includes('Academic Records'), false);

  context.cleanup();
});

test('admin dashboards never expose student or professor-only modules', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'admin@example.com', ADMIN_PASSWORD);
  const response = await agent.get('/dashboard');

  assert.equal(response.status, 200);
  assert.equal(response.text.includes('Inbox'), true);
  assert.equal(response.text.includes('Personal Profile'), true);
  assert.equal(response.text.includes('Admin Operations'), true);
  assert.equal(response.text.includes('Security Center'), true);
  assert.equal(response.text.includes('Academic Records'), false);
  assert.equal(response.text.includes('Schedule Builder'), false);
  assert.equal(response.text.includes('Enrollment Hub'), false);
  assert.equal(response.text.includes('Financial Summary'), false);
  assert.equal(response.text.includes('Current Courses'), false);
  assert.equal(response.text.includes('Teaching Workload'), false);
  assert.equal(response.text.includes('Grading Queue'), false);

  context.cleanup();
});
