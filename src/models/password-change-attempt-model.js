function createPasswordChangeAttemptModel(db) {
  const insertAttempt = db.prepare(`
    INSERT INTO password_change_attempts (
      actor_account_id,
      target_account_id,
      verification_type,
      outcome,
      failure_count_after_attempt,
      cooldown_until,
      request_id,
      metadata_json,
      created_at
    ) VALUES (
      @actor_account_id,
      @target_account_id,
      @verification_type,
      @outcome,
      @failure_count_after_attempt,
      @cooldown_until,
      @request_id,
      @metadata_json,
      @created_at
    )
  `);

  const selectAttemptsByTarget = db.prepare(`
    SELECT *
    FROM password_change_attempts
    WHERE target_account_id = ?
    ORDER BY id ASC
  `);

  function recordAttempt(details) {
    insertAttempt.run({
      actor_account_id: details.actorAccountId || null,
      target_account_id: details.targetAccountId || null,
      verification_type: details.verificationType,
      outcome: details.outcome,
      failure_count_after_attempt: details.failureCountAfterAttempt || 0,
      cooldown_until: details.cooldownUntil || null,
      request_id: details.requestId,
      metadata_json: JSON.stringify(details.metadata || {}),
      created_at: details.createdAt
    });
  }

  function listByTargetAccount(targetAccountId) {
    return selectAttemptsByTarget.all(targetAccountId);
  }

  return {
    listByTargetAccount,
    recordAttempt
  };
}

module.exports = { createPasswordChangeAttemptModel };
