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

function createCourseCapacityController(services) {
  function renderPage(res, payload, overrides = {}) {
    const offering = payload.offering || {};
    const html = renderHtml(path.resolve(__dirname, '../views/course-capacity.html'), {
      capacity_error_html: createFieldErrorHtml(overrides.fieldErrors?.proposedCapacity),
      capacity_input_class: createInputClass(overrides.fieldErrors?.proposedCapacity),
      current_capacity: String(offering.capacity ?? ''),
      current_enrollment: String(offering.currentEnrollment ?? ''),
      current_version: String(offering.version ?? ''),
      error_message: overrides.errorMessage || '',
      message_html: overrides.message
        ? `<p class='status-chip profile-status${
            overrides.variant === 'success'
              ? ' profile-status--success'
              : overrides.variant === 'error'
                ? ' profile-status--error'
                : ''
          }'>${escapeHtml(overrides.message)}</p>`
        : '',
      offering_heading: offering.id
        ? `${offering.courseCode} ${offering.title} (${offering.offeringCode})`
        : 'Course Capacity',
      offering_id: String(offering.id ?? ''),
      override_decision_error_html: createFieldErrorHtml(overrides.fieldErrors?.overrideDecision),
      override_reason_error_html: createFieldErrorHtml(overrides.fieldErrors?.overrideReason),
      override_reason_value: overrides.values?.overrideReason || '',
      proposed_capacity: String(overrides.values?.proposedCapacity ?? offering.capacity ?? ''),
      remaining_seats: String(offering.remainingSeats ?? ''),
      result_details_html: overrides.resultDetailsHtml || '',
      return_path: '/admin/offerings',
      selected_approved: overrides.values?.overrideDecision === 'approved' ? 'selected' : '',
      selected_denied: overrides.values?.overrideDecision === 'denied' ? 'selected' : '',
      submitted_version: String(overrides.values?.submittedVersion ?? offering.version ?? ''),
      term_section_label: offering.id ? `${offering.termCode} | Section ${offering.sectionCode}` : ''
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

  function readValues(req) {
    return {
      overrideDecision: String(req.body.overrideDecision || '').trim().toLowerCase(),
      overrideReason: String(req.body.overrideReason || ''),
      proposedCapacity: String(req.body.proposedCapacity || '').trim(),
      submittedVersion: String(req.body.submittedVersion || '').trim()
    };
  }

  function createResultDetails(result) {
    const parts = [
      `<p class='help-text'>Current enrollment: ${escapeHtml(String(result.currentEnrollment ?? '0'))}</p>`,
      `<p class='help-text'>Remaining seats: ${escapeHtml(String(result.remainingSeats ?? '0'))}</p>`
    ];

    if (result.overrideRequestId) {
      parts.push(`<p class='help-text'>Override request: ${escapeHtml(result.overrideRequestId)}</p>`);
    }

    if (result.retentionUntil) {
      parts.push(`<p class='help-text'>Override retained until: ${escapeHtml(result.retentionUntil)}</p>`);
    }

    return parts.join('');
  }

  return {
    getCapacityPage(req, res) {
      const result = services.courseCapacityService.getOfferingState(
        req.session.accountId,
        Number(req.params.offeringId)
      );

      if (result.statusCode !== 200) {
        return wantsJson(req)
          ? sendJsonError(res, result)
          : renderPage(res, {}, { errorMessage: result.message, statusCode: result.statusCode });
      }

      if (wantsJson(req)) {
        return res.status(200).json(result);
      }

      return renderPage(res, result);
    },

    postCapacityUpdate(req, res) {
      const values = readValues(req);
      const result = services.courseCapacityService.submitCapacityUpdate(
        req.session.accountId,
        Number(req.params.offeringId),
        {
          override: {
            allowSelfApproval: true,
            approvedByAccountId: req.session.accountId,
            decision: values.overrideDecision,
            reason: values.overrideReason
          },
          proposedCapacity: values.proposedCapacity,
          submittedVersion: values.submittedVersion
        }
      );

      if (wantsJson(req)) {
        if (result.statusCode >= 400 && !['OVERRIDE_REQUIRED'].includes(result.code)) {
          return sendJsonError(res, result);
        }

        return res.status(result.statusCode).json(result);
      }

      const state = services.courseCapacityService.getOfferingState(
        req.session.accountId,
        Number(req.params.offeringId)
      );
      const payload = state.statusCode === 200 ? state : { offering: { id: req.params.offeringId } };

      if (result.statusCode >= 400 && result.statusCode !== 409) {
        return renderPage(res, payload, {
          errorMessage: result.message,
          fieldErrors: result.details,
          statusCode: result.statusCode,
          values
        });
      }

      if (result.outcome === 'rejected' || result.outcome === 'stale' || result.outcome === 'failed') {
        return renderPage(res, payload, {
          errorMessage: result.message,
          fieldErrors: result.details,
          message: result.message,
          resultDetailsHtml: createResultDetails(result),
          statusCode: result.statusCode === 409 ? 409 : 200,
          values,
          variant: 'error'
        });
      }

      return renderPage(res, payload, {
        message: result.message,
        resultDetailsHtml: createResultDetails(result),
        values: {
          proposedCapacity: result.capacity,
          submittedVersion: result.version || payload.offering?.version || values.submittedVersion
        },
        variant: 'success'
      });
    }
  };
}

module.exports = { createCourseCapacityController };
