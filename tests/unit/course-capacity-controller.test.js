const test = require('node:test');
const assert = require('node:assert/strict');

const { createCourseCapacityController } = require('../../src/controllers/course-capacity-controller');

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
  return createCourseCapacityController({
    courseCapacityService: {
      getOfferingState() {
        return {
          offering: {
            capacity: 30,
            courseCode: 'ECE493',
            currentEnrollment: 14,
            id: 8,
            offeringCode: 'O_CONFLICT',
            remainingSeats: 6,
            sectionCode: 'G1',
            termCode: '2026FALL',
            title: 'Embedded Systems',
            version: 1
          },
          statusCode: 200
        };
      },
      submitCapacityUpdate() {
        return {
          capacity: 28,
          currentEnrollment: 14,
          message: 'Course capacity updated successfully. Capacity is now 28 with 14 remaining seats.',
          outcome: 'success',
          remainingSeats: 14,
          requestId: 'capacity_1',
          statusCode: 200,
          version: 2
        };
      }
    },
    ...overrides
  });
}

test('course capacity controller renders page and handles success/error html and json responses', () => {
  const controller = createController();

  const getRes = createResponse();
  controller.getCapacityPage({
    get() { return 'text/html'; },
    is() { return false; },
    params: { offeringId: '8' },
    session: { accountId: 1 }
  }, getRes);
  assert.match(getRes.body, /Edit Course Capacity/);

  const postRes = createResponse();
  controller.postCapacityUpdate({
    body: { proposedCapacity: '28', submittedVersion: '1' },
    get() { return 'text/html'; },
    is() { return false; },
    params: { offeringId: '8' },
    session: { accountId: 1 }
  }, postRes);
  assert.match(postRes.body, /Course capacity updated successfully/);

  const jsonRes = createResponse();
  controller.postCapacityUpdate({
    body: { proposedCapacity: '28', submittedVersion: '1' },
    get() { return 'application/json'; },
    is() { return 'application/json'; },
    params: { offeringId: '8' },
    session: { accountId: 1 }
  }, jsonRes);
  assert.equal(jsonRes.jsonBody.outcome, 'success');

  const errorController = createController({
    courseCapacityService: {
      getOfferingState() {
        return {
          offering: {
            capacity: 30,
            courseCode: 'ECE493',
            currentEnrollment: 14,
            id: 8,
            offeringCode: 'O_CONFLICT',
            remainingSeats: 6,
            sectionCode: 'G1',
            termCode: '2026FALL',
            title: 'Embedded Systems',
            version: 1
          },
          statusCode: 200
        };
      },
      submitCapacityUpdate() {
        return {
          code: 'OVERRIDE_REQUIRED',
          details: { overrideReason: 'Provide a reason.' },
          message: 'A below-enrollment override is required before this capacity can be saved.',
          currentEnrollment: 14,
          outcome: 'rejected',
          remainingSeats: 6,
          statusCode: 200
        };
      }
    }
  });
  const errorRes = createResponse();
  errorController.postCapacityUpdate({
    body: { proposedCapacity: '10', submittedVersion: '1' },
    get() { return 'text/html'; },
    is() { return false; },
    params: { offeringId: '8' },
    session: { accountId: 1 }
  }, errorRes);
  assert.match(errorRes.body, /override is required/i);
});
