function createStudentRecordAuditModel(db) {
  const insertAudit = db.prepare(`
    INSERT INTO student_record_access_audits (
      feature_key,
      requesting_account_id,
      attempted_target_account_id,
      denial_reason,
      created_at,
      degraded_logging
    ) VALUES (
      @feature_key,
      @requesting_account_id,
      @attempted_target_account_id,
      @denial_reason,
      @created_at,
      @degraded_logging
    )
  `);
  const selectAuditsByFeature = db.prepare(`
    SELECT id, feature_key, requesting_account_id, attempted_target_account_id, denial_reason, created_at, degraded_logging
    FROM student_record_access_audits
    WHERE feature_key = ?
    ORDER BY id ASC
  `);

  return {
    listByFeature(featureKey) {
      return selectAuditsByFeature.all(featureKey).map((row) => ({
        attemptedTargetAccountId: row.attempted_target_account_id,
        createdAt: row.created_at,
        degradedLogging: Boolean(row.degraded_logging),
        denialReason: row.denial_reason,
        featureKey: row.feature_key,
        id: row.id,
        requestingAccountId: row.requesting_account_id
      }));
    },

    recordFailure(details) {
      insertAudit.run(details);
    }
  };
}

module.exports = { createStudentRecordAuditModel };
