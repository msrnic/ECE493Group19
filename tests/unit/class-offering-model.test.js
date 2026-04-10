const test = require('node:test');
const assert = require('node:assert/strict');

const { createClassOfferingModel, parseCourseCode } = require('../../src/models/class-offering-model');

test('parseCourseCode handles standard and missing course code formats', () => {
  assert.deepEqual(parseCourseCode('ENGL210'), { courseNumber: '210', subjectCode: 'ENGL' });
  assert.deepEqual(parseCourseCode('  misc  '), { courseNumber: 'C', subjectCode: 'MIS' });
  assert.deepEqual(parseCourseCode(''), { courseNumber: '', subjectCode: '' });
});

test('class offering model lists terms, filters searches, and excludes unavailable offerings from details', () => {
  const prepareCalls = [];
  const db = {
    prepare(sql) {
      prepareCalls.push(sql);

      if (sql.includes('SELECT DISTINCT term_code')) {
        return {
          all() {
            return [{ term_code: '2026FALL' }];
          }
        };
      }

      if (sql.includes('WHERE id = ?')) {
        return {
          get(offeringId) {
            return offeringId === 1
              ? {
                  course_code: 'ENGL210',
                  id: 1,
                  meeting_days: 'Mon,Wed',
                  offering_code: 'O_OPEN',
                  seats_remaining: 12,
                  start_minute: 600,
                  term_code: '2026FALL',
                  title: 'Technical Communication',
                  updated_at: '2026-03-07T12:00:00.000Z'
                }
              : undefined;
          }
        };
      }

      return {
        all(...values) {
          const hasSubject = values.includes('ENGL%');
          const hasCourseNumber = values.includes('%210%');
          const hasQuery = values.includes('%technical%');
          const hasTerm = values.includes('2026FALL');

          assert.equal(typeof hasTerm, 'boolean');

          return hasSubject || hasCourseNumber || hasQuery || values.length === 0
            ? [{
                course_code: 'ENGL210',
                id: 1,
                meeting_days: 'Mon,Wed',
                offering_code: 'O_OPEN',
                seats_remaining: 12,
                start_minute: 600,
                term_code: '2026FALL',
                title: 'Technical Communication',
                updated_at: '2026-03-07T12:00:00.000Z'
              }]
            : [];
        }
      };
    }
  };
  const model = createClassOfferingModel(db);

  assert.deepEqual(model.listAvailableTerms(), ['2026FALL']);
  assert.equal(model.findAvailableOfferingById(1).offeringCode, 'O_OPEN');
  assert.equal(model.findAvailableOfferingById(2), null);

  assert.equal(model.searchAvailableOfferings({
    courseNumber: '',
    queryText: 'technical',
    subjectCode: '',
    termCode: '2026FALL'
  })[0].courseCode, 'ENGL210');

  assert.equal(model.searchAvailableOfferings({
    courseNumber: '210',
    queryText: '',
    subjectCode: 'ENGL',
    termCode: '2026FALL'
  })[0].subjectCode, 'ENGL');

  assert.equal(model.searchAvailableOfferings({
    courseNumber: '',
    queryText: '',
    subjectCode: '',
    termCode: ''
  })[0].offeringCode, 'O_OPEN');

  assert.ok(prepareCalls.some((sql) => sql.includes('ORDER BY start_minute ASC, course_code ASC')));
});
