const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');

const { createPasswordChangeService } = require('../../src/services/password-change-service');

async function buildService(overrides = {}) {
  const now = new Date('2026-03-07T12:00:00.000Z');
  const accounts = new Map([
    [1, {
      id: 1,
      email: 'userA@example.com',
      role: 'student',
      username: 'userA',
      password_hash: await bcrypt.hash('CorrectPass!234', 10)
    }],
    [2, {
      id: 2,
      email: 'admin@example.com',
      role: 'admin',
      username: 'adminA',
      password_hash: await bcrypt.hash('AdminPass!234', 10)
    }],
    [3, {
      id: 3,
      email: 'target@example.com',
      role: 'student',
      username: 'target',
      password_hash: await bcrypt.hash('CorrectPass!234', 10)
    }]
  ]);
  const attempts = [];
  const notifications = [];
  const consumedTokens = [];
  const invalidations = [];
  const scopeFailures = new Map();

  const baseOptions = {
    accountModel: {
      findById(accountId) {
        return accounts.get(accountId) || null;
      },
      updatePasswordHash(accountId, passwordHash) {
        const account = accounts.get(accountId);
        account.password_hash = passwordHash;
        return account;
      }
    },
    cooldownService: {
      clear(scopeKey) {
        scopeFailures.set(scopeKey, 0);
        return { consecutive_failures: 0 };
      },
      getActiveCooldown(scopeKey) {
        if (scopeKey === 'self:blocked' || scopeKey === 'reset:digest:blocked') {
          return {
            consecutive_failures: 4,
            cooldown_until: '2026-03-07T12:00:30.000Z',
            retryAfterSeconds: 30
          };
        }

        return null;
      },
      registerFailure(scopeKey) {
        const count = (scopeFailures.get(scopeKey) || 0) + 1;
        scopeFailures.set(scopeKey, count);
        return {
          cooldownUntil: count >= 3 ? '2026-03-07T12:00:30.000Z' : null,
          failureCountAfterAttempt: count,
          retryAfterSeconds: count >= 3 ? 30 : null
        };
      }
    },
    db: {
      transaction(callback) {
        return () => callback();
      }
    },
    notificationService: {
      queuePasswordChanged(targetAccount, details) {
        notifications.push({ details, targetAccount });
      }
    },
    now() {
      return now;
    },
    passwordChangeAttemptModel: {
      recordAttempt(details) {
        attempts.push(details);
      }
    },
    passwordPolicyService: {
      validate(newPassword, options) {
        if (newPassword === 'bad') {
          return { failedRules: ['min_length'], isValid: false };
        }
        if (options?.currentPassword && newPassword === options.currentPassword) {
          return { failedRules: ['different_from_current'], isValid: false };
        }
        return { failedRules: [], isValid: true };
      }
    },
    resetTokenModel: {
      consumeToken(tokenId, consumedAt) {
        consumedTokens.push({ consumedAt, tokenId });
      },
      digestToken(token) {
        return `digest:${token}`;
      },
      findByRawToken(token) {
        if (token === 'valid') {
          return {
            id: 9,
            account_id: 1,
            expires_at: '2026-03-07T13:00:00.000Z',
            consumed_at: null,
            revoked_at: null
          };
        }
        if (token === 'expired') {
          return {
            id: 10,
            account_id: 1,
            expires_at: '2026-03-07T11:00:00.000Z',
            consumed_at: null,
            revoked_at: null
          };
        }
        if (token === 'consumed') {
          return {
            id: 11,
            account_id: 1,
            expires_at: '2026-03-07T13:00:00.000Z',
            consumed_at: '2026-03-07T11:30:00.000Z',
            revoked_at: null
          };
        }
        if (token === 'revoked') {
          return {
            id: 12,
            account_id: 1,
            expires_at: '2026-03-07T13:00:00.000Z',
            consumed_at: null,
            revoked_at: '2026-03-07T11:30:00.000Z'
          };
        }
        if (token === 'missing-target') {
          return {
            id: 13,
            account_id: 99,
            expires_at: '2026-03-07T13:00:00.000Z',
            consumed_at: null,
            revoked_at: null
          };
        }
        return null;
      }
    },
    sessionSecurityService: {
      invalidateAllSessions(accountId) {
        invalidations.push({ accountId, mode: 'all' });
        return 2;
      },
      invalidateOtherSessions(accountId, currentSessionId) {
        invalidations.push({ accountId, currentSessionId, mode: 'other' });
        return 1;
      }
    },
    simulatedFailureIdentifiers: overrides.simulatedFailureIdentifiers || []
  };

  const options = {
    ...baseOptions,
    ...overrides
  };

  const service = createPasswordChangeService(options);
  return { accounts, attempts, consumedTokens, invalidations, notifications, service };
}

test('password change service covers self-service error paths and success', async () => {
  const { attempts, invalidations, notifications, service } = await buildService({
    accountModel: {
      findById(accountId) {
        if (accountId === 'blocked') {
          return {
            id: 'blocked',
            email: 'blocked@example.com',
            role: 'student',
            username: 'blocked',
            password_hash: '$2b$10$QeP0Yw.3LM6bajF05oigWOn9S8mVkg4CSkiqhSSjMBDlNIQP5CK0i'
          };
        }
        return null;
      },
      updatePasswordHash() {
        return true;
      }
    }
  });

  const missing = await service.changeOwnPassword({
    accountId: 999,
    currentPassword: 'CorrectPass!234',
    currentSessionId: 'session-1',
    newPassword: 'NewSecure!234'
  });
  assert.equal(missing.statusCode, 401);

  const blocked = await service.changeOwnPassword({
    accountId: 'blocked',
    currentPassword: 'WrongPass!000',
    currentSessionId: 'session-1',
    newPassword: 'NewSecure!234'
  });
  assert.equal(blocked.statusCode, 429);

  const validService = await buildService();
  const invalid = await validService.service.changeOwnPassword({
    accountId: 1,
    currentPassword: 'WrongPass!000',
    currentSessionId: 'session-1',
    newPassword: 'NewSecure!234'
  });
  assert.equal(invalid.statusCode, 401);
  assert.deepEqual(invalid.recoveryOptions, [
    'Retry with your current password.',
    'Use a reset token if needed.'
  ]);

  const policy = await validService.service.changeOwnPassword({
    accountId: 1,
    currentPassword: 'CorrectPass!234',
    currentSessionId: 'session-1',
    newPassword: 'CorrectPass!234'
  });
  assert.equal(policy.statusCode, 400);
  assert.deepEqual(policy.failedRules, ['different_from_current']);

  const success = await validService.service.changeOwnPassword({
    accountId: 1,
    currentPassword: 'CorrectPass!234',
    currentSessionId: 'session-1',
    newPassword: 'NewSecure!234'
  });
  assert.equal(success.statusCode, 200);
  assert.equal(success.invalidatedSessionCount, 1);
  assert.deepEqual(validService.invalidations, [{ accountId: 1, currentSessionId: 'session-1', mode: 'other' }]);
  assert.equal(validService.notifications.length, 1);
  assert.equal(validService.attempts.some((attempt) => attempt.outcome === 'invalid_verification'), true);
  assert.equal(validService.attempts.some((attempt) => attempt.outcome === 'policy_rejected'), true);
  assert.equal(validService.attempts.some((attempt) => attempt.outcome === 'success'), true);
  assert.equal(attempts.length, 1);
  assert.equal(invalidations.length, 0);
  assert.equal(notifications.length, 0);
});

test('password change service covers reset-token flows including missing target account', async () => {
  const { attempts, consumedTokens, service } = await buildService();

  const blocked = await service.changePasswordWithResetToken({
    resetToken: 'blocked',
    newPassword: 'TokenSecure!234'
  });
  assert.equal(blocked.statusCode, 429);

  const policy = await service.changePasswordWithResetToken({
    resetToken: 'valid',
    newPassword: 'bad'
  });
  assert.equal(policy.statusCode, 400);

  const success = await service.changePasswordWithResetToken({
    resetToken: 'valid',
    newPassword: 'TokenSecure!234'
  });
  assert.equal(success.statusCode, 200);
  assert.equal(consumedTokens.length, 1);

  const expired = await service.changePasswordWithResetToken({
    resetToken: 'expired',
    newPassword: 'TokenSecure!234'
  });
  assert.equal(expired.statusCode, 401);

  const consumed = await service.changePasswordWithResetToken({
    resetToken: 'consumed',
    newPassword: 'TokenSecure!234'
  });
  assert.equal(consumed.statusCode, 401);

  const revoked = await service.changePasswordWithResetToken({
    resetToken: 'revoked',
    newPassword: 'TokenSecure!234'
  });
  assert.equal(revoked.statusCode, 401);

  const missing = await service.changePasswordWithResetToken({
    resetToken: 'missing',
    newPassword: 'TokenSecure!234'
  });
  assert.equal(missing.statusCode, 401);

  const missingTarget = await service.changePasswordWithResetToken({
    resetToken: 'missing-target',
    newPassword: 'TokenSecure!234'
  });
  assert.equal(missingTarget.statusCode, 500);
  assert.equal(attempts.some((attempt) => attempt.outcome === 'system_error'), true);
});

test('password change service covers admin authorization, policy, success, failure, and cancellation', async () => {
  const validService = await buildService();

  const notAdmin = await validService.service.adminChangePassword({
    actorAccountId: 1,
    currentSessionId: 'session-1',
    newPassword: 'AdminSet!234',
    targetAccountId: 3
  });
  assert.equal(notAdmin.statusCode, 403);

  const missingAdmin = await validService.service.adminChangePassword({
    actorAccountId: 999,
    currentSessionId: 'session-1',
    newPassword: 'AdminSet!234',
    targetAccountId: 3
  });
  assert.equal(missingAdmin.statusCode, 403);

  const missingTarget = await validService.service.adminChangePassword({
    actorAccountId: 2,
    currentSessionId: 'session-1',
    newPassword: 'AdminSet!234',
    targetAccountId: 999
  });
  assert.equal(missingTarget.statusCode, 404);

  const policy = await validService.service.adminChangePassword({
    actorAccountId: 2,
    currentSessionId: 'session-1',
    newPassword: 'bad',
    targetAccountId: 3
  });
  assert.equal(policy.statusCode, 400);

  const selfSuccess = await validService.service.adminChangePassword({
    actorAccountId: 2,
    currentSessionId: 'admin-session',
    newPassword: 'AdminSet!234',
    targetAccountId: 2
  });
  assert.equal(selfSuccess.statusCode, 200);
  assert.deepEqual(validService.invalidations.at(-1), {
    accountId: 2,
    currentSessionId: 'admin-session',
    mode: 'other'
  });

  const failingService = await buildService({
    simulatedFailureIdentifiers: ['target@example.com']
  });
  const failedChange = await failingService.service.adminChangePassword({
    actorAccountId: 2,
    currentSessionId: 'session-1',
    newPassword: 'AdminSet!234',
    targetAccountId: 3
  });
  assert.equal(failedChange.statusCode, 500);
  assert.equal(failingService.attempts.some((attempt) => attempt.outcome === 'system_error'), true);

  const cancellation = validService.service.recordCancellation({
    actorAccountId: 1,
    targetAccountId: 1,
    verificationType: 'current_password'
  });
  assert.equal(cancellation.statusCode, 200);
  assert.equal(validService.attempts.some((attempt) => attempt.outcome === 'cancelled'), true);
});

test('password change service preserves explicit request ids and covers non-self admin success', async () => {
  const validService = await buildService();

  const ownSuccess = await validService.service.changeOwnPassword({
    accountId: 1,
    currentPassword: 'CorrectPass!234',
    currentSessionId: 'session-1',
    newPassword: 'RequestScoped!234',
    requestId: 'self-request-id'
  });
  assert.equal(ownSuccess.statusCode, 200);
  assert.equal(
    validService.attempts.find((attempt) => attempt.requestId === 'self-request-id').verificationType,
    'current_password'
  );

  const resetSuccess = await validService.service.changePasswordWithResetToken({
    resetToken: 'valid',
    newPassword: 'ResetScoped!234',
    requestId: 'reset-request-id'
  });
  assert.equal(resetSuccess.statusCode, 200);
  assert.equal(
    validService.attempts.find((attempt) => attempt.requestId === 'reset-request-id').verificationType,
    'reset_token'
  );

  const adminSuccess = await validService.service.adminChangePassword({
    actorAccountId: 2,
    currentSessionId: 'admin-session',
    newPassword: 'AdminScoped!234',
    requestId: 'admin-request-id',
    targetAccountId: 3
  });
  assert.equal(adminSuccess.statusCode, 200);
  assert.deepEqual(validService.invalidations.at(-1), { accountId: 3, mode: 'all' });
  assert.equal(
    validService.attempts.find((attempt) => attempt.requestId === 'admin-request-id').verificationType,
    'admin_override'
  );

  const cancellation = validService.service.recordCancellation({
    actorAccountId: 2,
    requestId: 'cancel-request-id',
    targetAccountId: 3,
    verificationType: 'admin_override'
  });
  assert.equal(cancellation.statusCode, 200);
  assert.equal(
    validService.attempts.find((attempt) => attempt.requestId === 'cancel-request-id').outcome,
    'cancelled'
  );
});

test('password change service treats an omitted current password as a verification failure', async () => {
  const validService = await buildService();

  const result = await validService.service.changeOwnPassword({
    accountId: 1,
    currentSessionId: 'session-1',
    newPassword: 'MissingCurrent!234'
  });

  assert.equal(result.statusCode, 401);
  assert.equal(validService.attempts.at(-1).outcome, 'invalid_verification');
});

test('password change service defaults simulated failure identifiers when the option is omitted', () => {
  const attempts = [];
  const service = createPasswordChangeService({
    now() {
      return new Date('2026-03-07T12:00:00.000Z');
    },
    passwordChangeAttemptModel: {
      recordAttempt(details) {
        attempts.push(details);
      }
    }
  });

  const result = service.recordCancellation({
    actorAccountId: 1,
    targetAccountId: 1,
    verificationType: 'current_password'
  });

  assert.equal(result.statusCode, 200);
  assert.equal(attempts.length, 1);
});
