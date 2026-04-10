function mapRule(row) {
  if (!row) {
    return null;
  }

  return {
    deadlineAt: row.deadline_at,
    termCode: row.term_code,
    timezoneName: row.timezone_name
  };
}

function createDeadlineRuleModel(db) {
  const selectRuleByTerm = db.prepare(`
    SELECT term_code, deadline_at, timezone_name
    FROM drop_deadline_rules
    WHERE term_code = ?
    LIMIT 1
  `);
  const selectTerms = db.prepare(`
    SELECT term_code
    FROM drop_deadline_rules
    ORDER BY term_code ASC
  `);

  return {
    findRuleByTerm(termCode) {
      return mapRule(selectRuleByTerm.get(termCode));
    },

    listTerms() {
      return selectTerms.all().map((row) => row.term_code);
    }
  };
}

module.exports = { createDeadlineRuleModel };
