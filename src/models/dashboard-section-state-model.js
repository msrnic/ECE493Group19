function createDashboardSectionStateModel(db) {
  const selectStatesForAccount = db.prepare(`
    SELECT account_id, section_id, availability_status, status_reason, last_attempt_at, last_success_at
    FROM dashboard_section_states
    WHERE account_id = ?
    ORDER BY section_id ASC
  `);
  const selectUnavailableStatesForAccount = db.prepare(`
    SELECT section_id
    FROM dashboard_section_states
    WHERE account_id = ?
      AND availability_status = 'unavailable'
    ORDER BY section_id ASC
  `);
  const upsertStateStatement = db.prepare(`
    INSERT INTO dashboard_section_states (
      account_id,
      section_id,
      availability_status,
      status_reason,
      last_attempt_at,
      last_success_at
    ) VALUES (
      @account_id,
      @section_id,
      @availability_status,
      @status_reason,
      @last_attempt_at,
      @last_success_at
    )
    ON CONFLICT(account_id, section_id) DO UPDATE SET
      availability_status = excluded.availability_status,
      status_reason = excluded.status_reason,
      last_attempt_at = excluded.last_attempt_at,
      last_success_at = excluded.last_success_at
  `);

  const upsertStatesTransaction = db.transaction((states) => {
    for (const state of states) {
      upsertStateStatement.run({
        account_id: state.accountId,
        section_id: state.sectionId,
        availability_status: state.availabilityStatus,
        status_reason: state.statusReason || null,
        last_attempt_at: state.lastAttemptAt,
        last_success_at: state.lastSuccessAt || null
      });
    }
  });

  return {
    listStatesForAccount(accountId) {
      return selectStatesForAccount.all(accountId);
    },
    listUnavailableSectionIds(accountId) {
      return selectUnavailableStatesForAccount.all(accountId).map((row) => row.section_id);
    },
    upsertStates(states) {
      upsertStatesTransaction(states);
    }
  };
}

module.exports = { createDashboardSectionStateModel };
