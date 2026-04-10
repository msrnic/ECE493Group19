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

test('enrollment model creates withdrawal records and restores seat counts', () => {
  const context = createTestContext();
  const model = createEnrollmentModel(context.db);
  const accountId = context.db
    .prepare('SELECT id FROM accounts WHERE email = ?')
    .get('conflict.student@example.com').id;
  const offeringId = context.db
    .prepare('SELECT id FROM class_offerings WHERE offering_code = ?')
    .get('O_CONFLICT').id;
  const beforeSeats = context.db
    .prepare('SELECT seats_remaining FROM class_offerings WHERE offering_code = ?')
    .get('O_CONFLICT').seats_remaining;

  const withdrawn = model.createWithdrawal(accountId, offeringId, {
    createdAt: '2026-03-07T12:00:00.000Z',
    feeImpactSummary: 'The current class charge of $410.00 remains applied after withdrawal.',
    transcriptImpact: 'A W notation will appear on your transcript for this class.'
  });

  assert.equal(withdrawn, true);
  assert.equal(model.findCurrentEnrollment(accountId, offeringId), null);
  assert.equal(
    context.db
      .prepare('SELECT COUNT(*) AS count FROM withdrawal_records WHERE account_id = ? AND offering_id = ?')
      .get(accountId, offeringId).count,
    1
  );
  assert.equal(
    context.db.prepare('SELECT seats_remaining FROM class_offerings WHERE offering_code = ?').get('O_CONFLICT')
      .seats_remaining,
    beforeSeats + 1
  );

  const duplicate = model.createWithdrawal(accountId, offeringId, {
    createdAt: '2026-03-07T12:05:00.000Z',
    feeImpactSummary: 'same',
    transcriptImpact: 'same'
  });
  assert.equal(duplicate, false);

  context.cleanup();
});

test('enrollment model creates drop records and restores seat counts', () => {
  const context = createTestContext();
  const model = createEnrollmentModel(context.db);
  const accountId = context.db
    .prepare('SELECT id FROM accounts WHERE email = ?')
    .get('conflict.student@example.com').id;
  const offeringId = context.db
    .prepare('SELECT id FROM class_offerings WHERE offering_code = ?')
    .get('O_CONFLICT').id;
  const beforeSeats = context.db
    .prepare('SELECT seats_remaining FROM class_offerings WHERE offering_code = ?')
    .get('O_CONFLICT').seats_remaining;

  const dropped = model.createDrop(accountId, offeringId, {
    createdAt: '2026-03-07T12:00:00.000Z',
    feeImpactSummary: 'Drop policy applies. $410.00 will be reduced or refunded per deadline rules.'
  });

  assert.equal(dropped, true);
  assert.equal(model.findCurrentEnrollment(accountId, offeringId), null);
  assert.equal(
    context.db
      .prepare('SELECT COUNT(*) AS count FROM drop_records WHERE account_id = ? AND offering_id = ?')
      .get(accountId, offeringId).count,
    1
  );
  assert.equal(
    context.db.prepare('SELECT seats_remaining FROM class_offerings WHERE offering_code = ?').get('O_CONFLICT')
      .seats_remaining,
    beforeSeats + 1
  );

  context.cleanup();
});

test('enrollment model creates waitlist records, exposes current waitlists, and lists alternatives', () => {
  const context = createTestContext();
  const model = createEnrollmentModel(context.db);
  const accountId = context.db
    .prepare('SELECT id FROM accounts WHERE email = ?')
    .get('userA@example.com').id;
  const offeringId = context.db
    .prepare('SELECT id FROM class_offerings WHERE offering_code = ?')
    .get('O_FULL').id;

  const created = model.createWaitlist(accountId, offeringId, {
    createdAt: '2026-03-07T12:00:00.000Z',
    usesPosition: true
  });

  assert.equal(created.waitlistStatus, 'waitlisted');
  assert.equal(created.waitlistPosition, 2);
  assert.equal(model.hasWaitlist(accountId, offeringId), true);
  assert.equal(model.listCurrentWaitlists(accountId).length, 1);
  assert.equal(model.listCurrentWaitlists(accountId)[0].waitlistPosition, 2);

  const alternatives = model.listWaitlistAlternatives(model.findOfferingById(offeringId));
  assert.equal(alternatives.length > 0, true);
  assert.equal(alternatives[0].offeringCode, 'O_ALT_OPEN');

  const duplicate = model.createWaitlist(accountId, offeringId, {
    createdAt: '2026-03-07T12:05:00.000Z',
    usesPosition: true
  });
  assert.equal(duplicate, false);

  context.cleanup();
});
