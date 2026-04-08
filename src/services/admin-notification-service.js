function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function createAdminNotificationService(options) {
  function shouldFailLogging(subject) {
    const blockedSubjects = new Set(
      (options.adminNotificationTestState?.loggingFailureSubjects || []).map((value) =>
        String(value || '').trim().toLowerCase()
      )
    );

    return blockedSubjects.has(String(subject || '').trim().toLowerCase());
  }

  function isAdminActor(actorAccountId) {
    const account = options.accountModel.findById(actorAccountId);
    return account && account.role === 'admin' ? account : null;
  }

  function resolveRecipients(selection) {
    const invalidSelections = [];
    const unauthorizedRecipientIds = [];
    const recipients = [];
    const recipientByStudentId = new Map();

    for (const studentId of asArray(selection.individualStudentIds)) {
      const normalizedStudentId = String(studentId || '').trim();
      if (!normalizedStudentId) {
        continue;
      }

      const student = options.studentAccountModel.findByStudentId(normalizedStudentId);
      if (student) {
        recipients.push(student);
        continue;
      }

      const account = options.accountModel.findByIdentifier(normalizedStudentId);
      if (account) {
        unauthorizedRecipientIds.push(normalizedStudentId);
      } else {
        invalidSelections.push(`Unknown student: ${normalizedStudentId}`);
      }
    }

    for (const courseCode of asArray(selection.courseRosterIds)) {
      const normalizedCourseCode = String(courseCode || '').trim();
      if (!normalizedCourseCode) {
        continue;
      }

      const course = options.inboxModel.findCourseDefinition(normalizedCourseCode);
      if (!course) {
        invalidSelections.push(`Unknown course roster: ${normalizedCourseCode}`);
        continue;
      }

      recipients.push(...options.inboxModel.resolveRosterStudents(normalizedCourseCode));
    }

    for (const groupKey of asArray(selection.groupIds)) {
      const normalizedGroupKey = String(groupKey || '').trim();
      if (!normalizedGroupKey) {
        continue;
      }

      const group = options.inboxModel.findGroupDefinition(normalizedGroupKey);
      if (!group) {
        invalidSelections.push(`Unknown recipient group: ${normalizedGroupKey}`);
        continue;
      }

      recipients.push(...options.inboxModel.resolveGroupStudents(normalizedGroupKey));
    }

    for (const recipient of recipients) {
      if (!recipientByStudentId.has(recipient.studentId)) {
        recipientByStudentId.set(recipient.studentId, recipient);
      }
    }

    return {
      duplicateRecipientsRemoved: Math.max(recipients.length - recipientByStudentId.size, 0),
      invalidSelections,
      recipients: [...recipientByStudentId.values()].sort((left, right) =>
        left.studentId.localeCompare(right.studentId)
      ),
      unauthorizedRecipientIds: [...new Set(unauthorizedRecipientIds)].sort()
    };
  }

  function createValidationError(code, message, details) {
    return {
      code,
      details,
      message,
      statusCode: 400
    };
  }

  function createDeduplicationKey(sendRequestId, recipient) {
    return `send-request:${sendRequestId}:${recipient.studentId}`;
  }

  function sendToRecipients(senderAccountId, payload, resolved) {
    const createdAt = options.now().toISOString();
    const messageId = options.inboxModel.createMessage({
      body: payload.body,
      created_at: createdAt,
      created_by: senderAccountId,
      subject: payload.subject
    });
    const retryExpiresAt = new Date(options.now().getTime() + 24 * 60 * 60 * 1000).toISOString();
    const sendRequestId = options.inboxModel.createSendRequest({
      duplicate_recipients_removed: resolved.duplicateRecipientsRemoved,
      failed_deliveries: 0,
      last_error: null,
      message_id: messageId,
      retry_expires_at: retryExpiresAt,
      sender_account_id: senderAccountId,
      sent_at: createdAt,
      status: 'processing',
      successful_deliveries: 0,
      total_unique_recipients: resolved.recipients.length
    });

    let successfulDeliveries = 0;
    let failedDeliveries = 0;
    for (const recipient of resolved.recipients) {
      const result = options.inboxService.createDeliveryOutcomeForAdmin(recipient, {
        body: payload.body,
        createdAt,
        deduplicationKey: createDeduplicationKey(sendRequestId, recipient),
        eventType: 'admin_message',
        sendRequestId,
        senderAccountId,
        sourceType: 'admin_message',
        subject: payload.subject
      });
      if (result.status === 'delivery_failed') {
        failedDeliveries += 1;
      } else {
        successfulDeliveries += 1;
      }
    }

    const status =
      failedDeliveries === 0
        ? 'completed'
        : successfulDeliveries === 0
          ? 'failed'
          : 'completed_with_failures';

    options.inboxModel.updateSendRequest({
      failed_deliveries: failedDeliveries,
      id: sendRequestId,
      last_error: failedDeliveries > 0 ? 'One or more notifications could not be delivered.' : null,
      status,
      successful_deliveries: successfulDeliveries
    });

    return {
      retryExpiresAt,
      sendRequestId,
      status: 'processing'
    };
  }

  function validateMessage(payload) {
    const details = [];

    if (!String(payload.subject || '').trim()) {
      details.push('Subject is required.');
    } else if (String(payload.subject).trim().length > 120) {
      details.push('Subject must be 120 characters or fewer.');
    }

    if (!String(payload.body || '').trim()) {
      details.push('Body is required.');
    } else if (String(payload.body).trim().length > 5000) {
      details.push('Body must be 5000 characters or fewer.');
    }

    return details;
  }

  return {
    getComposeMetadata() {
      return {
        courses: options.inboxModel.listCourses(),
        groups: options.inboxModel.listGroups(),
        recentSendRequests: options.inboxModel.listRecentSendRequests(10)
      };
    },

    getSendSummary(actorAccountId, sendRequestId) {
      if (!isAdminActor(actorAccountId)) {
        return {
          code: 'FORBIDDEN',
          message: 'Administrative authorization is required for this action.',
          statusCode: 403
        };
      }

      const sendRequest = options.inboxModel.findSendRequestById(sendRequestId);
      if (!sendRequest) {
        return {
          code: 'NOT_FOUND',
          message: 'Send request not found.',
          statusCode: 404
        };
      }

      const failedRecipients = options.inboxModel.listFailedRecipientsForSendRequest(sendRequestId);
      const failedDeliveries = failedRecipients.length;
      const successfulDeliveries = Math.max(
        sendRequest.totalUniqueRecipients - failedDeliveries,
        0
      );
      const status =
        failedDeliveries === 0
          ? 'completed'
          : successfulDeliveries === 0
            ? 'failed'
            : 'completed_with_failures';
      return {
        duplicateRecipientsRemoved: sendRequest.duplicateRecipientsRemoved,
        failedDeliveries,
        failedRecipients: failedRecipients.map((recipient) => ({
          reason: recipient.reason,
          recipientId: recipient.recipientId
        })),
        retryEligible:
          failedRecipients.length > 0 && new Date(sendRequest.retryExpiresAt).getTime() >= options.now().getTime(),
        sendRequestId: String(sendRequest.sendRequestId),
        status,
        statusCode: 200,
        successfulDeliveries,
        totalUniqueRecipients: sendRequest.totalUniqueRecipients
      };
    },

    previewRecipients(actorAccountId, selection) {
      if (!isAdminActor(actorAccountId)) {
        return {
          code: 'FORBIDDEN',
          message: 'Administrative authorization is required for this action.',
          statusCode: 403
        };
      }

      const resolved = resolveRecipients(selection || {});
      if (resolved.unauthorizedRecipientIds.length > 0) {
        return {
          code: 'UNAUTHORIZED_RECIPIENTS',
          message: 'One or more selected recipients are not student accounts.',
          statusCode: 403,
          unauthorizedRecipientIds: resolved.unauthorizedRecipientIds
        };
      }

      if (resolved.invalidSelections.length > 0) {
        return createValidationError(
          'INVALID_RECIPIENT_SELECTION',
          'Please correct the selected recipients before continuing.',
          resolved.invalidSelections
        );
      }

      if (resolved.recipients.length === 0) {
        return createValidationError(
          'EMPTY_RECIPIENT_SELECTION',
          'Select at least one valid student recipient.',
          ['No student recipients were resolved from the current selection.']
        );
      }

      return {
        duplicateRecipientsRemoved: resolved.duplicateRecipientsRemoved,
        recipientIds: resolved.recipients.map((recipient) => recipient.studentId),
        statusCode: 200,
        totalResolvedRecipients: resolved.recipients.length
      };
    },

    retryFailedDeliveries(actorAccountId, sendRequestId) {
      if (!isAdminActor(actorAccountId)) {
        return {
          code: 'FORBIDDEN',
          message: 'Administrative authorization is required for this action.',
          statusCode: 403
        };
      }

      const sendRequest = options.inboxModel.findSendRequestById(sendRequestId);
      if (!sendRequest) {
        return {
          code: 'NOT_FOUND',
          message: 'Send request not found.',
          statusCode: 404
        };
      }

      if (new Date(sendRequest.retryExpiresAt).getTime() < options.now().getTime()) {
        return {
          code: 'RETRY_WINDOW_EXPIRED',
          message: 'The retry window has expired for this send request.',
          retryExpiresAt: sendRequest.retryExpiresAt,
          statusCode: 410
        };
      }

      const failedRecipients = options.inboxModel.listFailedRecipientsForSendRequest(sendRequestId);
      if (failedRecipients.length === 0) {
        return createValidationError(
          'NO_FAILED_RECIPIENTS',
          'There are no failed recipients remaining for retry.',
          ['All recipients have already been delivered successfully.']
        );
      }

      for (const failedRecipient of failedRecipients) {
        const notification = options.inboxModel.findNotificationById(
          failedRecipient.inboxNotificationId
        );
        options.inboxService.retryFailedNotification(notification);
      }

      const summary = this.getSendSummary(actorAccountId, sendRequestId);
      if (summary.statusCode !== 200) {
        return summary;
      }

      options.inboxModel.updateSendRequest({
        failed_deliveries: summary.failedDeliveries,
        id: Number(sendRequestId),
        last_error:
          summary.failedDeliveries > 0
            ? 'One or more notifications could not be delivered.'
            : null,
        status: summary.status,
        successful_deliveries: summary.successfulDeliveries
      });

      return {
        retriedRecipientCount: failedRecipients.length,
        sendRequestId: String(sendRequestId),
        status: 'processing',
        statusCode: 202
      };
    },

    sendNotification(actorAccountId, payload) {
      if (!isAdminActor(actorAccountId)) {
        return {
          code: 'FORBIDDEN',
          message: 'Administrative authorization is required for this action.',
          statusCode: 403
        };
      }

      const messageErrors = validateMessage(payload || {});
      if (messageErrors.length > 0) {
        return createValidationError(
          'INVALID_MESSAGE',
          'Please correct the message before sending.',
          messageErrors
        );
      }

      const resolved = resolveRecipients(payload || {});
      if (resolved.unauthorizedRecipientIds.length > 0) {
        return {
          code: 'UNAUTHORIZED_RECIPIENTS',
          message: 'One or more selected recipients are not student accounts.',
          statusCode: 403,
          unauthorizedRecipientIds: resolved.unauthorizedRecipientIds
        };
      }

      if (resolved.invalidSelections.length > 0 || resolved.recipients.length === 0) {
        return createValidationError(
          resolved.invalidSelections.length > 0
            ? 'INVALID_RECIPIENT_SELECTION'
            : 'EMPTY_RECIPIENT_SELECTION',
          resolved.invalidSelections.length > 0
            ? 'Please correct the selected recipients before continuing.'
            : 'Select at least one valid student recipient.',
          resolved.invalidSelections.length > 0
            ? resolved.invalidSelections
            : ['No student recipients were resolved from the current selection.']
        );
      }

      if (shouldFailLogging(payload.subject)) {
        return {
          code: 'SEND_REQUEST_CONFLICT',
          message: 'The notification could not be logged for delivery. Please retry.',
          statusCode: 409
        };
      }

      return {
        ...sendToRecipients(actorAccountId, payload, resolved),
        statusCode: 202
      };
    }
  };
}

module.exports = { createAdminNotificationService };
