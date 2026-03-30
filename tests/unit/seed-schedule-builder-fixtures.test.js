const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { closeAll, getDb } = require('../../src/db/connection');
const {
  SCHEDULE_BUILDER_FIXTURES,
  seedLoginFixtures,
  seedScheduleBuilderFixtures
} = require('../../src/db/migrations/seed-login-fixtures');

test('seedScheduleBuilderFixtures refreshes schedule-builder data without resetting accounts', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seed-schedule-builder-fixtures-'));
  const dbPath = path.join(tempDir, 'sis.db');

  seedLoginFixtures(dbPath);
  const db = getDb(dbPath);

  const initialAccountCount = db.prepare('SELECT COUNT(*) AS count FROM accounts').get().count;
  const initialCourseCount = db.prepare('SELECT COUNT(*) AS count FROM courses').get().count;

  db.prepare(`
    UPDATE schedule_builder_courses
    SET title = 'Stale Title'
    WHERE course_code = 'SCH101'
  `).run();
  db.prepare('UPDATE planning_terms SET is_available = 0').run();

  const now = new Date('2028-02-01T10:00:00.000Z');
  const resolvedPath = seedScheduleBuilderFixtures(dbPath, { now });

  assert.equal(path.resolve(dbPath), resolvedPath);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM accounts').get().count, initialAccountCount);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM courses').get().count, initialCourseCount);

  const planningTerm = db.prepare(`
    SELECT term_code, is_available, created_at
    FROM planning_terms
    WHERE term_code = '2026FALL'
  `).get();
  assert.equal(planningTerm.term_code, SCHEDULE_BUILDER_FIXTURES.term.termCode);
  assert.equal(planningTerm.is_available, 1);
  assert.equal(planningTerm.created_at, now.toISOString());

  const builderCourseCount = db.prepare(`
    SELECT COUNT(*) AS count
    FROM schedule_builder_courses
  `).get();
  assert.equal(builderCourseCount.count, SCHEDULE_BUILDER_FIXTURES.courses.length);

  const refreshedCourse = db.prepare(`
    SELECT title
    FROM schedule_builder_courses
    WHERE course_code = 'SCH101'
  `).get();
  assert.equal(refreshedCourse.title, 'Planning Foundations');

  const addedCourse = db.prepare(`
    SELECT title
    FROM schedule_builder_courses
    WHERE course_code = 'SCH220'
  `).get();
  assert.equal(addedCourse.title, 'Constraint Modeling');

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});
