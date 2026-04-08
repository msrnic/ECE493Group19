const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

async function loginAs(agent, identifier, password = 'CorrectPass!234') {
  await agent.post('/login').type('form').send({ identifier, password }).expect(302);
}

test('student inbox page shows seeded academic and admin notifications', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    await loginAs(agent, 'userA@example.com');

    const dashboard = await agent.get('/dashboard');
    assert.equal(dashboard.status, 200);
    assert.match(dashboard.text, /Open Inbox/);

    const response = await agent.get('/inbox');
    assert.equal(response.status, 200);
    assert.match(response.text, /Built-in Inbox/);
    assert.match(response.text, /ECE493 course update/);
    assert.match(response.text, /CMPUT301 grade update/);
    assert.match(response.text, /Welcome to the built-in inbox/);
  } finally {
    context.cleanup();
  }
});

test('restricted students see stored status and admins can send and retry inbox notifications through html routes', async () => {
  const context = createTestContext();

  try {
    const restrictedAgent = request.agent(context.app);
    await loginAs(restrictedAgent, 'restricted.inbox@example.com');
    const restrictedPage = await restrictedAgent.get('/inbox');
    assert.equal(restrictedPage.status, 200);
    assert.match(restrictedPage.text, /Inbox access restricted/);
    assert.match(restrictedPage.text, /stored for later viewing/);
    const restrictedDashboard = await restrictedAgent.get('/dashboard');
    assert.equal(restrictedDashboard.status, 200);
    assert.match(restrictedDashboard.text, /temporarily restricted/);

    const adminAgent = request.agent(context.app);
    await loginAs(adminAgent, 'admin@example.com', 'AdminPass!234');
    const adminDashboard = await adminAgent.get('/dashboard');
    assert.equal(adminDashboard.status, 200);
    assert.match(adminDashboard.text, /Send Inbox Notifications/);

    const page = await adminAgent.get('/admin/notifications');
    assert.equal(page.status, 200);
    assert.match(page.text, /Student Inbox Notifications/);

    const preview = await adminAgent
      .post('/admin/notifications/preview')
      .type('form')
      .send({
        body: 'Preview body',
        courseRosterIds: 'ECE493',
        groupIds: 'all-active-students',
        individualStudentIds: 'userA',
        subject: 'Preview subject'
      });
    assert.equal(preview.status, 200);
    assert.match(preview.text, /Recipient preview/);

    const send = await adminAgent
      .post('/admin/notifications/send')
      .type('form')
      .send({
        body: 'A notification from integration tests.',
        groupIds: 'all-active-students',
        individualStudentIds: 'userA,outageUser',
        subject: 'Integration notice'
      });
    assert.equal(send.status, 200);
    assert.match(send.text, /Latest send summary/);
    assert.match(send.text, /Failed deliveries: 1/);

    const sendRequest = context.db
      .prepare('SELECT id FROM notification_send_requests ORDER BY id DESC LIMIT 1')
      .get();
    context.inboxTestState.deliveryFailureIdentifiers = [];

    const retry = await adminAgent.post(
      `/admin/notifications/send-requests/${sendRequest.id}/retry`
    );
    assert.equal(retry.status, 200);
    assert.match(retry.text, /Retry request accepted/);
  } finally {
    context.cleanup();
  }
});

test('non-students and non-admins are forbidden from inbox management routes', async () => {
  const context = createTestContext();

  try {
    const professorAgent = request.agent(context.app);
    await loginAs(professorAgent, 'professor@example.com');

    const inboxResponse = await professorAgent.get('/inbox');
    assert.equal(inboxResponse.status, 403);

    const adminToolResponse = await professorAgent.get('/admin/notifications');
    assert.equal(adminToolResponse.status, 403);
    assert.match(adminToolResponse.text, /Administrative authorization is required/);
  } finally {
    context.cleanup();
  }
});
