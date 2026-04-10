function mapEntry(row) {
  return {
    academicTerm: row.academic_term,
    availabilityStatus: row.availability_status,
    courseCode: row.course_code,
    courseTitle: row.course_title,
    credits: row.credits,
    entryId: row.id,
    finalResult: row.final_result,
    missingDetailsNote: row.missing_details_note
  };
}

function groupEntries(entries) {
  const groups = [];
  const seen = new Map();

  for (const entry of entries) {
    if (!seen.has(entry.academicTerm)) {
      const group = { entries: [], term: entry.academicTerm };
      seen.set(entry.academicTerm, group);
      groups.push(group);
    }

    seen.get(entry.academicTerm).entries.push(entry);
  }

  return groups;
}

function createTranscriptModel(db) {
  const selectEntriesByAccountId = db.prepare(`
    SELECT id, academic_term, course_code, course_title, credits, final_result, availability_status, missing_details_note
    FROM transcript_entries
    WHERE account_id = ?
    ORDER BY academic_term DESC, id ASC
  `);

  return {
    buildView(entries) {
      if (entries.length === 0) {
        return {
          message: 'No transcript entries are available for this account yet.',
          state: 'empty',
          termGroups: []
        };
      }

      const isPartial = entries.some((entry) => entry.availabilityStatus === 'partial');
      return {
        message: isPartial
          ? 'Some transcript details are incomplete. Available entries are shown below.'
          : 'Transcript loaded successfully.',
        missingDataMessage: isPartial
          ? entries
              .filter((entry) => entry.availabilityStatus === 'partial')
              .map((entry) => entry.missingDetailsNote || `${entry.courseCode} is incomplete.`)
              .join(' ')
          : null,
        state: isPartial ? 'partial' : 'full',
        termGroups: groupEntries(entries)
      };
    },

    listByAccountId(accountId) {
      return selectEntriesByAccountId.all(accountId).map(mapEntry);
    }
  };
}

module.exports = { createTranscriptModel };
