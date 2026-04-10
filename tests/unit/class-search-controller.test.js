const test = require('node:test');
const assert = require('node:assert/strict');

const { createClassSearchController } = require('../../src/controllers/class-search-controller');

function createResponseRecorder() {
  return {
    body: '',
    redirectedTo: null,
    statusCode: 200,
    redirect(value) {
      this.redirectedTo = value;
      return this;
    },
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
    classSearchService: {
      getOfferingDetails() {
        return { message: 'Class offering was not found.', status: 'not_found' };
      },
      getSearchPageData() {
        return {
          filters: { courseNumber: '', queryText: '', subjectCode: '', termCode: '2026FALL' },
          results: [],
          state: 'idle',
          termOptions: ['2026FALL']
        };
      }
    },
    studentAccountModel: {
      findActiveByAccountId(accountId) {
        return accountId === 1
          ? { accountId: 1, displayName: 'userA', studentId: 'userA', email: 'userA@example.com' }
          : null;
      }
    },
    ...overrides
  };
}

test('class search controller redirects unauthenticated requests for search and detail pages', () => {
  const controller = createClassSearchController(createServices());

  const searchResponse = createResponseRecorder();
  controller.getSearchPage({ query: {}, session: {} }, searchResponse);
  assert.equal(searchResponse.redirectedTo, '/login?returnTo=%2Fclasses%2Fsearch');

  const detailResponse = createResponseRecorder();
  controller.getClassDetail({ originalUrl: '/classes/3', params: { offeringId: '3' }, session: {} }, detailResponse);
  assert.equal(detailResponse.redirectedTo, '/login?returnTo=%2Fclasses%2F3');
});

test('class search controller renders idle, empty, and error search states', () => {
  const serviceStates = [
    {
      expectedStatus: 200,
      payload: {
        filters: { courseNumber: '', queryText: '', subjectCode: '', termCode: '2026FALL' },
        results: [],
        state: 'idle',
        termOptions: ['2026FALL']
      },
      text: /Search for available classes/
    },
    {
      expectedStatus: 200,
      payload: {
        filters: { courseNumber: '999', queryText: '', subjectCode: 'ENGL', termCode: '2026FALL' },
        results: [],
        state: 'empty',
        termOptions: ['2026FALL']
      },
      text: /No classes found/
    },
    {
      expectedStatus: 503,
      payload: {
        filters: { courseNumber: '', queryText: 'ENGL', subjectCode: '', termCode: '2026FALL' },
        results: [],
        state: 'error',
        statusMessage: 'Class search cannot be completed right now. Please retry.',
        termOptions: ['2026FALL']
      },
      text: /Search unavailable/
    }
  ];

  for (const scenario of serviceStates) {
    const controller = createClassSearchController(createServices({
      classSearchService: {
        getOfferingDetails() {
          return { message: 'Class offering was not found.', status: 'not_found' };
        },
        getSearchPageData() {
          return scenario.payload;
        }
      }
    }));
    const response = createResponseRecorder();
    controller.getSearchPage({ query: {}, session: { accountId: 1 } }, response);
    assert.equal(response.statusCode, scenario.expectedStatus);
    assert.match(response.body, scenario.text);
  }
});

test('class search controller renders result rows and detail success/error states', () => {
  const controller = createClassSearchController(createServices({
    classSearchService: {
      getOfferingDetails(student, offeringId) {
        if (offeringId === 1) {
          return {
            offering: {
              courseCode: 'ENGL210',
              courseNumber: '210',
              id: 1,
              instructorName: 'Instructor unavailable',
              isCurrent: false,
              lastUpdatedLabel: '2026-03-07T10:00:00.000Z',
              meetingTimeLabel: 'Mon,Wed 10:00',
              offeringCode: 'O_OPEN',
              seatsRemaining: 12,
              staleLabel: 'Stale availability snapshot from 2026-03-07T10:00:00.000Z',
              subjectCode: 'ENGL',
              termCode: '2026FALL',
              title: 'Technical Communication'
            },
            status: 'success'
          };
        }

        return offeringId === 2
          ? { message: 'Class offering was not found.', status: 'not_found' }
          : { message: 'Class details cannot be loaded right now. Please retry.', status: 'error' };
      },
      getSearchPageData() {
        return {
          filters: { courseNumber: '', queryText: 'ENGL', subjectCode: '', termCode: '2026FALL' },
          results: [{
            courseCode: 'ENGL210',
            id: 1,
            instructorName: 'Instructor unavailable',
            isCurrent: true,
            lastUpdatedLabel: '2026-03-07T12:00:00.000Z',
            meetingTimeLabel: 'Mon,Wed 10:00',
            offeringCode: 'O_OPEN',
            seatsRemaining: 12,
            staleLabel: null,
            termCode: '2026FALL',
            title: 'Technical Communication'
          }],
          state: 'results',
          termOptions: ['2026FALL']
        };
      }
    }
  }));

  const searchResponse = createResponseRecorder();
  controller.getSearchPage({ query: { q: 'ENGL' }, session: { accountId: 1 } }, searchResponse);
  assert.equal(searchResponse.statusCode, 200);
  assert.match(searchResponse.body, /1 matching class found/);
  assert.match(searchResponse.body, /<form method="post" action="\/enrollment">/);
  assert.match(searchResponse.body, /<button type="submit">Enroll<\/button>/);
  assert.match(searchResponse.body, /View class details/);

  const successDetail = createResponseRecorder();
  controller.getClassDetail({ params: { offeringId: '1' }, session: { accountId: 1 } }, successDetail);
  assert.equal(successDetail.statusCode, 200);
  assert.match(successDetail.body, /Enroll in this class/);
  assert.match(successDetail.body, /Stale availability snapshot/);

  const notFoundDetail = createResponseRecorder();
  controller.getClassDetail({ params: { offeringId: '2' }, session: { accountId: 1 } }, notFoundDetail);
  assert.equal(notFoundDetail.statusCode, 404);
  assert.match(notFoundDetail.body, /Class not found/);

  const errorDetail = createResponseRecorder();
  controller.getClassDetail({ params: { offeringId: '3' }, session: { accountId: 1 } }, errorDetail);
  assert.equal(errorDetail.statusCode, 503);
  assert.match(errorDetail.body, /Class details unavailable/);
});

test('class search controller renders stale result rows and mixed term options', () => {
  const controller = createClassSearchController(createServices({
    classSearchService: {
      getOfferingDetails() {
        return { message: 'Class offering was not found.', status: 'not_found' };
      },
      getSearchPageData() {
        return {
          filters: { courseNumber: '', queryText: 'STAT', subjectCode: '', termCode: '2026FALL' },
          results: [{
            courseCode: 'STAT252',
            id: 2,
            instructorName: 'Instructor unavailable',
            isCurrent: false,
            lastUpdatedLabel: '2026-03-07T10:00:00.000Z',
            meetingTimeLabel: 'Tue,Thu 14:00',
            offeringCode: 'O_STALE',
            seatsRemaining: 2,
            staleLabel: 'Stale availability snapshot from 2026-03-07T10:00:00.000Z',
            termCode: '2026FALL',
            title: 'Applied Statistics'
          }],
          state: 'results',
          termOptions: ['2026FALL', '2027WINTER']
        };
      }
    }
  }));

  const response = createResponseRecorder();
  controller.getSearchPage({ query: { q: 'STAT' }, session: { accountId: 1 } }, response);

  assert.equal(response.statusCode, 200);
  assert.match(response.body, /Stale availability snapshot/);
  assert.match(response.body, /<option value="2027WINTER">2027WINTER<\/option>/);
});

test('class search controller handles plural result messaging and inactive-student redirects', () => {
  const controller = createClassSearchController(createServices({
    classSearchService: {
      getOfferingDetails() {
        return { message: 'Class offering was not found.', status: 'not_found' };
      },
      getSearchPageData() {
        return {
          filters: { courseNumber: '', queryText: 'E', subjectCode: '', termCode: '2026FALL' },
          results: [
            {
              courseCode: 'ENGL210',
              id: 1,
              instructorName: 'Instructor unavailable',
              isCurrent: true,
              lastUpdatedLabel: '2026-03-07T12:00:00.000Z',
              meetingTimeLabel: 'Mon,Wed 10:00',
              offeringCode: 'O_OPEN',
              seatsRemaining: 12,
              staleLabel: null,
              termCode: '2026FALL',
              title: 'Technical Communication'
            },
            {
              courseCode: 'ECE320',
              id: 2,
              instructorName: 'Instructor unavailable',
              isCurrent: true,
              lastUpdatedLabel: '2026-03-07T12:00:00.000Z',
              meetingTimeLabel: 'Mon,Wed 10:00',
              offeringCode: 'O_CONFLICT',
              seatsRemaining: 6,
              staleLabel: null,
              termCode: '2026FALL',
              title: 'Embedded Systems'
            }
          ],
          state: 'results',
          termOptions: ['2026FALL']
        };
      }
    },
    studentAccountModel: {
      findActiveByAccountId() {
        return null;
      }
    }
  }));

  const inactiveSearch = createResponseRecorder();
  controller.getSearchPage({ query: {}, session: { accountId: 5 } }, inactiveSearch);
  assert.equal(inactiveSearch.redirectedTo, '/login?returnTo=%2Fclasses%2Fsearch');

  const inactiveDetail = createResponseRecorder();
  controller.getClassDetail({ originalUrl: '/classes/9', params: { offeringId: '9' }, session: { accountId: 5 } }, inactiveDetail);
  assert.equal(inactiveDetail.redirectedTo, '/login?returnTo=%2Fclasses%2F9');

  const activeController = createClassSearchController(createServices({
    classSearchService: {
      getOfferingDetails() {
        return { message: 'Class offering was not found.', status: 'not_found' };
      },
      getSearchPageData() {
        return {
          filters: { courseNumber: '', queryText: 'E', subjectCode: '', termCode: '2026FALL' },
          results: [
            {
              courseCode: 'ENGL210',
              id: 1,
              instructorName: 'Instructor unavailable',
              isCurrent: true,
              lastUpdatedLabel: '2026-03-07T12:00:00.000Z',
              meetingTimeLabel: 'Mon,Wed 10:00',
              offeringCode: 'O_OPEN',
              seatsRemaining: 12,
              staleLabel: null,
              termCode: '2026FALL',
              title: 'Technical Communication'
            },
            {
              courseCode: 'ECE320',
              id: 2,
              instructorName: 'Instructor unavailable',
              isCurrent: true,
              lastUpdatedLabel: '2026-03-07T12:00:00.000Z',
              meetingTimeLabel: 'Mon,Wed 10:00',
              offeringCode: 'O_CONFLICT',
              seatsRemaining: 6,
              staleLabel: null,
              termCode: '2026FALL',
              title: 'Embedded Systems'
            }
          ],
          state: 'results',
          termOptions: ['2026FALL']
        };
      }
    }
  }));
  const pluralResponse = createResponseRecorder();
  activeController.getSearchPage({ query: { q: 'E' }, session: { accountId: 1 } }, pluralResponse);
  assert.match(pluralResponse.body, /2 matching classes found/);
});

test('class search controller falls back to default class-search return path when originalUrl is missing', () => {
  const controller = createClassSearchController(createServices());
  const response = createResponseRecorder();

  controller.getClassDetail({ params: { offeringId: '4' }, session: {} }, response);

  assert.equal(response.redirectedTo, '/login?returnTo=%2Fclasses%2Fsearch');
});

test('class search controller renders an empty term selector without crashing', () => {
  const controller = createClassSearchController(createServices({
    classSearchService: {
      getOfferingDetails() {
        return { message: 'Class offering was not found.', status: 'not_found' };
      },
      getSearchPageData() {
        return {
          filters: { courseNumber: '', queryText: '', subjectCode: '', termCode: '' },
          results: [],
          state: 'idle',
          termOptions: []
        };
      }
    }
  }));
  const response = createResponseRecorder();

  controller.getSearchPage({ query: {}, session: { accountId: 1 } }, response);

  assert.equal(response.statusCode, 200);
  assert.doesNotMatch(response.body, /<option/);
});
