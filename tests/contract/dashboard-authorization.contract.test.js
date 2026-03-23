const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const USER_PASSWORD = 'CorrectPass' + '!234';
const ADMIN_PASSWORD = 'AdminPass' + '!234';

async function loginAs(agent, identifier, password = USER_PASSWORD) {
  await agent
    .post('/login')
    .type('form')
    .send({ identifier, password })
    .expect(302);
}

test('dashboard contract never exposes restricted module keys for each supported role profile', async () => {
  const scenarios = [
    {
      identifier: 'userA@example.com',
      expectedKeys: ['inbox', 'security-center', 'student-academics', 'schedule-builder', 'enrollment-hub', 'financial-summary'],
      excludedKeys: ['teaching-workload', 'grading-queue', 'admin-operations'],
      password: USER_PASSWORD,
      status: 'success'
    },
    {
      identifier: 'professor@example.com',
      expectedKeys: ['inbox', 'security-center', 'teaching-workload'],
      excludedKeys: ['student-academics', 'schedule-builder', 'enrollment-hub', 'financial-summary', 'grading-queue', 'admin-operations'],
      password: USER_PASSWORD,
      status: 'success'
    },
    {
      identifier: 'admin@example.com',
      expectedKeys: ['inbox', 'personal-profile', 'admin-operations', 'security-center'],
      excludedKeys: ['student-academics', 'schedule-builder', 'enrollment-hub', 'financial-summary', 'teaching-workload', 'grading-queue'],
      password: ADMIN_PASSWORD,
      status: 'success'
    },
    {
      identifier: 'hybrid.staff@example.com',
      expectedKeys: ['inbox', 'personal-profile', 'teaching-workload', 'admin-operations', 'security-center'],
      excludedKeys: ['student-academics', 'schedule-builder', 'enrollment-hub', 'financial-summary', 'grading-queue'],
      password: USER_PASSWORD,
      status: 'success'
    },
    {
      identifier: 'nomodule.student@example.com',
      expectedKeys: [],
      excludedKeys: ['inbox', 'personal-profile', 'student-academics', 'schedule-builder', 'enrollment-hub', 'financial-summary', 'teaching-workload', 'grading-queue', 'admin-operations', 'security-center'],
      password: USER_PASSWORD,
      status: 'empty_access'
    }
  ];

  for (const scenario of scenarios) {
    const context = createTestContext();
    const agent = request.agent(context.app);
    await loginAs(agent, scenario.identifier, scenario.password);

    const response = await agent
      .get('/dashboard')
      .set('Accept', 'application/json');

    assert.equal(response.status, 200);
    assert.equal(response.body.status, scenario.status);

    const moduleKeys = response.body.modules.map((module) => module.moduleKey);
    const sectionKeys = response.body.sections.map((section) => section.sectionKey);

    assert.deepEqual(moduleKeys, scenario.expectedKeys);
    assert.deepEqual([...new Set(moduleKeys)], moduleKeys);
    for (const excludedKey of scenario.excludedKeys) {
      assert.equal(moduleKeys.includes(excludedKey), false);
      assert.equal(sectionKeys.includes(excludedKey), false);
    }

    context.cleanup();
  }
});
