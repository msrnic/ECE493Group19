const path = require('path');

const { renderHtml } = require('../views/render');

function createDashboardController(services) {
  return {
    getDashboard(req, res) {
      const account = services.accountModel.getDashboardAccount(req.session.accountId);
      const sessionRecord = services.sessionModel.findActiveSession(req.sessionID);

      const courseItems = account.courses.length
        ? account.courses
            .map(
              (course) =>
                `<li><strong>${course.course_code}</strong> ${course.title} (${course.role})</li>`
            )
            .join('')
        : '<li>No courses are assigned to this account.</li>';

      const html = renderHtml(path.resolve(__dirname, '../views/dashboard.html'), {
        course_list: courseItems,
        session_created_at: sessionRecord ? sessionRecord.created_at : 'Session metadata unavailable.',
        username: account.username
      });

      return res.status(200).send(html);
    }
  };
}

module.exports = { createDashboardController };
