const test = require('node:test');
const assert = require('node:assert/strict');

const { createClassSearchService } = require('../../src/services/class-search-service');

test('class search service returns ordered matching classes with default term and freshness labels', () => {
  const service = createClassSearchService({
    classOfferingModel: {
      listAvailableTerms() {
        return ['2026FALL'];
      },
      searchAvailableOfferings(filters) {
        assert.equal(filters.termCode, '2026FALL');
        return [{
          courseCode: 'ENGL210',
          courseNumber: '210',
          id: 1,
          meetingDays: 'Mon,Wed',
          offeringCode: 'O_OPEN',
          seatsRemaining: 12,
          startMinute: 600,
          subjectCode: 'ENGL',
          termCode: '2026FALL',
          title: 'Technical Communication',
          updatedAt: '2026-03-07T12:00:00.000Z'
        }];
      }
    },
    classSearchTestState: { failureIdentifiers: [] },
    now: () => new Date('2026-03-07T12:00:30.000Z')
  });

  const payload = service.getSearchPageData(
    { email: 'userA@example.com', studentId: 'userA' },
    { q: 'engl' }
  );

  assert.equal(payload.state, 'results');
  assert.equal(payload.results.length, 1);
  assert.equal(payload.results[0].isCurrent, true);
  assert.equal(payload.results[0].subjectCode, 'ENGL');
  assert.equal(payload.results[0].courseNumber, '210');
});

test('class search service returns a safe error state when search is fault injected', () => {
  const service = createClassSearchService({
    classOfferingModel: {
      listAvailableTerms() {
        return ['2026FALL'];
      },
      searchAvailableOfferings() {
        throw new Error('should not be called');
      }
    },
    classSearchTestState: { failureIdentifiers: ['usera@example.com'] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });

  const payload = service.getSearchPageData(
    { email: 'userA@example.com', studentId: 'userA' },
    { q: 'engl' }
  );

  assert.equal(payload.state, 'error');
  assert.equal(payload.results.length, 0);
});

test('class search service covers idle, empty, stale, not-found, and detail-error branches', () => {
  const service = createClassSearchService({
    classOfferingModel: {
      findAvailableOfferingById(offeringId) {
        if (offeringId === 10) {
          return {
            courseCode: 'STAT252',
            courseNumber: '252',
            id: 10,
            meetingDays: 'Tue,Thu',
            offeringCode: 'O_OPEN',
            seatsRemaining: 1,
            startMinute: 840,
            subjectCode: 'STAT',
            termCode: '2026FALL',
            title: 'Applied Statistics',
            updatedAt: '2026-03-07T10:00:00.000Z'
          };
        }

        return null;
      },
      listAvailableTerms() {
        return [];
      },
      searchAvailableOfferings() {
        return [];
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });

  const idle = service.getSearchPageData({ email: 'userA@example.com', studentId: 'userA' }, {});
  assert.equal(idle.state, 'idle');
  assert.equal(idle.filters.termCode, '');

  const empty = service.getSearchPageData(
    { email: 'userA@example.com', studentId: 'userA' },
    { subject: 'STAT' }
  );
  assert.equal(empty.state, 'empty');

  const detail = service.getOfferingDetails({ email: 'userA@example.com', studentId: 'userA' }, 10);
  assert.equal(detail.status, 'success');
  assert.equal(detail.offering.isCurrent, false);
  assert.match(detail.offering.staleLabel, /Stale availability snapshot/);

  const notFound = service.getOfferingDetails({ email: 'userA@example.com', studentId: 'userA' }, 99);
  assert.equal(notFound.status, 'not_found');

  const erroredDetail = createClassSearchService({
    classOfferingModel: {
      findAvailableOfferingById() {
        throw new Error('should not be called');
      },
      listAvailableTerms() {
        return ['2026FALL'];
      },
      searchAvailableOfferings() {
        throw new Error('should not be called');
      }
    },
    classSearchTestState: { failureIdentifiers: ['usera@example.com'] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  }).getOfferingDetails({ email: 'userA@example.com', studentId: 'userA' }, 10);

  assert.equal(erroredDetail.status, 'error');
});

test('class search service supports student-id fault matching and current freshness boundary', () => {
  const service = createClassSearchService({
    classOfferingModel: {
      findAvailableOfferingById() {
        return {
          courseCode: 'ENGL210',
          courseNumber: '210',
          id: 1,
          meetingDays: 'Mon,Wed',
          offeringCode: 'O_OPEN',
          seatsRemaining: 12,
          startMinute: 600,
          subjectCode: 'ENGL',
          termCode: '2026FALL',
          title: 'Technical Communication',
          updatedAt: '2026-03-07T11:59:00.000Z'
        };
      },
      listAvailableTerms() {
        return ['2026FALL'];
      },
      searchAvailableOfferings() {
        throw new Error('should not be called');
      }
    },
    classSearchTestState: { failureIdentifiers: ['student-001'] },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });

  const detail = createClassSearchService({
    classOfferingModel: {
      findAvailableOfferingById() {
        return {
          courseCode: 'ENGL210',
          courseNumber: '210',
          id: 1,
          meetingDays: 'Mon,Wed',
          offeringCode: 'O_OPEN',
          seatsRemaining: 12,
          startMinute: 600,
          subjectCode: 'ENGL',
          termCode: '2026FALL',
          title: 'Technical Communication',
          updatedAt: '2026-03-07T11:59:00.000Z'
        };
      },
      listAvailableTerms() {
        return ['2026FALL'];
      },
      searchAvailableOfferings() {
        return [];
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  }).getOfferingDetails({ email: 'safe@example.com', studentId: 'safe' }, 1);

  assert.equal(
    service.getSearchPageData({ email: 'safe@example.com', studentId: 'student-001' }, { q: 'ENGL' }).state,
    'error'
  );
  assert.equal(detail.status, 'success');
  assert.equal(detail.offering.isCurrent, true);
  assert.equal(detail.offering.staleLabel, null);
});

test('class search service preserves explicit term overrides', () => {
  let observedTermCode = null;
  const service = createClassSearchService({
    classOfferingModel: {
      listAvailableTerms() {
        return ['2026FALL', '2027WINTER'];
      },
      searchAvailableOfferings(filters) {
        observedTermCode = filters.termCode;
        return [];
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });

  const payload = service.getSearchPageData(
    { email: 'userA@example.com', studentId: 'userA' },
    { q: 'ENGL', term: '2027WINTER' }
  );

  assert.equal(observedTermCode, '2027WINTER');
  assert.equal(payload.state, 'empty');
});

test('class search service normalizes missing identifiers safely when no failure config exists', () => {
  const service = createClassSearchService({
    classOfferingModel: {
      findAvailableOfferingById() {
        return {
          courseCode: 'ENGL210',
          courseNumber: '210',
          id: 1,
          meetingDays: 'Mon,Wed',
          offeringCode: 'O_OPEN',
          seatsRemaining: 12,
          startMinute: 600,
          subjectCode: 'ENGL',
          termCode: '2026FALL',
          title: 'Technical Communication',
          updatedAt: '2026-03-07T11:59:59.000Z'
        };
      },
      listAvailableTerms() {
        return [];
      },
      searchAvailableOfferings(filters) {
        return [{
          courseCode: 'ENGL210',
          courseNumber: '210',
          id: 1,
          meetingDays: 'Mon,Wed',
          offeringCode: 'O_OPEN',
          seatsRemaining: 12,
          startMinute: 600,
          subjectCode: 'ENGL',
          termCode: filters.termCode,
          title: 'Technical Communication',
          updatedAt: '2026-03-07T11:59:59.000Z'
        }];
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });

  const page = service.getSearchPageData({}, { subject: 'engl' });
  const detail = service.getOfferingDetails({}, 1);

  assert.equal(page.state, 'results');
  assert.equal(page.filters.termCode, '');
  assert.equal(detail.status, 'success');
  assert.equal(detail.offering.isCurrent, true);
});
