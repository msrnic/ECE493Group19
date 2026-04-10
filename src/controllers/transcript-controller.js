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

function createTranscriptController(services) {
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
    if (access.transcriptAccess !== 'enabled') {
      return null;
    }

    return student;
  }

  function shouldBeUnavailable(student) {
    const identifiers = new Set(
      (services.transcriptTestState?.retrievalFailureIdentifiers || []).map((value) =>
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
      'transcript',
      actor,
      services.studentAccountModel.findByStudentId(targetStudentId)?.accountId || null,
      reason
    );
  }

  function renderPage(res, details) {
    const html = renderHtml(path.resolve(__dirname, '../views/transcript.html'), {
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
      message: 'Transcript data is temporarily unavailable. Retry from the same page later.',
      state: 'unavailable',
      termGroups: []
    };
  }

  return {
    getTranscriptApi(req, res) {
      const actor = getActor(req);
      if (!actor) {
        return createJsonResponse(res, 401, {
          code: 'auth_required',
          message: 'Sign in to view your transcript.'
        });
      }

      const authorizedStudent = getAuthorizedStudent(actor);
      const targetStudent = services.studentAccountModel.findByStudentId(req.params.studentId);
      if (!authorizedStudent || !targetStudent || targetStudent.accountId !== authorizedStudent.accountId) {
        recordDenied(actor, req.params.studentId, 'Requested transcript is not available to this actor.');
        return createJsonResponse(res, 403, {
          code: 'transcript_denied',
          message: 'Transcript access was denied.'
        });
      }

      if (shouldBeUnavailable(authorizedStudent)) {
        return createJsonResponse(res, 503, buildUnavailableView());
      }

      return createJsonResponse(
        res,
        200,
        services.transcriptModel.buildView(
          services.transcriptModel.listByAccountId(authorizedStudent.accountId)
        )
      );
    },

    getTranscriptPage(req, res) {
      const actor = getActor(req);
      const requestedStudentId = req.params.studentId || services.studentAccountModel.findByAccountId(req.session?.accountId)?.studentId;
      if (!actor) {
        return res.redirect('/login?returnTo=%2Facademic%2Ftranscript');
      }

      const authorizedStudent = getAuthorizedStudent(actor);
      const targetStudent = services.studentAccountModel.findByStudentId(requestedStudentId);
      if (!authorizedStudent || !targetStudent || targetStudent.accountId !== authorizedStudent.accountId) {
        recordDenied(actor, requestedStudentId, 'Requested transcript is not available to this actor.');
        return renderPage(res, {
          contentHtml:
            '<section class="profile-section"><h2>Access denied</h2><p class="help-text">You are not authorized to view this transcript.</p></section>',
          signedInAs: actor.username,
          stateClass: 'failure',
          stateMessage: 'Transcript access was denied.',
          statusCode: 403,
          summaryText: 'Transcript viewing is limited to the authorized student account.'
        });
      }

      const view = shouldBeUnavailable(authorizedStudent)
        ? buildUnavailableView()
        : services.transcriptModel.buildView(
            services.transcriptModel.listByAccountId(authorizedStudent.accountId)
          );
      const statusCode = view.state === 'unavailable' ? 503 : 200;
      const contentHtml =
        view.state === 'empty'
          ? '<section class="profile-section"><h2>No transcript entries yet</h2><p class="help-text">No transcript entries are available for this account yet.</p></section>'
          : view.state === 'unavailable'
            ? '<section class="profile-section"><h2>Transcript unavailable</h2><p class="help-text">Transcript data is temporarily unavailable. Retry from the same page later.</p></section>'
            : `${view.missingDataMessage ? `<p class="status-chip profile-status">${escapeHtml(view.missingDataMessage)}</p>` : ''}${renderTermGroups(view.termGroups)}`;

      return renderPage(res, {
        contentHtml,
        signedInAs: authorizedStudent.studentId,
        stateClass: view.state,
        stateMessage: view.message,
        statusCode,
        summaryText: 'Review your transcript entries and final academic results in one place.'
      });
    }
  };
}

module.exports = { createTranscriptController };
