const test = require('node:test');
const assert = require('node:assert/strict');

const { createAuthService } = require('../../src/services/auth-service');

test('auth service handles omitted unavailableIdentifiers configuration', async () => {
  const failures = [];
  const service = createAuthService({
    accountModel: {
      findByIdentifier() {
        return null;
      }
    },
    sessionModel: {
      createSession() {
        throw new Error('session should not be created');
      }
    },
    authAuditService: {
      recordFailure(details) {
        failures.push(details);
      },
      recordSuccess() {
        throw new Error('success should not be recorded');
      }
    },
    lockoutService: {
      shouldClearExpiredLock() {
        return false;
      },
      hasActiveLock() {
        return false;
      },
      getNextFailureCount() {
        return 1;
      },
      shouldLockAfterFailure() {
        return false;
      },
      getLockedUntil() {
        return null;
      }
    },
    now() {
      return new Date('2026-03-07T12:00:00.000Z');
    }
  });

  const result = await service.authenticate({
    identifier: 'missing@example.com',
    password: 'WrongPass!000',
    sessionId: 'unused',
    expiresAt: '2026-03-07T13:00:00.000Z'
  });

  assert.equal(result.outcome, 'invalid_credentials');
  assert.equal(failures.length, 1);
});
