const test = require('node:test');
const assert = require('node:assert/strict');

const { createOfferingAdminController } = require('../../src/controllers/offering-admin-controller');

function createResponse() {
  return {
    body: '',
    jsonBody: null,
    statusCode: 200,
    json(payload) {
      this.jsonBody = payload;
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

function createController(overrides = {}) {
  return createOfferingAdminController({
    offeringAdminService: {
      createOffering() {
        return { message: 'Offering created successfully.', pendingAudit: false, statusCode: 201 };
      },
      deleteOffering() {
        return { message: 'Offering deleted successfully.', pendingAudit: false, statusCode: 200 };
      },
      getFormState() {
        return {
          instructors: [{ id: 2, label: 'professorA' }],
          offerings: [{ id: 6, courseCode: 'ECE493', title: 'Capstone', offeringCode: 'O_EMPTY', termCode: '2026FALL', sectionCode: 'E1', instructorLabel: 'professorA' }],
          statusCode: 200
        };
      }
    },
    ...overrides
  });
}

test('offering admin controller renders the page and handles create/delete/cancel paths', () => {
  const controller = createController();

  const pageRes = createResponse();
  controller.getOfferingPage({ session: { accountId: 1 } }, pageRes);
  assert.equal(pageRes.statusCode, 200);
  assert.match(pageRes.body, /Course Offerings Administration/);

  const createRes = createResponse();
  controller.postCreateOffering({
    body: { courseCode: 'ECE499', title: 'Special Topics', termCode: '2026FALL', sectionCode: 'A1', instructorAccountId: '2', capacity: '30', meetingDays: 'Mon,Wed', scheduleStartTime: '09:00', scheduleEndTime: '10:00' },
    get() { return 'text/html'; },
    is() { return false; },
    session: { accountId: 1 }
  }, createRes);
  assert.equal(createRes.statusCode, 200);
  assert.match(createRes.body, /Offering created successfully/);

  const deleteRes = createResponse();
  controller.postDeleteOffering({
    body: { confirmDelete: true },
    get() { return 'text/html'; },
    is() { return false; },
    params: { offeringId: '6' },
    session: { accountId: 1 }
  }, deleteRes);
  assert.equal(deleteRes.statusCode, 200);
  assert.match(deleteRes.body, /Offering deleted successfully/);

  const cancelRes = createResponse();
  controller.postDeleteOffering({
    body: { action: 'cancel' },
    get() { return 'text/html'; },
    is() { return false; },
    params: { offeringId: '6' },
    session: { accountId: 1 }
  }, cancelRes);
  assert.match(cancelRes.body, /Offering deletion was canceled/);
});
