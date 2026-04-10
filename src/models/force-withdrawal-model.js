function mapAction(row) {
  if (!row) {
    return null;
  }

  return {
    actionId: row.action_id,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    failureReason: row.failure_reason,
    initiatedByAccountId: row.initiated_by_account_id,
    offeringId: row.offering_id,
    reason: row.reason,
    status: row.status,
    studentAccountId: row.student_account_id
  };
}

function createForceWithdrawalModel(db) {
  const selectActionById = db.prepare(`
    SELECT action_id, initiated_by_account_id, student_account_id, offering_id, reason, status, created_at, completed_at, failure_reason
    FROM force_withdrawal_actions
    WHERE action_id = ?
    LIMIT 1
  `);
  const insertAction = db.prepare(`
    INSERT INTO force_withdrawal_actions (
      action_id, initiated_by_account_id, student_account_id, offering_id, reason, status, created_at, completed_at, failure_reason
    ) VALUES (
      @action_id, @initiated_by_account_id, @student_account_id, @offering_id, @reason, @status, @created_at, @completed_at, @failure_reason
    )
  `);
  const updateAction = db.prepare(`
    UPDATE force_withdrawal_actions
    SET status = @status, completed_at = @completed_at, failure_reason = @failure_reason
    WHERE action_id = @action_id
  `);
  const insertAudit = db.prepare(`
    INSERT INTO force_withdrawal_audit (
      action_id, admin_account_id, student_account_id, offering_id, reason, created_at
    ) VALUES (
      @action_id, @admin_account_id, @student_account_id, @offering_id, @reason, @created_at
    )
  `);
  const insertPendingAudit = db.prepare(`
    INSERT INTO force_withdrawal_pending_audit (
      action_id, next_retry_at, retry_count, last_error, status, created_at
    ) VALUES (
      @action_id, @next_retry_at, @retry_count, @last_error, @status, @created_at
    )
  `);
  const selectPendingAuditRows = db.prepare(`
    SELECT p.action_id, a.student_account_id, a.offering_id, p.retry_count, p.next_retry_at, p.last_error
    FROM force_withdrawal_pending_audit p
    INNER JOIN force_withdrawal_actions a ON a.action_id = p.action_id
    WHERE p.status != 'resolved'
    ORDER BY p.next_retry_at ASC, p.id ASC
  `);

  return {
    createAction(payload) {
      insertAction.run({
        action_id: payload.actionId,
        completed_at: payload.completedAt || null,
        created_at: payload.createdAt,
        failure_reason: payload.failureReason || null,
        initiated_by_account_id: payload.initiatedByAccountId,
        offering_id: payload.offeringId,
        reason: payload.reason,
        status: payload.status,
        student_account_id: payload.studentAccountId
      });

      return this.findActionById(payload.actionId);
    },

    findActionById(actionId) {
      return mapAction(selectActionById.get(actionId));
    },

    listPendingAudit() {
      return selectPendingAuditRows.all().map((row) => ({
        actionId: row.action_id,
        lastError: row.last_error,
        nextRetryAt: row.next_retry_at,
        offeringId: row.offering_id,
        retryCount: row.retry_count,
        studentAccountId: row.student_account_id
      }));
    },

    logAudit(payload) {
      insertAudit.run({
        action_id: payload.actionId,
        admin_account_id: payload.adminAccountId,
        created_at: payload.createdAt,
        offering_id: payload.offeringId,
        reason: payload.reason,
        student_account_id: payload.studentAccountId
      });
    },

    markStatus(actionId, status, completedAt, failureReason = null) {
      updateAction.run({
        action_id: actionId,
        completed_at: completedAt,
        failure_reason: failureReason,
        status
      });

      return this.findActionById(actionId);
    },

    markPendingAudit(payload) {
      this.markStatus(payload.actionId, 'pending_audit', payload.completedAt, payload.failureReason);
      insertPendingAudit.run({
        action_id: payload.actionId,
        created_at: payload.completedAt,
        last_error: payload.failureReason,
        next_retry_at: payload.nextRetryAt,
        retry_count: 0,
        status: 'pending'
      });

      return this.findActionById(payload.actionId);
    }
  };
}

module.exports = { createForceWithdrawalModel };
