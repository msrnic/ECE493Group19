const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

async function loginAs(agent, identifier, password = 'CorrectPass!234') {
  await agent.post('/login').type('form').send({ identifier, password }).expect(302);
}

test('POST /api/admin/notifications/preview-recipients returns documented success, validation, and authorization payloads', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    await loginAs(agent, 'admin@example.com', 'AdminPass!234');

    const success = await agent.post('/api/admin/notifications/preview-recipients').send({
      courseRosterIds: ['ECE493'],
      groupIds: [],
      individualStudentIds: ['userA']
    });
    assert.equal(success.status, 200);
    assert.equal(typeof success.body.totalResolvedRecipients, 'number');
    assert.equal(Array.isArray(success.body.recipientIds), true);

    const validation = await agent.post('/api/admin/notifications/preview-recipients').send({
      courseRosterIds: [],
      groupIds: [],
      individualStudentIds: []
    });
    assert.equal(validation.status, 400);
    assert.equal(validation.body.code, 'EMPTY_RECIPIENT_SELECTION');
    assert.equal(Array.isArray(validation.body.details), true);

    const unauthorized = await agent.post('/api/admin/notifications/preview-recipients').send({
      courseRosterIds: [],
      groupIds: [],
      individualStudentIds: ['profA']
    });
    assert.equal(unauthorized.status, 403);
    assert.equal(unauthorized.body.code, 'UNAUTHORIZED_RECIPIENTS');
    assert.deepEqual(unauthorized.body.unauthorizedRecipientIds, ['profA']);
  } finally {
    context.cleanup();
  }
});

test('POST /api/admin/notifications/send and GET summary return documented payloads', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    await loginAs(agent, 'admin@example.com', 'AdminPass!234');

    const accepted = await agent.post('/api/admin/notifications/send').send({
      body: 'Contract send body.',
      courseRosterIds: [],
      groupIds: [],
      individualStudentIds: ['userA', 'outageUser'],
      subject: 'Contract send'
    });
    assert.equal(accepted.status, 202);
    assert.equal(accepted.body.status, 'processing');
    assert.equal(typeof accepted.body.sendRequestId, 'string');
    assert.equal(typeof accepted.body.retryExpiresAt, 'string');

    const summary = await agent.get(
      `/api/admin/notifications/send-requests/${accepted.body.sendRequestId}`
    );
    assert.equal(summary.status, 200);
    assert.match(summary.body.status, /^(completed|completed_with_failures|failed)$/);
    assert.equal(Array.isArray(summary.body.failedRecipients), true);

    const missing = await agent.get('/api/admin/notifications/send-requests/999999');
    assert.equal(missing.status, 404);
  } finally {
    context.cleanup();
  }
});

test('POST /api/admin/notifications/send reports conflicts and retry endpoint reports accepted, empty, and expired payloads', async () => {
  const context = createTestContext({
    adminNotificationTestState: { loggingFailureSubjects: ['Blocked subject'] }
  });

  try {
    const agent = request.agent(context.app);
    await loginAs(agent, 'admin@example.com', 'AdminPass!234');

    const conflict = await agent.post('/api/admin/notifications/send').send({
      body: 'This request should conflict.',
      courseRosterIds: [],
      groupIds: [],
      individualStudentIds: ['userA'],
      subject: 'Blocked subject'
    });
    assert.equal(conflict.status, 409);
    assert.equal(conflict.body.code, 'SEND_REQUEST_CONFLICT');

    const accepted = await agent.post('/api/admin/notifications/send').send({
      body: 'Retry contract flow.',
      courseRosterIds: [],
      groupIds: [],
      individualStudentIds: ['outageUser'],
      subject: 'Retry contract'
    });
    assert.equal(accepted.status, 202);

    context.inboxTestState.deliveryFailureIdentifiers = [];
    const retryAccepted = await agent.post(
      `/api/admin/notifications/send-requests/${accepted.body.sendRequestId}/retry`
    );
    assert.equal(retryAccepted.status, 202);
    assert.equal(retryAccepted.body.status, 'processing');

    const retryEmpty = await agent.post(
      `/api/admin/notifications/send-requests/${accepted.body.sendRequestId}/retry`
    );
    assert.equal(retryEmpty.status, 400);
    assert.equal(retryEmpty.body.code, 'NO_FAILED_RECIPIENTS');

    const nextAccepted = await agent.post('/api/admin/notifications/send').send({
      body: 'Retry expiry flow.',
      courseRosterIds: [],
      groupIds: [],
      individualStudentIds: ['outageUser'],
      subject: 'Retry expiry'
    });
    assert.equal(nextAccepted.status, 202);

    context.advanceTime(25 * 60 * 60 * 1000);
    const retryExpired = await agent.post(
      `/api/admin/notifications/send-requests/${nextAccepted.body.sendRequestId}/retry`
    );
    assert.equal(retryExpired.status, 410);
    assert.equal(retryExpired.body.code, 'RETRY_WINDOW_EXPIRED');

    const retryMissing = await agent.post('/api/admin/notifications/send-requests/999999/retry');
    assert.equal(retryMissing.status, 404);
  } finally {
    context.cleanup();
  }
});
