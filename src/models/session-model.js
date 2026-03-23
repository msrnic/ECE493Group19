function createSessionModel(db) {
  const insertSession = db.prepare(`
    INSERT INTO user_sessions (
      id,
      account_id,
      created_at,
      expires_at,
      revoked_at,
      invalidation_reason
    )
    VALUES (@id, @account_id, @created_at, @expires_at, NULL, NULL)
    ON CONFLICT(id) DO UPDATE SET
      account_id = excluded.account_id,
      created_at = excluded.created_at,
      expires_at = excluded.expires_at,
      revoked_at = NULL,
      invalidation_reason = NULL
  `);

  const selectActiveSession = db.prepare(`
    SELECT *
    FROM user_sessions
    WHERE id = ?
      AND revoked_at IS NULL
  `);
  const invalidateSessionStatement = db.prepare(`
    UPDATE user_sessions
    SET
      revoked_at = @revoked_at,
      invalidation_reason = @invalidation_reason
    WHERE id = @id
      AND revoked_at IS NULL
  `);
  const invalidateSessionsStatement = db.prepare(`
    UPDATE user_sessions
    SET
      revoked_at = @revoked_at,
      invalidation_reason = @invalidation_reason
    WHERE account_id = @account_id
      AND revoked_at IS NULL
      AND (@preserve_session_id IS NULL OR id != @preserve_session_id)
  `);
  const selectSessionsForAccount = db.prepare(`
    SELECT *
    FROM user_sessions
    WHERE account_id = ?
    ORDER BY id ASC
  `);

  function createSession(details) {
    insertSession.run({
      id: details.id,
      account_id: details.accountId,
      created_at: details.createdAt,
      expires_at: details.expiresAt
    });

    return findActiveSession(details.id);
  }

  function findActiveSession(sessionId) {
    return selectActiveSession.get(sessionId) || null;
  }

  function invalidateSession(sessionId, options = {}) {
    return invalidateSessionStatement.run({
      id: sessionId,
      invalidation_reason: options.reason || null,
      revoked_at: options.revokedAt || null
    }).changes;
  }

  function invalidateSessionsForAccount(accountId, options = {}) {
    return invalidateSessionsStatement.run({
      account_id: accountId,
      invalidation_reason: options.reason || null,
      preserve_session_id: options.preserveSessionId || null,
      revoked_at: options.revokedAt || null
    }).changes;
  }

  function listSessionsForAccount(accountId) {
    return selectSessionsForAccount.all(accountId);
  }

  return {
    createSession,
    findActiveSession,
    invalidateSession,
    invalidateSessionsForAccount,
    listSessionsForAccount
  };
}

module.exports = { createSessionModel };
