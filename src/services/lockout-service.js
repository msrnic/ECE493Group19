function createLockoutService(options = {}) {
  const now = options.now || (() => new Date());
  const maxAttempts = options.maxAttempts || 5;
  const lockDurationMs = options.lockDurationMs || 15 * 60 * 1000;

  function getWindowStart(referenceTime = now()) {
    return new Date(referenceTime.getTime() - lockDurationMs);
  }

  function hasActiveLock(account, referenceTime = now()) {
    return Boolean(
      account.status === 'locked' &&
        account.locked_until &&
        new Date(account.locked_until).getTime() > referenceTime.getTime()
    );
  }

  function shouldResetFailureWindow(account, referenceTime = now()) {
    if (!account.last_failed_at) {
      return true;
    }

    return new Date(account.last_failed_at).getTime() < getWindowStart(referenceTime).getTime();
  }

  function getNextFailureCount(account, referenceTime = now()) {
    if (shouldResetFailureWindow(account, referenceTime)) {
      return 1;
    }

    return account.failed_attempt_count + 1;
  }

  function shouldLockAfterFailure(failureCount) {
    return failureCount >= maxAttempts;
  }

  function getLockedUntil(referenceTime = now()) {
    return new Date(referenceTime.getTime() + lockDurationMs).toISOString();
  }

  function shouldClearExpiredLock(account, referenceTime = now()) {
    return Boolean(
      account.status === 'locked' &&
        account.locked_until &&
        new Date(account.locked_until).getTime() <= referenceTime.getTime()
    );
  }

  return {
    getLockedUntil,
    getNextFailureCount,
    getWindowStart,
    hasActiveLock,
    shouldClearExpiredLock,
    shouldLockAfterFailure,
    shouldResetFailureWindow
  };
}

module.exports = { createLockoutService };
