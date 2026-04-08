function mapOffering(row) {
  if (!row) {
    return null;
  }

  return {
    capacity: row.capacity,
    courseCode: row.course_code,
    endMinute: row.end_minute,
    feeChangeCents: row.fee_change_cents,
    id: row.id,
    meetingDays: row.meeting_days,
    offeringCode: row.offering_code,
    prerequisiteCourseCode: row.prerequisite_course_code,
    seatsRemaining: row.seats_remaining,
    startMinute: row.start_minute,
    termCode: row.term_code,
    title: row.title
  };
}

function parseMeetingDays(value) {
  return new Set(String(value || '').split(',').map((entry) => entry.trim()).filter(Boolean));
}

function meetingsConflict(left, right) {
  const sharedDays = [...parseMeetingDays(left.meetingDays)].some((day) => parseMeetingDays(right.meetingDays).has(day));
  if (!sharedDays) {
    return false;
  }

  return left.startMinute < right.endMinute && right.startMinute < left.endMinute;
}

function createEnrollmentModel(db) {
  const selectOfferings = db.prepare(`
    SELECT id, offering_code, course_code, title, term_code, meeting_days, start_minute, end_minute,
           capacity, seats_remaining, prerequisite_course_code, fee_change_cents
    FROM class_offerings
    WHERE lower(course_code) LIKE '%' || lower(?) || '%'
       OR lower(title) LIKE '%' || lower(?) || '%'
    ORDER BY course_code, offering_code
  `);
  const selectOfferingById = db.prepare(`
    SELECT id, offering_code, course_code, title, term_code, meeting_days, start_minute, end_minute,
           capacity, seats_remaining, prerequisite_course_code, fee_change_cents
    FROM class_offerings
    WHERE id = ?
  `);
  const selectCompletedCourses = db.prepare(`
    SELECT course_code
    FROM completed_courses
    WHERE account_id = ?
  `);
  const selectActiveHolds = db.prepare(`
    SELECT hold_code, reason
    FROM registration_holds
    WHERE account_id = ?
      AND is_active = 1
  `);
  const selectCurrentSchedule = db.prepare(`
    SELECT o.id, o.offering_code, o.course_code, o.title, o.term_code, o.meeting_days, o.start_minute,
           o.end_minute, o.capacity, o.seats_remaining, o.prerequisite_course_code, o.fee_change_cents
    FROM class_enrollments e
    INNER JOIN class_offerings o ON o.id = e.offering_id
    WHERE e.account_id = ?
    ORDER BY o.course_code, o.offering_code
  `);
  const selectEnrollmentByAccountAndOffering = db.prepare(`
    SELECT id
    FROM class_enrollments
    WHERE account_id = ?
      AND offering_id = ?
    LIMIT 1
  `);
  const decrementSeats = db.prepare(`
    UPDATE class_offerings
    SET seats_remaining = seats_remaining - 1, updated_at = @updated_at
    WHERE id = @id
      AND seats_remaining > 0
  `);
  const insertEnrollment = db.prepare(`
    INSERT INTO class_enrollments (account_id, offering_id, created_at)
    VALUES (@account_id, @offering_id, @created_at)
  `);
  const insertAttempt = db.prepare(`
    INSERT INTO enrollment_attempts (account_id, offering_id, outcome, reason_summary, created_at)
    VALUES (@account_id, @offering_id, @outcome, @reason_summary, @created_at)
  `);

  return {
    createEnrollment(accountId, offeringId, timestamp) {
      return db.transaction(() => {
        const updateResult = decrementSeats.run({ id: offeringId, updated_at: timestamp });
        if (updateResult.changes !== 1) {
          return false;
        }

        insertEnrollment.run({
          account_id: accountId,
          created_at: timestamp,
          offering_id: offeringId
        });
        return true;
      })();
    },

    findOfferingById(offeringId) {
      return mapOffering(selectOfferingById.get(offeringId));
    },

    hasEnrollment(accountId, offeringId) {
      return Boolean(selectEnrollmentByAccountAndOffering.get(accountId, offeringId));
    },

    listCompletedCourses(accountId) {
      return new Set(selectCompletedCourses.all(accountId).map((row) => row.course_code));
    },

    listCurrentSchedule(accountId) {
      return selectCurrentSchedule.all(accountId).map(mapOffering);
    },

    listMatchingOfferings(query) {
      const term = String(query || '').trim();
      return selectOfferings.all(term, term).map(mapOffering);
    },

    listRegistrationHolds(accountId) {
      return selectActiveHolds.all(accountId);
    },

    logAttempt(accountId, offeringId, outcome, reasonSummary, timestamp) {
      insertAttempt.run({
        account_id: accountId,
        created_at: timestamp,
        offering_id: offeringId,
        outcome,
        reason_summary: reasonSummary || ''
      });
    },

    meetingsConflict
  };
}

module.exports = { createEnrollmentModel, meetingsConflict };
