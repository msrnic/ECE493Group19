const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const ADMIN_PASSWORD = 'AdminPass!234';

async function loginAsAdmin(agent) {
  await agent
    .post('/login')
    .type('form')
    .send({ identifier: 'admin@example.com', password: ADMIN_PASSWORD })
    .expect(302);
}

test('admin can force enroll a student, create audit state, and confirm over-capacity requests', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    await loginAsAdmin(agent);

    const dashboard = await agent.get('/dashboard');
    assert.equal(dashboard.status, 200);
    assert.match(dashboard.text, /Force Enroll Students/);

    const success = await agent
      .post('/admin/force-enroll')
      .type('form')
      .send({
        studentIdentifier: 'prereqStudent',
        offeringId: String(
          context.db.prepare("SELECT id FROM class_offerings WHERE offering_code = 'O_OPEN'").get().id
        ),
        reason: 'Override required for exceptional academic progression.'
      });
    assert.equal(success.status, 200);
    assert.match(success.text, /force enrolled successfully/i);

    const prereqStudentId = context.db
      .prepare("SELECT id FROM accounts WHERE email = 'prereq.student@example.com'")
      .get().id;
    const openOfferingId = context.db
      .prepare("SELECT id FROM class_offerings WHERE offering_code = 'O_OPEN'")
      .get().id;

    assert.equal(
      context.db
        .prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = ? AND offering_id = ?')
        .get(prereqStudentId, openOfferingId).count,
      1
    );
    assert.equal(
      context.db
        .prepare('SELECT COUNT(*) AS count FROM force_enroll_audit WHERE student_account_id = ? AND offering_id = ?')
        .get(prereqStudentId, openOfferingId).count,
      1
    );

    const fullOfferingId = context.db
      .prepare("SELECT id FROM class_offerings WHERE offering_code = 'O_FULL'")
      .get().id;
    const pending = await agent
      .post('/admin/force-enroll')
      .type('form')
      .send({
        studentIdentifier: 'outage.user@example.com',
        offeringId: String(fullOfferingId),
        reason: 'Override required to support time-sensitive registration resolution.'
      });
    assert.equal(pending.status, 200);
    assert.match(pending.text, /Over-capacity confirmation is required/i);

    const requestId = context.db
      .prepare(
        `
          SELECT request_id
          FROM force_enroll_requests
          WHERE student_account_id = (
            SELECT id FROM accounts WHERE email = 'outage.user@example.com'
          )
            AND offering_id = ?
          ORDER BY created_at DESC
          LIMIT 1
        `
      )
      .get(fullOfferingId).request_id;

    const confirmed = await agent
      .post(`/admin/force-enroll/${requestId}/confirm`)
      .type('form')
      .send({ action: 'confirm' });
    assert.equal(confirmed.status, 200);
    assert.match(confirmed.text, /force enrolled successfully/i);

    const fullAudit = context.db
      .prepare('SELECT over_capacity_override FROM force_enroll_audit WHERE request_id = ?')
      .get(requestId);
    assert.deepEqual(fullAudit, { over_capacity_override: 1 });
  } finally {
    context.cleanup();
  }
});

test('force enroll rejects missing entities, hard constraints, and simulated failures without changing enrollment state', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    await loginAsAdmin(agent);
    const openOfferingId = context.db
      .prepare("SELECT id FROM class_offerings WHERE offering_code = 'O_OPEN'")
      .get().id;

    const missingStudent = await agent
      .post('/api/force-enroll/requests')
      .send({
        offeringId: openOfferingId,
        reason: 'Override required for exceptional academic progression.',
        studentIdentifier: 'missing-student'
      });
    assert.equal(missingStudent.status, 404);
    assert.equal(missingStudent.body.code, 'STUDENT_NOT_FOUND');

    const missingOffering = await agent
      .post('/api/force-enroll/requests')
      .send({
        offeringId: 9999,
        reason: 'Override required for exceptional academic progression.',
        studentIdentifier: 'prereqStudent'
      });
    assert.equal(missingOffering.status, 404);
    assert.equal(missingOffering.body.code, 'OFFERING_NOT_FOUND');

    const hardConstraint = await agent
      .post('/api/force-enroll/requests')
      .send({
        offeringId: openOfferingId,
        reason: 'Override required for exceptional academic progression.',
        studentIdentifier: 'disabled.user@example.com'
      });
    assert.equal(hardConstraint.status, 409);
    assert.equal(hardConstraint.body.code, 'HARD_CONSTRAINT_FAILED');

    context.forceEnrollTestState.failureIdentifiers.push('prereq.student@example.com');
    const failure = await agent
      .post('/api/force-enroll/requests')
      .send({
        offeringId: openOfferingId,
        reason: 'Override required for exceptional academic progression.',
        studentIdentifier: 'prereqStudent'
      });
    assert.equal(failure.status, 500);
    assert.equal(failure.body.code, 'TRANSACTION_FAILED');

    const prereqStudentId = context.db
      .prepare("SELECT id FROM accounts WHERE email = 'prereq.student@example.com'")
      .get().id;
    assert.equal(
      context.db
        .prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = ? AND offering_id = ?')
        .get(prereqStudentId, openOfferingId).count,
      0
    );
  } finally {
    context.cleanup();
  }
});
