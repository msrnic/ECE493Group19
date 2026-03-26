function createNotificationAttemptModel(db) {
  const insertAttempt = db.prepare(`
    INSERT INTO notification_attempts (
      account_id,
      channel,
      status,
      error_code,
      error_message,
      attempted_at
    ) VALUES (
      @account_id,
      @channel,
      @status,
      @error_code,
      @error_message,
      @attempted_at
    )
  `);
  const selectByAccount = db.prepare(`
    SELECT *
    FROM notification_attempts
    WHERE account_id = ?
    ORDER BY id ASC
  `);

  return {
    listByAccount(accountId) {
      return selectByAccount.all(accountId);
    },
    recordAttempt(details) {
      insertAttempt.run({
        account_id: details.accountId,
        attempted_at: details.attemptedAt,
        channel: details.channel,
        error_code: details.errorCode || null,
        error_message: details.errorMessage || null,
        status: details.status
      });
    }
  };
}

module.exports = { createNotificationAttemptModel };
