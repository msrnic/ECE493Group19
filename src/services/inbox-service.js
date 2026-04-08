function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function createInboxService(options) {
  function shouldFailDelivery(student) {
    const failures = new Set(
      (options.inboxTestState?.deliveryFailureIdentifiers || []).map(normalizeIdentifier)
    );

    if (failures.has(normalizeIdentifier(student.email))) {
      return true;
    }

    return failures.has(normalizeIdentifier(student.studentId));
  }

  function createDeliveryOutcome(student, details) {
    const accessState = options.inboxModel.getAccessState(student.accountId);
    const createdAt = details.createdAt || options.now().toISOString();

    if (shouldFailDelivery(student)) {
      const notificationId = options.inboxModel.createInboxNotification({
        account_id: student.accountId,
        available_at: null,
        body: details.body,
        created_at: createdAt,
        deduplication_key: details.deduplicationKey,
        event_type: details.eventType,
        last_failure_reason: 'Inbox delivery is temporarily unavailable.',
        notification_status: 'delivery_failed',
        read_at: null,
        send_request_id: details.sendRequestId || null,
        sender_account_id: details.senderAccountId || null,
        source_type: details.sourceType,
        subject: details.subject
      });

      options.inboxModel.createDeliveryAttempt({
        attempted_at: createdAt,
        attempt_sequence: 1,
        delivered_at: null,
        failure_reason: 'Inbox delivery is temporarily unavailable.',
        inbox_notification_id: notificationId,
        retry_eligible_until: new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'failed'
      });

      return { notificationId, status: 'delivery_failed' };
    }

    const isRestricted = accessState.accessState === 'restricted';
    const notificationId = options.inboxModel.createInboxNotification({
      account_id: student.accountId,
      available_at: isRestricted ? null : createdAt,
      body: details.body,
      created_at: createdAt,
      deduplication_key: details.deduplicationKey,
      event_type: details.eventType,
      last_failure_reason: null,
      notification_status: isRestricted ? 'stored_for_later' : 'delivered',
      read_at: null,
      send_request_id: details.sendRequestId || null,
      sender_account_id: details.senderAccountId || null,
      source_type: details.sourceType,
      subject: details.subject
    });

    options.inboxModel.createDeliveryAttempt({
      attempted_at: createdAt,
      attempt_sequence: 1,
      delivered_at: isRestricted ? null : createdAt,
      failure_reason: null,
      inbox_notification_id: notificationId,
      retry_eligible_until: null,
      status: 'sent'
    });

    return { notificationId, status: isRestricted ? 'stored_for_later' : 'delivered' };
  }

  return {
    createDeliveryOutcomeForAdmin(student, details) {
      return createDeliveryOutcome(student, details);
    },

    createAcademicNotification(student, details) {
      if (!student || !details?.deduplicationKey) {
        return {
          message: 'Student and deduplication key are required.',
          status: 'invalid'
        };
      }

      const existing = options.inboxModel.findNotificationByDeduplicationKey(
        student.accountId,
        details.deduplicationKey
      );
      if (existing) {
        return {
          message: 'Matching notification already exists.',
          status: 'duplicate'
        };
      }

      return createDeliveryOutcome(student, {
        body: details.body,
        createdAt: details.createdAt,
        deduplicationKey: details.deduplicationKey,
        eventType: details.eventType,
        sendRequestId: null,
        senderAccountId: null,
        sourceType: 'academic_event',
        subject: details.subject
      });
    },

    getInboxView(student) {
      const accessState = options.inboxModel.getAccessState(student.accountId);
      const isRestricted = accessState.accessState === 'restricted';

      if (!isRestricted) {
        const releasedAt = options.now().toISOString();
        for (const notification of options.inboxModel.listStoredNotifications(student.accountId)) {
          options.inboxModel.updateNotificationDeliveryStatus({
            available_at: releasedAt,
            id: notification.inboxNotificationId,
            last_failure_reason: null,
            notification_status: 'delivered'
          });
          options.inboxModel.createDeliveryAttempt({
            attempted_at: releasedAt,
            attempt_sequence: options.inboxModel.getNextAttemptSequence(
              notification.inboxNotificationId
            ),
            delivered_at: releasedAt,
            failure_reason: null,
            inbox_notification_id: notification.inboxNotificationId,
            retry_eligible_until: null,
            status: 'sent'
          });
        }
      }

      return {
        accessState,
        notifications: isRestricted ? [] : options.inboxModel.listVisibleNotifications(student.accountId),
        storedCount: options.inboxModel.countStoredForLater(student.accountId)
      };
    },

    retryFailedNotification(notification) {
      if (!notification || notification.notificationStatus !== 'delivery_failed') {
        return {
          message: 'No failed notification is available for retry.',
          status: 'invalid'
        };
      }

      const student = options.studentAccountModel.findByAccountId(notification.accountId);
      if (!student) {
        return {
          message: 'Recipient account is no longer available.',
          status: 'invalid'
        };
      }

      const retryAttemptSequence = options.inboxModel.getNextAttemptSequence(
        notification.inboxNotificationId
      );
      const attemptedAt = options.now().toISOString();
      const accessState = options.inboxModel.getAccessState(student.accountId);

      if (shouldFailDelivery(student)) {
        options.inboxModel.createDeliveryAttempt({
          attempted_at: attemptedAt,
          attempt_sequence: retryAttemptSequence,
          delivered_at: null,
          failure_reason: 'Inbox delivery is temporarily unavailable.',
          inbox_notification_id: notification.inboxNotificationId,
          retry_eligible_until: new Date(options.now().getTime() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'failed'
        });

        options.inboxModel.updateNotificationDeliveryStatus({
          available_at: null,
          id: notification.inboxNotificationId,
          last_failure_reason: 'Inbox delivery is temporarily unavailable.',
          notification_status: 'delivery_failed'
        });

        return { status: 'delivery_failed' };
      }

      const isRestricted = accessState.accessState === 'restricted';
      options.inboxModel.createDeliveryAttempt({
        attempted_at: attemptedAt,
        attempt_sequence: retryAttemptSequence,
        delivered_at: isRestricted ? null : attemptedAt,
        failure_reason: null,
        inbox_notification_id: notification.inboxNotificationId,
        retry_eligible_until: null,
        status: 'sent'
      });
      options.inboxModel.updateNotificationDeliveryStatus({
        available_at: isRestricted ? null : attemptedAt,
        id: notification.inboxNotificationId,
        last_failure_reason: null,
        notification_status: isRestricted ? 'stored_for_later' : 'delivered'
      });

      return { status: isRestricted ? 'stored_for_later' : 'delivered' };
    }
  };
}

module.exports = { createInboxService, normalizeIdentifier };
