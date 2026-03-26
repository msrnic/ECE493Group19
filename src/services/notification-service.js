function createNotificationService(options) {
  function normalizeIdentifier(value) {
    return String(value || '').trim().toLowerCase();
  }

  function shouldFailAccountCreatedNotification(account) {
    const identifiers = new Set(
      (options.accountCreationTestState?.notificationFailureIdentifiers || []).map(normalizeIdentifier)
    );

    return (
      identifiers.has(normalizeIdentifier(account.email)) ||
      identifiers.has(normalizeIdentifier(account.username))
    );
  }

  function queuePasswordChanged(account, details) {
    options.notificationModel.queueNotification({
      accountId: account.id,
      eventType: 'password_changed',
      channel: 'email',
      createdAt: options.now().toISOString(),
      payload: {
        accountId: account.id,
        actorAccountId: details.actorAccountId,
        initiatedBy: details.initiatedBy,
        username: account.username
      }
    });

    return true;
  }

  function notifyAccountCreated(account) {
    const attemptedAt = options.now().toISOString();
    const notificationsEnabled = options.accountCreationTestState?.notificationsEnabled !== false;

    if (!notificationsEnabled) {
      options.notificationAttemptModel?.recordAttempt({
        accountId: account.id,
        attemptedAt,
        channel: 'email',
        status: 'skipped_disabled'
      });

      return {
        enabled: false,
        status: 'skipped_disabled'
      };
    }

    if (shouldFailAccountCreatedNotification(account)) {
      options.notificationAttemptModel?.recordAttempt({
        accountId: account.id,
        attemptedAt,
        channel: 'email',
        errorCode: 'DELIVERY_FAILED',
        errorMessage: 'Notification delivery failed.',
        status: 'failed'
      });

      return {
        enabled: true,
        status: 'failed',
        warning: 'The account was created, but notification delivery failed.'
      };
    }

    options.notificationAttemptModel?.recordAttempt({
      accountId: account.id,
      attemptedAt,
      channel: 'email',
      status: 'sent'
    });

    return {
      enabled: true,
      status: 'sent'
    };
  }

  return {
    notifyAccountCreated,
    queuePasswordChanged
  };
}

module.exports = { createNotificationService };
