function parseCourseCode(courseCode) {
  const match = String(courseCode || '').trim().toUpperCase().match(/^([A-Z]+)\s*([0-9A-Z]+)/);
  return {
    courseNumber: match ? match[2] : '',
    subjectCode: match ? match[1] : ''
  };
}

function mapOffering(row) {
  if (!row) {
    return null;
  }

  const parsed = parseCourseCode(row.course_code);
  return {
    courseCode: row.course_code,
    courseNumber: parsed.courseNumber,
    id: row.id,
    meetingDays: row.meeting_days,
    offeringCode: row.offering_code,
    seatsRemaining: row.seats_remaining,
    startMinute: row.start_minute,
    subjectCode: parsed.subjectCode,
    termCode: row.term_code,
    title: row.title,
    updatedAt: row.updated_at
  };
}

function createClassOfferingModel(db) {
  const selectTerms = db.prepare(`
    SELECT DISTINCT term_code
    FROM class_offerings
    ORDER BY term_code ASC
  `);
  const selectOfferingById = db.prepare(`
    SELECT id, offering_code, course_code, title, term_code, meeting_days, start_minute, seats_remaining, updated_at
    FROM class_offerings
    WHERE id = ?
      AND seats_remaining > 0
    LIMIT 1
  `);

  return {
    findAvailableOfferingById(offeringId) {
      return mapOffering(selectOfferingById.get(offeringId));
    },

    listAvailableTerms() {
      return selectTerms.all().map((row) => row.term_code);
    },

    searchAvailableOfferings(filters) {
      const conditions = ['seats_remaining > 0'];
      const values = [];

      if (filters.termCode) {
        conditions.push('term_code = ?');
        values.push(filters.termCode);
      }

      if (filters.subjectCode) {
        conditions.push('upper(course_code) LIKE ?');
        values.push(`${filters.subjectCode}%`);
      }

      if (filters.courseNumber) {
        conditions.push('replace(upper(course_code), \' \', \'\') LIKE ?');
        values.push(`%${filters.courseNumber}%`);
      }

      if (filters.queryText) {
        conditions.push('(lower(course_code) LIKE ? OR lower(title) LIKE ? OR lower(offering_code) LIKE ?)');
        const pattern = `%${filters.queryText.toLowerCase()}%`;
        values.push(pattern, pattern, pattern);
      }

      const sql = `
        SELECT id, offering_code, course_code, title, term_code, meeting_days, start_minute, seats_remaining, updated_at
        FROM class_offerings
        WHERE ${conditions.join(' AND ')}
        ORDER BY start_minute ASC, course_code ASC, offering_code ASC
      `;

      return db.prepare(sql).all(...values).map(mapOffering);
    }
  };
}

module.exports = { createClassOfferingModel, parseCourseCode };
