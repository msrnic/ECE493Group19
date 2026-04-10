const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');

function createDeadlineController(services) {
  function getActiveStudent(req) {
    if (!req.session?.accountId) {
      return null;
    }

    return services.studentAccountModel.findActiveByAccountId(req.session.accountId);
  }

  function renderPage(res, payload, overrides = {}) {
    const state = overrides.payload || payload;
    const actionLabel = state.actionState === 'allowed'
      ? 'Check drop eligibility'
      : state.state === 'error'
        ? 'Retry deadline check'
        : 'Attempt drop check';
    const actionHtml = `<form method="post" action="/deadlines/drop" class="profile-section"><div class="action-row profile-actions"><button type="submit">${escapeHtml(
      actionLabel
    )}</button><a class="login-button-link secondary-link" href="/enrollment">${
      state.actionState === 'allowed' ? 'Open Enrollment Hub' : 'Back to enrollment'
    }</a></div></form>`;
    const html = renderHtml(path.resolve(__dirname, '../views/add-drop-deadlines.html'), {
      action_html: actionHtml,
      attempt_message_html: overrides.attemptMessage
        ? `<p class='help-text'>${escapeHtml(overrides.attemptMessage)}</p>`
        : '',
      deadline_html: state.deadlineLabel
        ? `<ul class='course-list'><li>Term: ${escapeHtml(state.termCode)}</li><li>Deadline: ${escapeHtml(state.deadlineLabel)}</li><li>Timezone: ${escapeHtml(state.timezoneName)}</li></ul>`
        : `<p class='help-text'>Deadline information is currently unavailable for term ${escapeHtml(state.termCode || 'unknown')}.</p>`,
      status_banner_html: `<p class='status-chip profile-status${state.state === 'allowed' ? ' profile-status--success' : state.state === 'error' ? ' profile-status--error' : ''}'>${escapeHtml(
        state.message
      )}</p>`,
      status_label: state.statusLabel || (state.state === 'error' ? 'Deadline unavailable' : 'Deadline status')
    });

    const statusCode = state.state === 'error' ? 503 : 200;
    return res.status(statusCode).send(html);
  }

  return {
    getDropDeadlinePage(req, res) {
      const student = getActiveStudent(req);
      if (!student) {
        return res.redirect('/login?returnTo=%2Fdeadlines%2Fdrop');
      }

      return renderPage(res, services.deadlinePolicyService.getDropDeadlinePageData(student));
    },

    postDropDeadlineEvaluation(req, res) {
      const student = getActiveStudent(req);
      if (!student) {
        return res.redirect('/login?returnTo=%2Fdeadlines%2Fdrop');
      }

      const payload = services.deadlinePolicyService.evaluateDropAttempt(student);
      return renderPage(res, payload, { attemptMessage: payload.attemptMessage, payload });
    }
  };
}

module.exports = { createDeadlineController };
