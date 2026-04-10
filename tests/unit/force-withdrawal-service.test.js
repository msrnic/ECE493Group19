const test = require('node:test');
const assert = require('node:assert/strict');

const { createForceWithdrawalService } = require('../../src/services/force-withdrawal-service');

function createService(overrides = {}) {
  const forceWithdrawalModel = {
    createAction() {
      return { actionId: 'action-1' };
    },
    findActionById() {
      return { actionId: 'action-1', status: 'completed' };
    },
    listPendingAudit() {
      return [{ actionId: 'action-2', retryCount: 0 }];
    },
    logAudit() {},
    markPendingAudit() {},
    markStatus() {}
  };

  return createForceWithdrawalService({
    accountModel: {
      findById(accountId) {
        if (accountId === 1) {
          return { id: 1, role: 'admin', email: 'admin@example.com', username: 'adminA' };
        }

        if (accountId === 7) {
          return { id: 7, role: 'student', email: 'conflict.student@example.com', username: 'conflictStudent' };
        }

        return null;
      },
      findByIdentifier(identifier) {
        if (identifier === 'conflictStudent' || identifier === 'conflict.student@example.com') {
          return { id: 7, role: 'student', email: 'conflict.student@example.com', username: 'conflictStudent' };
        }

        return null;
      }
    },
    enrollmentModel: {
      createWithdrawal() {
        return true;
      },
      findOfferingById(offeringId) {
        if (offeringId === 8) {
          return {
            courseCode: 'ECE320',
            feeChangeCents: 41000,
            id: 8,
            offeringCode: 'O_CONFLICT',
            offeringStatus: 'open',
            title: 'Embedded Systems'
          };
        }

        if (offeringId === 9) {
          return {
            courseCode: 'ECE320',
            feeChangeCents: 41000,
            id: 9,
            offeringCode: 'O_ARCHIVE',
            offeringStatus: 'archived',
            title: 'Embedded Systems'
          };
        }

        return null;
      },
      hasEnrollment(accountId, offeringId) {
        return accountId === 7 && offeringId === 8;
      },
      listMatchingOfferings() {
        return [{ id: 8, courseCode: 'ECE320', title: 'Embedded Systems', offeringCode: 'O_CONFLICT' }];
      }
    },
    forceWithdrawalModel,
    forceWithdrawalTestState: {
      auditFailureIdentifiers: [],
      failureIdentifiers: []
    },
    now: overrides.now || (() => new Date('2026-03-07T12:00:00.000Z')),
    ...overrides,
    forceWithdrawalModel: {
      ...forceWithdrawalModel,
      ...(overrides.forceWithdrawalModel || {})
    }
  });
}

test('force-withdrawal service covers metadata, implications, success, pending audit, and status lookup', () => {
  const service = createService();

  const metadata = service.getFormState(1);
  assert.equal(metadata.statusCode, 200);
  assert.equal(metadata.offerings.length, 1);

  const implications = service.getImplications(1, 'conflictStudent', 8);
  assert.equal(implications.status, 'ready');
  assert.match(implications.implications.transcriptImpact, /W notation/);

  const success = service.processWithdrawal({
    actorAccountId: 1,
    offeringId: 8,
    reason: 'Administrative removal after enrollment review.',
    studentIdentifier: 'conflictStudent'
  });
  assert.equal(success.status, 'completed');
  assert.equal(success.pendingAudit, false);

  const pending = createService({
    forceWithdrawalTestState: {
      auditFailureIdentifiers: ['conflict.student@example.com'],
      failureIdentifiers: []
    }
  }).processWithdrawal({
    actorAccountId: 1,
    offeringId: 8,
    reason: 'Administrative removal after enrollment review.',
    studentIdentifier: 'conflictStudent'
  });
  assert.equal(pending.status, 'pending_audit');

  const status = service.getActionStatus(1, 'action-1');
  assert.equal(status.statusCode, 200);
  assert.equal(status.actionId, 'action-1');
});

test('force-withdrawal service covers forbidden, validation, missing records, not enrolled, offering state, and processing failure', () => {
  const service = createService();

  assert.equal(service.getFormState(2).code, 'FORBIDDEN');

  const validation = service.processWithdrawal({
    actorAccountId: 1,
    offeringId: 8,
    reason: '   ',
    studentIdentifier: 'conflictStudent'
  });
  assert.equal(validation.code, 'VALIDATION_ERROR');

  assert.equal(service.getImplications(1, 'missing', 8).code, 'STUDENT_NOT_FOUND');
  assert.equal(service.getImplications(1, 'conflictStudent', 404).code, 'OFFERING_NOT_FOUND');
  assert.equal(service.getImplications(1, 'conflictStudent', 9).code, 'OFFERING_NOT_ELIGIBLE');

  const notEnrolled = createService({
    enrollmentModel: {
      createWithdrawal() {
        return true;
      },
      findOfferingById() {
        return {
          courseCode: 'ECE320',
          feeChangeCents: 41000,
          id: 8,
          offeringCode: 'O_CONFLICT',
          offeringStatus: 'open',
          title: 'Embedded Systems'
        };
      },
      hasEnrollment() {
        return false;
      },
      listMatchingOfferings() {
        return [];
      }
    }
  }).processWithdrawal({
    actorAccountId: 1,
    offeringId: 8,
    reason: 'Administrative removal after enrollment review.',
    studentIdentifier: 'conflictStudent'
  });
  assert.equal(notEnrolled.code, 'NOT_ENROLLED');

  const failure = createService({
    forceWithdrawalTestState: {
      auditFailureIdentifiers: [],
      failureIdentifiers: ['conflict.student@example.com']
    }
  }).processWithdrawal({
    actorAccountId: 1,
    offeringId: 8,
    reason: 'Administrative removal after enrollment review.',
    studentIdentifier: 'conflictStudent'
  });
  assert.equal(failure.code, 'TRANSACTION_FAILED');
});
