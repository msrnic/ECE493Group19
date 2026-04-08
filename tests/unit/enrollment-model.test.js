const test = require('node:test');
const assert = require('node:assert/strict');

const { createEnrollmentModel, meetingsConflict } = require('../../src/models/enrollment-model');
const { createTestContext } = require('../helpers/test-context');

test('enrollment model returns null for missing offerings and false for non-overlapping meetings', () => {
  const context = createTestContext();
  const model = createEnrollmentModel(context.db);

  assert.equal(model.findOfferingById(999), null);
  assert.equal(model.listMatchingOfferings().length > 0, true);
  assert.equal(
    meetingsConflict(
      { endMinute: 660, meetingDays: 'Mon,Wed', startMinute: 600 },
      { endMinute: 660, meetingDays: 'Tue,Thu', startMinute: 600 }
    ),
    false
  );
  assert.equal(
    meetingsConflict(
      { endMinute: 660, meetingDays: undefined, startMinute: 600 },
      { endMinute: 660, meetingDays: 'Tue,Thu', startMinute: 600 }
    ),
    false
  );

  context.cleanup();
});

test('enrollment model createEnrollment returns false when seats cannot be decremented', () => {
  const context = createTestContext();
  const model = createEnrollmentModel(context.db);

  const created = model.createEnrollment(1, 2, '2026-03-07T12:00:00.000Z');
  assert.equal(created, false);
  assert.equal(
    context.db
      .prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = 1 AND offering_id = 2')
      .get().count,
    0
  );

  context.cleanup();
});

test('enrollment model logAttempt stores blank reason summaries when omitted', () => {
  const context = createTestContext();
  const model = createEnrollmentModel(context.db);

  model.logAttempt(1, 1, 'blocked', undefined, '2026-03-07T12:00:00.000Z');

  assert.equal(
    context.db
      .prepare('SELECT reason_summary FROM enrollment_attempts WHERE account_id = 1 ORDER BY id DESC LIMIT 1')
      .get().reason_summary,
    ''
  );

  context.cleanup();
});
