const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');

function wantsJson(req) {
  const matchesContentType = typeof req.is === 'function' ? req.is('application/json') : false;
  const acceptHeader = typeof req.get === 'function' ? req.get('accept') : req.headers?.accept;
  return matchesContentType || String(acceptHeader || '').includes('application/json');
}

function createFieldErrorHtml(errorMessage) {
  return errorMessage ? `<p class='field-error'>${escapeHtml(errorMessage)}</p>` : '';
}

function createInputClass(errorMessage) {
  return errorMessage ? 'input-error' : '';
}

function renderInstructorOptions(instructors, selectedId) {
  return [
    "<option value=''>Select an instructor</option>",
    ...instructors.map((instructor) => `<option value='${escapeHtml(String(instructor.id))}'${
      String(selectedId) === String(instructor.id) ? ' selected' : ''
    }>${escapeHtml(instructor.label)}</option>`)
  ].join('');
}

function renderOfferingRows(offerings) {
  if (!offerings.length) {
    return '<li>No offerings available.</li>';
  }

  return offerings.map((offering) => `<li>${escapeHtml(offering.courseCode)} ${escapeHtml(offering.title)} (${escapeHtml(offering.offeringCode)})<br>Term: ${escapeHtml(offering.termCode)} | Section: ${escapeHtml(offering.sectionCode)} | Instructor: ${escapeHtml(offering.instructorLabel || 'Unassigned')} | Capacity: ${escapeHtml(String(offering.capacity))} | Remaining seats: ${escapeHtml(String(offering.seatsRemaining))}<div class='action-row'><a class='login-button-link secondary-link' href='/admin/course-offerings/${escapeHtml(String(offering.id))}/capacity'>Edit capacity</a><form method='post' action='/admin/offerings/${escapeHtml(String(offering.id))}/delete'><input type='hidden' name='confirmDelete' value='true'><button type='submit'>Delete Offering</button></form></div></li>`).join('');
}

function createOfferingAdminController(services) {
  function renderPage(res, metadata, overrides = {}) {
    const html = renderHtml(path.resolve(__dirname, '../views/offering-admin.html'), {
      capacity_error_html: createFieldErrorHtml(overrides.fieldErrors?.capacity),
      capacity_input_class: createInputClass(overrides.fieldErrors?.capacity),
      capacity_value: overrides.values?.capacity || '',
      course_code_error_html: createFieldErrorHtml(overrides.fieldErrors?.courseCode),
      course_code_input_class: createInputClass(overrides.fieldErrors?.courseCode),
      course_code_value: overrides.values?.courseCode || '',
      error_message: overrides.errorMessage || '',
      instructor_error_html: createFieldErrorHtml(overrides.fieldErrors?.instructorAccountId),
      instructor_input_class: createInputClass(overrides.fieldErrors?.instructorAccountId),
      instructor_options_html: renderInstructorOptions(metadata.instructors || [], overrides.values?.instructorAccountId),
      meeting_days_error_html: createFieldErrorHtml(overrides.fieldErrors?.meetingDays),
      meeting_days_input_class: createInputClass(overrides.fieldErrors?.meetingDays),
      meeting_days_value: overrides.values?.meetingDays || '',
      offerings_html: renderOfferingRows(metadata.offerings || []),
      pending_audit_html: overrides.pendingAuditHtml || '',
      result_banner_html: overrides.message
        ? `<p class='status-chip profile-status${overrides.variant === 'success' ? ' profile-status--success' : ' profile-status--error'}'>${escapeHtml(overrides.message)}</p>`
        : '',
      return_path: '/dashboard#admin-operations',
      schedule_end_error_html: createFieldErrorHtml(overrides.fieldErrors?.scheduleEndTime),
      schedule_end_input_class: createInputClass(overrides.fieldErrors?.scheduleEndTime),
      schedule_end_value: overrides.values?.scheduleEndTime || '',
      schedule_start_error_html: createFieldErrorHtml(overrides.fieldErrors?.scheduleStartTime),
      schedule_start_input_class: createInputClass(overrides.fieldErrors?.scheduleStartTime),
      schedule_start_value: overrides.values?.scheduleStartTime || '',
      section_code_error_html: createFieldErrorHtml(overrides.fieldErrors?.sectionCode),
      section_code_input_class: createInputClass(overrides.fieldErrors?.sectionCode),
      section_code_value: overrides.values?.sectionCode || '',
      term_code_error_html: createFieldErrorHtml(overrides.fieldErrors?.termCode),
      term_code_input_class: createInputClass(overrides.fieldErrors?.termCode),
      term_code_value: overrides.values?.termCode || '',
      title_error_html: createFieldErrorHtml(overrides.fieldErrors?.title),
      title_input_class: createInputClass(overrides.fieldErrors?.title),
      title_value: overrides.values?.title || '',
      override_reason_error_html: createFieldErrorHtml(overrides.fieldErrors?.overrideReason)
    });

    return res.status(overrides.statusCode || 200).send(html);
  }

  function sendJsonError(res, result) {
    return res.status(result.statusCode).json({
      code: result.code,
      details: result.details,
      message: result.message
    });
  }

  return {
    getOfferingPage(req, res) {
      const metadata = services.offeringAdminService.getFormState(req.session.accountId);
      if (metadata.statusCode !== 200) {
        return wantsJson(req) ? sendJsonError(res, metadata) : renderPage(res, metadata, { errorMessage: metadata.message, statusCode: metadata.statusCode });
      }

      return renderPage(res, metadata);
    },

    postCreateOffering(req, res) {
      const metadata = services.offeringAdminService.getFormState(req.session.accountId);
      const values = {
        capacity: req.body.capacity,
        courseCode: req.body.courseCode,
        instructorAccountId: req.body.instructorAccountId,
        meetingDays: req.body.meetingDays,
        scheduleEndTime: req.body.scheduleEndTime,
        scheduleStartTime: req.body.scheduleStartTime,
        sectionCode: req.body.sectionCode,
        termCode: req.body.termCode,
        title: req.body.title
      };

      if (req.body.action === 'cancel') {
        return renderPage(res, metadata, {
          message: 'Offering creation was canceled.'
        });
      }

      const result = services.offeringAdminService.createOffering(req.session.accountId, values);
      if (wantsJson(req)) {
        if (result.statusCode >= 400) {
          return sendJsonError(res, result);
        }

        return res.status(result.statusCode).json(result);
      }

      if (result.statusCode >= 400) {
        return renderPage(res, metadata, {
          errorMessage: result.message,
          fieldErrors: result.details,
          statusCode: result.statusCode,
          values
        });
      }

      const refreshed = services.offeringAdminService.getFormState(req.session.accountId);
      return renderPage(res, refreshed, {
        message: result.message,
        pendingAuditHtml: result.pendingAudit ? "<p class='help-text'>Audit logging is pending retry for the latest offering change.</p>" : '',
        variant: 'success'
      });
    },

    postDeleteOffering(req, res) {
      const metadata = services.offeringAdminService.getFormState(req.session.accountId);
      if (req.body.action === 'cancel') {
        return renderPage(res, metadata, {
          message: 'Offering deletion was canceled.'
        });
      }

      const result = services.offeringAdminService.deleteOffering(req.session.accountId, Number(req.params.offeringId), req.body);
      if (wantsJson(req)) {
        if (result.statusCode >= 400) {
          return sendJsonError(res, result);
        }

        return res.status(result.statusCode).json(result);
      }

      if (result.statusCode >= 400) {
        return renderPage(res, metadata, {
          errorMessage: result.message,
          fieldErrors: result.details,
          statusCode: result.statusCode
        });
      }

      const refreshed = services.offeringAdminService.getFormState(req.session.accountId);
      return renderPage(res, refreshed, {
        message: result.message,
        pendingAuditHtml: result.pendingAudit ? "<p class='help-text'>Audit logging is pending retry for the latest offering change.</p>" : '',
        variant: 'success'
      });
    }
  };
}

module.exports = { createOfferingAdminController };
