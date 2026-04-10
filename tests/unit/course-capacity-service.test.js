const test = require('node:test');
const assert = require('node:assert/strict');

const { createCourseCapacityService } = require('../../src/services/course-capacity-service');

function createService(overrides = {}) {
  const state = {
    appliedPayload: null,
    currentOffering: null,
    overridePayload: null,
    requestStatusPayloads: []
  };
  const baseOffering = {
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
  };

  return {
    service: createCourseCapacityService({
      accountModel: {
        findById(accountId) {
          return accountId === 1 ? { id: 1, role: 'admin' } : null;
        }
      },
      courseCapacityModel: {
        createOverrideAuthorization(payload) {
          state.overridePayload = payload;
          return {
            approvedAt: payload.approved_at,
            approvedByAccountId: payload.approved_by_account_id,
            overrideRequestId: payload.override_request_id,
            retentionUntil: payload.retention_until
          };
        },
        createRequest(payload) {
          state.requestPayload = payload;
          return payload;
        },
        findOfferingById() {
          return overrides.currentOffering || state.currentOffering || baseOffering;
        },
        updateCapacity(payload) {
          state.appliedPayload = payload;
          state.currentOffering = {
            ...(overrides.currentOffering || baseOffering),
            capacity: payload.capacity,
            remainingSeats: payload.seats_remaining,
            updatedAt: payload.updated_at,
            version: (overrides.currentOffering || state.currentOffering || baseOffering).version + 1
          };
          return overrides.updateSucceeded !== false;
        },
        updateRequestStatus(payload) {
          state.requestStatusPayloads.push(payload);
          return payload;
        }
      },
      courseCapacityTestState: overrides.courseCapacityTestState || { failureIdentifiers: [] },
      now: overrides.now || (() => new Date('2026-04-10T18:00:00.000Z'))
    }),
    state
  };
}

test('course capacity service applies valid updates, returns noop, and blocks non-admin access', () => {
  const { service, state } = createService();

  const success = service.submitCapacityUpdate(1, 8, {
    proposedCapacity: '28',
    submittedVersion: '1'
  });
  assert.equal(success.statusCode, 200);
  assert.equal(success.outcome, 'success');
  assert.equal(success.remainingSeats, 14);
  assert.equal(state.appliedPayload.capacity, 28);

  const noop = service.submitCapacityUpdate(1, 8, {
    proposedCapacity: '28',
    submittedVersion: '2'
  });
  assert.equal(noop.outcome, 'noop');

  const forbidden = service.getOfferingState(9, 8);
  assert.equal(forbidden.code, 'FORBIDDEN');
});

test('course capacity service covers validation, override-required, denied override, self-approval policy, stale, and failure paths', () => {
  const { service } = createService();
  assert.equal(service.submitCapacityUpdate(1, 8, { proposedCapacity: 'abc', submittedVersion: '1' }).code, 'VALIDATION_ERROR');

  const needsOverride = service.submitCapacityUpdate(1, 8, {
    proposedCapacity: '10',
    submittedVersion: '1'
  });
  assert.equal(needsOverride.code, 'OVERRIDE_REQUIRED');

  const denied = service.submitCapacityUpdate(1, 8, {
    override: { allowSelfApproval: true, approvedByAccountId: 1, decision: 'denied', reason: 'Registrar policy' },
    proposedCapacity: '10',
    submittedVersion: '1'
  });
  assert.equal(denied.messageCode, 'OVERRIDE_DENIED');

  const selfDenied = service.submitCapacityUpdate(1, 8, {
    override: { allowSelfApproval: false, approvedByAccountId: 1, decision: 'approved', reason: 'Registrar policy' },
    proposedCapacity: '10',
    submittedVersion: '1'
  });
  assert.equal(selfDenied.code, 'SELF_APPROVAL_NOT_ALLOWED');

  const stale = service.submitCapacityUpdate(1, 8, {
    proposedCapacity: '40',
    submittedVersion: '2'
  });
  assert.equal(stale.messageCode, 'STALE_SUBMISSION');

  const failed = createService({
    courseCapacityTestState: { failureIdentifiers: ['o_conflict'] }
  }).service.submitCapacityUpdate(1, 8, {
    proposedCapacity: '40',
    submittedVersion: '1'
  });
  assert.equal(failed.messageCode, 'UPDATE_FAILED');

  const conflictAfterValidation = createService({ updateSucceeded: false }).service.submitCapacityUpdate(1, 8, {
    proposedCapacity: '40',
    submittedVersion: '1'
  });
  assert.equal(conflictAfterValidation.statusCode, 409);
});
