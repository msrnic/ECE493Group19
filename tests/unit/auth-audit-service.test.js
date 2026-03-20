const test = require('node:test');
const assert = require('node:assert/strict');

const loginOutcomes = require('../../src/services/login-outcomes');
const { createAuthAuditService } = require('../../src/services/auth-audit-service');

test('auth audit service records both failure and success outcomes', () => {
  const attempts = [];
  const service = createAuthAuditService(
    {
      recordAttempt(details) {
        attempts.push(details);
      }
    },
    () => new Date('2026-03-07T12:00:00.000Z')
  );

  service.recordFailure({
    accountId: 1,
    identifier: 'userA@example.com',
    outcome: loginOutcomes.SERVICE_UNAVAILABLE,
    sourceIp: '127.0.0.1',
    userAgent: 'test'
  });
  service.recordSuccess({
    accountId: 1,
    identifier: 'userA@example.com',
    sourceIp: '127.0.0.1',
    userAgent: 'test'
  });

  assert.equal(attempts.length, 2);
  assert.equal(attempts[0].outcome, loginOutcomes.SERVICE_UNAVAILABLE);
  assert.equal(attempts[1].outcome, loginOutcomes.SUCCESS);
});
