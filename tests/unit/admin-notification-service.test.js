const test = require('node:test');
const assert = require('node:assert/strict');

const { createTestContext } = require('../helpers/test-context');

function getAdmin(context) {
  return context.app.locals.services.accountModel.findByIdentifier('admin@example.com');
}

test('admin notification service previews recipient selections across individuals, courses, and groups', () => {
  const context = createTestContext();

  try {
    const admin = getAdmin(context);
    const service = context.app.locals.services.adminNotificationService;

    const success = service.previewRecipients(admin.id, {
      courseRosterIds: ['ECE493'],
      groupIds: ['all-active-students'],
      individualStudentIds: ['userA']
    });
    assert.equal(success.statusCode, 200);
    assert.equal(success.totalResolvedRecipients >= 5, true);
    assert.equal(success.duplicateRecipientsRemoved >= 1, true);
    assert.equal(success.recipientIds.includes('userA'), true);

    const empty = service.previewRecipients(admin.id, {
      courseRosterIds: [],
      groupIds: [],
      individualStudentIds: []
    });
    assert.equal(empty.statusCode, 400);

    const invalid = service.previewRecipients(admin.id, {
      courseRosterIds: ['NOPE101'],
      groupIds: ['unknown-group'],
      individualStudentIds: ['missingStudent']
    });
    assert.equal(invalid.statusCode, 400);
    assert.equal(invalid.details.length, 3);

    const unauthorized = service.previewRecipients(admin.id, {
      courseRosterIds: [],
      groupIds: [],
      individualStudentIds: ['profA']
    });
    assert.equal(unauthorized.statusCode, 403);
    assert.deepEqual(unauthorized.unauthorizedRecipientIds, ['profA']);

    const forbidden = service.previewRecipients(1, {
      courseRosterIds: [],
      groupIds: [],
      individualStudentIds: ['userA']
    });
    assert.equal(forbidden.statusCode, 403);
  } finally {
    context.cleanup();
  }
});

test('admin notification service validates, sends, summarizes, and retries notification deliveries', () => {
  const context = createTestContext();

  try {
    const services = context.app.locals.services;
    const admin = getAdmin(context);
    const service = services.adminNotificationService;

    const invalidMessage = service.sendNotification(admin.id, {
      body: '',
      courseRosterIds: [],
      groupIds: [],
      individualStudentIds: ['userA'],
      subject: ''
    });
    assert.equal(invalidMessage.statusCode, 400);

    services.adminNotificationTestState.loggingFailureSubjects.push('Conflict subject');
    const conflict = service.sendNotification(admin.id, {
      body: 'Blocked by logging conflict.',
      courseRosterIds: [],
      groupIds: [],
      individualStudentIds: ['userA'],
      subject: 'Conflict subject'
    });
    assert.equal(conflict.statusCode, 409);

    const accepted = service.sendNotification(admin.id, {
      body: 'A new inbox announcement is available.',
      courseRosterIds: [],
      groupIds: [],
      individualStudentIds: ['userA', 'outageUser'],
      subject: 'Important notice'
    });
    assert.equal(accepted.statusCode, 202);

    const summary = service.getSendSummary(admin.id, accepted.sendRequestId);
    assert.equal(summary.statusCode, 200);
    assert.equal(summary.totalUniqueRecipients, 2);
    assert.equal(summary.successfulDeliveries, 1);
    assert.equal(summary.failedDeliveries, 1);
    assert.equal(summary.retryEligible, true);

    const noFailed = service.retryFailedDeliveries(admin.id, 1);
    assert.equal(noFailed.statusCode, 400);

    const missing = service.getSendSummary(admin.id, 999999);
    assert.equal(missing.statusCode, 404);

    const retryForbidden = service.retryFailedDeliveries(1, accepted.sendRequestId);
    assert.equal(retryForbidden.statusCode, 403);

    services.inboxTestState.deliveryFailureIdentifiers = [];
    const retried = service.retryFailedDeliveries(admin.id, accepted.sendRequestId);
    assert.equal(retried.statusCode, 202);

    const summaryAfterRetry = service.getSendSummary(admin.id, accepted.sendRequestId);
    assert.equal(summaryAfterRetry.failedDeliveries, 0);
    assert.equal(summaryAfterRetry.retryEligible, false);

    context.advanceTime(25 * 60 * 60 * 1000);
    const expired = service.retryFailedDeliveries(admin.id, accepted.sendRequestId);
    assert.equal(expired.statusCode, 410);
  } finally {
    context.cleanup();
  }
});
