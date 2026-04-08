const test = require('node:test');
const assert = require('node:assert/strict');

const { createEnrollmentService } = require('../../src/services/enrollment-service');

function createService(overrides = {}) {
  const enrollmentModel = {
    createEnrollment() {
      return true;
    },
    findOfferingById() {
      return {
        courseCode: 'ENGL210',
        feeChangeCents: 45000,
        id: 1,
        meetingDays: 'Mon,Wed',
        offeringCode: 'O_OPEN',
        prerequisiteCourseCode: 'CMPUT301',
        seatsRemaining: 10,
        startMinute: 600,
        endMinute: 660,
        title: 'Technical Communication'
      };
    },
    hasEnrollment() {
      return false;
    },
    listCompletedCourses() {
      return new Set(['CMPUT301']);
    },
    listCurrentSchedule() {
      return [];
    },
    listRegistrationHolds() {
      return [];
    },
    logAttempt() {},
    meetingsConflict() {
      return false;
    },
    ...overrides
  };

  return createEnrollmentService({
    enrollmentModel,
    enrollmentTestState: { failureIdentifiers: [] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });
}

test('enrollment service enrolls eligible students and formats fee changes', () => {
  const service = createService();
  const result = service.enrollStudent(
    { accountId: 1, email: 'userA@example.com', studentId: 'userA' },
    1
  );

  assert.equal(result.status, 'enrolled');
  assert.equal(result.feeAssessment.amount, '$450.00');
});

test('enrollment service aggregates blocking reasons and handles not-found/capacity/system-error branches', () => {
  const blockedService = createService({
    hasEnrollment() {
      return true;
    },
    listCompletedCourses() {
      return new Set();
    },
    listCurrentSchedule() {
      return [
        {
          courseCode: 'ECE320',
          endMinute: 660,
          meetingDays: 'Mon,Wed',
          startMinute: 600,
          title: 'Embedded Systems'
        }
      ];
    },
    listRegistrationHolds() {
      return [{ reason: 'Outstanding fees must be cleared before enrolling in new classes.' }];
    },
    meetingsConflict() {
      return true;
    }
  });
  const blocked = blockedService.enrollStudent(
    { accountId: 1, email: 'hold.student@example.com', studentId: 'holdStudent' },
    1
  );
  assert.equal(blocked.status, 'blocked');
  assert.deepEqual(blocked.reasons.map((reason) => reason.code), [
    'registration_hold',
    'prerequisite',
    'duplicate',
    'schedule_conflict'
  ]);

  const missing = createService({
    findOfferingById() {
      return null;
    }
  }).enrollStudent({ accountId: 1, email: 'userA@example.com', studentId: 'userA' }, 999);
  assert.equal(missing.status, 'not_found');

  const capacity = createService({
    createEnrollment() {
      return false;
    }
  }).enrollStudent({ accountId: 1, email: 'userA@example.com', studentId: 'userA' }, 1);
  assert.equal(capacity.status, 'blocked');
  assert.equal(capacity.reasons[0].code, 'capacity');

  const error = createEnrollmentService({
    enrollmentModel: createService().evaluateEnrollment ? {
      ...{
        createEnrollment() {
          return true;
        },
        findOfferingById() {
          return {
            courseCode: 'ENGL210',
            feeChangeCents: 45000,
            id: 1,
            meetingDays: 'Mon,Wed',
            offeringCode: 'O_OPEN',
            prerequisiteCourseCode: 'CMPUT301',
            seatsRemaining: 10,
            startMinute: 600,
            endMinute: 660,
            title: 'Technical Communication'
          };
        },
        hasEnrollment() {
          return false;
        },
        listCompletedCourses() {
          return new Set(['CMPUT301']);
        },
        listCurrentSchedule() {
          return [];
        },
        listRegistrationHolds() {
          return [];
        },
        logAttempt() {},
        meetingsConflict() {
          return false;
        }
      }
    } : null,
    enrollmentTestState: { failureIdentifiers: ['error@example.com'] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  }).enrollStudent({ accountId: 1, email: 'error@example.com', studentId: 'errorStudent' }, 1);
  assert.equal(error.status, 'error');
});
