const test = require('node:test');
const assert = require('node:assert/strict');

const { createForceEnrollService } = require('../../src/services/force-enroll-service');

function createService(overrides = {}) {
  const forceEnrollModel = {
    confirmPendingRequest() {
      return { enrollmentId: 77, requestId: 'request-1' };
    },
    createCompletedRequestAndEnrollment() {
      return { enrollmentId: 44, requestId: 'request-1' };
    },
    createPendingRequest() {
      return { requestId: 'request-1', status: 'pending_confirmation' };
    },
    findRequestById() {
      return {
        initiatedByAccountId: 1,
        offeringId: 5,
        reason: 'Override required for exceptional case.',
        requestId: 'request-1',
        status: 'pending_confirmation',
        studentAccountId: 12
      };
    },
    rejectRequest() {
      return { requestId: 'request-1', status: 'rejected' };
    }
  };

  return createForceEnrollService({
    accountModel: {
      findById(accountId) {
        if (accountId === 1) {
          return { id: 1, role: 'admin', email: 'admin@example.com', username: 'adminA', status: 'active' };
        }

        if (accountId === 12) {
          return { id: 12, role: 'student', email: 'prereq.student@example.com', username: 'prereqStudent', status: 'active' };
        }

        if (accountId === 13) {
          return { id: 13, role: 'student', email: 'disabled.user@example.com', username: 'disabledUser', status: 'disabled' };
        }

        return null;
      },
      findByIdentifier(identifier) {
        if (identifier === 'prereqStudent' || identifier === 'prereq.student@example.com') {
          return { id: 12, role: 'student', email: 'prereq.student@example.com', username: 'prereqStudent', status: 'active' };
        }

        if (identifier === 'disabled.user@example.com') {
          return { id: 13, role: 'student', email: 'disabled.user@example.com', username: 'disabledUser', status: 'disabled' };
        }

        return null;
      }
    },
    enrollmentModel: {
      findOfferingById(offeringId) {
        if (offeringId === 5) {
          return {
            courseCode: 'ECE401',
            id: 5,
            offeringCode: 'O_OPEN',
            seatsRemaining: 12,
            termCode: '2026FALL',
            title: 'Advanced Systems'
          };
        }

        if (offeringId === 6) {
          return {
            courseCode: 'STAT252',
            id: 6,
            offeringCode: 'O_FULL',
            seatsRemaining: 0,
            termCode: '2026FALL',
            title: 'Applied Statistics'
          };
        }

        return null;
      },
      hasEnrollment(accountId, offeringId) {
        return accountId === 12 && offeringId === 99;
      },
      listMatchingOfferings() {
        return [
          { id: 5, courseCode: 'ECE401', title: 'Advanced Systems', offeringCode: 'O_OPEN', seatsRemaining: 12 },
          { id: 6, courseCode: 'STAT252', title: 'Applied Statistics', offeringCode: 'O_FULL', seatsRemaining: 0 }
        ];
      }
    },
    forceEnrollModel,
    forceEnrollTestState: {
      failureIdentifiers: []
    },
    now: overrides.now || (() => new Date('2026-03-07T12:00:00.000Z')),
    ...overrides,
    forceEnrollModel: {
      ...forceEnrollModel,
      ...(overrides.forceEnrollModel || {})
    }
  });
}

test('force-enroll service covers metadata, success, pending confirmation, validation, and failures', () => {
  const service = createService();

  const metadata = service.getFormState(1);
  assert.equal(metadata.statusCode, 200);
  assert.equal(metadata.offerings.length, 2);

  const success = service.createRequest({
    actorAccountId: 1,
    offeringId: 5,
    reason: 'Override required for exceptional case.',
    studentIdentifier: 'prereqStudent'
  });
  assert.equal(success.status, 'completed');
  assert.equal(success.statusCode, 201);
  assert.equal(success.enrollmentId, 44);

  const pending = service.createRequest({
    actorAccountId: 1,
    offeringId: 6,
    reason: 'Override required for exceptional case.',
    studentIdentifier: 'prereq.student@example.com'
  });
  assert.equal(pending.status, 'pending_confirmation');
  assert.equal(pending.requiresOverCapacityConfirmation, true);

  const validation = service.createRequest({
    actorAccountId: 1,
    offeringId: 5,
    reason: 'short',
    studentIdentifier: 'prereqStudent'
  });
  assert.equal(validation.code, 'VALIDATION_ERROR');

  const missingStudent = service.createRequest({
    actorAccountId: 1,
    offeringId: 5,
    reason: 'Override required for exceptional case.',
    studentIdentifier: 'missing-student'
  });
  assert.equal(missingStudent.code, 'STUDENT_NOT_FOUND');

  const missingOffering = service.createRequest({
    actorAccountId: 1,
    offeringId: 404,
    reason: 'Override required for exceptional case.',
    studentIdentifier: 'prereqStudent'
  });
  assert.equal(missingOffering.code, 'OFFERING_NOT_FOUND');

  const hardConstraint = service.createRequest({
    actorAccountId: 1,
    offeringId: 5,
    reason: 'Override required for exceptional case.',
    studentIdentifier: 'disabled.user@example.com'
  });
  assert.equal(hardConstraint.code, 'HARD_CONSTRAINT_FAILED');
});

test('force-enroll service covers duplicate, confirm, cancel, forbidden, and injected failure branches', () => {
  const service = createService({
    enrollmentModel: {
      findOfferingById(offeringId) {
        return {
          courseCode: offeringId === 6 ? 'STAT252' : 'ECE401',
          id: offeringId,
          offeringCode: offeringId === 6 ? 'O_FULL' : 'O_OPEN',
          seatsRemaining: offeringId === 6 ? 0 : 12,
          termCode: '2026FALL',
          title: 'Offering'
        };
      },
      hasEnrollment(accountId, offeringId) {
        return accountId === 12 && offeringId === 5;
      },
      listMatchingOfferings() {
        return [];
      }
    }
  });

  const duplicate = service.createRequest({
    actorAccountId: 1,
    offeringId: 5,
    reason: 'Override required for exceptional case.',
    studentIdentifier: 'prereqStudent'
  });
  assert.equal(duplicate.code, 'DUPLICATE_ENROLLMENT');

  const forbidden = service.getFormState(999);
  assert.equal(forbidden.code, 'FORBIDDEN');

  const canceled = service.confirmRequest({
    actorAccountId: 1,
    confirm: false,
    requestId: 'request-1'
  });
  assert.equal(canceled.status, 'canceled');

  const completed = createService().confirmRequest({
    actorAccountId: 1,
    confirm: true,
    requestId: 'request-1'
  });
  assert.equal(completed.status, 'completed');

  const failure = createService({
    forceEnrollTestState: {
      failureIdentifiers: ['prereq.student@example.com']
    }
  }).createRequest({
    actorAccountId: 1,
    offeringId: 5,
    reason: 'Override required for exceptional case.',
    studentIdentifier: 'prereqStudent'
  });
  assert.equal(failure.code, 'TRANSACTION_FAILED');
});
