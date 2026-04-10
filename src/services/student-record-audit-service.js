function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function createStudentRecordAuditService(options) {
  function shouldDegrade(featureKey, account) {
    const configured = options.studentRecordTestState?.auditFailureIdentifiersByFeature || {};
    const identifiers = new Set(
      (configured[featureKey] || []).map(normalizeIdentifier)
    );

    return (
      identifiers.has(normalizeIdentifier(account.email)) ||
      identifiers.has(normalizeIdentifier(account.username))
    );
  }

  return {
    recordDeniedAccess(featureKey, requester, targetAccountId, denialReason) {
      const degradedLogging = shouldDegrade(featureKey, requester);

      options.studentRecordAuditModel.recordFailure({
        attempted_target_account_id: targetAccountId || null,
        created_at: options.now().toISOString(),
        degraded_logging: degradedLogging ? 1 : 0,
        denial_reason: denialReason,
        feature_key: featureKey,
        requesting_account_id: requester.id
      });

      return {
        degradedLogging,
        status: degradedLogging ? 'logged_degraded' : 'logged'
      };
    }
  };
}

module.exports = { createStudentRecordAuditService };
