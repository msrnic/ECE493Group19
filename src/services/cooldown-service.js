function createCooldownService(options) {
  function getCooldownDurationMs(failureCount) {
    if (failureCount < 3) {
      return 0;
    }

    return Math.min(30 * 1000 * (2 ** (failureCount - 3)), 15 * 60 * 1000);
  }

  function getRetryAfterSeconds(cooldownUntil, now = options.now()) {
    const retryAfterMs = new Date(cooldownUntil).getTime() - now.getTime();
    return Math.max(1, Math.ceil(retryAfterMs / 1000));
  }

  function getActiveCooldown(scopeKey) {
    const record = options.verificationCooldownModel.findByScopeKey(scopeKey);
    const now = options.now();

    if (!record || !record.cooldown_until) {
      return null;
    }

    if (new Date(record.cooldown_until).getTime() <= now.getTime()) {
      return null;
    }

    return {
      ...record,
      retryAfterSeconds: getRetryAfterSeconds(record.cooldown_until, now)
    };
  }

  function registerFailure(scopeKey) {
    const now = options.now();
    const existing = options.verificationCooldownModel.findByScopeKey(scopeKey);
    const nextFailureCount = (existing ? existing.consecutive_failures : 0) + 1;
    const durationMs = getCooldownDurationMs(nextFailureCount);
    const cooldownUntil = durationMs ? new Date(now.getTime() + durationMs).toISOString() : null;

    const updated = options.verificationCooldownModel.saveState(scopeKey, {
      consecutiveFailures: nextFailureCount,
      cooldownUntil,
      lastFailureAt: now.toISOString(),
      updatedAt: now.toISOString()
    });

    return {
      cooldownUntil: updated.cooldown_until,
      failureCountAfterAttempt: updated.consecutive_failures,
      retryAfterSeconds: updated.cooldown_until
        ? getRetryAfterSeconds(updated.cooldown_until, now)
        : null
    };
  }

  function clear(scopeKey) {
    return options.verificationCooldownModel.clear(scopeKey, options.now().toISOString());
  }

  return {
    clear,
    getActiveCooldown,
    getCooldownDurationMs,
    getRetryAfterSeconds,
    registerFailure
  };
}

module.exports = { createCooldownService };
