const test = require('node:test');
const assert = require('node:assert/strict');

const { createEnrollmentService } = require('../../src/services/enrollment-service');

test('enrollment service can trigger simulated failure by student identifier', () => {
  const loggedAttempts = [];
  const service = createEnrollmentService({
    enrollmentModel: {
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
      logAttempt(...args) {
        loggedAttempts.push(args);
      },
      meetingsConflict() {
        return false;
      }
    },
    enrollmentTestState: { failureIdentifiers: ['student-001'] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });

  const result = service.enrollStudent(
    { accountId: 1, email: 'someone@example.com', studentId: 'student-001' },
    1
  );

  assert.equal(result.status, 'error');
  assert.equal(loggedAttempts.length, 1);
  assert.deepEqual(loggedAttempts[0].slice(2, 4), ['error', 'system_error']);
});

test('enrollment service defaults missing failure configuration to no simulated errors', () => {
  const service = createEnrollmentService({
    enrollmentModel: {
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
    },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });

  const result = service.enrollStudent(
    { accountId: 1, email: 'someone@example.com', studentId: 'student-002' },
    1
  );

  assert.equal(result.status, 'enrolled');
});

test('enrollment service formats zero-dollar fee changes', () => {
  const service = createEnrollmentService({
    enrollmentModel: {
      createEnrollment() {
        return true;
      },
      findOfferingById() {
        return {
          courseCode: 'LAB100',
          feeChangeCents: 0,
          id: 10,
          meetingDays: 'Fri',
          offeringCode: 'O_ZERO',
          prerequisiteCourseCode: null,
          seatsRemaining: 10,
          startMinute: 800,
          endMinute: 900,
          title: 'Orientation Lab'
        };
      },
      hasEnrollment() {
        return false;
      },
      listCompletedCourses() {
        return new Set();
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
    },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });

  const result = service.enrollStudent(
    { accountId: 1, email: 'someone@example.com', studentId: 'student-003' },
    10
  );

  assert.equal(result.status, 'enrolled');
  assert.equal(result.feeAssessment.amount, '$0.00');
});

test('enrollment service normalizes missing student identifiers during simulated failure checks', () => {
  const service = createEnrollmentService({
    enrollmentModel: {
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
    },
    enrollmentTestState: { failureIdentifiers: [''] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });

  const result = service.enrollStudent({ accountId: 1 }, 1);
  assert.equal(result.status, 'error');
});
