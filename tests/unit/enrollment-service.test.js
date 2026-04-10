const test = require('node:test');
const assert = require('node:assert/strict');

const { createEnrollmentService } = require('../../src/services/enrollment-service');

function createService(overrides = {}) {
  const enrollmentModel = {
    createEnrollment() {
      return true;
    },
    createDrop() {
      return true;
    },
    createWaitlist() {
      return { waitlistPosition: 2, waitlistStatus: 'waitlisted' };
    },
    createWithdrawal() {
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
        title: 'Technical Communication',
        waitlistEnabled: false,
        waitlistUsesPosition: true
      };
    },
    findCurrentEnrollment(accountId, offeringId) {
      return offeringId === 1
        ? {
            courseCode: 'ENGL210',
            feeChangeCents: 45000,
            id: 1,
            offeringCode: 'O_OPEN',
            title: 'Technical Communication'
          }
        : null;
    },
    hasEnrollment() {
      return false;
    },
    hasWaitlist() {
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
    listWaitlistAlternatives() {
      return [];
    },
    logAttempt() {},
    logWaitlistAttempt() {},
    meetingsConflict() {
      return false;
    },
    ...overrides
  };

  return createEnrollmentService({
    deadlinePolicyService: {
      classifyRemovalForOffering() {
        return {
          classification: 'drop',
          deadlineLabel: 'Sep 15, 2026, 5:59 p.m.',
          state: 'ready',
          timezoneName: 'America/Edmonton'
        };
      }
    },
    enrollmentModel,
    enrollmentTestState: { failureIdentifiers: [], removalFailureIdentifiers: [], withdrawalFailureIdentifiers: [] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });
}

function createBaseEnrollmentModel() {
  return {
    createEnrollment() {
      return true;
    },
    createDrop() {
      return true;
    },
    createWaitlist() {
      return { waitlistPosition: 2, waitlistStatus: 'waitlisted' };
    },
    createWithdrawal() {
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
        title: 'Technical Communication',
        waitlistEnabled: false,
        waitlistUsesPosition: true
      };
    },
    findCurrentEnrollment() {
      return {
        courseCode: 'ENGL210',
        feeChangeCents: 45000,
        id: 1,
        offeringCode: 'O_OPEN',
        title: 'Technical Communication'
      };
    },
    hasEnrollment() {
      return false;
    },
    hasWaitlist() {
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
    listWaitlistAlternatives() {
      return [];
    },
    logAttempt() {},
    logWaitlistAttempt() {},
    meetingsConflict() {
      return false;
    }
  };
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
    deadlinePolicyService: {
      classifyRemovalForOffering() {
        return {
          classification: 'drop',
          deadlineLabel: 'Sep 15, 2026, 5:59 p.m.',
          state: 'ready',
          timezoneName: 'America/Edmonton'
        };
      }
    },
    enrollmentModel: createBaseEnrollmentModel(),
    enrollmentTestState: { failureIdentifiers: ['error@example.com'], withdrawalFailureIdentifiers: [] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  }).enrollStudent({ accountId: 1, email: 'error@example.com', studentId: 'errorStudent' }, 1);
  assert.equal(error.status, 'error');
});

test('enrollment service joins eligible waitlists and blocks unavailable, duplicate, closed-term, and failed requests safely', () => {
  const waitlistService = createService({
    findOfferingById() {
      return {
        courseCode: 'STAT252',
        feeChangeCents: 37500,
        id: 2,
        meetingDays: 'Tue,Thu',
        offeringCode: 'O_FULL',
        prerequisiteCourseCode: null,
        seatsRemaining: 0,
        startMinute: 840,
        endMinute: 900,
        termCode: '2026FALL',
        title: 'Applied Statistics',
        waitlistEnabled: true,
        waitlistUsesPosition: true
      };
    },
    listCurrentWaitlists() {
      return [];
    }
  });

  const joined = waitlistService.joinWaitlist(
    { accountId: 1, email: 'userA@example.com', studentId: 'userA' },
    2
  );
  assert.equal(joined.status, 'waitlisted');
  assert.equal(joined.waitlistPosition, 2);

  const unavailable = createService({
    findOfferingById() {
      return {
        courseCode: 'STAT252',
        feeChangeCents: 37500,
        id: 3,
        meetingDays: 'Fri',
        offeringCode: 'O_NOWL',
        prerequisiteCourseCode: null,
        seatsRemaining: 0,
        startMinute: 960,
        endMinute: 1020,
        termCode: '2026FALL',
        title: 'Applied Statistics',
        waitlistEnabled: false,
        waitlistUsesPosition: true
      };
    },
    listWaitlistAlternatives() {
      return [{ courseCode: 'STAT252', id: 4, offeringCode: 'O_ALT_OPEN', seatsRemaining: 8, termCode: '2026FALL', title: 'Applied Statistics' }];
    }
  }).getWaitlistPreview({ accountId: 1, email: 'userA@example.com', studentId: 'userA' }, 3);
  assert.equal(unavailable.status, 'blocked');
  assert.equal(unavailable.reasons[0].code, 'waitlist_unavailable');
  assert.equal(unavailable.alternatives.length, 1);

  const duplicate = createService({
    findOfferingById() {
      return {
        courseCode: 'STAT252',
        feeChangeCents: 37500,
        id: 2,
        meetingDays: 'Tue,Thu',
        offeringCode: 'O_FULL',
        prerequisiteCourseCode: null,
        seatsRemaining: 0,
        startMinute: 840,
        endMinute: 900,
        termCode: '2026FALL',
        title: 'Applied Statistics',
        waitlistEnabled: true,
        waitlistUsesPosition: true
      };
    },
    hasWaitlist() {
      return true;
    }
  }).getWaitlistPreview({ accountId: 1, email: 'conflict.student@example.com', studentId: 'conflictStudent' }, 2);
  assert.equal(duplicate.status, 'blocked');
  assert.equal(duplicate.reasons[0].code, 'already_waitlisted');

  const closedTerm = createEnrollmentService({
    deadlinePolicyService: {
      classifyRemovalForOffering() {
        return {
          classification: 'drop',
          deadlineLabel: 'Sep 15, 2026, 5:59 p.m.',
          state: 'ready',
          timezoneName: 'America/Edmonton'
        };
      }
    },
    enrollmentModel: {
      ...createBaseEnrollmentModel(),
      findOfferingById() {
        return {
          courseCode: 'STAT252',
          feeChangeCents: 37500,
          id: 2,
          meetingDays: 'Tue,Thu',
          offeringCode: 'O_FULL',
          prerequisiteCourseCode: null,
          seatsRemaining: 0,
          startMinute: 840,
          endMinute: 900,
          termCode: '2026FALL',
          title: 'Applied Statistics',
          waitlistEnabled: true,
          waitlistUsesPosition: true
        };
      }
    },
    enrollmentTestState: { failureIdentifiers: [], removalFailureIdentifiers: [], waitlistClosedTermIdentifiers: ['closed@example.com'], waitlistFailureIdentifiers: [], withdrawalFailureIdentifiers: [] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  }).getWaitlistPreview({ accountId: 1, email: 'closed@example.com', studentId: 'closedStudent' }, 2);
  assert.equal(closedTerm.status, 'blocked');
  assert.equal(closedTerm.reasons[0].code, 'term_closed');

  const failed = createEnrollmentService({
    deadlinePolicyService: {
      classifyRemovalForOffering() {
        return {
          classification: 'drop',
          deadlineLabel: 'Sep 15, 2026, 5:59 p.m.',
          state: 'ready',
          timezoneName: 'America/Edmonton'
        };
      }
    },
    enrollmentModel: {
      ...createBaseEnrollmentModel(),
      findOfferingById() {
        return {
          courseCode: 'STAT252',
          feeChangeCents: 37500,
          id: 2,
          meetingDays: 'Tue,Thu',
          offeringCode: 'O_FULL',
          prerequisiteCourseCode: null,
          seatsRemaining: 0,
          startMinute: 840,
          endMinute: 900,
          termCode: '2026FALL',
          title: 'Applied Statistics',
          waitlistEnabled: true,
          waitlistUsesPosition: false
        };
      }
    },
    enrollmentTestState: { failureIdentifiers: [], removalFailureIdentifiers: [], waitlistFailureIdentifiers: ['error@example.com'], withdrawalFailureIdentifiers: [] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  }).joinWaitlist({ accountId: 1, email: 'error@example.com', studentId: 'errorStudent' }, 2);
  assert.equal(failed.status, 'error');
});

test('enrollment service previews and records successful withdrawals', () => {
  const service = createService();

  const preview = service.getWithdrawalPreview(
    { accountId: 1, email: 'userA@example.com', studentId: 'userA' },
    1
  );
  assert.equal(preview.status, 'ready');
  assert.match(preview.implications.transcriptImpact, /W notation/);
  assert.match(preview.implications.feeImpactSummary, /\$450\.00/);

  const result = service.withdrawStudent(
    { accountId: 1, email: 'userA@example.com', studentId: 'userA' },
    1
  );
  assert.equal(result.status, 'withdrawn');
});

test('enrollment service handles withdrawal not-found and simulated error branches', () => {
  const missing = createService().withdrawStudent(
    { accountId: 1, email: 'userA@example.com', studentId: 'userA' },
    999
  );
  assert.equal(missing.status, 'not_found');

  const failure = createEnrollmentService({
    deadlinePolicyService: {
      classifyRemovalForOffering() {
        return {
          classification: 'drop',
          deadlineLabel: 'Sep 15, 2026, 5:59 p.m.',
          state: 'ready',
          timezoneName: 'America/Edmonton'
        };
      }
    },
    enrollmentModel: createBaseEnrollmentModel(),
    enrollmentTestState: { failureIdentifiers: [], withdrawalFailureIdentifiers: ['error@example.com'] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  }).withdrawStudent({ accountId: 1, email: 'error@example.com', studentId: 'errorStudent' }, 1);

  assert.equal(failure.status, 'error');
});

test('enrollment service applies drop before the deadline and withdrawal after the deadline for class removal', () => {
  const dropped = createService().removeStudent(
    { accountId: 1, email: 'userA@example.com', studentId: 'userA' },
    1
  );
  assert.equal(dropped.status, 'removed');
  assert.equal(dropped.classification, 'drop');
  assert.match(dropped.implications.feeImpactSummary, /Drop policy applies/);

  const withdrawn = createEnrollmentService({
    deadlinePolicyService: {
      classifyRemovalForOffering() {
        return {
          classification: 'withdrawal',
          deadlineLabel: 'Sep 15, 2026, 5:59 p.m.',
          state: 'ready',
          timezoneName: 'America/Edmonton'
        };
      }
    },
    enrollmentModel: createBaseEnrollmentModel(),
    enrollmentTestState: { failureIdentifiers: [], removalFailureIdentifiers: [], withdrawalFailureIdentifiers: [] },
    now: () => new Date('2026-09-16T00:00:00.000Z')
  }).removeStudent({ accountId: 1, email: 'userA@example.com', studentId: 'userA' }, 1);

  assert.equal(withdrawn.status, 'removed');
  assert.equal(withdrawn.classification, 'withdrawal');
  assert.match(withdrawn.implications.feeImpactSummary, /remains applied after withdrawal/);
});

test('enrollment service blocks or fails safely when removal policy cannot be determined or updates fail', () => {
  const blocked = createEnrollmentService({
    deadlinePolicyService: {
      classifyRemovalForOffering() {
        return {
          message: 'We cannot confirm add/drop deadline information right now. Please retry later.',
          state: 'error'
        };
      }
    },
    enrollmentModel: createBaseEnrollmentModel(),
    enrollmentTestState: { failureIdentifiers: [], removalFailureIdentifiers: [], withdrawalFailureIdentifiers: [] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  }).getRemovalPreview({ accountId: 1, email: 'userA@example.com', studentId: 'userA' }, 1);

  assert.equal(blocked.status, 'blocked');

  const failed = createEnrollmentService({
    deadlinePolicyService: {
      classifyRemovalForOffering() {
        return {
          classification: 'drop',
          deadlineLabel: 'Sep 15, 2026, 5:59 p.m.',
          state: 'ready',
          timezoneName: 'America/Edmonton'
        };
      }
    },
    enrollmentModel: createBaseEnrollmentModel(),
    enrollmentTestState: { failureIdentifiers: [], removalFailureIdentifiers: ['userA@example.com'], withdrawalFailureIdentifiers: [] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  }).removeStudent({ accountId: 1, email: 'userA@example.com', studentId: 'userA' }, 1);

  assert.equal(failed.status, 'error');
  assert.match(failed.message, /could not be completed/);
});
