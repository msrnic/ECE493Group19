const test = require('node:test');
const assert = require('node:assert/strict');

const { createGradebookController } = require('../../src/controllers/gradebook-controller');
const { createTestContext } = require('../helpers/test-context');

function createResponse() {
  return {
    body: null,
    headers: {},
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
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };
}

test('gradebook controller redirects unauthenticated professor routes and returns summary json states', () => {
  const context = createTestContext();

  try {
    const controller = createGradebookController(context.app.locals.services);

    const pageRes = createResponse();
    controller.getGradeEntryPage({ params: { offeringId: '1' }, session: {} }, pageRes);
    assert.equal(pageRes.redirectedTo, '/login?returnTo=%2Fgrades%2Fofferings%2F1');

    const statusRes = createResponse();
    controller.getSummaryStatus({ params: {}, query: { offeringId: '1' }, session: { accountId: 2 } }, statusRes);
    assert.equal(statusRes.statusCode, 200);
    assert.equal(typeof statusRes.body.distribution, 'object');
  } finally {
    context.cleanup();
  }
});

test('gradebook controller renders entry, validation error, summary page, and export', () => {
  const context = createTestContext();

  try {
    const services = context.app.locals.services;
    const professor = services.accountModel.findByIdentifier('professor@example.com');
    const controller = createGradebookController(services);
    const offeringId = services.gradebookService.getProfessorOfferings(professor.id)[0].id;

    const entryRes = createResponse();
    controller.getGradeEntryPage(
      { params: { offeringId: String(offeringId) }, session: { accountId: professor.id } },
      entryRes
    );
    assert.equal(entryRes.statusCode, 200);
    assert.match(entryRes.body, /Submit Grades/);

    const invalidRes = createResponse();
    controller.postGrades(
      {
        body: { grade_1: 'ZZ', intent: 'submit' },
        params: { offeringId: String(offeringId) },
        session: { accountId: professor.id }
      },
      invalidRes
    );
    assert.equal(invalidRes.statusCode, 400);

    const summaryRes = createResponse();
    controller.getSummaryPage(
      { params: {}, query: { offeringId: String(offeringId) }, session: { accountId: professor.id } },
      summaryRes
    );
    assert.equal(summaryRes.statusCode, 200);
    assert.match(summaryRes.body, /Grade Distribution/);

    const exportRes = createResponse();
    controller.exportSummary(
      { params: { offeringId: String(offeringId) }, session: { accountId: professor.id } },
      exportRes
    );
    assert.equal(exportRes.statusCode, 200);
    assert.equal(exportRes.headers['Content-Type'], 'text/csv; charset=utf-8');
  } finally {
    context.cleanup();
  }
});
