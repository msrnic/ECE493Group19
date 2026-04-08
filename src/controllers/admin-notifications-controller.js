const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');

function wantsJson(req) {
  const matchesContentType = typeof req.is === 'function' ? req.is('application/json') : false;
  const acceptHeader = typeof req.get === 'function' ? req.get('accept') : req.headers?.accept;
  return (
    matchesContentType ||
    String(acceptHeader || '').includes('application/json') ||
    String(req.originalUrl || req.url || '').startsWith('/api/')
  );
}

function normalizeSelections(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function renderCheckboxes(items, fieldName, selectedValues, valueKey, labelKey) {
  const selected = new Set(selectedValues);
  return items
    .map(
      (item) => `
        <label class="profile-choice">
          <input type="checkbox" name="${escapeHtml(fieldName)}" value="${escapeHtml(item[valueKey])}"${selected.has(item[valueKey]) ? ' checked' : ''}>
          <span>${escapeHtml(item[labelKey])}</span>
        </label>
      `
    )
    .join('');
}

function renderSummary(summary) {
  if (!summary) {
    return '';
  }

  const failedRecipientsHtml = (summary.failedRecipients || [])
    .map((recipient) => `<li>${escapeHtml(recipient.recipientId)}: ${escapeHtml(recipient.reason)}</li>`)
    .join('');

  return `
    <section class="profile-section">
      <h2>Latest send summary</h2>
      <ul class="course-list">
        <li>Total recipients: ${escapeHtml(summary.totalUniqueRecipients)}</li>
        <li>Delivered successfully: ${escapeHtml(summary.successfulDeliveries)}</li>
        <li>Failed deliveries: ${escapeHtml(summary.failedDeliveries)}</li>
        <li>Duplicates removed: ${escapeHtml(summary.duplicateRecipientsRemoved)}</li>
      </ul>
      ${failedRecipientsHtml ? `<h3>Failed recipients</h3><ul class="course-list">${failedRecipientsHtml}</ul>` : ''}
      ${summary.retryEligible ? `<form method="post" action="/admin/notifications/send-requests/${escapeHtml(summary.sendRequestId)}/retry"><button class="login-button-link" type="submit">Retry failed deliveries</button></form>` : ''}
    </section>
  `;
}

function createAdminNotificationsController(services) {
  function buildFormValues(body) {
    return {
      body: String(body?.body || ''),
      courseRosterIds: normalizeSelections(body?.courseRosterIds),
      groupIds: normalizeSelections(body?.groupIds),
      individualStudentIds: normalizeSelections(body?.individualStudentIds),
      subject: String(body?.subject || '')
    };
  }

  function renderPage(res, details) {
    const metadata = services.adminNotificationService.getComposeMetadata();
    const html = renderHtml(path.resolve(__dirname, '../views/admin-notifications.html'), {
      course_checkboxes_html: renderCheckboxes(
        metadata.courses,
        'courseRosterIds',
        details.values.courseRosterIds,
        'courseCode',
        'courseCode'
      ),
      group_checkboxes_html: renderCheckboxes(
        metadata.groups,
        'groupIds',
        details.values.groupIds,
        'groupKey',
        'displayName'
      ),
      preview_html: details.previewHtml || '',
      recent_requests_html: metadata.recentSendRequests
        .map(
          (request) => `<li>${escapeHtml(request.subject)} (${escapeHtml(request.status)})</li>`
        )
        .join(''),
      selected_students: escapeHtml(details.values.individualStudentIds.join(', ')),
      status_banner_html: details.statusBannerHtml || '',
      subject_value: details.values.subject,
      summary_html: details.summaryHtml || '',
      body_value: details.values.body
    });

    return res.status(details.statusCode || 200).send(html);
  }

  function renderStatus(message, variant) {
    if (!message) {
      return '';
    }

    const variantClass = variant === 'error' ? ' profile-status--error' : variant === 'success' ? ' profile-status--success' : '';
    return `<p class="status-chip profile-status${variantClass}">${escapeHtml(message)}</p>`;
  }

  function sendJsonError(res, result) {
    const payload = {
      code: result.code,
      message: result.message
    };

    if (result.details) {
      payload.details = result.details;
    }

    if (result.unauthorizedRecipientIds) {
      payload.unauthorizedRecipientIds = result.unauthorizedRecipientIds;
    }

    if (result.retryExpiresAt) {
      payload.retryExpiresAt = result.retryExpiresAt;
    }

    return res.status(result.statusCode).json(payload);
  }

  return {
    getAdminNotificationsPage(req, res) {
      const result = services.adminNotificationService.previewRecipients(req.session.accountId, {
        courseRosterIds: [],
        groupIds: [],
        individualStudentIds: []
      });
      if (result.statusCode === 403) {
        return renderPage(res, {
          statusBannerHtml: renderStatus(result.message, 'error'),
          statusCode: 403,
          values: buildFormValues({})
        });
      }

      return renderPage(res, { values: buildFormValues({}) });
    },

    getSendSummary(req, res) {
      const result = services.adminNotificationService.getSendSummary(
        req.session.accountId,
        req.params.sendRequestId
      );
      if (result.statusCode !== 200) {
        return wantsJson(req) ? sendJsonError(res, result) : renderPage(res, {
          statusBannerHtml: renderStatus(result.message, 'error'),
          statusCode: result.statusCode,
          values: buildFormValues({})
        });
      }

      return res.status(200).json({
        duplicateRecipientsRemoved: result.duplicateRecipientsRemoved,
        failedDeliveries: result.failedDeliveries,
        failedRecipients: result.failedRecipients,
        retryEligible: result.retryEligible,
        sendRequestId: result.sendRequestId,
        status: result.status,
        successfulDeliveries: result.successfulDeliveries,
        totalUniqueRecipients: result.totalUniqueRecipients
      });
    },

    postPreviewRecipients(req, res) {
      const values = buildFormValues(req.body);
      const result = services.adminNotificationService.previewRecipients(req.session.accountId, values);
      if (wantsJson(req)) {
        if (result.statusCode !== 200) {
          return sendJsonError(res, result);
        }

        return res.status(200).json({
          duplicateRecipientsRemoved: result.duplicateRecipientsRemoved,
          recipientIds: result.recipientIds,
          totalResolvedRecipients: result.totalResolvedRecipients
        });
      }

      if (result.statusCode !== 200) {
        return renderPage(res, {
          previewHtml: '',
          statusBannerHtml: renderStatus(result.message, 'error'),
          statusCode: result.statusCode,
          values
        });
      }

      return renderPage(res, {
        previewHtml: `<section class="profile-section"><h2>Recipient preview</h2><p class="help-text">${escapeHtml(String(result.totalResolvedRecipients))} recipient(s) resolved. ${escapeHtml(String(result.duplicateRecipientsRemoved))} duplicate(s) removed.</p><p class="help-text">${escapeHtml(result.recipientIds.join(', '))}</p></section>`,
        statusBannerHtml: renderStatus('Recipients resolved successfully.', 'success'),
        values
      });
    },

    postRetryFailedDeliveries(req, res) {
      const result = services.adminNotificationService.retryFailedDeliveries(
        req.session.accountId,
        req.params.sendRequestId
      );
      if (wantsJson(req)) {
        if (result.statusCode !== 202) {
          return sendJsonError(res, result);
        }

        return res.status(202).json({
          retriedRecipientCount: result.retriedRecipientCount,
          sendRequestId: result.sendRequestId,
          status: result.status
        });
      }

      const summary = services.adminNotificationService.getSendSummary(
        req.session.accountId,
        req.params.sendRequestId
      );
      return renderPage(res, {
        statusBannerHtml: renderStatus(
          result.statusCode === 202
            ? 'Retry request accepted for failed recipients.'
            : result.message,
          result.statusCode === 202 ? 'success' : 'error'
        ),
        statusCode: result.statusCode === 202 ? 200 : result.statusCode,
        summaryHtml: summary.statusCode === 200 ? renderSummary(summary) : '',
        values: buildFormValues({})
      });
    },

    postSendNotification(req, res) {
      const values = buildFormValues(req.body);
      const result = services.adminNotificationService.sendNotification(req.session.accountId, values);
      if (wantsJson(req)) {
        if (result.statusCode !== 202) {
          return sendJsonError(res, result);
        }

        return res.status(202).json({
          retryExpiresAt: result.retryExpiresAt,
          sendRequestId: String(result.sendRequestId),
          status: result.status
        });
      }

      if (result.statusCode !== 202) {
        return renderPage(res, {
          statusBannerHtml: renderStatus(result.message, 'error'),
          statusCode: result.statusCode,
          values
        });
      }

      const summary = services.adminNotificationService.getSendSummary(
        req.session.accountId,
        result.sendRequestId
      );
      return renderPage(res, {
        statusBannerHtml: renderStatus('Notification send request accepted.', 'success'),
        summaryHtml: summary.statusCode === 200 ? renderSummary(summary) : '',
        values: buildFormValues({})
      });
    }
  };
}

module.exports = { createAdminNotificationsController };
