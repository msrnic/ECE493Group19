function createAccountModel(db) {
  const selectByIdentifier = db.prepare(`
    SELECT *
    FROM accounts
    WHERE lower(email) = lower(?) OR lower(username) = lower(?)
    LIMIT 1
  `);

  const selectById = db.prepare('SELECT * FROM accounts WHERE id = ?');
  const selectAllAccounts = db.prepare(`
    SELECT id, email, username, role, status
    FROM accounts
    ORDER BY email ASC
  `);
  const selectPasswordManagementTargets = db.prepare(`
    SELECT id, email, username, role, status
    FROM accounts
    WHERE id != ?
    ORDER BY email ASC
  `);
  const selectDashboardCourses = db.prepare(`
    SELECT c.course_code, c.title, c.credits, ac.role
    FROM account_courses ac
    INNER JOIN courses c ON c.id = ac.course_id
    WHERE ac.account_id = ?
    ORDER BY c.course_code
  `);

  const updateFailureState = db.prepare(`
    UPDATE accounts
    SET
      status = @status,
      failed_attempt_count = @failed_attempt_count,
      last_failed_at = @last_failed_at,
      locked_until = @locked_until,
      updated_at = @updated_at
    WHERE id = @id
  `);
  const updatePasswordHashStatement = db.prepare(`
    UPDATE accounts
    SET
      password_hash = @password_hash,
      must_change_password = 0,
      password_changed_at = @password_changed_at,
      updated_at = @updated_at
    WHERE id = @id
  `);

  function findByIdentifier(identifier) {
    if (!identifier) {
      return null;
    }

    return selectByIdentifier.get(identifier, identifier) || null;
  }

  function findById(accountId) {
    return selectById.get(accountId) || null;
  }

  function listAccounts() {
    return selectAllAccounts.all();
  }

  function getDashboardAccount(accountId) {
    const account = findById(accountId);
    if (!account) {
      return null;
    }

    return {
      ...account,
      courses: selectDashboardCourses.all(accountId)
    };
  }

  function listPasswordManagementTargets(actorAccountId) {
    return selectPasswordManagementTargets.all(actorAccountId);
  }

  function saveFailureState(accountId, state) {
    updateFailureState.run({
      id: accountId,
      status: state.status,
      failed_attempt_count: state.failedAttemptCount,
      last_failed_at: state.lastFailedAt,
      locked_until: state.lockedUntil,
      updated_at: state.updatedAt
    });

    return findById(accountId);
  }

  function resetFailureState(accountId, updatedAt) {
    return saveFailureState(accountId, {
      status: 'active',
      failedAttemptCount: 0,
      lastFailedAt: null,
      lockedUntil: null,
      updatedAt
    });
  }

  function updatePasswordHash(accountId, passwordHash, changedAt) {
    updatePasswordHashStatement.run({
      id: accountId,
      password_hash: passwordHash,
      password_changed_at: changedAt,
      updated_at: changedAt
    });

    return findById(accountId);
  }

  return {
    findByIdentifier,
    findById,
    getDashboardAccount,
    listAccounts,
    listPasswordManagementTargets,
    resetFailureState,
    saveFailureState,
    updatePasswordHash
  };
}

module.exports = { createAccountModel };
