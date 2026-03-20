const test = require('node:test');
const assert = require('node:assert/strict');

const { createLockoutService } = require('../../src/services/lockout-service');

test('lockout service resets stale failure windows and computes the next count', () => {
  const referenceTime = new Date('2026-03-07T12:00:00.000Z');
  const service = createLockoutService({ now: () => referenceTime });

  assert.equal(
    service.getNextFailureCount(
      {
        failed_attempt_count: 4,
        last_failed_at: '2026-03-07T11:40:00.000Z'
      },
      referenceTime
    ),
    1
  );
  assert.equal(service.getWindowStart(referenceTime).toISOString(), '2026-03-07T11:45:00.000Z');
});

test('lockout service detects active locks, expired locks, and false-path evaluations', () => {
  const referenceTime = new Date('2026-03-07T12:00:00.000Z');
  const service = createLockoutService({ now: () => referenceTime });

  assert.equal(
    service.hasActiveLock(
      {
        status: 'locked',
        locked_until: '2026-03-07T12:05:00.000Z'
      },
      referenceTime
    ),
    true
  );
  assert.equal(service.hasActiveLock({ status: 'active', locked_until: null }, referenceTime), false);

  assert.equal(
    service.shouldClearExpiredLock(
      {
        status: 'locked',
        locked_until: '2026-03-07T11:59:00.000Z'
      },
      referenceTime
    ),
    true
  );
  assert.equal(
    service.shouldClearExpiredLock(
      {
        status: 'active',
        locked_until: '2026-03-07T12:10:00.000Z'
      },
      referenceTime
    ),
    false
  );

  assert.equal(
    service.shouldResetFailureWindow(
      {
        failed_attempt_count: 2,
        last_failed_at: '2026-03-07T11:59:00.000Z'
      },
      referenceTime
    ),
    false
  );

  assert.equal(service.shouldLockAfterFailure(5), true);
  assert.equal(service.shouldLockAfterFailure(4), false);
});


test('lockout service supports default time evaluation paths', () => {
  const service = createLockoutService();
  const lockedUntil = service.getLockedUntil();

  assert.equal(typeof lockedUntil, 'string');
  assert.equal(service.hasActiveLock({ status: 'locked', locked_until: null }), false);
  assert.equal(service.shouldResetFailureWindow({ last_failed_at: null }), true);
});
