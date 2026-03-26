const test = require('node:test');
const assert = require('node:assert/strict');

const { createNotificationService } = require('../../src/services/notification-service');

test('notification service covers sent, failed, skipped, and password-changed branches', () => {
  const queued = [];
  const attempts = [];
  const now = () => new Date('2026-03-07T12:00:00.000Z');

  const sentService = createNotificationService({
    accountCreationTestState: {
      createFailureIdentifiers: [],
      notificationFailureIdentifiers: [],
      notificationsEnabled: true
    },
    notificationAttemptModel: {
      recordAttempt(details) {
        attempts.push(details);
      }
    },
    notificationModel: {
      queueNotification(details) {
        queued.push(details);
      }
    },
    now
  });

  assert.equal(
    sentService.queuePasswordChanged({ id: 1, username: 'new.user@example.com' }, {
      actorAccountId: 2,
      initiatedBy: 'admin_override'
    }),
    true
  );
  assert.equal(queued.length, 1);

  const sent = sentService.notifyAccountCreated({
    email: 'new.user@example.com',
    id: 1,
    username: 'new.user@example.com'
  });
  assert.deepEqual(sent, { enabled: true, status: 'sent' });
  assert.equal(attempts.at(-1).status, 'sent');

  const emailFailureService = createNotificationService({
    accountCreationTestState: {
      createFailureIdentifiers: [],
      notificationFailureIdentifiers: ['duplicate@example.com'],
      notificationsEnabled: true
    },
    notificationAttemptModel: {
      recordAttempt(details) {
        attempts.push(details);
      }
    },
    notificationModel: {
      queueNotification() {}
    },
    now
  });
  assert.equal(
    emailFailureService.notifyAccountCreated({
      email: 'duplicate@example.com',
      id: 2,
      username: 'other-user'
    }).status,
    'failed'
  );

  const usernameFailureService = createNotificationService({
    accountCreationTestState: {
      createFailureIdentifiers: [],
      notificationFailureIdentifiers: ['target-user'],
      notificationsEnabled: true
    },
    notificationAttemptModel: {
      recordAttempt(details) {
        attempts.push(details);
      }
    },
    notificationModel: {
      queueNotification() {}
    },
    now
  });
  assert.equal(
    usernameFailureService.notifyAccountCreated({
      email: 'available@example.com',
      id: 3,
      username: 'target-user'
    }).status,
    'failed'
  );

  const skipped = createNotificationService({
    accountCreationTestState: {
      createFailureIdentifiers: [],
      notificationFailureIdentifiers: [],
      notificationsEnabled: false
    },
    notificationAttemptModel: {
      recordAttempt(details) {
        attempts.push(details);
      }
    },
    notificationModel: {
      queueNotification() {}
    },
    now
  }).notifyAccountCreated({ email: 'disabled@example.com', id: 4, username: 'disabled@example.com' });

  assert.deepEqual(skipped, { enabled: false, status: 'skipped_disabled' });
  assert.equal(attempts.at(-1).status, 'skipped_disabled');
});
