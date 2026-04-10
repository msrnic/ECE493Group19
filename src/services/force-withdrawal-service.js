const { randomUUID } = require('node:crypto');

function formatCurrency(cents) {
  return (Number(cents || 0) / 100).toLocaleString('en-US', {
    currency: 'USD',
    minimumFractionDigits: 2,
    style: 'currency'
  });
}

function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function createError(statusCode, code, message, details = {}) {
  return { code, details, message, statusCode };
}

function createForceWithdrawalService(options) {
  function isAdminActor(actorAccountId) {
    const actor = options.accountModel.findById(actorAccountId);
    return actor && actor.role === 'admin' ? actor : null;
  }

  function failureSet(key) {
    return new Set((options.forceWithdrawalTestState?.[key] || []).map(normalizeIdentifier));
  }

  function shouldFailCore(student, offering) {
    const failures = failureSet('failureIdentifiers');
    return [student.email, student.studentId, offering.offeringCode].some((value) =>
      failures.has(normalizeIdentifier(value))
    );
  }

  function shouldFailAudit(student, offering) {
    const failures = failureSet('auditFailureIdentifiers');
    return [student.email, student.studentId, offering.offeringCode].some((value) =>
      failures.has(normalizeIdentifier(value))
    );
  }

  function resolveStudent(studentIdentifier) {
    const normalized = String(studentIdentifier || '').trim();
    if (!normalized) {
      return null;
    }

    const byIdentifier = options.accountModel.findByIdentifier(normalized);
    if (byIdentifier && byIdentifier.role === 'student') {
      return {
        accountId: byIdentifier.id,
        email: byIdentifier.email,
        studentId: byIdentifier.username
      };
    }

    if (/^\d+$/.test(normalized)) {
      const byId = options.accountModel.findById(Number(normalized));
      if (byId && byId.role === 'student') {
        return {
          accountId: byId.id,
          email: byId.email,
          studentId: byId.username
        };
      }
    }

    return null;
  }

  function validateSelection(studentIdentifier, offeringId) {
    const student = resolveStudent(studentIdentifier);
    if (!student) {
      return createError(404, 'STUDENT_NOT_FOUND', 'Student was not found.');
    }

    const offering = options.enrollmentModel.findOfferingById(Number(offeringId));
    if (!offering) {
      return createError(404, 'OFFERING_NOT_FOUND', 'Course offering was not found.');
    }

    if (offering.offeringStatus && offering.offeringStatus !== 'open') {
      return createError(
        409,
        'OFFERING_NOT_ELIGIBLE',
        'The selected offering is no longer eligible for forced withdrawal.',
        { offeringStatus: offering.offeringStatus }
      );
    }

    return { offering, student };
  }

  function buildImplications(offering) {
    const feeChange = formatCurrency(offering.feeChangeCents);
    return {
      feeImpact: `A fee adjustment of ${feeChange} will be applied to the student account.`,
      feeImpactSummary: `A fee adjustment of ${feeChange} was applied to the student account.`,
      transcriptImpact: 'A W notation will be applied to the transcript for this class.'
    };
  }

  return {
    getActionStatus(actorAccountId, actionId) {
      if (!isAdminActor(actorAccountId)) {
        return createError(403, 'FORBIDDEN', 'Administrative authorization is required for this action.');
      }

      const action = options.forceWithdrawalModel.findActionById(actionId);
      if (!action) {
        return createError(404, 'NOT_FOUND', 'Forced withdrawal action was not found.');
      }

      return {
        ...action,
        statusCode: 200
      };
    },

    getFormState(actorAccountId) {
      if (!isAdminActor(actorAccountId)) {
        return {
          offerings: [],
          ...createError(403, 'FORBIDDEN', 'Administrative authorization is required for this action.')
        };
      }

      return {
        offerings: options.enrollmentModel.listMatchingOfferings(''),
        statusCode: 200
      };
    },

    getImplications(actorAccountId, studentIdentifier, offeringId) {
      if (!isAdminActor(actorAccountId)) {
        return createError(403, 'FORBIDDEN', 'Administrative authorization is required for this action.');
      }

      const selection = validateSelection(studentIdentifier, offeringId);
      if (selection.code) {
        return selection;
      }

      if (!options.enrollmentModel.hasEnrollment(selection.student.accountId, selection.offering.id)) {
        return createError(
          409,
          'NOT_ENROLLED',
          'The selected student is not currently enrolled in this offering.'
        );
      }

      return {
        implications: buildImplications(selection.offering),
        offering: selection.offering,
        status: 'ready',
        statusCode: 200,
        student: selection.student
      };
    },

    listPendingAudit(actorAccountId) {
      if (!isAdminActor(actorAccountId)) {
        return createError(403, 'FORBIDDEN', 'Administrative authorization is required for this action.');
      }

      return {
        items: options.forceWithdrawalModel.listPendingAudit(),
        statusCode: 200
      };
    },

    processWithdrawal({ actorAccountId, offeringId, reason, studentIdentifier }) {
      if (!isAdminActor(actorAccountId)) {
        return createError(403, 'FORBIDDEN', 'Administrative authorization is required for this action.');
      }

      const trimmedReason = String(reason || '').trim();
      if (!trimmedReason) {
        return createError(400, 'VALIDATION_ERROR', 'A reason is required before forced withdrawal can proceed.', {
          reason: 'Provide a non-empty reason.'
        });
      }

      const selection = validateSelection(studentIdentifier, offeringId);
      if (selection.code) {
        return selection;
      }

      const actionId = randomUUID();
      const now = options.now().toISOString();
      options.forceWithdrawalModel.createAction({
        actionId,
        createdAt: now,
        initiatedByAccountId: actorAccountId,
        offeringId: selection.offering.id,
        reason: trimmedReason,
        status: 'failed',
        studentAccountId: selection.student.accountId
      });

      if (!options.enrollmentModel.hasEnrollment(selection.student.accountId, selection.offering.id)) {
        options.forceWithdrawalModel.markStatus(
          actionId,
          'rejected_not_enrolled',
          now,
          'The selected student is not currently enrolled in this offering.'
        );
        return {
          actionId,
          code: 'NOT_ENROLLED',
          message: 'The selected student is not currently enrolled in this offering.',
          statusCode: 409
        };
      }

      if (shouldFailCore(selection.student, selection.offering)) {
        options.forceWithdrawalModel.markStatus(
          actionId,
          'failed',
          now,
          'Forced withdrawal could not be completed right now. No withdrawal changes were saved.'
        );
        return {
          actionId,
          code: 'TRANSACTION_FAILED',
          message: 'Forced withdrawal could not be completed right now. No withdrawal changes were saved.',
          statusCode: 500
        };
      }

      const implications = buildImplications(selection.offering);
      const created = options.enrollmentModel.createWithdrawal(selection.student.accountId, selection.offering.id, {
        createdAt: now,
        feeImpactSummary: implications.feeImpactSummary,
        transcriptImpact: implications.transcriptImpact
      });

      if (!created) {
        options.forceWithdrawalModel.markStatus(
          actionId,
          'rejected_not_enrolled',
          now,
          'The selected student is not currently enrolled in this offering.'
        );
        return {
          actionId,
          code: 'ALREADY_WITHDRAWN',
          message: 'The selected student is not currently enrolled in this offering.',
          statusCode: 409
        };
      }

      if (shouldFailAudit(selection.student, selection.offering)) {
        options.forceWithdrawalModel.markPendingAudit({
          actionId,
          completedAt: now,
          failureReason: 'Audit logging is pending retry.',
          nextRetryAt: new Date(options.now().getTime() + 60 * 1000).toISOString()
        });
        return {
          actionId,
          message: 'Forced withdrawal completed, but audit logging is pending retry.',
          pendingAudit: true,
          status: 'pending_audit',
          statusCode: 200
        };
      }

      options.forceWithdrawalModel.logAudit({
        actionId,
        adminAccountId: actorAccountId,
        createdAt: now,
        offeringId: selection.offering.id,
        reason: trimmedReason,
        studentAccountId: selection.student.accountId
      });
      options.forceWithdrawalModel.markStatus(actionId, 'completed', now, null);

      return {
        actionId,
        message: 'Forced withdrawal completed successfully.',
        pendingAudit: false,
        status: 'completed',
        statusCode: 200
      };
    }
  };
}

module.exports = { createForceWithdrawalService };
