const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { closeAll, getDb } = require('../../src/db/connection');
const {
  SCHEDULE_BUILDER_FIXTURES,
  seedLoginFixtures
} = require('../../src/db/migrations/seed-login-fixtures');

test('seedLoginFixtures honors explicit timestamps and seeds schedule builder fixture data', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seed-login-fixtures-'));
  const dbPath = path.join(tempDir, 'sis.db');
  const now = new Date('2027-01-01T00:00:00.000Z');
  const lockedUntil = new Date('2027-01-01T00:15:00.000Z');

  const resolvedPath = seedLoginFixtures(dbPath, { lockedUntil, now });
  const db = getDb(resolvedPath);

  const lockedUser = db.prepare(`
    SELECT password_changed_at, locked_until
    FROM accounts
    WHERE email = 'locked.user@example.com'
  `).get();
  assert.equal(lockedUser.password_changed_at, now.toISOString());
  assert.equal(lockedUser.locked_until, lockedUntil.toISOString());

  const term = db.prepare(`
    SELECT is_available
    FROM planning_terms
    WHERE term_code = '2026FALL'
  `).get();
  assert.equal(term.is_available, 1);

  const compatibilityCourse = db.prepare(`
    SELECT compatibility_status
    FROM schedule_builder_courses
    WHERE course_code = 'SCH460'
  `).get();
  assert.equal(compatibilityCourse.compatibility_status, 'missing');

  const sharedListingCourse = db.prepare(`
    SELECT shared_listing_group
    FROM schedule_builder_courses
    WHERE course_code = 'XLIST410A'
  `).get();
  assert.equal(sharedListingCourse.shared_listing_group, 'XGROUP-410');

  const fullGroup = db.prepare(`
    SELECT seats_remaining
    FROM schedule_builder_option_groups
    WHERE option_code = 'SCH404-A'
  `).get();
  assert.equal(fullGroup.seats_remaining, 0);

  const builderCourseCount = db.prepare(`
    SELECT COUNT(*) AS count
    FROM schedule_builder_courses
  `).get();
  assert.equal(builderCourseCount.count, SCHEDULE_BUILDER_FIXTURES.courses.length);

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});
