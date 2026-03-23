function createVerificationCooldownModel(db) {
  const selectByScopeKey = db.prepare('SELECT * FROM verification_cooldowns WHERE scope_key = ?');
  const upsertState = db.prepare(`
    INSERT INTO verification_cooldowns (
      scope_key,
      consecutive_failures,
      cooldown_until,
      last_failure_at,
      updated_at
    ) VALUES (
      @scope_key,
      @consecutive_failures,
      @cooldown_until,
      @last_failure_at,
      @updated_at
    )
    ON CONFLICT(scope_key) DO UPDATE SET
      consecutive_failures = excluded.consecutive_failures,
      cooldown_until = excluded.cooldown_until,
      last_failure_at = excluded.last_failure_at,
      updated_at = excluded.updated_at
  `);

  function findByScopeKey(scopeKey) {
    return selectByScopeKey.get(scopeKey) || null;
  }

  function saveState(scopeKey, state) {
    upsertState.run({
      scope_key: scopeKey,
      consecutive_failures: state.consecutiveFailures,
      cooldown_until: state.cooldownUntil,
      last_failure_at: state.lastFailureAt,
      updated_at: state.updatedAt
    });

    return findByScopeKey(scopeKey);
  }

  function clear(scopeKey, updatedAt) {
    return saveState(scopeKey, {
      consecutiveFailures: 0,
      cooldownUntil: null,
      lastFailureAt: null,
      updatedAt
    });
  }

  return {
    clear,
    findByScopeKey,
    saveState
  };
}

module.exports = { createVerificationCooldownModel };
