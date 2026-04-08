function mapAccessState(row) {
  if (!row) {
    return {
      accessState: 'enabled',
      restrictionReason: null,
      showStatusIndicator: true,
      updatedAt: null
    };
  }

  return {
    accessState: row.access_state,
    restrictionReason: row.restriction_reason,
    showStatusIndicator: Boolean(row.show_status_indicator),
    updatedAt: row.updated_at
  };
}

function mapInboxNotification(row) {
  return {
    accountId: row.account_id,
    availableAt: row.available_at,
    body: row.body,
    createdAt: row.created_at,
    deduplicationKey: row.deduplication_key,
    eventType: row.event_type,
    inboxNotificationId: row.id,
    lastFailureReason: row.last_failure_reason,
    notificationStatus: row.notification_status,
    readAt: row.read_at,
    recipientId: row.username,
    sendRequestId: row.send_request_id,
    senderAccountId: row.sender_account_id,
    senderUsername: row.sender_username,
    sourceType: row.source_type,
    subject: row.subject
  };
}

function mapSendRequest(row) {
  if (!row) {
    return null;
  }

  return {
    duplicateRecipientsRemoved: row.duplicate_recipients_removed,
    failedDeliveries: row.failed_deliveries,
    lastError: row.last_error,
    retryExpiresAt: row.retry_expires_at,
    sendRequestId: row.id,
    senderAccountId: row.sender_account_id,
    sentAt: row.sent_at,
    status: row.status,
    successfulDeliveries: row.successful_deliveries,
    totalUniqueRecipients: row.total_unique_recipients
  };
}

function mapStudent(row) {
  return {
    accountId: row.id,
    email: row.email,
    role: row.role,
    status: row.status,
    studentId: row.username
  };
}

function createInboxModel(db) {
  const selectInboxAccessState = db.prepare(`
    SELECT account_id, access_state, restriction_reason, show_status_indicator, updated_at
    FROM inbox_access_states
    WHERE account_id = ?
    LIMIT 1
  `);
  const selectVisibleInboxNotifications = db.prepare(`
    SELECT
      n.id,
      n.account_id,
      n.source_type,
      n.event_type,
      n.subject,
      n.body,
      n.notification_status,
      n.deduplication_key,
      n.send_request_id,
      n.sender_account_id,
      n.created_at,
      n.available_at,
      n.read_at,
      n.last_failure_reason,
      a.username,
      sender.username AS sender_username
    FROM inbox_notifications n
    INNER JOIN accounts a ON a.id = n.account_id
    LEFT JOIN accounts sender ON sender.id = n.sender_account_id
    WHERE n.account_id = ?
      AND n.notification_status IN ('delivered', 'read')
    ORDER BY datetime(n.available_at) DESC, datetime(n.created_at) DESC, n.id DESC
  `);
  const selectStoredCount = db.prepare(`
    SELECT COUNT(*) AS count
    FROM inbox_notifications
    WHERE account_id = ?
      AND notification_status = 'stored_for_later'
  `);
  const selectStoredNotifications = db.prepare(`
    SELECT
      n.id,
      n.account_id,
      n.source_type,
      n.event_type,
      n.subject,
      n.body,
      n.notification_status,
      n.deduplication_key,
      n.send_request_id,
      n.sender_account_id,
      n.created_at,
      n.available_at,
      n.read_at,
      n.last_failure_reason,
      a.username,
      sender.username AS sender_username
    FROM inbox_notifications n
    INNER JOIN accounts a ON a.id = n.account_id
    LEFT JOIN accounts sender ON sender.id = n.sender_account_id
    WHERE n.account_id = ?
      AND n.notification_status = 'stored_for_later'
    ORDER BY datetime(n.created_at) DESC, n.id DESC
  `);
  const selectNotificationByDeduplicationKey = db.prepare(`
    SELECT id
    FROM inbox_notifications
    WHERE account_id = ?
      AND deduplication_key = ?
    LIMIT 1
  `);
  const insertInboxNotification = db.prepare(`
    INSERT INTO inbox_notifications (
      account_id,
      source_type,
      event_type,
      subject,
      body,
      notification_status,
      deduplication_key,
      send_request_id,
      sender_account_id,
      created_at,
      available_at,
      read_at,
      last_failure_reason
    ) VALUES (
      @account_id,
      @source_type,
      @event_type,
      @subject,
      @body,
      @notification_status,
      @deduplication_key,
      @send_request_id,
      @sender_account_id,
      @created_at,
      @available_at,
      @read_at,
      @last_failure_reason
    )
  `);
  const insertDeliveryAttempt = db.prepare(`
    INSERT INTO inbox_delivery_attempts (
      inbox_notification_id,
      attempt_sequence,
      status,
      failure_reason,
      retry_eligible_until,
      attempted_at,
      delivered_at
    ) VALUES (
      @inbox_notification_id,
      @attempt_sequence,
      @status,
      @failure_reason,
      @retry_eligible_until,
      @attempted_at,
      @delivered_at
    )
  `);
  const selectNotificationById = db.prepare(`
    SELECT
      n.id,
      n.account_id,
      n.source_type,
      n.event_type,
      n.subject,
      n.body,
      n.notification_status,
      n.deduplication_key,
      n.send_request_id,
      n.sender_account_id,
      n.created_at,
      n.available_at,
      n.read_at,
      n.last_failure_reason,
      a.username,
      sender.username AS sender_username
    FROM inbox_notifications n
    INNER JOIN accounts a ON a.id = n.account_id
    LEFT JOIN accounts sender ON sender.id = n.sender_account_id
    WHERE n.id = ?
    LIMIT 1
  `);
  const updateNotificationDeliveryStatus = db.prepare(`
    UPDATE inbox_notifications
    SET
      notification_status = @notification_status,
      available_at = @available_at,
      last_failure_reason = @last_failure_reason
    WHERE id = @id
  `);
  const insertNotificationMessage = db.prepare(`
    INSERT INTO notification_messages (subject, body, created_by, created_at)
    VALUES (@subject, @body, @created_by, @created_at)
  `);
  const insertSendRequest = db.prepare(`
    INSERT INTO notification_send_requests (
      message_id,
      sender_account_id,
      status,
      total_unique_recipients,
      duplicate_recipients_removed,
      successful_deliveries,
      failed_deliveries,
      sent_at,
      retry_expires_at,
      last_error
    ) VALUES (
      @message_id,
      @sender_account_id,
      @status,
      @total_unique_recipients,
      @duplicate_recipients_removed,
      @successful_deliveries,
      @failed_deliveries,
      @sent_at,
      @retry_expires_at,
      @last_error
    )
  `);
  const updateSendRequest = db.prepare(`
    UPDATE notification_send_requests
    SET
      status = @status,
      successful_deliveries = @successful_deliveries,
      failed_deliveries = @failed_deliveries,
      last_error = @last_error
    WHERE id = @id
  `);
  const selectSendRequestById = db.prepare(`
    SELECT *
    FROM notification_send_requests
    WHERE id = ?
    LIMIT 1
  `);
  const selectFailedRecipientsForSendRequest = db.prepare(`
    SELECT
      n.id,
      a.username AS recipient_id,
      n.last_failure_reason AS reason
    FROM inbox_notifications n
    INNER JOIN accounts a ON a.id = n.account_id
    WHERE n.send_request_id = ?
      AND n.notification_status = 'delivery_failed'
    ORDER BY a.username ASC
  `);
  const selectSendRequests = db.prepare(`
    SELECT
      r.*,
      m.subject
    FROM notification_send_requests r
    INNER JOIN notification_messages m ON m.id = r.message_id
    ORDER BY datetime(r.sent_at) DESC, r.id DESC
    LIMIT ?
  `);
  const selectLatestDeliveryAttemptSequence = db.prepare(`
    SELECT COALESCE(MAX(attempt_sequence), 0) AS max_sequence
    FROM inbox_delivery_attempts
    WHERE inbox_notification_id = ?
  `);
  const selectIndividualStudent = db.prepare(`
    SELECT id, email, username, role, status
    FROM accounts
    WHERE lower(username) = lower(?)
    LIMIT 1
  `);
  const selectRosterStudents = db.prepare(`
    SELECT DISTINCT a.id, a.email, a.username, a.role, a.status
    FROM account_courses ac
    INNER JOIN accounts a ON a.id = ac.account_id
    INNER JOIN courses c ON c.id = ac.course_id
    WHERE lower(c.course_code) = lower(?)
      AND ac.role = 'student'
      AND a.role = 'student'
    ORDER BY a.username ASC
  `);
  const selectGroupStudents = db.prepare(`
    SELECT DISTINCT a.id, a.email, a.username, a.role, a.status
    FROM notification_group_memberships gm
    INNER JOIN notification_recipient_groups g ON g.id = gm.group_id
    INNER JOIN accounts a ON a.id = gm.account_id
    WHERE lower(g.group_key) = lower(?)
      AND g.is_active = 1
      AND a.role = 'student'
    ORDER BY a.username ASC
  `);
  const selectGroupDefinition = db.prepare(`
    SELECT id, group_key, display_name
    FROM notification_recipient_groups
    WHERE lower(group_key) = lower(?)
      AND is_active = 1
    LIMIT 1
  `);
  const selectCourseDefinition = db.prepare(`
    SELECT id, course_code, title
    FROM courses
    WHERE lower(course_code) = lower(?)
    LIMIT 1
  `);
  const selectRecipientGroups = db.prepare(`
    SELECT group_key, display_name
    FROM notification_recipient_groups
    WHERE is_active = 1
    ORDER BY display_name ASC, group_key ASC
  `);
  const selectCoursesWithStudentRoster = db.prepare(`
    SELECT DISTINCT c.course_code, c.title
    FROM courses c
    INNER JOIN account_courses ac ON ac.course_id = c.id
    WHERE ac.role = 'student'
    ORDER BY c.course_code ASC
  `);

  return {
    countStoredForLater(accountId) {
      return Number(selectStoredCount.get(accountId)?.count || 0);
    },
    createDeliveryAttempt(details) {
      insertDeliveryAttempt.run(details);
    },
    createInboxNotification(details) {
      return Number(insertInboxNotification.run(details).lastInsertRowid);
    },
    createMessage(details) {
      return Number(insertNotificationMessage.run(details).lastInsertRowid);
    },
    createSendRequest(details) {
      return Number(insertSendRequest.run(details).lastInsertRowid);
    },
    findCourseDefinition(courseCode) {
      return selectCourseDefinition.get(courseCode) || null;
    },
    findGroupDefinition(groupKey) {
      return selectGroupDefinition.get(groupKey) || null;
    },
    findNotificationByDeduplicationKey(accountId, deduplicationKey) {
      return selectNotificationByDeduplicationKey.get(accountId, deduplicationKey) || null;
    },
    findNotificationById(notificationId) {
      const row = selectNotificationById.get(notificationId);
      return row ? mapInboxNotification(row) : null;
    },
    findSendRequestById(sendRequestId) {
      return mapSendRequest(selectSendRequestById.get(sendRequestId));
    },
    getAccessState(accountId) {
      return mapAccessState(selectInboxAccessState.get(accountId));
    },
    getNextAttemptSequence(notificationId) {
      return Number(selectLatestDeliveryAttemptSequence.get(notificationId)?.max_sequence || 0) + 1;
    },
    listCourses() {
      return selectCoursesWithStudentRoster.all().map((row) => ({
        courseCode: row.course_code,
        title: row.title
      }));
    },
    listFailedRecipientsForSendRequest(sendRequestId) {
      return selectFailedRecipientsForSendRequest.all(sendRequestId).map((row) => ({
        inboxNotificationId: row.id,
        reason: row.reason || 'Delivery failed.',
        recipientId: row.recipient_id
      }));
    },
    listGroups() {
      return selectRecipientGroups.all().map((row) => ({
        displayName: row.display_name,
        groupKey: row.group_key
      }));
    },
    listRecentSendRequests(limit = 10) {
      return selectSendRequests.all(Number(limit)).map((row) => ({
        ...mapSendRequest(row),
        subject: row.subject
      }));
    },
    listVisibleNotifications(accountId) {
      return selectVisibleInboxNotifications.all(accountId).map(mapInboxNotification);
    },
    listStoredNotifications(accountId) {
      return selectStoredNotifications.all(accountId).map(mapInboxNotification);
    },
    resolveGroupStudents(groupKey) {
      return selectGroupStudents.all(groupKey).map(mapStudent);
    },
    resolveRosterStudents(courseCode) {
      return selectRosterStudents.all(courseCode).map(mapStudent);
    },
    resolveStudentByStudentId(studentId) {
      const row = selectIndividualStudent.get(studentId);
      return row ? mapStudent(row) : null;
    },
    updateNotificationDeliveryStatus(details) {
      updateNotificationDeliveryStatus.run(details);
    },
    updateSendRequest(details) {
      updateSendRequest.run(details);
    }
  };
}

module.exports = { createInboxModel };
