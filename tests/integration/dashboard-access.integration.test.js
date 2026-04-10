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

test('dashboard renders role-scoped navigation for student, professor, admin, and multi-role actors', async () => {
  const scenarios = [
    {
      excluded: ['Teaching Workload', 'Admin Operations', 'Security Center'],
      identifier: 'userA@example.com',
      includes: ['Welcome, userA', 'Inbox', 'Personal Profile', 'Academic Records', 'Schedule Builder', 'Enrollment Hub', 'Financial Summary'],
      password: USER_PASSWORD
    },
    {
      excluded: ['Academic Records', 'Schedule Builder', 'Enrollment Hub', 'Financial Summary', 'Grading Queue', 'Admin Operations', 'Security Center'],
      identifier: 'professor@example.com',
      includes: ['Inbox', 'Personal Profile', 'Current Courses', 'ECE493 Software Engineering (instructor)'],
      password: USER_PASSWORD
    },
    {
      excluded: ['Academic Records', 'Schedule Builder', 'Enrollment Hub', 'Financial Summary', 'Current Courses', 'Teaching Workload'],
      identifier: 'admin@example.com',
      includes: ['Inbox', 'Personal Profile', 'Admin Operations', 'Security Center', 'Change Password', 'Reset userA password'],
      password: ADMIN_PASSWORD
    },
    {
      excluded: ['Academic Records', 'Schedule Builder', 'Enrollment Hub', 'Financial Summary', 'Grading Queue'],
      identifier: 'hybrid.staff@example.com',
      includes: ['Inbox', 'Personal Profile', 'Current Courses', 'Admin Operations', 'Security Center'],
      password: USER_PASSWORD,
      roleBadges: ['Professor', 'Admin']
    }
  ];

  for (const scenario of scenarios) {
    const context = createTestContext();
    const agent = request.agent(context.app);
    await loginAs(agent, scenario.identifier, scenario.password);

    const response = await agent.get('/dashboard');
    assert.equal(response.status, 200);

    for (const includedText of scenario.includes) {
      assert.equal(response.text.includes(includedText), true);
    }
    for (const excludedText of scenario.excluded) {
      assert.equal(response.text.includes(excludedText), false);
    }
    if (scenario.roleBadges) {
      for (const badge of scenario.roleBadges) {
        assert.equal(response.text.includes('>' + badge + '<'), true);
      }
    }

    context.cleanup();
  }
});

test('dashboard renders a role-data error state with retry guidance when role resolution fails', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  context.dashboardTestState.roleFailureIdentifiers.push('userA');

  await loginAs(agent, 'userA@example.com');
  const response = await agent.get('/dashboard');

  assert.equal(response.status, 200);
  assert.equal(response.text.includes('Authorization data error'), true);
  assert.equal(response.text.includes('Retry unavailable sections'), true);
  assert.equal(response.text.includes('Financial Summary'), false);
  assert.equal(response.text.includes('Current Courses'), false);

  context.cleanup();
});
