const test = require('node:test');
const assert = require('node:assert/strict');

const { createOfferingAdminService } = require('../../src/services/offering-admin-service');

function createService(overrides = {}) {
  return createOfferingAdminService({
    accountModel: {
      findById(accountId) {
        return accountId === 1 ? { id: 1, role: 'admin' } : null;
      }
    },
    now: overrides.now || (() => new Date('2026-03-07T12:00:00.000Z')),
    offeringAdminModel: {
      createOffering(payload) {
        return {
          capacity: payload.capacity,
          courseCode: payload.course_code,
          id: 42,
          instructorAccountId: payload.instructor_account_id,
          instructorLabel: 'professorA',
          meetingDays: payload.meeting_days,
          offeringCode: payload.offering_code,
          scheduleEndMinute: payload.end_minute,
          scheduleStartMinute: payload.start_minute,
          sectionCode: payload.section_code,
          seatsRemaining: payload.seats_remaining,
          termCode: payload.term_code,
          title: payload.title,
          updatedAt: payload.updated_at
        };
      },
      deleteOffering() {
        return true;
      },
      findDuplicateIdentity() {
        return null;
      },
      findOfferingById(offeringId) {
        return offeringId === 6
          ? {
              capacity: 30,
              courseCode: 'ECE493',
              id: 6,
              instructorLabel: 'professorA',
              offeringCode: 'O_EMPTY',
              sectionCode: 'E1',
              termCode: '2026FALL',
              title: 'Capstone'
            }
          : offeringId === 5
            ? {
                capacity: 30,
                courseCode: 'ECE493',
                id: 5,
                instructorLabel: 'professorA',
                offeringCode: 'O_ROSTER',
                sectionCode: 'D1',
                termCode: '2026FALL',
                title: 'Capstone'
              }
            : null;
      },
      listInstructorOptions() {
        return [{ id: 2, label: 'professorA' }];
      },
      listOfferings() {
        return [];
      },
      logChange() {},
      queueAuditRetry() {},
      readActiveEnrollmentCount(offeringId) {
        return offeringId === 5 ? 2 : 0;
      }
    },
    offeringAdminTestState: {
      auditFailureIdentifiers: [],
      createFailureIdentifiers: [],
      deleteFailureIdentifiers: []
    },
    ...overrides
  });
}

test('offering admin service covers metadata, create success, pending-audit add, delete success, and pending-audit delete', () => {
  const service = createService();
  assert.equal(service.getFormState(1).statusCode, 200);

  const created = service.createOffering(1, {
    capacity: '30',
    courseCode: 'ECE499',
    instructorAccountId: '2',
    meetingDays: 'Mon,Wed',
    scheduleEndTime: '10:00',
    scheduleStartTime: '09:00',
    sectionCode: 'A1',
    termCode: '2026FALL',
    title: 'Special Topics'
  });
  assert.equal(created.statusCode, 201);
  assert.equal(created.pendingAudit, false);

  const pendingAdd = createService({
    offeringAdminTestState: { auditFailureIdentifiers: ['ECE499-2026FALL-A1'], createFailureIdentifiers: [], deleteFailureIdentifiers: [] }
  }).createOffering(1, {
    capacity: '30',
    courseCode: 'ECE499',
    instructorAccountId: '2',
    meetingDays: 'Mon,Wed',
    scheduleEndTime: '10:00',
    scheduleStartTime: '09:00',
    sectionCode: 'A1',
    termCode: '2026FALL',
    title: 'Special Topics'
  });
  assert.equal(pendingAdd.pendingAudit, true);

  const deleted = service.deleteOffering(1, 6, { confirmDelete: true });
  assert.equal(deleted.statusCode, 200);

  const pendingDelete = createService({
    offeringAdminTestState: { auditFailureIdentifiers: ['o_empty'], createFailureIdentifiers: [], deleteFailureIdentifiers: [] }
  }).deleteOffering(1, 6, { confirmDelete: true });
  assert.equal(pendingDelete.pendingAudit, true);
});

test('offering admin service covers validation, duplicate, blocked delete, override delete, and transactional failures', () => {
  const service = createService();

  assert.equal(service.getFormState(9).code, 'FORBIDDEN');
  assert.equal(service.createOffering(1, {}).code, 'VALIDATION_ERROR');

  const duplicate = createService({
    offeringAdminModel: {
      ...createService().getFormState && {},
      createOffering() { return {}; },
      deleteOffering() { return true; },
      findDuplicateIdentity() { return { id: 9 }; },
      findOfferingById() { return null; },
      listInstructorOptions() { return []; },
      listOfferings() { return []; },
      logChange() {},
      queueAuditRetry() {},
      readActiveEnrollmentCount() { return 0; }
    }
  }).createOffering(1, {
    capacity: '30',
    courseCode: 'ECE499',
    instructorAccountId: '2',
    meetingDays: 'Mon,Wed',
    scheduleEndTime: '10:00',
    scheduleStartTime: '09:00',
    sectionCode: 'A1',
    termCode: '2026FALL',
    title: 'Special Topics'
  });
  assert.equal(duplicate.code, 'DUPLICATE_OFFERING');

  const blockedDelete = service.deleteOffering(1, 5, { confirmDelete: true });
  assert.equal(blockedDelete.code, 'ACTIVE_ENROLLMENTS');

  const overrideDelete = service.deleteOffering(1, 5, {
    confirmDelete: true,
    overrideConfirmed: true,
    overrideReason: 'Policy override'
  });
  assert.equal(overrideDelete.statusCode, 200);

  const createFailure = createService({
    offeringAdminTestState: { auditFailureIdentifiers: [], createFailureIdentifiers: ['ece499-2026fall-a1'], deleteFailureIdentifiers: [] }
  }).createOffering(1, {
    capacity: '30',
    courseCode: 'ECE499',
    instructorAccountId: '2',
    meetingDays: 'Mon,Wed',
    scheduleEndTime: '10:00',
    scheduleStartTime: '09:00',
    sectionCode: 'A1',
    termCode: '2026FALL',
    title: 'Special Topics'
  });
  assert.equal(createFailure.code, 'TRANSACTION_FAILED');

  const deleteFailure = createService({
    offeringAdminTestState: { auditFailureIdentifiers: [], createFailureIdentifiers: [], deleteFailureIdentifiers: ['o_empty'] }
  }).deleteOffering(1, 6, { confirmDelete: true });
  assert.equal(deleteFailure.code, 'TRANSACTION_FAILED');
});
