const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');

function renderNotifications(notifications) {
  return notifications.map((notification) => `
    <article class="dashboard-section-card transaction-record">
      <div class="dashboard-section-header">
        <h2>${escapeHtml(notification.subject)}</h2>
        <span class="dashboard-pill dashboard-pill--ok">${escapeHtml(notification.availableAt || notification.createdAt)}</span>
      </div>
      <p class="help-text">${escapeHtml(notification.body)}</p>
      <ul class="course-list">
        <li>Type: ${escapeHtml(notification.eventType)}</li>
        <li>Status: ${escapeHtml(notification.notificationStatus)}</li>
        ${notification.senderUsername ? `<li>Sent by: ${escapeHtml(notification.senderUsername)}</li>` : ''}
      </ul>
    </article>
  `).join('');
}

function createInboxController(services) {
  function getActiveStudent(req) {
    if (!req.session?.accountId) {
      return null;
    }

    return services.studentAccountModel.findActiveByAccountId(req.session.accountId);
  }

  function renderPage(res, details) {
    const html = renderHtml(path.resolve(__dirname, '../views/inbox.html'), {
      inbox_items_html: details.itemsHtml,
      signed_in_as: details.signedInAs,
      status_class: details.statusClass,
      status_message: details.statusMessage,
      summary_text: details.summaryText
    });

    return res.status(details.statusCode).send(html);
  }

  return {
    getInboxPage(req, res) {
      const student = getActiveStudent(req);
      if (!student) {
        return renderPage(res, {
          itemsHtml:
            '<section class="dashboard-section-card dashboard-section-card--message"><h2>Inbox unavailable</h2><p class="help-text">Only active student accounts may view the built-in inbox.</p></section>',
          signedInAs: 'student',
          statusClass: 'failure',
          statusCode: 403,
          statusMessage: 'Inbox access is unavailable for this account.',
          summaryText: 'Only active student accounts may view inbox notifications.'
        });
      }

      const inboxView = services.inboxService.getInboxView(student);
      if (inboxView.accessState.accessState === 'restricted') {
        return renderPage(res, {
          itemsHtml: `<section class="dashboard-section-card dashboard-section-card--message"><h2>Inbox access restricted</h2><p class="help-text">${escapeHtml(inboxView.accessState.restrictionReason || 'Inbox access is currently restricted.')}</p><p class="help-text">${escapeHtml(String(inboxView.storedCount))} notification(s) are stored for later viewing.</p></section>`,
          signedInAs: student.studentId,
          statusClass: 'failure',
          statusCode: 200,
          statusMessage: 'Inbox access is restricted right now.',
          summaryText: 'New notifications are being stored until inbox access is restored.'
        });
      }

      if (inboxView.notifications.length === 0) {
        return renderPage(res, {
          itemsHtml:
            '<section class="dashboard-section-card dashboard-section-card--message"><h2>No inbox messages</h2><p class="help-text">Course updates, grade changes, and administrative announcements will appear here.</p></section>',
          signedInAs: student.studentId,
          statusClass: 'empty_access',
          statusCode: 200,
          statusMessage: 'No inbox messages require action right now.',
          summaryText: 'Recent course and administrative updates will appear here as they arrive.'
        });
      }

      return renderPage(res, {
        itemsHtml: renderNotifications(inboxView.notifications),
        signedInAs: student.studentId,
        statusClass: 'success',
        statusCode: 200,
        statusMessage: 'Inbox messages loaded successfully.',
        summaryText: 'Review course updates, grade changes, and administrative messages in one place.'
      });
    }
  };
}

module.exports = { createInboxController };
