function mapOffering(row) {
  if (!row) {
    return null;
  }

  return {
    capacity: row.capacity,
    courseCode: row.course_code,
    id: row.id,
    instructorAccountId: row.instructor_account_id,
    instructorLabel: row.instructor_label,
    meetingDays: row.meeting_days,
    offeringCode: row.offering_code,
    offeringStatus: row.offering_status,
    scheduleEndMinute: row.end_minute,
    scheduleStartMinute: row.start_minute,
    sectionCode: row.section_code,
    seatsRemaining: row.seats_remaining,
    termCode: row.term_code,
    title: row.title,
    updatedAt: row.updated_at
  };
}

function createOfferingAdminModel(db) {
  const offeringSelect = `
    SELECT
      o.id,
      o.offering_code,
      o.course_code,
      o.title,
      o.term_code,
      o.section_code,
      o.offering_status,
      o.meeting_days,
      o.start_minute,
      o.end_minute,
      o.capacity,
      o.seats_remaining,
      o.updated_at,
      i.account_id AS instructor_account_id,
      COALESCE(a.username, a.email, '') AS instructor_label
    FROM class_offerings o
    LEFT JOIN offering_instructors i ON i.offering_id = o.id
    LEFT JOIN accounts a ON a.id = i.account_id
  `;
  const selectAll = db.prepare(`${offeringSelect} ORDER BY o.term_code ASC, o.course_code ASC, o.offering_code ASC`);
  const selectById = db.prepare(`${offeringSelect} WHERE o.id = ? LIMIT 1`);
  const selectActiveEnrollmentCount = db.prepare(`
    SELECT COUNT(*) AS count
    FROM class_enrollments
    WHERE offering_id = ?
  `);
  const selectInstructorOptions = db.prepare(`
    SELECT id, username, email
    FROM accounts
    WHERE role IN ('professor', 'admin')
      AND status = 'active'
    ORDER BY username ASC, email ASC
  `);
  const selectDuplicate = db.prepare(`
    SELECT o.id
    FROM class_offerings o
    INNER JOIN offering_instructors i ON i.offering_id = o.id
    WHERE lower(o.course_code) = lower(@course_code)
      AND lower(o.term_code) = lower(@term_code)
      AND lower(o.section_code) = lower(@section_code)
      AND i.account_id = @instructor_account_id
    LIMIT 1
  `);
  const insertOffering = db.prepare(`
    INSERT INTO class_offerings (
      offering_code,
      course_code,
      title,
      term_code,
      section_code,
      meeting_days,
      start_minute,
      end_minute,
      capacity,
      seats_remaining,
      waitlist_enabled,
      waitlist_uses_position,
      prerequisite_course_code,
      fee_change_cents,
      created_at,
      updated_at
    ) VALUES (
      @offering_code,
      @course_code,
      @title,
      @term_code,
      @section_code,
      @meeting_days,
      @start_minute,
      @end_minute,
      @capacity,
      @seats_remaining,
      0,
      1,
      NULL,
      0,
      @created_at,
      @updated_at
    )
  `);
  const insertInstructor = db.prepare(`
    INSERT INTO offering_instructors (offering_id, account_id, assigned_at)
    VALUES (@offering_id, @account_id, @assigned_at)
  `);
  const deleteInstructors = db.prepare(`DELETE FROM offering_instructors WHERE offering_id = ?`);
  const deleteOffering = db.prepare(`DELETE FROM class_offerings WHERE id = ?`);
  const insertChangeLog = db.prepare(`
    INSERT INTO offering_change_logs (
      offering_id,
      offering_code,
      action_type,
      actor_account_id,
      outcome,
      override_used,
      override_reason,
      failure_reason,
      created_at
    ) VALUES (
      @offering_id,
      @offering_code,
      @action_type,
      @actor_account_id,
      @outcome,
      @override_used,
      @override_reason,
      @failure_reason,
      @created_at
    )
  `);
  const insertRetry = db.prepare(`
    INSERT INTO offering_change_audit_retry (
      log_payload_json,
      attempt_count,
      next_attempt_at,
      last_error,
      created_at,
      updated_at
    ) VALUES (
      @log_payload_json,
      @attempt_count,
      @next_attempt_at,
      @last_error,
      @created_at,
      @updated_at
    )
  `);

  return {
    createOffering(payload) {
      return db.transaction(() => {
        const inserted = insertOffering.run(payload);
        const offeringId = Number(inserted.lastInsertRowid);
        insertInstructor.run({
          account_id: payload.instructor_account_id,
          assigned_at: payload.created_at,
          offering_id: offeringId
        });
        return this.findOfferingById(offeringId);
      })();
    },

    deleteOffering(offeringId) {
      return db.transaction(() => {
        deleteInstructors.run(offeringId);
        return deleteOffering.run(offeringId).changes === 1;
      })();
    },

    findDuplicateIdentity(payload) {
      return selectDuplicate.get(payload) || null;
    },

    findOfferingById(offeringId) {
      return mapOffering(selectById.get(offeringId));
    },

    listInstructorOptions() {
      return selectInstructorOptions.all().map((row) => ({
        id: row.id,
        label: row.username || row.email
      }));
    },

    listOfferings() {
      return selectAll.all().map(mapOffering);
    },

    logChange(payload) {
      insertChangeLog.run(payload);
    },

    queueAuditRetry(payload) {
      insertRetry.run(payload);
    },

    readActiveEnrollmentCount(offeringId) {
      return Number(selectActiveEnrollmentCount.get(offeringId)?.count || 0);
    }
  };
}

module.exports = { createOfferingAdminModel };
