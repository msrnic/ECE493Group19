const test = require('node:test');
const assert = require('node:assert/strict');

const { createTestContext } = require('../helpers/test-context');

test('inbox service creates delivered, duplicate, restricted, and failed academic notifications', () => {
  const context = createTestContext();

  try {
    const services = context.app.locals.services;
    const userA = services.studentAccountModel.findByStudentId('userA');
    const restricted = services.studentAccountModel.findByStudentId('restrictedInbox');
    const outage = services.studentAccountModel.findByStudentId('outageUser');

    const delivered = services.inboxService.createAcademicNotification(userA, {
      body: 'Grades are now available.',
      deduplicationKey: 'unit:userA:1',
      eventType: 'grade_update',
      subject: 'Grade update'
    });
    assert.equal(delivered.status, 'delivered');

    const duplicate = services.inboxService.createAcademicNotification(userA, {
      body: 'Grades are now available.',
      deduplicationKey: 'unit:userA:1',
      eventType: 'grade_update',
      subject: 'Grade update'
    });
    assert.equal(duplicate.status, 'duplicate');

    const stored = services.inboxService.createAcademicNotification(restricted, {
      body: 'Standing review notice.',
      deduplicationKey: 'unit:restricted:1',
      eventType: 'academic_standing',
      subject: 'Standing update'
    });
    assert.equal(stored.status, 'stored_for_later');

    const failed = services.inboxService.createAcademicNotification(outage, {
      body: 'Delivery will fail.',
      deduplicationKey: 'unit:outage:1',
      eventType: 'course_update',
      subject: 'Course update'
    });
    assert.equal(failed.status, 'delivery_failed');

    const states = context.db
      .prepare(
        "SELECT notification_status FROM inbox_notifications WHERE deduplication_key IN ('unit:userA:1', 'unit:restricted:1', 'unit:outage:1') ORDER BY deduplication_key"
      )
      .all()
      .map((row) => row.notification_status);
    assert.deepEqual(states, ['delivery_failed', 'stored_for_later', 'delivered']);
  } finally {
    context.cleanup();
  }
});

test('inbox service returns inbox views and retries failed notifications', () => {
  const context = createTestContext();

  try {
    const services = context.app.locals.services;
    const userA = services.studentAccountModel.findByStudentId('userA');
    const restricted = services.studentAccountModel.findByStudentId('restrictedInbox');
    const outage = services.studentAccountModel.findByStudentId('outageUser');

    const visibleView = services.inboxService.getInboxView(userA);
    assert.equal(visibleView.accessState.accessState, 'enabled');
    assert.equal(visibleView.notifications.length >= 1, true);

    const restrictedView = services.inboxService.getInboxView(restricted);
    assert.equal(restrictedView.accessState.accessState, 'restricted');
    assert.equal(restrictedView.notifications.length, 0);
    assert.equal(restrictedView.storedCount >= 1, true);

    const failedNotification = context.db
      .prepare(
        "SELECT id FROM inbox_notifications WHERE account_id = ? AND notification_status = 'delivery_failed' ORDER BY id DESC LIMIT 1"
      )
      .get(outage.accountId);

    const invalidRetry = services.inboxService.retryFailedNotification(null);
    assert.equal(invalidRetry.status, 'invalid');

    const stillFailed = services.inboxService.retryFailedNotification(
      services.inboxModel.findNotificationById(failedNotification.id)
    );
    assert.equal(stillFailed.status, 'delivery_failed');

    services.inboxTestState.deliveryFailureIdentifiers = [];
    const deliveredRetry = services.inboxService.retryFailedNotification(
      services.inboxModel.findNotificationById(failedNotification.id)
    );
    assert.equal(deliveredRetry.status, 'delivered');

    const updatedNotification = services.inboxModel.findNotificationById(failedNotification.id);
    assert.equal(updatedNotification.notificationStatus, 'delivered');
  } finally {
    context.cleanup();
  }
});
