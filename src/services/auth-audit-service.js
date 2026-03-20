const loginOutcomes = require('./login-outcomes');

function createAuthAuditService(loginAttemptModel, nowProvider = () => new Date()) {
  function record(details) {
    loginAttemptModel.recordAttempt({
      accountId: details.accountId,
      attemptedAt: nowProvider().toISOString(),
      identifier: details.identifier,
      outcome: details.outcome,
      sourceIp: details.sourceIp,
      userAgent: details.userAgent
    });
  }

  return {
    recordFailure(details) {
      record(details);
    },

    recordSuccess(details) {
      record({ ...details, outcome: loginOutcomes.SUCCESS });
    }
  };
}

module.exports = { createAuthAuditService };
