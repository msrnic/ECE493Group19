function createNotificationModel(db) {
  const insertNotification = db.prepare(`
    INSERT INTO notifications (
      account_id,
      event_type,
      channel,
      status,
      payload_json,
      created_at,
      sent_at
    ) VALUES (
      @account_id,
      @event_type,
      @channel,
      @status,
      @payload_json,
      @created_at,
      NULL
    )
  `);

  const selectByAccount = db.prepare(`
    SELECT *
    FROM notifications
    WHERE account_id = ?
    ORDER BY id ASC
  `);

  function queueNotification(details) {
    insertNotification.run({
      account_id: details.accountId,
      event_type: details.eventType,
      channel: details.channel,
      status: 'queued',
      payload_json: JSON.stringify(details.payload),
      created_at: details.createdAt
    });
  }

  function listByAccount(accountId) {
    return selectByAccount.all(accountId);
  }

  return {
    listByAccount,
    queueNotification
  };
}

module.exports = { createNotificationModel };
