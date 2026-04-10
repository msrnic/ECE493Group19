const test = require('node:test');
const assert = require('node:assert/strict');

const { createDeadlinePolicyService } = require('../../src/services/deadline-policy-service');

function createService(overrides = {}) {
  return createDeadlinePolicyService({
    deadlineRuleModel: {
      findRuleByTerm(termCode) {
        return termCode === '2026FALL'
          ? {
              deadlineAt: '2026-09-15T23:59:59.000Z',
              termCode: '2026FALL',
              timezoneName: 'America/Edmonton'
            }
          : null;
      },
      listTerms() {
        return ['2026FALL'];
      },
      ...(overrides.deadlineRuleModel || {})
    },
    deadlineTestState: {
      failureIdentifiers: [],
      ...(overrides.deadlineTestState || {})
    },
    enrollmentModel: {
      listCurrentSchedule() {
        return [{ termCode: '2026FALL' }];
      },
      ...(overrides.enrollmentModel || {})
    },
    now: overrides.now || (() => new Date('2026-03-07T12:00:00.000Z'))
  });
}

test('deadline policy service allows drop before the configured deadline', () => {
  const payload = createService().getDropDeadlinePageData({
    accountId: 1,
    email: 'userA@example.com',
    studentId: 'userA'
  });

  assert.equal(payload.state, 'allowed');
  assert.equal(payload.actionState, 'allowed');
  assert.match(payload.message, /currently allowed/);
  assert.equal(payload.termCode, '2026FALL');
});

test('deadline policy service blocks drop at or after the deadline and on missing rules', () => {
  const blocked = createService({
    now: () => new Date('2026-09-15T23:59:59.000Z')
  }).evaluateDropAttempt({
    accountId: 1,
    email: 'userA@example.com',
    studentId: 'userA'
  });

  assert.equal(blocked.state, 'blocked');
  assert.equal(blocked.actionState, 'blocked');
  assert.match(blocked.attemptMessage, /cannot proceed after the published deadline/);

  const missingRule = createService({
    deadlineRuleModel: {
      findRuleByTerm() {
        return null;
      },
      listTerms() {
        return ['2026FALL'];
      }
    }
  }).getDropDeadlinePageData({
    accountId: 1,
    email: 'userA@example.com',
    studentId: 'userA'
  });

  assert.equal(missingRule.state, 'error');
  assert.match(missingRule.message, /cannot confirm add\/drop deadline information/i);
});

test('deadline policy service fails safe on fault injection and falls back to first known term', () => {
  const payload = createService({
    deadlineTestState: {
      failureIdentifiers: ['student-001']
    },
    enrollmentModel: {
      listCurrentSchedule() {
        return [];
      }
    }
  }).evaluateDropAttempt({
    accountId: 1,
    email: 'safe@example.com',
    studentId: 'student-001'
  });

  assert.equal(payload.state, 'error');
  assert.equal(payload.termCode, '2026FALL');
  assert.match(payload.attemptMessage, /remains blocked until deadline information can be confirmed/);
});
