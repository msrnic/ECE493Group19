function mapOffering(row) {
  if (!row) {
    return null;
  }

  return {
    courseCode: row.course_code,
    id: row.id,
    instructorAccountId: row.instructor_account_id,
    submissionDeadlineAt: row.submission_deadline_at,
    submissionStatus: row.submission_status,
    termCode: row.term_code,
    title: row.title,
    updatedAt: row.updated_at
  };
}

function mapRosterEntry(row) {
  return {
    finalGrade: row.final_grade,
    rosterEntryId: row.id,
    studentAccountId: row.student_account_id,
    studentEmail: row.email,
    studentId: row.username,
    studentName: [row.first_name, row.last_name].filter(Boolean).join(' ').trim() || row.username,
    updatedAt: row.updated_at
  };
}

function createGradebookModel(db) {
  const selectOfferingsByInstructor = db.prepare(`
    SELECT id, course_code, title, term_code, instructor_account_id, submission_deadline_at, submission_status, updated_at
    FROM gradebook_offerings
    WHERE instructor_account_id = ?
    ORDER BY term_code DESC, course_code ASC
  `);
  const selectOfferingById = db.prepare(`
    SELECT id, course_code, title, term_code, instructor_account_id, submission_deadline_at, submission_status, updated_at
    FROM gradebook_offerings
    WHERE id = ?
    LIMIT 1
  `);
  const selectRosterByOffering = db.prepare(`
    SELECT
      r.id,
      r.offering_id,
      r.student_account_id,
      r.final_grade,
      r.updated_at,
      a.email,
      a.username,
      p.first_name,
      p.last_name
    FROM gradebook_roster_entries r
    INNER JOIN accounts a ON a.id = r.student_account_id
    LEFT JOIN personal_details p ON p.account_id = a.id
    WHERE r.offering_id = ?
    ORDER BY a.username ASC
  `);
  const updateOfferingStatus = db.prepare(`
    UPDATE gradebook_offerings
    SET submission_status = @submission_status, updated_at = @updated_at
    WHERE id = @id
  `);
  const updateRosterGrade = db.prepare(`
    UPDATE gradebook_roster_entries
    SET final_grade = @final_grade, updated_at = @updated_at
    WHERE offering_id = @offering_id
      AND student_account_id = @student_account_id
  `);

  return {
    findOfferingById(offeringId) {
      return mapOffering(selectOfferingById.get(offeringId));
    },

    listOfferingsByInstructor(accountId) {
      return selectOfferingsByInstructor.all(accountId).map(mapOffering);
    },

    listRosterByOffering(offeringId) {
      return selectRosterByOffering.all(offeringId).map(mapRosterEntry);
    },

    saveGrades(offeringId, gradesByStudentId, submissionStatus, updatedAt) {
      return db.transaction(() => {
        for (const [studentAccountId, finalGrade] of Object.entries(gradesByStudentId)) {
          updateRosterGrade.run({
            final_grade: finalGrade,
            offering_id: offeringId,
            student_account_id: Number(studentAccountId),
            updated_at: updatedAt
          });
        }

        updateOfferingStatus.run({
          id: offeringId,
          submission_status: submissionStatus,
          updated_at: updatedAt
        });
      })();
    }
  };
}

module.exports = { createGradebookModel };
