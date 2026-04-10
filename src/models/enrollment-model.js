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
    offeringStatus: row.offering_status,
    prerequisiteCourseCode: row.prerequisite_course_code,
    seatsRemaining: row.seats_remaining,
    startMinute: row.start_minute,
    termCode: row.term_code,
    title: row.title,
    waitlistEnabled: Boolean(row.waitlist_enabled),
    waitlistUsesPosition: Boolean(row.waitlist_uses_position)
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
  const offeringColumns = [
    'id',
    'offering_code',
    'course_code',
    'title',
    'term_code',
    'offering_status',
    'meeting_days',
    'start_minute',
    'end_minute',
    'capacity',
    'seats_remaining',
    'waitlist_enabled',
    'waitlist_uses_position',
    'prerequisite_course_code',
    'fee_change_cents'
  ];
  const offeringFields = offeringColumns.join(', ');
  const joinedOfferingFields = offeringColumns.map((column) => `o.${column}`).join(', ');
  const selectOfferings = db.prepare(`
    SELECT ${offeringFields}
    FROM class_offerings
    WHERE lower(course_code) LIKE '%' || lower(?) || '%'
       OR lower(title) LIKE '%' || lower(?) || '%'
    ORDER BY course_code, offering_code
  `);
  const selectOfferingById = db.prepare(`
    SELECT ${offeringFields}
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
    SELECT ${joinedOfferingFields}
    FROM class_enrollments e
    INNER JOIN class_offerings o ON o.id = e.offering_id
    WHERE e.account_id = ?
    ORDER BY o.course_code, o.offering_code
  `);
  const selectCurrentWaitlists = db.prepare(`
    SELECT ${joinedOfferingFields}, w.waitlist_position, w.waitlist_status
    FROM waitlist_entries w
    INNER JOIN class_offerings o ON o.id = w.offering_id
    WHERE w.account_id = ?
    ORDER BY w.created_at ASC, o.course_code ASC, o.offering_code ASC
  `);
  const selectEnrollmentByAccountAndOffering = db.prepare(`
    SELECT id
    FROM class_enrollments
    WHERE account_id = ?
      AND offering_id = ?
    LIMIT 1
  `);
  const selectCurrentEnrollmentByAccountAndOffering = db.prepare(`
    SELECT ${joinedOfferingFields}
    FROM class_enrollments e
    INNER JOIN class_offerings o ON o.id = e.offering_id
    WHERE e.account_id = ?
      AND e.offering_id = ?
    LIMIT 1
  `);
  const selectWaitlistByAccountAndOffering = db.prepare(`
    SELECT id, waitlist_position, waitlist_status
    FROM waitlist_entries
    WHERE account_id = ?
      AND offering_id = ?
    LIMIT 1
  `);
  const selectMaxWaitlistPosition = db.prepare(`
    SELECT MAX(waitlist_position) AS max_position
    FROM waitlist_entries
    WHERE offering_id = ?
  `);
  const selectAlternativeSections = db.prepare(`
    SELECT ${offeringFields}
    FROM class_offerings
    WHERE course_code = ?
      AND term_code = ?
      AND id != ?
    ORDER BY seats_remaining DESC, start_minute ASC, offering_code ASC
    LIMIT 3
  `);
  const decrementSeats = db.prepare(`
    UPDATE class_offerings
    SET seats_remaining = seats_remaining - 1, updated_at = @updated_at
    WHERE id = @id
      AND seats_remaining > 0
  `);
  const incrementSeats = db.prepare(`
    UPDATE class_offerings
    SET seats_remaining = CASE
          WHEN seats_remaining < capacity THEN seats_remaining + 1
          ELSE capacity
        END,
        updated_at = @updated_at
    WHERE id = @id
  `);
  const insertEnrollment = db.prepare(`
    INSERT INTO class_enrollments (account_id, offering_id, created_at)
    VALUES (@account_id, @offering_id, @created_at)
  `);
  const deleteEnrollment = db.prepare(`
    DELETE FROM class_enrollments
    WHERE account_id = @account_id
      AND offering_id = @offering_id
  `);
  const insertAttempt = db.prepare(`
    INSERT INTO enrollment_attempts (account_id, offering_id, outcome, reason_summary, created_at)
    VALUES (@account_id, @offering_id, @outcome, @reason_summary, @created_at)
  `);
  const insertWaitlistAttempt = db.prepare(`
    INSERT INTO waitlist_attempts (account_id, offering_id, outcome, reason_summary, created_at)
    VALUES (@account_id, @offering_id, @outcome, @reason_summary, @created_at)
  `);
  const insertWaitlistEntry = db.prepare(`
    INSERT INTO waitlist_entries (
      account_id,
      offering_id,
      waitlist_status,
      waitlist_position,
      created_at
    ) VALUES (
      @account_id,
      @offering_id,
      @waitlist_status,
      @waitlist_position,
      @created_at
    )
  `);
  const insertWithdrawalRecord = db.prepare(`
    INSERT INTO withdrawal_records (
      account_id,
      offering_id,
      transcript_impact,
      fee_impact_summary,
      created_at
    ) VALUES (
      @account_id,
      @offering_id,
      @transcript_impact,
      @fee_impact_summary,
      @created_at
    )
  `);
  const insertDropRecord = db.prepare(`
    INSERT INTO drop_records (
      account_id,
      offering_id,
      fee_impact_summary,
      created_at
    ) VALUES (
      @account_id,
      @offering_id,
      @fee_impact_summary,
      @created_at
    )
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

    createDrop(accountId, offeringId, snapshot) {
      return db.transaction(() => {
        const removed = deleteEnrollment.run({
          account_id: accountId,
          offering_id: offeringId
        });
        if (removed.changes !== 1) {
          return false;
        }

        incrementSeats.run({
          id: offeringId,
          updated_at: snapshot.createdAt
        });
        insertDropRecord.run({
          account_id: accountId,
          created_at: snapshot.createdAt,
          fee_impact_summary: snapshot.feeImpactSummary,
          offering_id: offeringId
        });
        return true;
      })();
    },

    createWaitlist(accountId, offeringId, snapshot) {
      return db.transaction(() => {
        if (selectWaitlistByAccountAndOffering.get(accountId, offeringId)) {
          return false;
        }

        const waitlistPosition = snapshot.usesPosition
          ? Number(selectMaxWaitlistPosition.get(offeringId)?.max_position || 0) + 1
          : null;

        insertWaitlistEntry.run({
          account_id: accountId,
          created_at: snapshot.createdAt,
          offering_id: offeringId,
          waitlist_position: waitlistPosition,
          waitlist_status: 'waitlisted'
        });

        return {
          waitlistPosition,
          waitlistStatus: 'waitlisted'
        };
      })();
    },

    createWithdrawal(accountId, offeringId, snapshot) {
      return db.transaction(() => {
        const removed = deleteEnrollment.run({
          account_id: accountId,
          offering_id: offeringId
        });
        if (removed.changes !== 1) {
          return false;
        }

        incrementSeats.run({
          id: offeringId,
          updated_at: snapshot.createdAt
        });
        insertWithdrawalRecord.run({
          account_id: accountId,
          created_at: snapshot.createdAt,
          fee_impact_summary: snapshot.feeImpactSummary,
          offering_id: offeringId,
          transcript_impact: snapshot.transcriptImpact
        });
        return true;
      })();
    },

    findCurrentEnrollment(accountId, offeringId) {
      return mapOffering(selectCurrentEnrollmentByAccountAndOffering.get(accountId, offeringId));
    },

    findOfferingById(offeringId) {
      return mapOffering(selectOfferingById.get(offeringId));
    },

    hasEnrollment(accountId, offeringId) {
      return Boolean(selectEnrollmentByAccountAndOffering.get(accountId, offeringId));
    },

    hasWaitlist(accountId, offeringId) {
      return Boolean(selectWaitlistByAccountAndOffering.get(accountId, offeringId));
    },

    listCompletedCourses(accountId) {
      return new Set(selectCompletedCourses.all(accountId).map((row) => row.course_code));
    },

    listCurrentSchedule(accountId) {
      return selectCurrentSchedule.all(accountId).map(mapOffering);
    },

    listCurrentWaitlists(accountId) {
      return selectCurrentWaitlists.all(accountId).map((row) => ({
        ...mapOffering(row),
        waitlistPosition: row.waitlist_position,
        waitlistStatus: row.waitlist_status
      }));
    },

    listMatchingOfferings(query) {
      const term = String(query || '').trim();
      return selectOfferings.all(term, term).map(mapOffering);
    },

    listRegistrationHolds(accountId) {
      return selectActiveHolds.all(accountId);
    },

    listWaitlistAlternatives(offering) {
      return selectAlternativeSections.all(offering.courseCode, offering.termCode, offering.id).map(mapOffering);
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

    logWaitlistAttempt(accountId, offeringId, outcome, reasonSummary, timestamp) {
      insertWaitlistAttempt.run({
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
