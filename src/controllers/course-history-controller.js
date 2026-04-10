const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');

function renderTermGroups(termGroups) {
  return termGroups
    .map((group) => `
      <section class="profile-section">
        <h2>${escapeHtml(group.term)}</h2>
        <ul class="course-list">
          ${group.entries
            .map(
              (entry) => `
                <li>
                  <strong>${escapeHtml(entry.courseCode)}</strong> ${escapeHtml(entry.courseTitle)}
                  ${entry.credits == null ? '' : ` · ${escapeHtml(String(entry.credits))} credits`}
                  ${entry.finalResult ? ` · Final result: ${escapeHtml(entry.finalResult)}` : ''}
                  ${entry.availabilityStatus === 'partial' ? ` · ${escapeHtml(entry.missingDetailsNote || 'Some details are unavailable.')}` : ''}
                </li>
              `
            )
            .join('')}
        </ul>
      </section>
    `)
    .join('');
}

function createCourseHistoryController(services) {
  function getActor(req) {
    if (!req.session?.accountId) {
      return null;
    }

    return services.accountModel.findById(req.session.accountId);
  }

  function getAuthorizedStudent(actor) {
    if (!actor) {
      return null;
    }

    const student = services.studentAccountModel.findActiveByAccountId(actor.id);
    if (!student) {
      return null;
    }

    const access = services.studentAccountModel.getStudentRecordAccess(actor.id);
    if (access.courseHistoryAccess !== 'enabled') {
      return null;
    }

    return student;
  }

  function shouldBeUnavailable(student) {
    const identifiers = new Set(
      (services.courseHistoryTestState?.retrievalFailureIdentifiers || []).map((value) =>
        String(value || '').trim().toLowerCase()
      )
    );

    return (
      identifiers.has(String(student.email || '').trim().toLowerCase()) ||
      identifiers.has(String(student.studentId || '').trim().toLowerCase())
    );
  }

  function recordDenied(actor, targetStudentId, reason) {
    return services.studentRecordAuditService.recordDeniedAccess(
      'course_history',
      actor,
      services.studentAccountModel.findByStudentId(targetStudentId)?.accountId || null,
      reason
    );
  }

  function renderPage(res, details) {
    const html = renderHtml(path.resolve(__dirname, '../views/course-history.html'), {
      content_html: details.contentHtml,
      signed_in_as: details.signedInAs,
      state_class: details.stateClass,
      state_message: details.stateMessage,
      summary_text: details.summaryText
    });

    return res.status(details.statusCode).send(html);
  }

  function createJsonResponse(res, statusCode, payload) {
    return res.status(statusCode).json(payload);
  }

  function buildUnavailableView() {
    return {
      message: 'Course history is temporarily unavailable. Retry from the same page later.',
      state: 'unavailable',
      termGroups: []
    };
  }

  return {
    getCourseHistoryApi(req, res) {
      const actor = getActor(req);
      if (!actor) {
        return createJsonResponse(res, 401, {
          code: 'auth_required',
          message: 'Sign in to view course history.'
        });
      }

      const authorizedStudent = getAuthorizedStudent(actor);
      const targetStudent = services.studentAccountModel.findByStudentId(req.params.studentId);
      if (!authorizedStudent || !targetStudent || targetStudent.accountId !== authorizedStudent.accountId) {
        recordDenied(actor, req.params.studentId, 'Requested course history is not available to this actor.');
        return createJsonResponse(res, 403, {
          code: 'course_history_denied',
          message: 'Course history access was denied.'
        });
      }

      if (shouldBeUnavailable(authorizedStudent)) {
        return createJsonResponse(res, 503, buildUnavailableView());
      }

      return createJsonResponse(
        res,
        200,
        services.courseHistoryModel.buildView(
          services.courseHistoryModel.listByAccountId(authorizedStudent.accountId)
        )
      );
    },

    getCourseHistoryPage(req, res) {
      const actor = getActor(req);
      const requestedStudentId = req.params.studentId || services.studentAccountModel.findByAccountId(req.session?.accountId)?.studentId;
      if (!actor) {
        return res.redirect('/login?returnTo=%2Facademic%2Fcourse-history');
      }

      const authorizedStudent = getAuthorizedStudent(actor);
      const targetStudent = services.studentAccountModel.findByStudentId(requestedStudentId);
      if (!authorizedStudent || !targetStudent || targetStudent.accountId !== authorizedStudent.accountId) {
        recordDenied(actor, requestedStudentId, 'Requested course history is not available to this actor.');
        return renderPage(res, {
          contentHtml:
            '<section class="profile-section"><h2>Access denied</h2><p class="help-text">You are not authorized to view this course history.</p></section>',
          signedInAs: actor.username,
          stateClass: 'failure',
          stateMessage: 'Course history access was denied.',
          statusCode: 403,
          summaryText: 'Course history is visible only to the authorized student account.'
        });
      }

      const view = shouldBeUnavailable(authorizedStudent)
        ? buildUnavailableView()
        : services.courseHistoryModel.buildView(
            services.courseHistoryModel.listByAccountId(authorizedStudent.accountId)
          );
      const statusCode = view.state === 'unavailable' ? 503 : 200;
      const contentHtml =
        view.state === 'empty'
          ? '<section class="profile-section"><h2>No course history yet</h2><p class="help-text">No past course history records are available for this account yet.</p></section>'
          : view.state === 'unavailable'
            ? '<section class="profile-section"><h2>Course history unavailable</h2><p class="help-text">Course history is temporarily unavailable. Retry from the same page later.</p></section>'
            : `${view.missingDataMessage ? `<p class="status-chip profile-status">${escapeHtml(view.missingDataMessage)}</p>` : ''}${renderTermGroups(view.termGroups)}`;

      return renderPage(res, {
        contentHtml,
        signedInAs: authorizedStudent.studentId,
        stateClass: view.state,
        stateMessage: view.message,
        statusCode,
        summaryText: 'Review your completed courses and historical academic results in one place.'
      });
    }
  };
}

module.exports = { createCourseHistoryController };
