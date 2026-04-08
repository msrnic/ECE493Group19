const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');

function renderOfferingRows(offerings) {
  if (offerings.length === 0) {
    return "<section class='profile-section'><h2>No class offerings found</h2><p class='help-text'>Try a different course code or keyword.</p></section>";
  }

  return offerings
    .map(
      (offering) => `
        <section class='profile-section'>
          <h2>${escapeHtml(offering.courseCode)} ${escapeHtml(offering.title)}</h2>
          <p class='help-text'>Offering: ${escapeHtml(offering.offeringCode)} | Seats remaining: ${escapeHtml(String(offering.seatsRemaining))}</p>
          <p class='help-text'>Meeting time: ${escapeHtml(offering.meetingDays)} ${escapeHtml(String(offering.startMinute))}-${escapeHtml(String(offering.endMinute))}</p>
          <form method='post' action='/enrollment'>
            <input type='hidden' name='offeringId' value='${escapeHtml(String(offering.id))}'>
            <button type='submit'>Enroll</button>
          </form>
        </section>
      `
    )
    .join('');
}

function renderScheduleRows(schedule) {
  if (schedule.length === 0) {
    return '<li>No enrolled classes yet.</li>';
  }

  return schedule
    .map(
      (offering) =>
        `<li>${escapeHtml(offering.courseCode)} ${escapeHtml(offering.title)} (${escapeHtml(offering.offeringCode)})</li>`
    )
    .join('');
}

function createEnrollmentController(services) {
  function getActiveStudent(req) {
    if (!req.session?.accountId) {
      return null;
    }

    return services.studentAccountModel.findActiveByAccountId(req.session.accountId);
  }

  function renderPage(res, student, overrides = {}) {
    const offerings = overrides.offerings || services.enrollmentModel.listMatchingOfferings(overrides.query || '');
    const schedule = services.enrollmentModel.listCurrentSchedule(student.accountId);
    const html = renderHtml(path.resolve(__dirname, '../views/enrollment.html'), {
      offerings_html: renderOfferingRows(offerings),
      query: overrides.query || '',
      result_banner_html: overrides.message
        ? `<p class='status-chip profile-status${overrides.variant === 'success' ? ' profile-status--success' : overrides.variant === 'error' ? ' profile-status--error' : ''}'>${escapeHtml(overrides.message)}</p>`
        : '',
      result_details_html: overrides.detailsHtml || '',
      schedule_html: renderScheduleRows(schedule)
    });

    return res.status(overrides.statusCode || 200).send(html);
  }

  return {
    getEnrollmentPage(req, res) {
      const student = getActiveStudent(req);
      if (!student) {
        return res.redirect('/login?returnTo=%2Fenrollment');
      }

      return renderPage(res, student, { query: req.query.q || '' });
    },

    postEnrollment(req, res) {
      const student = getActiveStudent(req);
      if (!student) {
        return res.redirect('/login?returnTo=%2Fenrollment');
      }

      const outcome = services.enrollmentService.enrollStudent(student, Number(req.body.offeringId));
      if (outcome.status === 'not_found') {
        return renderPage(res, student, {
          message: outcome.message,
          query: req.body.q || '',
          statusCode: 404,
          variant: 'error'
        });
      }

      if (outcome.status === 'blocked') {
        return renderPage(res, student, {
          detailsHtml: `<ul class='course-list'>${outcome.reasons
            .map((reason) => `<li>${escapeHtml(reason.message)}</li>`)
            .join('')}</ul>`,
          message: 'Enrollment was blocked.',
          query: req.body.q || '',
          statusCode: 409,
          variant: 'error'
        });
      }

      if (outcome.status === 'error') {
        return renderPage(res, student, {
          message: outcome.message,
          query: req.body.q || '',
          statusCode: 500,
          variant: 'error'
        });
      }

      return renderPage(res, student, {
        detailsHtml: `<p class='help-text'>Fee assessment change: ${escapeHtml(
          outcome.feeAssessment.amount
        )}</p>`,
        message: `${outcome.offering.courseCode} ${outcome.offering.title} enrolled successfully.`,
        query: req.body.q || '',
        variant: 'success'
      });
    }
  };
}

module.exports = { createEnrollmentController };
