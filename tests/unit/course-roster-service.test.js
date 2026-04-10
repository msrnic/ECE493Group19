const test = require('node:test');
const assert = require('node:assert/strict');

const { createCourseRosterService } = require('../../src/services/course-roster-service');

function createService(overrides = {}) {
  return createCourseRosterService({
    courseRosterModel: {
      findAssignedOffering(actorAccountId, offeringId) {
        if (offeringId === 1) {
          return { courseCode: 'ECE493', id: 1, offeringCode: 'O_ROSTER', termCode: '2026FALL', title: 'Software Engineering' };
        }

        if (offeringId === 3) {
          return { courseCode: 'ECE493', id: 3, offeringCode: 'O_EMPTY', termCode: '2026FALL', title: 'Software Engineering' };
        }

        return null;
      },
      findOfferingById(offeringId) {
        return offeringId === 2 ? { courseCode: 'MATH201', id: 2, offeringCode: 'O_HYBRID', termCode: '2026FALL', title: 'Discrete Mathematics' } : null;
      },
      listAssignedOfferings() {
        return [
          { courseCode: 'ECE493', id: 1, offeringCode: 'O_ROSTER', termCode: '2026FALL', title: 'Software Engineering' },
          { courseCode: 'ECE493', id: 3, offeringCode: 'O_EMPTY', termCode: '2026FALL', title: 'Software Engineering' }
        ];
      },
      listRosterStudents(offeringId) {
        if (offeringId === 3) {
          return [];
        }

        return [
          { fullName: 'Alex Example', programName: 'Software Engineering', studentId: 'userA' },
          { fullName: 'Casey Student', programName: 'Computer Engineering', studentId: 'casey1' }
        ];
      },
      logRosterView() {},
      ...overrides
    },
    courseRosterTestState: { failureIdentifiers: [] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });
}

test('course roster service returns ready, filtered, and sorted roster data for assigned offerings', () => {
  const service = createService();
  const ready = service.getRosterPage({ email: 'professor@example.com', id: 2, username: 'profA' }, { offeringId: '1' });
  assert.equal(ready.state, 'ready');
  assert.equal(ready.roster.length, 2);

  const filtered = service.getRosterPage({ email: 'professor@example.com', id: 2, username: 'profA' }, { offeringId: '1', program: 'Software Engineering' });
  assert.equal(filtered.roster.length, 1);
  assert.equal(filtered.roster[0].studentId, 'userA');

  const sorted = service.getRosterPage({ email: 'professor@example.com', id: 2, username: 'profA' }, { offeringId: '1', sort: 'student_id' });
  assert.equal(sorted.roster[0].studentId, 'casey1');
});

test('course roster service returns empty, forbidden, not-found, and error states safely', () => {
  const empty = createService().getRosterPage({ email: 'professor@example.com', id: 2, username: 'profA' }, { offeringId: '3' });
  assert.equal(empty.state, 'empty_roster');

  const forbidden = createService().getRosterPage({ email: 'professor@example.com', id: 2, username: 'profA' }, { offeringId: '2' });
  assert.equal(forbidden.state, 'forbidden');

  const missing = createService().getRosterPage({ email: 'professor@example.com', id: 2, username: 'profA' }, { offeringId: '99' });
  assert.equal(missing.state, 'not_found');

  const failed = createCourseRosterService({
    courseRosterModel: createService().getRosterPage ? {
      findAssignedOffering() {
        return { courseCode: 'ECE493', id: 1, offeringCode: 'O_ROSTER', termCode: '2026FALL', title: 'Software Engineering' };
      },
      findOfferingById() {
        return null;
      },
      listAssignedOfferings() {
        return [{ courseCode: 'ECE493', id: 1, offeringCode: 'O_ROSTER', termCode: '2026FALL', title: 'Software Engineering' }];
      },
      listRosterStudents() {
        return [];
      },
      logRosterView() {}
    } : null,
    courseRosterTestState: { failureIdentifiers: ['professor@example.com'] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  }).getRosterPage({ email: 'professor@example.com', id: 2, username: 'profA' }, { offeringId: '1' });
  assert.equal(failed.state, 'error');
});
