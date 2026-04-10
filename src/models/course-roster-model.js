function mapOffering(row) {
  if (!row) {
    return null;
  }

  return {
    courseCode: row.course_code,
    id: row.id,
    offeringCode: row.offering_code,
    termCode: row.term_code,
    title: row.title
  };
}

function mapRosterRow(row) {
  return {
    fullName: row.full_name,
    programName: row.program_name || 'Program unavailable',
    studentId: row.student_id
  };
}

function createCourseRosterModel(db) {
  const selectAssignedOfferings = db.prepare(`
    SELECT o.id, o.course_code, o.offering_code, o.term_code, o.title
    FROM offering_instructors oi
    INNER JOIN class_offerings o ON o.id = oi.offering_id
    WHERE oi.account_id = ?
    ORDER BY o.course_code ASC, o.offering_code ASC
  `);
  const selectAssignedOffering = db.prepare(`
    SELECT o.id, o.course_code, o.offering_code, o.term_code, o.title
    FROM offering_instructors oi
    INNER JOIN class_offerings o ON o.id = oi.offering_id
    WHERE oi.account_id = ?
      AND oi.offering_id = ?
    LIMIT 1
  `);
  const selectOfferingById = db.prepare(`
    SELECT id, course_code, offering_code, term_code, title
    FROM class_offerings
    WHERE id = ?
    LIMIT 1
  `);
  const selectRosterRows = db.prepare(`
    SELECT
      trim(coalesce(pd.first_name, '') || ' ' || coalesce(pd.last_name, '')) AS full_name,
      spp.program_name,
      a.username AS student_id
    FROM class_enrollments e
    INNER JOIN accounts a ON a.id = e.account_id
    LEFT JOIN personal_details pd ON pd.account_id = a.id
    LEFT JOIN student_program_profiles spp ON spp.account_id = a.id
    WHERE e.offering_id = ?
    ORDER BY lower(full_name) ASC, lower(a.username) ASC
  `);
  const insertRosterAudit = db.prepare(`
    INSERT INTO roster_view_audit (actor_account_id, offering_id, outcome, created_at)
    VALUES (@actor_account_id, @offering_id, @outcome, @created_at)
  `);

  return {
    findAssignedOffering(actorAccountId, offeringId) {
      return mapOffering(selectAssignedOffering.get(actorAccountId, offeringId));
    },
    findOfferingById(offeringId) {
      return mapOffering(selectOfferingById.get(offeringId));
    },
    listAssignedOfferings(actorAccountId) {
      return selectAssignedOfferings.all(actorAccountId).map(mapOffering);
    },
    listRosterStudents(offeringId) {
      return selectRosterRows.all(offeringId).map(mapRosterRow);
    },
    logRosterView(actorAccountId, offeringId, outcome, createdAt) {
      insertRosterAudit.run({
        actor_account_id: actorAccountId,
        created_at: createdAt,
        offering_id: offeringId,
        outcome
      });
    }
  };
}

module.exports = { createCourseRosterModel };
