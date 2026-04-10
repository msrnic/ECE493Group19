function createGradebookAuditModel(db) {
  const insertAudit = db.prepare(`
    INSERT INTO gradebook_access_audits (
      feature_key,
      requesting_account_id,
      offering_id,
      denial_reason,
      created_at,
      degraded_logging
    ) VALUES (
      @feature_key,
      @requesting_account_id,
      @offering_id,
      @denial_reason,
      @created_at,
      @degraded_logging
    )
  `);
  const selectByFeature = db.prepare(`
    SELECT id, feature_key, requesting_account_id, offering_id, denial_reason, created_at, degraded_logging
    FROM gradebook_access_audits
    WHERE feature_key = ?
    ORDER BY id ASC
  `);

  return {
    listByFeature(featureKey) {
      return selectByFeature.all(featureKey).map((row) => ({
        createdAt: row.created_at,
        degradedLogging: Boolean(row.degraded_logging),
        denialReason: row.denial_reason,
        featureKey: row.feature_key,
        id: row.id,
        offeringId: row.offering_id,
        requestingAccountId: row.requesting_account_id
      }));
    },

    record(details) {
      insertAudit.run(details);
    }
  };
}

module.exports = { createGradebookAuditModel };
