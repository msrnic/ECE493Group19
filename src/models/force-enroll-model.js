function mapRequest(row) {
  if (!row) {
    return null;
  }

  return {
    createdAt: row.created_at,
    initiatedByAccountId: row.initiated_by_account_id,
    offeringId: row.offering_id,
    overCapacityConfirmationByAccountId: row.over_capacity_confirmation_by_account_id,
    reason: row.reason,
    rejectionReason: row.rejection_reason,
    requestId: row.request_id,
    requiresOverCapacityConfirmation: Boolean(row.requires_over_capacity_confirmation),
    resolvedAt: row.resolved_at,
    status: row.status,
    studentAccountId: row.student_account_id
  };
}

function createForceEnrollModel(db) {
  const selectRequestById = db.prepare(`
    SELECT
      request_id,
      initiated_by_account_id,
      student_account_id,
      offering_id,
      reason,
      status,
      requires_over_capacity_confirmation,
      over_capacity_confirmation_by_account_id,
      created_at,
      resolved_at,
      rejection_reason
    FROM force_enroll_requests
    WHERE request_id = ?
    LIMIT 1
  `);
  const selectEnrollment = db.prepare(`
    SELECT id
    FROM class_enrollments
    WHERE account_id = ?
      AND offering_id = ?
    LIMIT 1
  `);
  const selectOffering = db.prepare(`
    SELECT id, seats_remaining
    FROM class_offerings
    WHERE id = ?
    LIMIT 1
  `);
  const decrementSeats = db.prepare(`
    UPDATE class_offerings
    SET seats_remaining = seats_remaining - 1, updated_at = @updated_at
    WHERE id = @id
      AND seats_remaining > 0
  `);
  const insertRequest = db.prepare(`
    INSERT INTO force_enroll_requests (
      request_id,
      initiated_by_account_id,
      student_account_id,
      offering_id,
      reason,
      status,
      requires_over_capacity_confirmation,
      over_capacity_confirmation_by_account_id,
      created_at,
      resolved_at,
      rejection_reason
    ) VALUES (
      @request_id,
      @initiated_by_account_id,
      @student_account_id,
      @offering_id,
      @reason,
      @status,
      @requires_over_capacity_confirmation,
      @over_capacity_confirmation_by_account_id,
      @created_at,
      @resolved_at,
      @rejection_reason
    )
  `);
  const updateRequest = db.prepare(`
    UPDATE force_enroll_requests
    SET
      status = @status,
      over_capacity_confirmation_by_account_id = @over_capacity_confirmation_by_account_id,
      resolved_at = @resolved_at,
      rejection_reason = @rejection_reason
    WHERE request_id = @request_id
  `);
  const insertEnrollment = db.prepare(`
    INSERT INTO class_enrollments (account_id, offering_id, created_at)
    VALUES (@account_id, @offering_id, @created_at)
  `);
  const insertAudit = db.prepare(`
    INSERT INTO force_enroll_audit (
      request_id,
      admin_account_id,
      student_account_id,
      offering_id,
      reason,
      prerequisite_override,
      over_capacity_override,
      created_at
    ) VALUES (
      @request_id,
      @admin_account_id,
      @student_account_id,
      @offering_id,
      @reason,
      @prerequisite_override,
      @over_capacity_override,
      @created_at
    )
  `);

  return {
    createCompletedRequestAndEnrollment(payload) {
      return db.transaction(() => {
        const offering = selectOffering.get(payload.offeringId);
        if (!offering) {
          return { error: 'offering_not_found' };
        }

        if (selectEnrollment.get(payload.studentAccountId, payload.offeringId)) {
          return { error: 'duplicate' };
        }

        if (!payload.overCapacityOverride) {
          const capacityUpdate = decrementSeats.run({
            id: payload.offeringId,
            updated_at: payload.createdAt
          });
          if (capacityUpdate.changes !== 1) {
            return { error: 'confirmation_required' };
          }
        }

        insertRequest.run({
          created_at: payload.createdAt,
          initiated_by_account_id: payload.initiatedByAccountId,
          offering_id: payload.offeringId,
          over_capacity_confirmation_by_account_id: payload.overCapacityOverride
            ? payload.initiatedByAccountId
            : null,
          reason: payload.reason,
          rejection_reason: null,
          request_id: payload.requestId,
          requires_over_capacity_confirmation: payload.overCapacityOverride ? 1 : 0,
          resolved_at: payload.createdAt,
          status: 'completed',
          student_account_id: payload.studentAccountId
        });

        const enrollment = insertEnrollment.run({
          account_id: payload.studentAccountId,
          created_at: payload.createdAt,
          offering_id: payload.offeringId
        });

        insertAudit.run({
          admin_account_id: payload.initiatedByAccountId,
          created_at: payload.createdAt,
          offering_id: payload.offeringId,
          over_capacity_override: payload.overCapacityOverride ? 1 : 0,
          prerequisite_override: 1,
          reason: payload.reason,
          request_id: payload.requestId,
          student_account_id: payload.studentAccountId
        });

        return {
          enrollmentId: Number(enrollment.lastInsertRowid),
          requestId: payload.requestId
        };
      })();
    },

    createPendingRequest(payload) {
      insertRequest.run({
        created_at: payload.createdAt,
        initiated_by_account_id: payload.initiatedByAccountId,
        offering_id: payload.offeringId,
        over_capacity_confirmation_by_account_id: null,
        reason: payload.reason,
        rejection_reason: null,
        request_id: payload.requestId,
        requires_over_capacity_confirmation: 1,
        resolved_at: null,
        status: 'pending_confirmation',
        student_account_id: payload.studentAccountId
      });

      return this.findRequestById(payload.requestId);
    },

    confirmPendingRequest(payload) {
      return db.transaction(() => {
        const request = selectRequestById.get(payload.requestId);
        if (!request || request.status !== 'pending_confirmation') {
          return { error: 'not_confirmable' };
        }

        if (selectEnrollment.get(request.student_account_id, request.offering_id)) {
          return { error: 'duplicate' };
        }

        const enrollment = insertEnrollment.run({
          account_id: request.student_account_id,
          created_at: payload.resolvedAt,
          offering_id: request.offering_id
        });

        insertAudit.run({
          admin_account_id: request.initiated_by_account_id,
          created_at: payload.resolvedAt,
          offering_id: request.offering_id,
          over_capacity_override: 1,
          prerequisite_override: 1,
          reason: request.reason,
          request_id: request.request_id,
          student_account_id: request.student_account_id
        });

        updateRequest.run({
          over_capacity_confirmation_by_account_id: payload.actorAccountId,
          rejection_reason: null,
          request_id: payload.requestId,
          resolved_at: payload.resolvedAt,
          status: 'completed'
        });

        return {
          enrollmentId: Number(enrollment.lastInsertRowid),
          requestId: payload.requestId
        };
      })();
    },

    findRequestById(requestId) {
      return mapRequest(selectRequestById.get(requestId));
    },

    rejectRequest(requestId, resolvedAt, rejectionReason) {
      updateRequest.run({
        over_capacity_confirmation_by_account_id: null,
        rejection_reason: rejectionReason,
        request_id: requestId,
        resolved_at: resolvedAt,
        status: 'rejected'
      });

      return this.findRequestById(requestId);
    }
  };
}

module.exports = { createForceEnrollModel };
