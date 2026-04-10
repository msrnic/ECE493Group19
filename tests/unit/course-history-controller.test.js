const test = require('node:test');
const assert = require('node:assert/strict');

const { createCourseHistoryController } = require('../../src/controllers/course-history-controller');
const { createTestContext } = require('../helpers/test-context');

function createResponse() {
  return {
    body: null,
    redirectedTo: null,
    statusCode: 200,
    json(payload) {
      this.body = payload;
      return this;
    },
    redirect(location) {
      this.redirectedTo = location;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };
}

test('course history controller redirects unauthenticated page requests and rejects unauthenticated api requests', () => {
  const context = createTestContext();

  try {
    const controller = createCourseHistoryController(context.app.locals.services);

    const pageRes = createResponse();
    controller.getCourseHistoryPage({ params: {}, session: {} }, pageRes);
    assert.equal(pageRes.redirectedTo, '/login?returnTo=%2Facademic%2Fcourse-history');

    const apiRes = createResponse();
    controller.getCourseHistoryApi({ params: { studentId: 'userA' }, session: {} }, apiRes);
    assert.equal(apiRes.statusCode, 401);
    assert.equal(apiRes.body.code, 'auth_required');
  } finally {
    context.cleanup();
  }
});

test('course history controller serves success, unavailable, and denied states', () => {
  const context = createTestContext({
    courseHistoryTestState: { retrievalFailureIdentifiers: ['outage.user@example.com'] }
  });

  try {
    const controller = createCourseHistoryController(context.app.locals.services);
    const userA = context.app.locals.services.accountModel.findByIdentifier('userA@example.com');
    const outage = context.app.locals.services.accountModel.findByIdentifier('outage.user@example.com');
    const professor = context.app.locals.services.accountModel.findByIdentifier('professor@example.com');

    const successRes = createResponse();
    controller.getCourseHistoryApi(
      { params: { studentId: 'userA' }, session: { accountId: userA.id } },
      successRes
    );
    assert.equal(successRes.statusCode, 200);
    assert.equal(successRes.body.state, 'full');

    const unavailableRes = createResponse();
    controller.getCourseHistoryPage(
      { params: {}, session: { accountId: outage.id } },
      unavailableRes
    );
    assert.equal(unavailableRes.statusCode, 503);
    assert.match(unavailableRes.body, /Course history unavailable/);

    const deniedRes = createResponse();
    controller.getCourseHistoryPage(
      { params: { studentId: 'userA' }, session: { accountId: professor.id } },
      deniedRes
    );
    assert.equal(deniedRes.statusCode, 403);
    assert.match(deniedRes.body, /Access denied/);
  } finally {
    context.cleanup();
  }
});
