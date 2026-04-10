const { randomUUID } = require('node:crypto');

function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function createError(statusCode, code, message, details = {}) {
  return {
    code,
    details,
    message,
    statusCode
  };
}

function createForceEnrollService(options) {
  function isAdminActor(actorAccountId) {
    const actor = options.accountModel.findById(actorAccountId);
    return actor && actor.role === 'admin' ? actor : null;
  }

  function shouldFailForceEnroll(student, offering) {
    const configured = new Set(
      (options.forceEnrollTestState?.failureIdentifiers || []).map(normalizeIdentifier)
    );

    return [
      student.email,
      student.studentId,
      offering.offeringCode,
      offering.courseCode
    ].some((value) => configured.has(normalizeIdentifier(value)));
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
        status: byIdentifier.status,
        studentId: byIdentifier.username
      };
    }

    if (/^\d+$/.test(normalized)) {
      const byId = options.accountModel.findById(Number(normalized));
      if (byId && byId.role === 'student') {
        return {
          accountId: byId.id,
          email: byId.email,
          status: byId.status,
          studentId: byId.username
        };
      }
    }

    return null;
  }

  function validateReason(reason) {
    const trimmed = String(reason || '').trim();
    if (trimmed.length < 10 || trimmed.length > 500) {
      return createError(
        400,
        'VALIDATION_ERROR',
        'A reason between 10 and 500 characters is required for force enroll.',
        { reason: 'Provide a trimmed reason between 10 and 500 characters.' }
      );
    }

    return { reason: trimmed };
  }

  function validateHardConstraints(student, offering) {
    if (student.status !== 'active') {
      return createError(
        409,
        'HARD_CONSTRAINT_FAILED',
        'The selected student is not eligible for enrollment.',
        { studentStatus: student.status }
      );
    }

    if (!offering.termCode) {
      return createError(
        409,
        'HARD_CONSTRAINT_FAILED',
        'The selected offering is not valid for enrollment.',
        { offeringTerm: offering.termCode || null }
      );
    }

    return null;
  }

  function getOfferings() {
    return options.enrollmentModel.listMatchingOfferings('');
  }

  return {
    getFormState(actorAccountId) {
      if (!isAdminActor(actorAccountId)) {
        return {
          offerings: [],
          ...createError(403, 'FORBIDDEN', 'Administrative authorization is required for this action.')
        };
      }

      return {
        offerings: getOfferings(),
        statusCode: 200
      };
    },

    createRequest({ actorAccountId, offeringId, reason, studentIdentifier }) {
      if (!isAdminActor(actorAccountId)) {
        return createError(403, 'FORBIDDEN', 'Administrative authorization is required for this action.');
      }

      const validation = validateReason(reason);
      if (validation.code) {
        return validation;
      }

      const student = resolveStudent(studentIdentifier);
      if (!student) {
        return createError(404, 'STUDENT_NOT_FOUND', 'Student was not found.', {
          studentIdentifier: String(studentIdentifier || '').trim()
        });
      }

      const offering = options.enrollmentModel.findOfferingById(Number(offeringId));
      if (!offering) {
        return createError(404, 'OFFERING_NOT_FOUND', 'Course offering was not found.', {
          offeringId: Number(offeringId)
        });
      }

      const hardConstraintError = validateHardConstraints(student, offering);
      if (hardConstraintError) {
        return hardConstraintError;
      }

      if (options.enrollmentModel.hasEnrollment(student.accountId, offering.id)) {
        return createError(
          409,
          'DUPLICATE_ENROLLMENT',
          'The selected student is already enrolled in this offering.'
        );
      }

      if (shouldFailForceEnroll(student, offering)) {
        return createError(
          500,
          'TRANSACTION_FAILED',
          'Force enrollment could not be completed right now. No enrollment changes were saved.'
        );
      }

      const timestamp = options.now().toISOString();
      const requestId = randomUUID();

      if (offering.seatsRemaining <= 0) {
        options.forceEnrollModel.createPendingRequest({
          createdAt: timestamp,
          initiatedByAccountId: actorAccountId,
          offeringId: offering.id,
          reason: validation.reason,
          requestId,
          studentAccountId: student.accountId
        });

        return {
          message: 'Over-capacity confirmation is required before this forced enrollment can be completed.',
          offering,
          requestId,
          requiresOverCapacityConfirmation: true,
          status: 'pending_confirmation',
          statusCode: 201,
          student
        };
      }

      const completed = options.forceEnrollModel.createCompletedRequestAndEnrollment({
        createdAt: timestamp,
        initiatedByAccountId: actorAccountId,
        offeringId: offering.id,
        overCapacityOverride: false,
        reason: validation.reason,
        requestId,
        studentAccountId: student.accountId
      });

      if (completed.error === 'duplicate') {
        return createError(
          409,
          'DUPLICATE_ENROLLMENT',
          'The selected student is already enrolled in this offering.'
        );
      }

      if (completed.error) {
        return createError(
          500,
          'TRANSACTION_FAILED',
          'Force enrollment could not be completed right now. No enrollment changes were saved.'
        );
      }

      return {
        enrollmentId: completed.enrollmentId,
        message: 'Forced enrollment completed successfully.',
        offering,
        requestId,
        requiresOverCapacityConfirmation: false,
        status: 'completed',
        statusCode: 201,
        student
      };
    },

    confirmRequest({ actorAccountId, confirm, requestId }) {
      if (!isAdminActor(actorAccountId)) {
        return createError(403, 'FORBIDDEN', 'Administrative authorization is required for this action.');
      }

      const request = options.forceEnrollModel.findRequestById(requestId);
      if (!request) {
        return createError(404, 'REQUEST_NOT_FOUND', 'Force-enroll request was not found.');
      }

      if (request.initiatedByAccountId !== actorAccountId) {
        return createError(
          403,
          'CONFIRMATION_NOT_ALLOWED',
          'Only the administrator who initiated the request can confirm over-capacity enrollment.'
        );
      }

      if (request.status !== 'pending_confirmation') {
        return createError(
          409,
          'CONFIRMATION_NOT_ALLOWED',
          'This force-enroll request can no longer be confirmed.'
        );
      }

      if (!confirm) {
        options.forceEnrollModel.rejectRequest(
          requestId,
          options.now().toISOString(),
          'Administrator canceled the over-capacity confirmation.'
        );
        return {
          message: 'Over-capacity force enrollment was canceled. No enrollment changes were saved.',
          requestId,
          status: 'canceled',
          statusCode: 200
        };
      }

      const studentAccount = options.accountModel.findById(request.studentAccountId);
      const offering = options.enrollmentModel.findOfferingById(request.offeringId);
      if (!studentAccount || studentAccount.role !== 'student' || !offering) {
        options.forceEnrollModel.rejectRequest(
          requestId,
          options.now().toISOString(),
          'The student or offering was no longer available at confirmation time.'
        );
        return createError(
          409,
          'CONFIRMATION_NOT_ALLOWED',
          'This request can no longer be completed because the student or offering is unavailable.'
        );
      }

      const student = {
        accountId: studentAccount.id,
        email: studentAccount.email,
        status: studentAccount.status,
        studentId: studentAccount.username
      };
      const hardConstraintError = validateHardConstraints(student, offering);
      if (hardConstraintError) {
        options.forceEnrollModel.rejectRequest(
          requestId,
          options.now().toISOString(),
          hardConstraintError.message
        );
        return hardConstraintError;
      }

      if (options.enrollmentModel.hasEnrollment(student.accountId, offering.id)) {
        options.forceEnrollModel.rejectRequest(
          requestId,
          options.now().toISOString(),
          'The selected student is already enrolled in this offering.'
        );
        return createError(
          409,
          'DUPLICATE_ENROLLMENT',
          'The selected student is already enrolled in this offering.'
        );
      }

      if (shouldFailForceEnroll(student, offering)) {
        return createError(
          500,
          'TRANSACTION_FAILED',
          'Force enrollment could not be completed right now. No enrollment changes were saved.'
        );
      }

      const completed = options.forceEnrollModel.confirmPendingRequest({
        actorAccountId,
        requestId,
        resolvedAt: options.now().toISOString()
      });

      if (completed.error) {
        return createError(
          500,
          'TRANSACTION_FAILED',
          'Force enrollment could not be completed right now. No enrollment changes were saved.'
        );
      }

      return {
        enrollmentId: completed.enrollmentId,
        message: 'Forced enrollment completed successfully.',
        offering,
        requestId,
        status: 'completed',
        statusCode: 200,
        student
      };
    },

    getRequestStatus(actorAccountId, requestId) {
      if (!isAdminActor(actorAccountId)) {
        return createError(403, 'FORBIDDEN', 'Administrative authorization is required for this action.');
      }

      const request = options.forceEnrollModel.findRequestById(requestId);
      if (!request) {
        return createError(404, 'REQUEST_NOT_FOUND', 'Force-enroll request was not found.');
      }

      return {
        ...request,
        statusCode: 200
      };
    }
  };
}

module.exports = { createForceEnrollService };
