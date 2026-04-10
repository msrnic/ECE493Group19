const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');

function renderAlternativeRows(alternatives) {
  if (!alternatives || alternatives.length === 0) {
    return "<p class='help-text'>No alternate sections are available right now. Try another course search.</p>";
  }

  return `<ul class='course-list'>${alternatives
    .map((offering) => `<li>${escapeHtml(offering.courseCode)} ${escapeHtml(offering.title)} (${escapeHtml(
      offering.offeringCode
    )}) - ${escapeHtml(String(offering.seatsRemaining))} seats remaining</li>`)
    .join('')}</ul>`;
}

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
          <div class='action-row profile-actions'>
            ${
              offering.seatsRemaining > 0
                ? `<form method='post' action='/enrollment'>
            <input type='hidden' name='offeringId' value='${escapeHtml(String(offering.id))}'>
            <button type='submit'>Enroll</button>
          </form>`
                : `<a class='login-button-link secondary-link' href='/enrollment/waitlist/${escapeHtml(String(offering.id))}'>Join Waitlist</a>`
            }
          </div>
        </section>
      `
    )
    .join('');
}

function renderScheduleRows(schedule) {
  if (schedule.length === 0) {
    return '<li>No enrolled classes yet.</li>';
  }

  function formatValue(label, value, unavailableText) {
    return `${label}: ${
      value === null || typeof value === 'undefined'
        ? `<span class='dashboard-pill'>${escapeHtml(unavailableText)}</span>`
        : escapeHtml(String(value))
    }`;
  }

  return schedule
    .map(
      (offering) =>
        `<li>${escapeHtml(offering.courseCode)} ${escapeHtml(offering.title)} (${escapeHtml(
          offering.offeringCode
        )})<br>${formatValue('Capacity', offering.capacity, 'Capacity unavailable')}<br>${formatValue(
          'Remaining seats',
          offering.seatsRemaining,
          'Remaining seats unavailable'
        )}<br><a class='login-button-link secondary-link' href='/enrollment/remove/${escapeHtml(
          String(offering.id)
        )}'>Remove</a><br><a class='login-button-link secondary-link' href='/enrollment/withdraw/${escapeHtml(
          String(offering.id)
        )}'>Withdraw</a></li>`
    )
    .join('');
}

function renderWaitlistRows(waitlists) {
  if (waitlists.length === 0) {
    return '<li>No current waitlists.</li>';
  }

  return waitlists
    .map((offering) => `<li>${escapeHtml(offering.courseCode)} ${escapeHtml(offering.title)} (${escapeHtml(
      offering.offeringCode
    )})<br>Status: ${escapeHtml(offering.waitlistStatus || 'waitlisted')}${
      offering.waitlistPosition === null || typeof offering.waitlistPosition === 'undefined'
        ? ''
        : `<br>Waitlist position: ${escapeHtml(String(offering.waitlistPosition))}`
    }</li>`)
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
    const schedule = services.enrollmentService.getCourseCapacityView(student);
    const waitlists = services.enrollmentService.getCurrentWaitlists(student);
    const html = renderHtml(path.resolve(__dirname, '../views/enrollment.html'), {
      offerings_html: renderOfferingRows(offerings),
      query: overrides.query || '',
      result_banner_html: overrides.message
        ? `<p class='status-chip profile-status${overrides.variant === 'success' ? ' profile-status--success' : overrides.variant === 'error' ? ' profile-status--error' : ''}'>${escapeHtml(overrides.message)}</p>`
        : '',
      result_details_html: overrides.detailsHtml || '',
      schedule_html: renderScheduleRows(schedule),
      waitlists_html: renderWaitlistRows(waitlists)
    });

    return res.status(overrides.statusCode || 200).send(html);
  }

  function renderWaitlistPage(res, outcome, overrides = {}) {
    const html = renderHtml(path.resolve(__dirname, '../views/waitlist-confirmation.html'), {
      alternatives_html: outcome.alternatives ? renderAlternativeRows(outcome.alternatives) : '',
      course_heading: outcome.offering ? `${outcome.offering.courseCode} ${outcome.offering.title}` : 'Waitlist request',
      offering_code: outcome.offering ? outcome.offering.offeringCode : '',
      offering_id: outcome.offering ? String(outcome.offering.id) : '',
      position_note: outcome.offering?.waitlistUsesPosition
        ? 'A waitlist position will be assigned when your request is recorded.'
        : 'This section uses waitlist status without assigning a numeric position.',
      result_banner_html: overrides.message
        ? `<p class='status-chip profile-status${overrides.variant === 'error' ? ' profile-status--error' : ''}'>${escapeHtml(overrides.message)}</p>`
        : '',
      seat_status: outcome.offering ? `${outcome.offering.seatsRemaining} seats remaining` : '',
      waitlist_details_html: overrides.detailsHtml || ''
    });

    return res.status(overrides.statusCode || 200).send(html);
  }

  function renderWithdrawalPage(res, student, outcome, overrides = {}) {
    const html = renderHtml(path.resolve(__dirname, '../views/withdrawal-confirmation.html'), {
      course_heading: `${outcome.offering.courseCode} ${outcome.offering.title}`,
      fee_impact: outcome.implications.feeImpactSummary,
      offering_code: outcome.offering.offeringCode,
      offering_id: String(outcome.offering.id),
      result_banner_html: overrides.message
        ? `<p class='status-chip profile-status${overrides.variant === 'error' ? ' profile-status--error' : ''}'>${escapeHtml(overrides.message)}</p>`
        : '',
      transcript_impact: outcome.implications.transcriptImpact
    });

    return res.status(overrides.statusCode || 200).send(html);
  }

  function renderRemovalPage(res, student, outcome, overrides = {}) {
    const detailsHtml = outcome.classification === 'drop'
      ? `<p class='help-text'>${escapeHtml(outcome.implications.transcriptImpact)}</p>`
      : `<p class='help-text'>${escapeHtml('A W notation will appear on your transcript for this class.')}</p>`;
    const html = renderHtml(path.resolve(__dirname, '../views/removal-confirmation.html'), {
      classification: outcome.classification === 'drop' ? 'Drop' : 'Withdrawal',
      course_heading: `${outcome.offering.courseCode} ${outcome.offering.title}`,
      deadline_label: outcome.deadlineLabel,
      details_html: detailsHtml,
      fee_impact: outcome.implications.feeImpactSummary,
      offering_id: String(outcome.offering.id),
      result_banner_html: overrides.message
        ? `<p class='status-chip profile-status${overrides.variant === 'error' ? ' profile-status--error' : ''}'>${escapeHtml(overrides.message)}</p>`
        : '',
      timezone_name: outcome.timezoneName
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
          detailsHtml: "<p class='help-text'>No enrollment was created. Refresh your schedule and retry.</p>",
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
    },

    getWaitlistPage(req, res) {
      const student = getActiveStudent(req);
      if (!student) {
        return res.redirect('/login?returnTo=%2Fenrollment');
      }

      const outcome = services.enrollmentService.getWaitlistPreview(student, Number(req.params.offeringId));
      if (outcome.status === 'not_found') {
        return renderPage(res, student, {
          message: outcome.message,
          statusCode: 404,
          variant: 'error'
        });
      }

      if (outcome.status === 'blocked') {
        return renderWaitlistPage(res, outcome, {
          detailsHtml: `<ul class='course-list'>${outcome.reasons
            .map((reason) => `<li>${escapeHtml(reason.message)}</li>`)
            .join('')}</ul>`,
          message: outcome.message,
          statusCode: 409,
          variant: 'error'
        });
      }

      return renderWaitlistPage(res, outcome);
    },

    postWaitlist(req, res) {
      const student = getActiveStudent(req);
      if (!student) {
        return res.redirect('/login?returnTo=%2Fenrollment');
      }

      if (req.body.action === 'cancel') {
        return renderPage(res, student, {
          message: 'Waitlist request was canceled. Your registration status was not changed.'
        });
      }

      const outcome = services.enrollmentService.joinWaitlist(student, Number(req.params.offeringId));
      if (outcome.status === 'blocked') {
        return renderWaitlistPage(res, outcome, {
          detailsHtml: `<ul class='course-list'>${outcome.reasons
            .map((reason) => `<li>${escapeHtml(reason.message)}</li>`)
            .join('')}</ul>`,
          message: outcome.message,
          statusCode: 409,
          variant: 'error'
        });
      }

      if (outcome.status === 'not_found') {
        return renderPage(res, student, {
          message: outcome.message,
          statusCode: 404,
          variant: 'error'
        });
      }

      if (outcome.status === 'error') {
        const preview = services.enrollmentService.getWaitlistPreview(student, Number(req.params.offeringId));
        if (preview.status === 'ready') {
          return renderWaitlistPage(res, preview, {
            detailsHtml: "<ul class='course-list'><li>No waitlist entry was created.</li><li>No waitlist position was assigned.</li></ul>",
            message: outcome.message,
            statusCode: 500,
            variant: 'error'
          });
        }

        return renderPage(res, student, {
          detailsHtml: "<ul class='course-list'><li>No waitlist entry was created.</li><li>No waitlist position was assigned.</li></ul>",
          message: outcome.message,
          statusCode: 500,
          variant: 'error'
        });
      }

      return renderPage(res, student, {
        detailsHtml: `<ul class='course-list'><li>Status: ${escapeHtml(outcome.waitlistStatus)}</li>${
          outcome.waitlistPosition === null || typeof outcome.waitlistPosition === 'undefined'
            ? ''
            : `<li>Waitlist position: ${escapeHtml(String(outcome.waitlistPosition))}</li>`
        }</ul>`,
        message: `${outcome.offering.courseCode} ${outcome.offering.title} waitlisted successfully.`,
        variant: 'success'
      });
    },

    getWithdrawalPage(req, res) {
      const student = getActiveStudent(req);
      if (!student) {
        return res.redirect('/login?returnTo=%2Fenrollment');
      }

      const outcome = services.enrollmentService.getWithdrawalPreview(student, Number(req.params.offeringId));
      if (outcome.status !== 'ready') {
        return renderPage(res, student, {
          message: outcome.message,
          statusCode: 404,
          variant: 'error'
        });
      }

      return renderWithdrawalPage(res, student, outcome);
    },

    postWithdrawal(req, res) {
      const student = getActiveStudent(req);
      if (!student) {
        return res.redirect('/login?returnTo=%2Fenrollment');
      }

      if (req.body.action === 'cancel') {
        return renderPage(res, student, {
          message: 'Withdrawal was canceled. Your schedule was not changed.'
        });
      }

      const outcome = services.enrollmentService.withdrawStudent(student, Number(req.params.offeringId));
      if (outcome.status === 'not_found') {
        return renderPage(res, student, {
          message: outcome.message,
          statusCode: 409,
          variant: 'error'
        });
      }

      if (outcome.status === 'error') {
        const preview = services.enrollmentService.getWithdrawalPreview(student, Number(req.params.offeringId));
        if (preview.status === 'ready') {
          return renderWithdrawalPage(res, student, preview, {
            message: outcome.message,
            statusCode: 500,
            variant: 'error'
          });
        }

        return renderPage(res, student, {
          message: outcome.message,
          statusCode: 500,
          variant: 'error'
        });
      }

      return renderPage(res, student, {
        detailsHtml: `<ul class='course-list'><li>${escapeHtml(outcome.implications.transcriptImpact)}</li><li>${escapeHtml(
          outcome.implications.feeImpactSummary
        )}</li></ul>`,
        message: `${outcome.offering.courseCode} ${outcome.offering.title} was withdrawn successfully.`,
        variant: 'success'
      });
    },

    getRemovalPage(req, res) {
      const student = getActiveStudent(req);
      if (!student) {
        return res.redirect('/login?returnTo=%2Fenrollment');
      }

      const outcome = services.enrollmentService.getRemovalPreview(student, Number(req.params.offeringId));
      if (outcome.status === 'blocked') {
        return renderPage(res, student, {
          message: outcome.message,
          statusCode: 409,
          variant: 'error'
        });
      }

      if (outcome.status !== 'ready') {
        return renderPage(res, student, {
          message: outcome.message,
          statusCode: 404,
          variant: 'error'
        });
      }

      return renderRemovalPage(res, student, outcome);
    },

    postRemoval(req, res) {
      const student = getActiveStudent(req);
      if (!student) {
        return res.redirect('/login?returnTo=%2Fenrollment');
      }

      if (req.body.action === 'cancel') {
        return renderPage(res, student, {
          message: 'Class removal was canceled. Your schedule was not changed.'
        });
      }

      const outcome = services.enrollmentService.removeStudent(student, Number(req.params.offeringId));
      if (outcome.status === 'blocked') {
        return renderPage(res, student, {
          message: outcome.message,
          statusCode: 409,
          variant: 'error'
        });
      }

      if (outcome.status === 'not_found') {
        return renderPage(res, student, {
          message: outcome.message,
          statusCode: 404,
          variant: 'error'
        });
      }

      if (outcome.status === 'error') {
        const preview = services.enrollmentService.getRemovalPreview(student, Number(req.params.offeringId));
        if (preview.status === 'ready') {
          return renderRemovalPage(res, student, preview, {
            message: outcome.message,
            statusCode: 500,
            variant: 'error'
          });
        }

        return renderPage(res, student, {
          message: outcome.message,
          statusCode: 500,
          variant: 'error'
        });
      }

      return renderPage(res, student, {
        detailsHtml: `<ul class='course-list'><li>Classification: ${escapeHtml(
          outcome.classification === 'drop' ? 'Drop' : 'Withdrawal'
        )}</li><li>${escapeHtml(outcome.implications.feeImpactSummary)}</li></ul>`,
        message: `${outcome.offering.courseCode} ${outcome.offering.title} was removed successfully.`,
        variant: 'success'
      });
    }
  };
}

module.exports = { createEnrollmentController };
