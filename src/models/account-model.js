function createAccountModel(db) {
  const selectByIdentifier = db.prepare(`
    SELECT *
    FROM accounts
    WHERE lower(email) = lower(?) OR lower(username) = lower(?)
    LIMIT 1
  `);

  const selectById = db.prepare('SELECT * FROM accounts WHERE id = ?');
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

  function findByIdentifier(identifier) {
    if (!identifier) {
      return null;
    }

    return selectByIdentifier.get(identifier, identifier) || null;
  }

  function findById(accountId) {
    return selectById.get(accountId) || null;
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

  return {
    findByIdentifier,
    findById,
    getDashboardAccount,
    resetFailureState,
    saveFailureState
  };
}

module.exports = { createAccountModel };
