const bcrypt = require('bcrypt');

const loginOutcomes = require('./login-outcomes');

const DUMMY_HASH = bcrypt.hashSync('placeholder-password', 10);

function createAuthService(options) {
  const unavailableIdentifiers = new Set(
    (options.unavailableIdentifiers || []).map((identifier) => identifier.toLowerCase())
  );

  async function authenticate(details) {
    const now = options.now();
    const identifierKey = details.identifier.toLowerCase();

    if (unavailableIdentifiers.has(identifierKey)) {
      options.authAuditService.recordFailure({
        accountId: null,
        identifier: details.identifier,
        outcome: loginOutcomes.SERVICE_UNAVAILABLE,
        sourceIp: details.sourceIp,
        userAgent: details.userAgent
      });

      return { outcome: loginOutcomes.SERVICE_UNAVAILABLE };
    }

    let account = options.accountModel.findByIdentifier(details.identifier);

    if (!account) {
      await bcrypt.compare(details.password, DUMMY_HASH);
      options.authAuditService.recordFailure({
        accountId: null,
        identifier: details.identifier,
        outcome: loginOutcomes.INVALID_CREDENTIALS,
        sourceIp: details.sourceIp,
        userAgent: details.userAgent
      });

      return { outcome: loginOutcomes.INVALID_CREDENTIALS };
    }

    if (options.lockoutService.shouldClearExpiredLock(account, now)) {
      account = options.accountModel.resetFailureState(account.id, now.toISOString());
    }

    if (account.status === 'disabled') {
      options.authAuditService.recordFailure({
        accountId: account.id,
        identifier: details.identifier,
        outcome: loginOutcomes.DISABLED,
        sourceIp: details.sourceIp,
        userAgent: details.userAgent
      });

      return { outcome: loginOutcomes.DISABLED };
    }

    if (options.lockoutService.hasActiveLock(account, now)) {
      options.authAuditService.recordFailure({
        accountId: account.id,
        identifier: details.identifier,
        outcome: loginOutcomes.LOCKED,
        sourceIp: details.sourceIp,
        userAgent: details.userAgent
      });

      return { outcome: loginOutcomes.LOCKED };
    }

    const passwordMatches = await bcrypt.compare(details.password, account.password_hash);
    if (!passwordMatches) {
      const nextFailureCount = options.lockoutService.getNextFailureCount(account, now);
      const updatedAccount = options.accountModel.saveFailureState(account.id, {
        failedAttemptCount: nextFailureCount,
        lastFailedAt: now.toISOString(),
        lockedUntil: options.lockoutService.shouldLockAfterFailure(nextFailureCount)
          ? options.lockoutService.getLockedUntil(now)
          : null,
        status: options.lockoutService.shouldLockAfterFailure(nextFailureCount)
          ? 'locked'
          : 'active',
        updatedAt: now.toISOString()
      });

      options.authAuditService.recordFailure({
        accountId: account.id,
        identifier: details.identifier,
        outcome: loginOutcomes.INVALID_CREDENTIALS,
        sourceIp: details.sourceIp,
        userAgent: details.userAgent
      });

      return {
        account: updatedAccount,
        outcome: loginOutcomes.INVALID_CREDENTIALS
      };
    }

    account = options.accountModel.resetFailureState(account.id, now.toISOString());
    const session = options.sessionModel.createSession({
      id: details.sessionId,
      accountId: account.id,
      createdAt: now.toISOString(),
      expiresAt: details.expiresAt
    });

    options.authAuditService.recordSuccess({
      accountId: account.id,
      identifier: details.identifier,
      sourceIp: details.sourceIp,
      userAgent: details.userAgent
    });

    return {
      account,
      outcome: loginOutcomes.SUCCESS,
      session
    };
  }

  return { authenticate };
}

module.exports = { createAuthService };
