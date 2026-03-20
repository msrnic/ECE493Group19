function createLoginAttemptModel(db) {
  const insertAttempt = db.prepare(`
    INSERT INTO login_attempts (
      account_id,
      submitted_identifier,
      outcome,
      source_ip,
      user_agent,
      attempted_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const selectAttemptsForAccount = db.prepare(`
    SELECT *
    FROM login_attempts
    WHERE account_id = ?
    ORDER BY attempted_at ASC
  `);

  const countOutcomeSince = db.prepare(`
    SELECT COUNT(*) AS count
    FROM login_attempts
    WHERE account_id = ?
      AND outcome = ?
      AND attempted_at >= ?
  `);

  function recordAttempt(details) {
    insertAttempt.run(
      details.accountId || null,
      details.identifier,
      details.outcome,
      details.sourceIp || null,
      details.userAgent || null,
      details.attemptedAt
    );
  }

  function listAttemptsForAccount(accountId) {
    return selectAttemptsForAccount.all(accountId);
  }

  function countOutcomeForAccountSince(accountId, outcome, sinceIso) {
    return countOutcomeSince.get(accountId, outcome, sinceIso).count;
  }

  return {
    countOutcomeForAccountSince,
    listAttemptsForAccount,
    recordAttempt
  };
}

module.exports = { createLoginAttemptModel };
