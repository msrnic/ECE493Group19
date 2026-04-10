function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function createGradebookAuditService(options) {
  function shouldDegrade(featureKey, account) {
    const configured = options.gradebookTestState?.auditFailureIdentifiersByFeature || {};
    const identifiers = new Set((configured[featureKey] || []).map(normalizeIdentifier));

    return (
      identifiers.has(normalizeIdentifier(account.email)) ||
      identifiers.has(normalizeIdentifier(account.username))
    );
  }

  return {
    recordDenied(featureKey, requester, offeringId, denialReason) {
      const degradedLogging = shouldDegrade(featureKey, requester);

      options.gradebookAuditModel.record({
        created_at: options.now().toISOString(),
        degraded_logging: degradedLogging ? 1 : 0,
        denial_reason: denialReason,
        feature_key: featureKey,
        offering_id: offeringId || null,
        requesting_account_id: requester.id
      });

      return {
        degradedLogging,
        status: degradedLogging ? 'logged_degraded' : 'logged'
      };
    }
  };
}

module.exports = { createGradebookAuditService };
