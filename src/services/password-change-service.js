const bcrypt = require('bcrypt');

function createPasswordChangeService(options) {
  const simulatedFailureIdentifiers = new Set(
    (options.simulatedFailureIdentifiers || []).map((identifier) => identifier.toLowerCase())
  );

  function buildScopeKey(prefix, scopeValue) {
    return `${prefix}:${scopeValue}`;
  }

  function createRequestId() {
    return `pwd-${options.now().getTime()}`;
  }

  function shouldSimulateFailure(account) {
    return simulatedFailureIdentifiers.has(String(account.email).toLowerCase());
  }

  function recordAttempt(details) {
    options.passwordChangeAttemptModel.recordAttempt({
      actorAccountId: details.actorAccountId,
      targetAccountId: details.targetAccountId,
      verificationType: details.verificationType,
      outcome: details.outcome,
      failureCountAfterAttempt: details.failureCountAfterAttempt,
      cooldownUntil: details.cooldownUntil,
      requestId: details.requestId,
      metadata: details.metadata,
      createdAt: options.now().toISOString()
    });
  }

  function buildPolicyFailure(verificationType, actorAccountId, targetAccountId, failedRules, requestId) {
    recordAttempt({
      actorAccountId,
      targetAccountId,
      verificationType,
      outcome: 'policy_rejected',
      requestId,
      metadata: { failedRules }
    });

    return {
      failedRules,
      message: 'Your new password does not satisfy the password requirements.',
      recoveryOptions: [],
      status: 'error',
      statusCode: 400
    };
  }

  function buildVerificationFailure(details) {
    recordAttempt({
      actorAccountId: details.actorAccountId,
      targetAccountId: details.targetAccountId,
      verificationType: details.verificationType,
      outcome: 'invalid_verification',
      failureCountAfterAttempt: details.failure.failureCountAfterAttempt,
      cooldownUntil: details.failure.cooldownUntil,
      requestId: details.requestId,
      metadata: { recoveryOptions: details.recoveryOptions }
    });

    return {
      message: details.message,
      recoveryOptions: details.recoveryOptions,
      status: 'error',
      statusCode: 401
    };
  }

  function buildCooldownFailure(details) {
    recordAttempt({
      actorAccountId: details.actorAccountId,
      targetAccountId: details.targetAccountId,
      verificationType: details.verificationType,
      outcome: 'cooldown_blocked',
      failureCountAfterAttempt: details.failureCountAfterAttempt,
      cooldownUntil: details.cooldownUntil,
      requestId: details.requestId,
      metadata: { retryAfterSeconds: details.retryAfterSeconds }
    });

    return {
      message: 'Too many verification failures. Try again after the cooldown period.',
      retryAfterSeconds: details.retryAfterSeconds,
      status: 'error',
      statusCode: 429
    };
  }

  function buildSystemFailure(details) {
    recordAttempt({
      actorAccountId: details.actorAccountId,
      targetAccountId: details.targetAccountId,
      verificationType: details.verificationType,
      outcome: 'system_error',
      requestId: details.requestId,
      metadata: { errorMessage: details.error.message }
    });

    return {
      message: 'We could not update the password. Please retry later.',
      status: 'error',
      statusCode: 500
    };
  }

  function buildSuccess(details) {
    recordAttempt({
      actorAccountId: details.actorAccountId,
      targetAccountId: details.targetAccount.id,
      verificationType: details.verificationType,
      outcome: 'success',
      requestId: details.requestId,
      metadata: {
        invalidatedSessionCount: details.invalidatedSessionCount,
        notificationQueued: true
      }
    });

    return {
      invalidatedSessionCount: details.invalidatedSessionCount,
      message: details.message,
      notificationQueued: true,
      status: 'success',
      statusCode: 200
    };
  }

  async function performSuccessfulChange(details) {
    const timestamp = options.now().toISOString();
    const passwordHash = await bcrypt.hash(details.newPassword, 10);

    try {
      const transaction = options.db.transaction(() => {
        if (shouldSimulateFailure(details.targetAccount)) {
          throw new Error('Simulated password update failure');
        }

        options.accountModel.updatePasswordHash(details.targetAccount.id, passwordHash, timestamp);

        const invalidatedSessionCount = details.preserveCurrentSessionId
          ? options.sessionSecurityService.invalidateOtherSessions(
              details.targetAccount.id,
              details.preserveCurrentSessionId
            )
          : options.sessionSecurityService.invalidateAllSessions(details.targetAccount.id);

        if (details.consumeTokenId) {
          options.resetTokenModel.consumeToken(details.consumeTokenId, timestamp);
        }

        options.notificationService.queuePasswordChanged(details.targetAccount, {
          actorAccountId: details.actorAccountId,
          initiatedBy: details.notificationSource
        });

        return invalidatedSessionCount;
      });

      const invalidatedSessionCount = transaction();
      return buildSuccess({
        actorAccountId: details.actorAccountId,
        invalidatedSessionCount,
        message: details.successMessage,
        requestId: details.requestId,
        targetAccount: details.targetAccount,
        verificationType: details.verificationType
      });
    } catch (error) {
      return buildSystemFailure({
        actorAccountId: details.actorAccountId,
        error,
        requestId: details.requestId,
        targetAccountId: details.targetAccount.id,
        verificationType: details.verificationType
      });
    }
  }

  async function changeOwnPassword(details) {
    const requestId = details.requestId || createRequestId();
    const account = options.accountModel.findById(details.accountId);
    if (!account) {
      return {
        message: 'Your session has expired. Please sign in again.',
        recoveryOptions: ['Sign in again.'],
        status: 'error',
        statusCode: 401
      };
    }

    const scopeKey = buildScopeKey('self', account.id);
    const activeCooldown = options.cooldownService.getActiveCooldown(scopeKey);
    if (activeCooldown) {
      return buildCooldownFailure({
        actorAccountId: account.id,
        cooldownUntil: activeCooldown.cooldown_until,
        failureCountAfterAttempt: activeCooldown.consecutive_failures,
        requestId,
        retryAfterSeconds: activeCooldown.retryAfterSeconds,
        targetAccountId: account.id,
        verificationType: 'current_password'
      });
    }

    const passwordMatches = await bcrypt.compare(String(details.currentPassword || ''), account.password_hash);
    if (!passwordMatches) {
      const failure = options.cooldownService.registerFailure(scopeKey);
      return buildVerificationFailure({
        actorAccountId: account.id,
        failure,
        message: 'Current password verification failed. Retry or restart account recovery.',
        recoveryOptions: ['Retry with your current password.', 'Use a reset token if needed.'],
        requestId,
        targetAccountId: account.id,
        verificationType: 'current_password'
      });
    }

    options.cooldownService.clear(scopeKey);
    const policyResult = options.passwordPolicyService.validate(details.newPassword, {
      currentPassword: details.currentPassword
    });
    if (!policyResult.isValid) {
      return buildPolicyFailure(
        'current_password',
        account.id,
        account.id,
        policyResult.failedRules,
        requestId
      );
    }

    return performSuccessfulChange({
      actorAccountId: account.id,
      newPassword: details.newPassword,
      notificationSource: 'self_service',
      preserveCurrentSessionId: details.currentSessionId,
      requestId,
      successMessage: 'Password changed successfully.',
      targetAccount: account,
      verificationType: 'current_password'
    });
  }

  async function changePasswordWithResetToken(details) {
    const requestId = details.requestId || createRequestId();
    const scopeKey = buildScopeKey('reset', options.resetTokenModel.digestToken(details.resetToken));
    const activeCooldown = options.cooldownService.getActiveCooldown(scopeKey);
    if (activeCooldown) {
      return buildCooldownFailure({
        actorAccountId: null,
        cooldownUntil: activeCooldown.cooldown_until,
        failureCountAfterAttempt: activeCooldown.consecutive_failures,
        requestId,
        retryAfterSeconds: activeCooldown.retryAfterSeconds,
        targetAccountId: null,
        verificationType: 'reset_token'
      });
    }

    const tokenRecord = options.resetTokenModel.findByRawToken(details.resetToken);
    const now = options.now();
    const tokenExpired = tokenRecord && new Date(tokenRecord.expires_at).getTime() <= now.getTime();
    const tokenInvalid = !tokenRecord || tokenRecord.consumed_at || tokenRecord.revoked_at || tokenExpired;
    if (tokenInvalid) {
      const failure = options.cooldownService.registerFailure(scopeKey);
      return buildVerificationFailure({
        actorAccountId: null,
        failure,
        message: 'Reset token verification failed. Request a fresh recovery link.',
        recoveryOptions: ['Request a new reset token.', 'Contact support if recovery keeps failing.'],
        requestId,
        targetAccountId: tokenRecord ? tokenRecord.account_id : null,
        verificationType: 'reset_token'
      });
    }

    options.cooldownService.clear(scopeKey);
    const targetAccount = options.accountModel.findById(tokenRecord.account_id);
    if (!targetAccount) {
      return buildSystemFailure({
        actorAccountId: null,
        error: new Error('Reset token target account is missing'),
        requestId,
        targetAccountId: tokenRecord.account_id,
        verificationType: 'reset_token'
      });
    }

    const policyResult = options.passwordPolicyService.validate(details.newPassword);
    if (!policyResult.isValid) {
      return buildPolicyFailure(
        'reset_token',
        null,
        tokenRecord.account_id,
        policyResult.failedRules,
        requestId
      );
    }

    return performSuccessfulChange({
      actorAccountId: null,
      consumeTokenId: tokenRecord.id,
      newPassword: details.newPassword,
      notificationSource: 'reset_token',
      requestId,
      successMessage: 'Password reset completed successfully.',
      targetAccount,
      verificationType: 'reset_token'
    });
  }

  async function adminChangePassword(details) {
    const requestId = details.requestId || createRequestId();
    const actorAccount = options.accountModel.findById(details.actorAccountId);
    if (!actorAccount || actorAccount.role !== 'admin') {
      return {
        message: 'Administrative authorization is required for this action.',
        status: 'error',
        statusCode: 403
      };
    }

    const targetAccount = options.accountModel.findById(details.targetAccountId);
    if (!targetAccount) {
      return {
        message: 'Target account was not found.',
        status: 'error',
        statusCode: 404
      };
    }

    const policyResult = options.passwordPolicyService.validate(details.newPassword);
    if (!policyResult.isValid) {
      return buildPolicyFailure(
        'admin_override',
        actorAccount.id,
        targetAccount.id,
        policyResult.failedRules,
        requestId
      );
    }

    const preserveCurrentSessionId = actorAccount.id === targetAccount.id
      ? details.currentSessionId
      : null;

    return performSuccessfulChange({
      actorAccountId: actorAccount.id,
      newPassword: details.newPassword,
      notificationSource: 'admin_override',
      preserveCurrentSessionId,
      requestId,
      successMessage: 'Password changed for the selected account.',
      targetAccount,
      verificationType: 'admin_override'
    });
  }

  function recordCancellation(details) {
    recordAttempt({
      actorAccountId: details.actorAccountId,
      targetAccountId: details.targetAccountId,
      verificationType: details.verificationType,
      outcome: 'cancelled',
      requestId: details.requestId || createRequestId(),
      metadata: {}
    });

    return {
      message: 'Password change cancelled. No updates were saved.',
      status: 'success',
      statusCode: 200
    };
  }

  return {
    adminChangePassword,
    changeOwnPassword,
    changePasswordWithResetToken,
    recordCancellation
  };
}

module.exports = { createPasswordChangeService };
