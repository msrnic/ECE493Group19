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
      }>${escapeHtml(`${offering.courseCode} ${offering.title} (${offering.offeringCode})`)}</option>`
    );
  }

  return options.join('');
}

function createForceWithdrawalController(services) {
  function sendJsonError(res, result) {
    return res.status(result.statusCode).json({
      actionId: result.actionId,
      code: result.code,
      details: result.details,
      message: result.message
    });
  }

  function buildPendingAuditHtml(items) {
    if (!items.length) {
      return '';
    }

    return `<section class='profile-section'><h2>Pending Audit</h2><ul class='course-list'>${items
      .map(
        (item) =>
          `<li>Action ${escapeHtml(item.actionId)} is pending audit retry.<br>Retry count: ${escapeHtml(
            String(item.retryCount)
          )}</li>`
      )
      .join('')}</ul></section>`;
  }

  function renderForm(res, metadata, overrides = {}) {
    const html = renderHtml(path.resolve(__dirname, '../views/force-withdrawal.html'), {
      error_message: overrides.errorMessage || '',
      offering_error_html: createFieldErrorHtml(overrides.fieldErrors?.offeringId),
      offering_input_class: createInputClass(overrides.fieldErrors?.offeringId),
      offering_options_html: renderOfferingOptions(metadata.offerings || [], overrides.values?.offeringId),
      pending_audit_html: overrides.pendingAuditHtml || '',
      reason_error_html: createFieldErrorHtml(overrides.fieldErrors?.reason),
      reason_input_class: createInputClass(overrides.fieldErrors?.reason),
      reason_value: overrides.values?.reason || '',
      result_banner_html: overrides.message
        ? `<p class='status-chip profile-status${
            overrides.variant === 'success'
              ? ' profile-status--success'
              : overrides.variant === 'error'
                ? ' profile-status--error'
                : ''
          }'>${escapeHtml(overrides.message)}</p>`
        : '',
      return_path: '/dashboard#admin-operations',
      student_error_html: createFieldErrorHtml(overrides.fieldErrors?.studentIdentifier),
      student_identifier: overrides.values?.studentIdentifier || '',
      student_input_class: createInputClass(overrides.fieldErrors?.studentIdentifier)
    });

    return res.status(overrides.statusCode || 200).send(html);
  }

  function renderConfirmation(res, payload, overrides = {}) {
    const html = renderHtml(path.resolve(__dirname, '../views/force-withdrawal-confirmation.html'), {
      fee_impact: payload.implications?.feeImpact || '',
      message_html: overrides.message
        ? `<p class='status-chip profile-status'>${escapeHtml(overrides.message)}</p>`
        : '',
      offering_code: payload.offering?.offeringCode || '',
      offering_id: payload.offering?.id || '',
      reason: overrides.reason || '',
      student_identifier: payload.student?.studentId || '',
      transcript_impact: payload.implications?.transcriptImpact || '',
      course_heading: payload.offering ? `${payload.offering.courseCode} ${payload.offering.title}` : 'Force Withdraw'
    });

    return res.status(overrides.statusCode || 200).send(html);
  }

  return {
    getActionStatus(req, res) {
      const result = services.forceWithdrawalService.getActionStatus(req.session.accountId, req.params.actionId);
      if (result.statusCode !== 200) {
        return sendJsonError(res, result);
      }

      return res.status(200).json(result);
    },

    getForceWithdrawalPage(req, res) {
      const metadata = services.forceWithdrawalService.getFormState(req.session.accountId);
      if (metadata.statusCode !== 200) {
        return wantsJson(req)
          ? sendJsonError(res, metadata)
          : renderForm(res, metadata, { errorMessage: metadata.message, statusCode: metadata.statusCode });
      }

      const pending = services.forceWithdrawalService.listPendingAudit(req.session.accountId);
      return renderForm(res, metadata, {
        pendingAuditHtml: pending.statusCode === 200 ? buildPendingAuditHtml(pending.items) : ''
      });
    },

    getImplications(req, res) {
      const values = {
        offeringId: String(req.query.offeringId || '').trim(),
        reason: String(req.query.reason || ''),
        studentIdentifier: String(req.query.studentId || req.query.studentIdentifier || '').trim()
      };
      const result = services.forceWithdrawalService.getImplications(
        req.session.accountId,
        values.studentIdentifier,
        values.offeringId
      );

      if (wantsJson(req)) {
        if (result.statusCode !== 200) {
          return sendJsonError(res, result);
        }

        return res.status(200).json({
          enrolled: true,
          feeImpact: result.implications.feeImpact,
          offeringId: String(result.offering.id),
          studentId: result.student.studentId,
          transcriptImpact: result.implications.transcriptImpact
        });
      }

      const metadata = services.forceWithdrawalService.getFormState(req.session.accountId);
      if (result.statusCode !== 200) {
        return renderForm(res, metadata, {
          errorMessage: result.message,
          statusCode: result.statusCode,
          values
        });
      }

      return renderConfirmation(res, result, {
        message: 'Review the withdrawal implications before confirming.',
        reason: values.reason
      });
    },

    postForceWithdrawal(req, res) {
      const metadata = services.forceWithdrawalService.getFormState(req.session.accountId);
      if (metadata.statusCode !== 200) {
        return wantsJson(req)
          ? sendJsonError(res, metadata)
          : renderForm(res, metadata, { errorMessage: metadata.message, statusCode: metadata.statusCode });
      }

      if (req.body.action === 'cancel') {
        return renderForm(res, metadata, {
          message: 'Forced withdrawal was canceled. Enrollment remains unchanged.'
        });
      }

      const values = {
        offeringId: String(req.body.offeringId || '').trim(),
        reason: String(req.body.reason || ''),
        studentIdentifier: String(req.body.studentIdentifier || '').trim()
      };
      const fieldErrors = {};
      if (!values.studentIdentifier) {
        fieldErrors.studentIdentifier = 'Enter a student ID or email.';
      }
      if (!values.offeringId) {
        fieldErrors.offeringId = 'Select a course offering.';
      }
      if (!String(values.reason).trim()) {
        fieldErrors.reason = 'Provide a reason for the forced withdrawal.';
      }

      if (Object.keys(fieldErrors).length > 0) {
        const errorResult = { code: 'VALIDATION_ERROR', message: 'Please correct the highlighted fields.', statusCode: 400 };
        return wantsJson(req)
          ? sendJsonError(res, errorResult)
          : renderForm(res, metadata, {
              errorMessage: errorResult.message,
              fieldErrors,
              statusCode: 400,
              values
            });
      }

      const result = services.forceWithdrawalService.processWithdrawal({
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

      if (result.statusCode >= 400) {
        return renderForm(res, metadata, {
          errorMessage: result.message,
          statusCode: result.statusCode,
          values,
          variant: 'error'
        });
      }

      return renderForm(res, metadata, {
        message: result.message,
        pendingAuditHtml: result.pendingAudit
          ? "<section class='profile-section'><h2>Pending Audit</h2><p class='help-text'>Audit logging is pending retry for the most recent forced withdrawal.</p></section>"
          : '',
        variant: 'success'
      });
    }
  };
}

module.exports = { createForceWithdrawalController };
