function createNotificationService(options) {
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

  return {
    queuePasswordChanged
  };
}

module.exports = { createNotificationService };
