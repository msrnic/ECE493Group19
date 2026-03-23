const test = require('node:test');
const assert = require('node:assert/strict');

const { createCooldownService } = require('../../src/services/cooldown-service');

test('cooldown service tracks escalation, active blocks, and clears state', () => {
  const states = new Map();
  const nowState = { value: new Date('2026-03-07T12:00:00.000Z') };
  const service = createCooldownService({
    now() {
      return nowState.value;
    },
    verificationCooldownModel: {
      clear(scopeKey, updatedAt) {
        states.set(scopeKey, {
          scope_key: scopeKey,
          consecutive_failures: 0,
          cooldown_until: null,
          last_failure_at: null,
          updated_at: updatedAt
        });
        return states.get(scopeKey);
      },
      findByScopeKey(scopeKey) {
        return states.get(scopeKey) || null;
      },
      saveState(scopeKey, state) {
        states.set(scopeKey, {
          scope_key: scopeKey,
          consecutive_failures: state.consecutiveFailures,
          cooldown_until: state.cooldownUntil,
          last_failure_at: state.lastFailureAt,
          updated_at: state.updatedAt
        });
        return states.get(scopeKey);
      }
    }
  });

  assert.equal(service.getCooldownDurationMs(2), 0);
  assert.equal(service.getCooldownDurationMs(3), 30000);
  assert.equal(service.getCooldownDurationMs(10), 900000);
  assert.equal(service.getActiveCooldown('missing'), null);

  const first = service.registerFailure('self:1');
  assert.equal(first.failureCountAfterAttempt, 1);
  assert.equal(first.cooldownUntil, null);

  service.registerFailure('self:1');
  const third = service.registerFailure('self:1');
  assert.equal(third.failureCountAfterAttempt, 3);
  assert.equal(third.retryAfterSeconds, 30);
  assert.equal(service.getActiveCooldown('self:1').retryAfterSeconds, 30);

  nowState.value = new Date('2026-03-07T12:00:31.000Z');
  assert.equal(service.getActiveCooldown('self:1'), null);
  assert.equal(service.getRetryAfterSeconds('2026-03-07T12:00:31.400Z', nowState.value), 1);

  const cleared = service.clear('self:1');
  assert.equal(cleared.consecutive_failures, 0);
});
