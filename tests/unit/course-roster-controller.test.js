const test = require('node:test');
const assert = require('node:assert/strict');

const { createCourseRosterController } = require('../../src/controllers/course-roster-controller');

function createResponseRecorder() {
  return {
    body: '',
    statusCode: 200,
    send(value) {
      this.body = value;
      return this;
    },
    status(value) {
      this.statusCode = value;
      return this;
    }
  };
}

function createServices(overrides = {}) {
  return {
    accountModel: {
      findById(accountId) {
        return accountId === 2 ? { email: 'professor@example.com', id: 2, role: 'professor', status: 'active', username: 'profA' } : { id: 1, role: 'student', status: 'active', username: 'userA' };
      }
    },
    courseRosterService: {
      getRosterPage() {
        return {
          assignedOfferings: [{ courseCode: 'ECE493', id: 1, offeringCode: 'O_ROSTER', title: 'Software Engineering' }],
          filters: { program: '', sort: 'name' },
          programOptions: ['Software Engineering'],
          roster: [{ fullName: 'Alex Example', programName: 'Software Engineering', studentId: 'userA' }],
          selectedOffering: { courseCode: 'ECE493', id: 1, offeringCode: 'O_ROSTER', title: 'Software Engineering' },
          state: 'ready'
        };
      }
    },
    ...overrides
  };
}

test('course roster controller renders ready rosters and denies non-professor access', () => {
  const controller = createCourseRosterController(createServices());
  const response = createResponseRecorder();
  controller.getRosterPage({ query: { offeringId: '1' }, session: { accountId: 2 } }, response);
  assert.equal(response.statusCode, 200);
  assert.match(response.body, /My Course Offerings/);
  assert.match(response.body, /Alex Example/);

  const denied = createResponseRecorder();
  controller.getRosterPage({ query: {}, session: { accountId: 1 } }, denied);
  assert.equal(denied.statusCode, 403);
  assert.match(denied.body, /Access denied/);
});

test('course roster controller renders empty, forbidden, and error states', () => {
  const emptyController = createCourseRosterController(createServices({
    courseRosterService: {
      getRosterPage() {
        return {
          assignedOfferings: [{ courseCode: 'ECE493', id: 3, offeringCode: 'O_EMPTY', title: 'Software Engineering' }],
          filters: { program: '', sort: 'name' },
          selectedOffering: { courseCode: 'ECE493', id: 3, offeringCode: 'O_EMPTY', title: 'Software Engineering' },
          state: 'empty_roster'
        };
      }
    }
  }));
  const empty = createResponseRecorder();
  emptyController.getRosterPage({ query: { offeringId: '3' }, session: { accountId: 2 } }, empty);
  assert.match(empty.body, /No students are currently enrolled/);

  const forbiddenController = createCourseRosterController(createServices({
    courseRosterService: {
      getRosterPage() {
        return {
          assignedOfferings: [],
          filters: { program: '', sort: 'name' },
          message: 'Access denied. You can only view rosters for offerings assigned to you.',
          state: 'forbidden'
        };
      }
    }
  }));
  const forbidden = createResponseRecorder();
  forbiddenController.getRosterPage({ query: { offeringId: '2' }, session: { accountId: 2 } }, forbidden);
  assert.equal(forbidden.statusCode, 403);
  assert.match(forbidden.body, /Access denied/);

  const errorController = createCourseRosterController(createServices({
    courseRosterService: {
      getRosterPage() {
        return {
          assignedOfferings: [],
          filters: { program: '', sort: 'name' },
          message: 'Roster information is temporarily unavailable. Please retry.',
          state: 'error'
        };
      }
    }
  }));
  const error = createResponseRecorder();
  errorController.getRosterPage({ query: { offeringId: '1' }, session: { accountId: 2 } }, error);
  assert.equal(error.statusCode, 503);
  assert.match(error.body, /Roster unavailable/);
});
