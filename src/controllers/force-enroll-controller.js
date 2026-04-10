const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');

function wantsJson(req) {
  const matchesContentType = typeof req.is === 'function' ? req.is('application/json') : false;
  const acceptHeader = typeof req.get === 'function' ? req.get('accept') : req.headers?.accept;
  return matchesContentType || String(acceptHeader || '').includes('application/json');
}

function createFieldErrorHtml(errorMessage) {
  if (!errorMessage) {
    return '';
  }

  return `<p class='field-error'>${escapeHtml(errorMessage)}</p>`;
}

function createInputClass(errorMessage) {
  return errorMessage ? 'input-error' : '';
}

function renderOfferingOptions(offerings, selectedOfferingId) {
  const options = ["<option value=''>Select a course offering</option>"];

  for (const offering of offerings) {
    options.push(
      `<option value='${escapeHtml(String(offering.id))}'${
        String(selectedOfferingId) === String(offering.id) ? ' selected' : ''
      }>${escapeHtml(`${offering.courseCode} ${offering.title} (${offering.offeringCode}) - ${offering.seatsRemaining} seats remaining`)}</option>`
    );
  }

  return options.join('');
}

function createForceEnrollController(services) {
  function getMetadata(actorAccountId) {
    return services.forceEnrollService.getFormState(actorAccountId);
  }

  function renderForm(res, metadata, overrides = {}) {
    const html = renderHtml(path.resolve(__dirname, '../views/force-enroll.html'), {
      error_message: overrides.errorMessage || '',
      offering_error_html: createFieldErrorHtml(overrides.fieldErrors?.offeringId),
      offering_input_class: createInputClass(overrides.fieldErrors?.offeringId),
      offering_options_html: renderOfferingOptions(metadata.offerings || [], overrides.values?.offeringId),
      reason_error_html: createFieldErrorHtml(overrides.fieldErrors?.reason),
      reason_input_class: createInputClass(overrides.fieldErrors?.reason),
      reason_value: overrides.values?.reason || '',
      return_path: '/dashboard#admin-operations',
      status_banner_html: overrides.message
        ? `<p class='status-chip profile-status${
            overrides.variant === 'success'
              ? ' profile-status--success'
              : overrides.variant === 'error'
                ? ' profile-status--error'
                : ''
          }'>${escapeHtml(overrides.message)}</p>`
        : '',
      student_error_html: createFieldErrorHtml(overrides.fieldErrors?.studentIdentifier),
      student_identifier: overrides.values?.studentIdentifier || '',
      student_input_class: createInputClass(overrides.fieldErrors?.studentIdentifier)
    });

    return res.status(overrides.statusCode || 200).send(html);
  }

  function renderConfirmation(res, payload, overrides = {}) {
    const html = renderHtml(path.resolve(__dirname, '../views/force-enroll-confirmation.html'), {
      course_heading: payload.offering
        ? `${payload.offering.courseCode} ${payload.offering.title}`
        : 'Force Enroll',
      details_html: overrides.detailsHtml || '',
      message_html: overrides.message
        ? `<p class='status-chip profile-status${
            overrides.variant === 'success' ? ' profile-status--success' : ' profile-status--error'
          }'>${escapeHtml(overrides.message)}</p>`
        : '',
      offering_code: payload.offering?.offeringCode || '',
      reason: payload.reason || '',
      request_id: payload.requestId || '',
      student_identifier: payload.student?.studentId || '',
      student_label: payload.student
        ? `${payload.student.studentId} (${payload.student.email})`
        : ''
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

  function getRequestValues(body) {
    return {
      offeringId: String(body?.offeringId || '').trim(),
      reason: String(body?.reason || ''),
      studentIdentifier: String(body?.studentIdentifier || '').trim()
    };
  }

  return {
    getForceEnrollPage(req, res) {
      const metadata = getMetadata(req.session.accountId);
      if (metadata.statusCode !== 200) {
        return wantsJson(req)
          ? sendJsonError(res, metadata)
          : renderForm(res, metadata, {
              errorMessage: metadata.message,
              statusCode: metadata.statusCode
            });
      }

      return renderForm(res, metadata);
    },

    getRequestStatus(req, res) {
      const result = services.forceEnrollService.getRequestStatus(
        req.session.accountId,
        req.params.requestId
      );

      if (result.statusCode !== 200) {
        return sendJsonError(res, result);
      }

      return res.status(200).json(result);
    },

    postForceEnroll(req, res) {
      const metadata = getMetadata(req.session.accountId);
      if (metadata.statusCode !== 200) {
        return wantsJson(req)
          ? sendJsonError(res, metadata)
          : renderForm(res, metadata, {
              errorMessage: metadata.message,
              statusCode: metadata.statusCode
            });
      }

      const values = getRequestValues(req.body);
      const fieldErrors = {};
      if (!values.studentIdentifier) {
        fieldErrors.studentIdentifier = 'Enter a student ID or email.';
      }
      if (!values.offeringId) {
        fieldErrors.offeringId = 'Select a course offering.';
      }

      if (Object.keys(fieldErrors).length > 0) {
        const errorPayload = {
          code: 'VALIDATION_ERROR',
          details: fieldErrors,
          message: 'Please correct the highlighted fields.',
          statusCode: 400
        };

        return wantsJson(req)
          ? sendJsonError(res, errorPayload)
          : renderForm(res, metadata, {
              errorMessage: errorPayload.message,
              fieldErrors,
              statusCode: 400,
              values
            });
      }

      const result = services.forceEnrollService.createRequest({
        actorAccountId: req.session.accountId,
        offeringId: Number(values.offeringId),
        reason: values.reason,
        studentIdentifier: values.studentIdentifier
      });

      if (wantsJson(req)) {
        if (result.statusCode >= 400) {
          return sendJsonError(res, result);
        }

        return res.status(result.statusCode).json(result);
      }

      if (result.status === 'pending_confirmation') {
        return renderConfirmation(
          res,
          { ...result, reason: values.reason },
          {
            detailsHtml:
              "<p class='help-text'>This section is full. The same administrator must explicitly confirm the over-capacity override before enrollment is created.</p>",
            message: result.message
          }
        );
      }

      if (result.status === 'completed') {
        return renderConfirmation(
          res,
          { ...result, reason: values.reason },
          {
            detailsHtml:
              "<p class='help-text'>Prerequisite checks were bypassed, while hard constraints remained enforced. An audit record was created for this override.</p>",
            message: `${result.student.studentId} was force enrolled successfully.`,
            variant: 'success'
          }
        );
      }

      return renderForm(res, metadata, {
        errorMessage: result.message,
        fieldErrors: result.code === 'VALIDATION_ERROR' ? { reason: result.details?.reason } : undefined,
        statusCode: result.statusCode,
        values,
        variant: 'error'
      });
    },

    postConfirmForceEnroll(req, res) {
      const metadata = getMetadata(req.session.accountId);
      const confirm = req.body.action === 'confirm' || req.body.confirm === 'true' || req.body.confirm === true;
      const result = services.forceEnrollService.confirmRequest({
        actorAccountId: req.session.accountId,
        confirm,
        requestId: req.params.requestId
      });

      if (wantsJson(req)) {
        if (result.statusCode >= 400) {
          return sendJsonError(res, result);
        }

        return res.status(result.statusCode).json(result);
      }

      if (result.status === 'completed') {
        return renderConfirmation(
          res,
          result,
          {
            detailsHtml:
              "<p class='help-text'>The over-capacity override was confirmed by the same administrator, and the audit record now marks the enrollment as over capacity.</p>",
            message: `${result.student.studentId} was force enrolled successfully.`,
            variant: 'success'
          }
        );
      }

      if (result.status === 'canceled') {
        return renderForm(res, metadata, {
          message: result.message
        });
      }

      return renderForm(res, metadata, {
        errorMessage: result.message,
        statusCode: result.statusCode,
        variant: 'error'
      });
    }
  };
}

module.exports = { createForceEnrollController };
