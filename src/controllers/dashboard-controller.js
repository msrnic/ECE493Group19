const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');

function createDashboardController(services) {
  function renderSecurityLinks(account) {
    const links = [
      '<li><a class="login-button-link" href="/account/security/password-change">Change password</a></li>'
    ];

    if (account.role === 'admin') {
      const targets = services.accountModel.listPasswordManagementTargets(account.id);
      for (const target of targets) {
        links.push(
          `<li><a class="login-button-link secondary-link" href="/admin/users/${target.id}/password">Reset ${escapeHtml(target.username)} password</a></li>`
        );
      }
    }

    return links.join('');
  }

  return {
    getDashboard(req, res) {
      const account = services.accountModel.getDashboardAccount(req.session.accountId) || {
        courses: [],
        id: req.session.accountId,
        role: 'student',
        username: 'Account'
      };
      const sessionRecord = services.sessionModel.findActiveSession(req.sessionID);

      const courseItems = account.courses.length
        ? account.courses
            .map(
              (course) =>
                `<li><strong>${escapeHtml(course.course_code)}</strong> ${escapeHtml(course.title)} (${escapeHtml(course.role)})</li>`
            )
            .join('')
        : '<li>No courses are assigned to this account.</li>';

      const html = renderHtml(path.resolve(__dirname, '../views/dashboard.html'), {
        course_list: courseItems,
        security_links_html: renderSecurityLinks(account),
        session_created_at: sessionRecord ? sessionRecord.created_at : 'Session metadata unavailable.',
        username: account.username
      });

      return res.status(200).send(html);
    }
  };
}

module.exports = { createDashboardController };
