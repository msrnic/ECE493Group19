const test = require('node:test');
const assert = require('node:assert/strict');

const { createEnrollmentController } = require('../../src/controllers/enrollment-controller');

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
    enrollmentModel: {
      listCurrentSchedule() {
        return [];
      },
      listMatchingOfferings() {
        return [];
      }
    },
    enrollmentService: {
      enrollStudent() {
        return { message: 'Class offering was not found.', status: 'not_found' };
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

test('enrollment controller redirects unauthenticated requests and renders empty search results', () => {
  const controller = createEnrollmentController(createServices());

  const redirectResponse = createResponseRecorder();
  controller.postEnrollment({ body: {}, session: {} }, redirectResponse);
  assert.equal(redirectResponse.redirectedTo, '/login?returnTo=%2Fenrollment');

  const emptyResponse = createResponseRecorder();
  controller.getEnrollmentPage({ query: { q: 'missing' }, session: { accountId: 1 } }, emptyResponse);
  assert.equal(emptyResponse.statusCode, 200);
  assert.match(emptyResponse.body, /No class offerings found/);
  assert.match(emptyResponse.body, /No enrolled classes yet\./);
});
