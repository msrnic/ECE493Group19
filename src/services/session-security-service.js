function createSessionSecurityService(options) {
  function invalidateOtherSessions(accountId, currentSessionId) {
    return options.sessionModel.invalidateSessionsForAccount(accountId, {
      preserveSessionId: currentSessionId,
      reason: 'password_changed',
      revokedAt: options.now().toISOString()
    });
  }

  function invalidateAllSessions(accountId) {
    return options.sessionModel.invalidateSessionsForAccount(accountId, {
      reason: 'password_changed',
      revokedAt: options.now().toISOString()
    });
  }

  return {
    invalidateAllSessions,
    invalidateOtherSessions
  };
}

module.exports = { createSessionSecurityService };
