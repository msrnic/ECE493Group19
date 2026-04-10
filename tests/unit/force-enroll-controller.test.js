const test = require('node:test');
const assert = require('node:assert/strict');

const { createForceEnrollController } = require('../../src/controllers/force-enroll-controller');

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
  return createForceEnrollController({
    forceEnrollService: {
      confirmRequest() {
        return {
          message: 'Forced enrollment completed successfully.',
          offering: { courseCode: 'STAT252', offeringCode: 'O_FULL', title: 'Applied Statistics' },
          requestId: 'request-1',
          status: 'completed',
          statusCode: 200,
          student: { email: 'prereq.student@example.com', studentId: 'prereqStudent' }
        };
      },
      createRequest() {
        return {
          enrollmentId: 12,
          message: 'Forced enrollment completed successfully.',
          offering: { courseCode: 'ECE401', offeringCode: 'O_OPEN', title: 'Advanced Systems' },
          requestId: 'request-2',
          status: 'completed',
          statusCode: 201,
          student: { email: 'prereq.student@example.com', studentId: 'prereqStudent' }
        };
      },
      getFormState() {
        return {
          offerings: [
            { id: 5, courseCode: 'ECE401', title: 'Advanced Systems', offeringCode: 'O_OPEN', seatsRemaining: 12 }
          ],
          statusCode: 200
        };
      },
      getRequestStatus() {
        return {
          requestId: 'request-1',
          status: 'pending_confirmation',
          statusCode: 200
        };
      }
    },
    ...overrides
  });
}

test('force-enroll controller renders form, handles html validation, success, confirmation, and json status', () => {
  const controller = createController();

  const pageRes = createResponse();
  controller.getForceEnrollPage({ session: { accountId: 1 } }, pageRes);
  assert.equal(pageRes.statusCode, 200);
  assert.match(pageRes.body, /Force Enroll Student/);

  const validationRes = createResponse();
  controller.postForceEnroll(
    {
      body: { studentIdentifier: '', offeringId: '', reason: '' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1 }
    },
    validationRes
  );
  assert.equal(validationRes.statusCode, 400);
  assert.match(validationRes.body, /Please correct the highlighted fields\./);

  const successRes = createResponse();
  controller.postForceEnroll(
    {
      body: {
        studentIdentifier: 'prereqStudent',
        offeringId: '5',
        reason: 'Override required for exceptional case.'
      },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1 }
    },
    successRes
  );
  assert.equal(successRes.statusCode, 200);
  assert.match(successRes.body, /prereqStudent was force enrolled successfully/);

  const confirmRes = createResponse();
  controller.postConfirmForceEnroll(
    {
      body: { action: 'confirm' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      params: { requestId: 'request-1' },
      session: { accountId: 1 }
    },
    confirmRes
  );
  assert.equal(confirmRes.statusCode, 200);
  assert.match(confirmRes.body, /over-capacity override was confirmed/i);

  const statusRes = createResponse();
  controller.getRequestStatus(
    {
      get() {
        return 'application/json';
      },
      headers: { accept: 'application/json' },
      is(type) {
        return type === 'application/json';
      },
      params: { requestId: 'request-1' },
      session: { accountId: 1 }
    },
    statusRes
  );
  assert.equal(statusRes.statusCode, 200);
  assert.equal(statusRes.jsonBody.requestId, 'request-1');
});

test('force-enroll controller returns json and html errors for service failures', () => {
  const controller = createController({
    forceEnrollService: {
      confirmRequest() {
        return {
          code: 'CONFIRMATION_NOT_ALLOWED',
          message: 'Only the initiating administrator can confirm.',
          statusCode: 403
        };
      },
      createRequest() {
        return {
          code: 'STUDENT_NOT_FOUND',
          message: 'Student was not found.',
          statusCode: 404
        };
      },
      getFormState() {
        return {
          offerings: [],
          statusCode: 200
        };
      },
      getRequestStatus() {
        return {
          code: 'REQUEST_NOT_FOUND',
          message: 'Force-enroll request was not found.',
          statusCode: 404
        };
      }
    }
  });

  const htmlErrorRes = createResponse();
  controller.postForceEnroll(
    {
      body: {
        studentIdentifier: 'missing',
        offeringId: '5',
        reason: 'Override required for exceptional case.'
      },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1 }
    },
    htmlErrorRes
  );
  assert.equal(htmlErrorRes.statusCode, 404);
  assert.match(htmlErrorRes.body, /Student was not found/);

  const jsonErrorRes = createResponse();
  controller.getRequestStatus(
    {
      get() {
        return 'application/json';
      },
      headers: { accept: 'application/json' },
      is(type) {
        return type === 'application/json';
      },
      params: { requestId: 'missing-request' },
      session: { accountId: 1 }
    },
    jsonErrorRes
  );
  assert.equal(jsonErrorRes.statusCode, 404);
  assert.equal(jsonErrorRes.jsonBody.code, 'REQUEST_NOT_FOUND');
});
