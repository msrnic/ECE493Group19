const test = require('node:test');
const assert = require('node:assert/strict');

const { createCourseRosterModel } = require('../../src/models/course-roster-model');
const { createTestContext } = require('../helpers/test-context');

test('course roster model lists assigned offerings, authorized rosters, and audit rows', () => {
  const context = createTestContext();
  const model = createCourseRosterModel(context.db);
  const professorId = context.db.prepare('SELECT id FROM accounts WHERE email = ?').get('professor@example.com').id;
  const offeringId = context.db.prepare('SELECT id FROM class_offerings WHERE offering_code = ?').get('O_ROSTER').id;

  assert.equal(model.listAssignedOfferings(professorId).length >= 2, true);
  assert.equal(model.findAssignedOffering(professorId, offeringId).offeringCode, 'O_ROSTER');
  assert.equal(model.listRosterStudents(offeringId).length, 2);

  model.logRosterView(professorId, offeringId, 'success', '2026-03-07T12:00:00.000Z');
  assert.equal(
    context.db.prepare('SELECT outcome FROM roster_view_audit WHERE actor_account_id = ? ORDER BY id DESC LIMIT 1').get(professorId).outcome,
    'success'
  );

  context.cleanup();
});
