const crypto = require('crypto');

function createError(statusCode, code, message, details = {}) {
  return { code, details, message, statusCode };
}

function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function createRequestId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function addYears(isoString, years) {
  const date = new Date(isoString);
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date.toISOString();
}

function createCourseCapacityService(options) {
  function isAdminActor(actorAccountId) {
    const actor = options.accountModel.findById(actorAccountId);
    return actor && actor.role === 'admin' ? actor : null;
  }

  function shouldFail(marker) {
    const configured = new Set((options.courseCapacityTestState?.failureIdentifiers || []).map(normalizeIdentifier));
    return configured.has(normalizeIdentifier(marker));
  }

  function validateCapacityInput(input) {
    const value = String(input?.proposedCapacity ?? '').trim();
    if (!/^\d+$/.test(value)) {
      return createError(400, 'VALIDATION_ERROR', 'Capacity must be a positive whole number.', {
        proposedCapacity: 'Enter a positive whole number.'
      });
    }

    const proposedCapacity = Number(value);
    if (!Number.isInteger(proposedCapacity) || proposedCapacity < 1) {
      return createError(400, 'VALIDATION_ERROR', 'Capacity must be a positive whole number.', {
        proposedCapacity: 'Enter a positive whole number.'
      });
    }

    const submittedVersion = Number(input?.submittedVersion);
    if (!Number.isInteger(submittedVersion) || submittedVersion < 1) {
      return createError(400, 'VALIDATION_ERROR', 'This capacity form is missing a valid version. Reload and try again.', {
        submittedVersion: 'Reload the offering before submitting.'
      });
    }

    return { proposedCapacity, submittedVersion };
  }

  function createOverridePayload({ actorAccountId, offeringId, requestId, override }) {
    const decision = String(override?.decision || '').trim().toLowerCase();
    const reason = String(override?.reason || '').trim();
    const approvedByAccountId = Number(override?.approvedByAccountId || actorAccountId);
    const allowSelfApproval = override?.allowSelfApproval !== false && override?.allowSelfApproval !== 'false';

    if (!['approved', 'denied'].includes(decision)) {
      return createError(400, 'VALIDATION_ERROR', 'Override decision is required for below-enrollment capacity changes.', {
        overrideDecision: 'Choose whether to approve or deny the override.'
      });
    }

    if (reason.length < 5 || reason.length > 500) {
      return createError(400, 'VALIDATION_ERROR', 'Override reason must be between 5 and 500 characters.', {
        overrideReason: 'Provide a reason between 5 and 500 characters.'
      });
    }

    if (approvedByAccountId === actorAccountId && !allowSelfApproval) {
      return createError(403, 'SELF_APPROVAL_NOT_ALLOWED', 'Self-approval is not allowed for this override request.');
    }

    const createdAt = options.now().toISOString();
    const approvedAt = decision === 'approved' ? createdAt : null;
    return {
      allowSelfApproval,
      approvedAt,
      approvedByAccountId: decision === 'approved' ? approvedByAccountId : null,
      createdAt,
      decision,
      offeringId,
      overrideRequestId: createRequestId('override'),
      reason,
      requestId,
      requestedByAccountId: actorAccountId,
      retentionUntil: decision === 'approved' ? addYears(createdAt, 7) : null
    };
  }

  function buildViewPayload(offering, request = null, override = null) {
    return {
      capacity: offering.capacity,
      currentEnrollment: offering.currentEnrollment,
      offering,
      override,
      remainingSeats: offering.remainingSeats,
      request,
      statusCode: 200,
      version: offering.version
    };
  }

  return {
    getOfferingState(actorAccountId, offeringId) {
      if (!isAdminActor(actorAccountId)) {
        return createError(403, 'FORBIDDEN', 'Administrative authorization is required for this action.');
      }

      const offering = options.courseCapacityModel.findOfferingById(Number(offeringId));
      if (!offering) {
        return createError(404, 'NOT_FOUND', 'Course offering was not found.');
      }

      return buildViewPayload(offering);
    },

    submitCapacityUpdate(actorAccountId, offeringId, input) {
      if (!isAdminActor(actorAccountId)) {
        return createError(403, 'FORBIDDEN', 'Administrative authorization is required for this action.');
      }

      const offering = options.courseCapacityModel.findOfferingById(Number(offeringId));
      if (!offering) {
        return createError(404, 'NOT_FOUND', 'Course offering was not found.');
      }

      const validated = validateCapacityInput(input);
      if (validated.code) {
        return validated;
      }

      const timestamp = options.now().toISOString();
      const requestId = createRequestId('capacity');
      const requestRecord = options.courseCapacityModel.createRequest({
        created_at: timestamp,
        offering_id: offering.id,
        override_request_id: null,
        request_id: requestId,
        resolved_at: null,
        status: 'pending',
        status_message: 'Capacity update submitted.',
        submitted_by_account_id: actorAccountId,
        submitted_capacity: validated.proposedCapacity,
        submitted_version: validated.submittedVersion
      });

      if (validated.proposedCapacity === offering.capacity) {
        options.courseCapacityModel.updateRequestStatus({
          override_request_id: null,
          request_id: requestId,
          resolved_at: timestamp,
          status: 'noop',
          status_message: 'Capacity is unchanged. No update was applied.'
        });

        return {
          capacity: offering.capacity,
          currentEnrollment: offering.currentEnrollment,
          message: 'Capacity is unchanged. No update was applied.',
          messageCode: 'NO_CHANGE',
          outcome: 'noop',
          remainingSeats: offering.remainingSeats,
          requestId,
          statusCode: 200
        };
      }

      if (validated.submittedVersion !== offering.version) {
        options.courseCapacityModel.updateRequestStatus({
          override_request_id: null,
          request_id: requestId,
          resolved_at: timestamp,
          status: 'stale',
          status_message: 'This offering changed after you opened it. Reload before resubmitting.'
        });

        return {
          capacity: offering.capacity,
          currentEnrollment: offering.currentEnrollment,
          message: 'This offering changed after you opened it. Reload before resubmitting.',
          messageCode: 'STALE_SUBMISSION',
          outcome: 'stale',
          remainingSeats: offering.remainingSeats,
          requestId,
          statusCode: 409
        };
      }

      let overrideRecord = null;
      if (validated.proposedCapacity < offering.currentEnrollment) {
        const overridePayload = createOverridePayload({
          actorAccountId,
          offeringId: offering.id,
          override: input.override,
          requestId
        });
        if (overridePayload.code) {
          options.courseCapacityModel.updateRequestStatus({
            override_request_id: null,
            request_id: requestId,
            resolved_at: timestamp,
            status: 'rejected',
            status_message: 'A below-enrollment override is required before this capacity can be saved.'
          });
          return overridePayload.code === 'SELF_APPROVAL_NOT_ALLOWED'
            ? overridePayload
            : {
                capacity: offering.capacity,
                currentEnrollment: offering.currentEnrollment,
                code: 'OVERRIDE_REQUIRED',
                details: overridePayload.details,
                message: 'A below-enrollment override is required before this capacity can be saved.',
                messageCode: 'OVERRIDE_REQUIRED',
                outcome: 'rejected',
                remainingSeats: offering.remainingSeats,
                requestId,
                statusCode: 200
              };
        }

        overrideRecord = options.courseCapacityModel.createOverrideAuthorization({
          allow_self_approval: overridePayload.allowSelfApproval ? 1 : 0,
          approved_at: overridePayload.approvedAt,
          approved_by_account_id: overridePayload.approvedByAccountId,
          created_at: overridePayload.createdAt,
          decision: overridePayload.decision,
          offering_id: overridePayload.offeringId,
          override_request_id: overridePayload.overrideRequestId,
          reason: overridePayload.reason,
          request_id: overridePayload.requestId,
          requested_by_account_id: overridePayload.requestedByAccountId,
          retention_until: overridePayload.retentionUntil
        });

        if (overridePayload.decision !== 'approved') {
          options.courseCapacityModel.updateRequestStatus({
            override_request_id: overridePayload.overrideRequestId,
            request_id: requestId,
            resolved_at: timestamp,
            status: 'rejected',
            status_message: 'Capacity update was denied during the override workflow.'
          });

          return {
            capacity: offering.capacity,
            currentEnrollment: offering.currentEnrollment,
            message: 'Capacity update was denied during the override workflow.',
            messageCode: 'OVERRIDE_DENIED',
            outcome: 'rejected',
            overrideRequestId: overridePayload.overrideRequestId,
            remainingSeats: offering.remainingSeats,
            requestId,
            statusCode: 200
          };
        }
      }

      if (shouldFail(offering.offeringCode)) {
        options.courseCapacityModel.updateRequestStatus({
          override_request_id: overrideRecord?.overrideRequestId || null,
          request_id: requestId,
          resolved_at: timestamp,
          status: 'failed',
          status_message: 'Capacity update failed before completion. The stored values were left unchanged.'
        });

        return {
          capacity: offering.capacity,
          currentEnrollment: offering.currentEnrollment,
          message: 'Capacity update failed before completion. The stored values were left unchanged.',
          messageCode: 'UPDATE_FAILED',
          outcome: 'failed',
          overrideRequestId: overrideRecord?.overrideRequestId || null,
          remainingSeats: offering.remainingSeats,
          requestId,
          statusCode: 500
        };
      }

      const nextRemainingSeats = Math.max(validated.proposedCapacity - offering.currentEnrollment, 0);
      const updated = options.courseCapacityModel.updateCapacity({
        capacity: validated.proposedCapacity,
        offering_id: offering.id,
        seats_remaining: nextRemainingSeats,
        submitted_version: validated.submittedVersion,
        updated_at: timestamp
      });

      if (!updated) {
        const current = options.courseCapacityModel.findOfferingById(offering.id);
        options.courseCapacityModel.updateRequestStatus({
          override_request_id: overrideRecord?.overrideRequestId || null,
          request_id: requestId,
          resolved_at: timestamp,
          status: 'stale',
          status_message: 'This offering changed after you opened it. Reload before resubmitting.'
        });

        return {
          capacity: current.capacity,
          currentEnrollment: current.currentEnrollment,
          message: 'This offering changed after you opened it. Reload before resubmitting.',
          messageCode: 'STALE_SUBMISSION',
          outcome: 'stale',
          overrideRequestId: overrideRecord?.overrideRequestId || null,
          remainingSeats: current.remainingSeats,
          requestId,
          statusCode: 409
        };
      }

      options.courseCapacityModel.updateRequestStatus({
        override_request_id: overrideRecord?.overrideRequestId || null,
        request_id: requestId,
        resolved_at: timestamp,
        status: 'applied',
        status_message: 'Course capacity updated successfully.'
      });
      const current = options.courseCapacityModel.findOfferingById(offering.id);

      return {
        approvedAt: overrideRecord?.approvedAt || null,
        approvedByAccountId: overrideRecord?.approvedByAccountId || null,
        capacity: current.capacity,
        currentEnrollment: current.currentEnrollment,
        message: `Course capacity updated successfully. Capacity is now ${current.capacity} with ${current.remainingSeats} remaining seats.`,
        messageCode: 'UPDATED',
        outcome: 'success',
        overrideRequestId: overrideRecord?.overrideRequestId || null,
        remainingSeats: current.remainingSeats,
        requestId,
        retentionUntil: overrideRecord?.retentionUntil || null,
        statusCode: 200,
        version: current.version
      };
    }
  };
}

module.exports = { createCourseCapacityService };
