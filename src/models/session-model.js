function createSessionModel(db) {
  const insertSession = db.prepare(`
    INSERT INTO user_sessions (id, account_id, created_at, expires_at, revoked_at)
    VALUES (@id, @account_id, @created_at, @expires_at, NULL)
    ON CONFLICT(id) DO UPDATE SET
      account_id = excluded.account_id,
      created_at = excluded.created_at,
      expires_at = excluded.expires_at,
      revoked_at = NULL
  `);

  const selectActiveSession = db.prepare(`
    SELECT *
    FROM user_sessions
    WHERE id = ?
      AND revoked_at IS NULL
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

  return {
    createSession,
    findActiveSession
  };
}

module.exports = { createSessionModel };
