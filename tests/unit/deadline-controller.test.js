const test = require('node:test');
const assert = require('node:assert/strict');

const { createDeadlineController } = require('../../src/controllers/deadline-controller');

function createResponseRecorder() {
  return {
    body: '',
    redirectedTo: null,
    statusCode: 200,
    redirect(value) {
      this.redirectedTo = value;
      return this;
    },
    send(value) {
      this.body = value;
      return this;
    },
    status(value) {
      this.statusCode = value;
      return this;
    }
  };
}

function createServices(overrides = {}) {
  return {
    deadlinePolicyService: {
      evaluateDropAttempt() {
        return {
          actionState: 'allowed',
          attemptMessage: 'Drop action may proceed before the published deadline.',
          deadlineLabel: 'Sep 15, 2026, 5:59 p.m.',
          message: 'Drop action is currently allowed before the published deadline.',
          state: 'allowed',
          statusLabel: 'Drop allowed',
          termCode: '2026FALL',
          timezoneName: 'America/Edmonton'
        };
      },
      getDropDeadlinePageData() {
        return {
          actionState: 'allowed',
          deadlineLabel: 'Sep 15, 2026, 5:59 p.m.',
          message: 'Drop action is currently allowed before the published deadline.',
          state: 'allowed',
          statusLabel: 'Drop allowed',
          termCode: '2026FALL',
          timezoneName: 'America/Edmonton'
        };
      }
    },
    studentAccountModel: {
      findActiveByAccountId(accountId) {
        return accountId === 1 ? { accountId: 1 } : null;
      }
    },
    ...overrides
  };
}

test('deadline controller redirects unauthenticated students and renders allowed, blocked, and error states', () => {
  const controller = createDeadlineController(createServices());

  const redirectResponse = createResponseRecorder();
  controller.getDropDeadlinePage({ session: {} }, redirectResponse);
  assert.equal(redirectResponse.redirectedTo, '/login?returnTo=%2Fdeadlines%2Fdrop');

  const allowedResponse = createResponseRecorder();
  controller.getDropDeadlinePage({ session: { accountId: 1 } }, allowedResponse);
  assert.equal(allowedResponse.statusCode, 200);
  assert.match(allowedResponse.body, /Add\/Drop Deadlines/);
  assert.match(allowedResponse.body, /Drop action is currently allowed/);

  const blockedController = createDeadlineController(createServices({
    deadlinePolicyService: {
      evaluateDropAttempt() {
        return {
          actionState: 'blocked',
          attemptMessage: 'Drop action cannot proceed after the published deadline.',
          deadlineLabel: 'Sep 15, 2026, 5:59 p.m.',
          message: 'Drop action is blocked because the published deadline has passed.',
          state: 'blocked',
          statusLabel: 'Deadline passed',
          termCode: '2026FALL',
          timezoneName: 'America/Edmonton'
        };
      },
      getDropDeadlinePageData() {
        return {
          actionState: 'error',
          message: 'We cannot confirm add/drop deadline information right now. Please retry later.',
          state: 'error',
          statusLabel: 'Deadline unavailable',
          termCode: '2026FALL'
        };
      }
    }
  }));

  const errorResponse = createResponseRecorder();
  blockedController.getDropDeadlinePage({ session: { accountId: 1 } }, errorResponse);
  assert.equal(errorResponse.statusCode, 503);
  assert.match(errorResponse.body, /cannot confirm add\/drop deadline information/i);

  const blockedResponse = createResponseRecorder();
  blockedController.postDropDeadlineEvaluation({ session: { accountId: 1 } }, blockedResponse);
  assert.equal(blockedResponse.statusCode, 200);
  assert.match(blockedResponse.body, /Drop action cannot proceed after the published deadline/);
});
