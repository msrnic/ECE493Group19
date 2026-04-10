function mapCapacityOffering(row) {
  if (!row) {
    return null;
  }

  return {
    capacity: row.capacity,
    courseCode: row.course_code,
    currentEnrollment: row.current_enrollment,
    id: row.id,
    offeringCode: row.offering_code,
    remainingSeats: row.seats_remaining,
    sectionCode: row.section_code,
    termCode: row.term_code,
    title: row.title,
    updatedAt: row.updated_at,
    version: row.version
  };
}

function createCourseCapacityModel(db) {
  const selectOffering = db.prepare(`
    SELECT
      o.id,
      o.offering_code,
      o.course_code,
      o.title,
      o.term_code,
      o.section_code,
      o.capacity,
      o.seats_remaining,
      o.version,
      o.updated_at,
      (
        SELECT COUNT(*)
        FROM class_enrollments ce
        WHERE ce.offering_id = o.id
      ) AS current_enrollment
    FROM class_offerings o
    WHERE o.id = ?
    LIMIT 1
  `);
  const insertRequest = db.prepare(`
    INSERT INTO capacity_update_requests (
      request_id,
      offering_id,
      submitted_by_account_id,
      submitted_capacity,
      submitted_version,
      override_request_id,
      status,
      status_message,
      created_at,
      resolved_at
    ) VALUES (
      @request_id,
      @offering_id,
      @submitted_by_account_id,
      @submitted_capacity,
      @submitted_version,
      @override_request_id,
      @status,
      @status_message,
      @created_at,
      @resolved_at
    )
  `);
  const updateRequestStatus = db.prepare(`
    UPDATE capacity_update_requests
    SET
      override_request_id = @override_request_id,
      status = @status,
      status_message = @status_message,
      resolved_at = @resolved_at
    WHERE request_id = @request_id
  `);
  const insertOverride = db.prepare(`
    INSERT INTO capacity_override_authorizations (
      override_request_id,
      request_id,
      offering_id,
      requested_by_account_id,
      approved_by_account_id,
      decision,
      reason,
      allow_self_approval,
      approved_at,
      retention_until,
      created_at
    ) VALUES (
      @override_request_id,
      @request_id,
      @offering_id,
      @requested_by_account_id,
      @approved_by_account_id,
      @decision,
      @reason,
      @allow_self_approval,
      @approved_at,
      @retention_until,
      @created_at
    )
  `);
  const updateCapacity = db.prepare(`
    UPDATE class_offerings
    SET
      capacity = @capacity,
      seats_remaining = @seats_remaining,
      version = version + 1,
      updated_at = @updated_at
    WHERE id = @offering_id
      AND version = @submitted_version
  `);
  const selectRequest = db.prepare(`
    SELECT
      request_id AS requestId,
      offering_id AS offeringId,
      submitted_by_account_id AS submittedByAccountId,
      submitted_capacity AS submittedCapacity,
      submitted_version AS submittedVersion,
      override_request_id AS overrideRequestId,
      status,
      status_message AS statusMessage,
      created_at AS createdAt,
      resolved_at AS resolvedAt
    FROM capacity_update_requests
    WHERE request_id = ?
    LIMIT 1
  `);
  const selectOverride = db.prepare(`
    SELECT
      override_request_id AS overrideRequestId,
      request_id AS requestId,
      approved_by_account_id AS approvedByAccountId,
      decision,
      reason,
      allow_self_approval AS allowSelfApproval,
      approved_at AS approvedAt,
      retention_until AS retentionUntil
    FROM capacity_override_authorizations
    WHERE request_id = ?
    LIMIT 1
  `);

  return {
    createRequest(payload) {
      insertRequest.run(payload);
      return this.findRequestById(payload.request_id);
    },

    createOverrideAuthorization(payload) {
      insertOverride.run(payload);
      return this.findOverrideByRequestId(payload.request_id);
    },

    findOfferingById(offeringId) {
      return mapCapacityOffering(selectOffering.get(offeringId));
    },

    findOverrideByRequestId(requestId) {
      return selectOverride.get(requestId) || null;
    },

    findRequestById(requestId) {
      return selectRequest.get(requestId) || null;
    },

    updateCapacity(payload) {
      return updateCapacity.run(payload).changes === 1;
    },

    updateRequestStatus(payload) {
      updateRequestStatus.run(payload);
      return this.findRequestById(payload.request_id);
    }
  };
}

module.exports = { createCourseCapacityModel };
