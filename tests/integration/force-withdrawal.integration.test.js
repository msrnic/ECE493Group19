const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const ADMIN_PASSWORD = 'AdminPass!234';

async function loginAsAdmin(agent) {
  await agent.post('/login').type('form').send({
    identifier: 'admin@example.com',
    password: ADMIN_PASSWORD
  }).expect(302);
}

test('admin can review implications and force withdraw an enrolled student with audit logging', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    await loginAsAdmin(agent);

    const page = await agent.get('/admin/force-withdrawals');
    assert.equal(page.status, 200);
    assert.match(page.text, /Force Withdraw Student/);

    const offeringId = context.db.prepare("SELECT id FROM class_offerings WHERE offering_code = 'O_CONFLICT'").get().id;
    const implications = await agent.get(`/admin/force-withdrawals/implications?studentId=conflictStudent&offeringId=${offeringId}&reason=Administrative%20removal`);
    assert.equal(implications.status, 200);
    assert.match(implications.text, /W notation/);

    const result = await agent.post('/admin/force-withdrawals').type('form').send({
      offeringId: String(offeringId),
      reason: 'Administrative removal after enrollment review.',
      studentIdentifier: 'conflictStudent'
    });
    assert.equal(result.status, 200);
    assert.match(result.text, /Forced withdrawal completed successfully/);

    const studentId = context.db.prepare("SELECT id FROM accounts WHERE email = 'conflict.student@example.com'").get().id;
    assert.equal(
      context.db.prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = ? AND offering_id = ?').get(studentId, offeringId).count,
      0
    );
    assert.equal(
      context.db.prepare('SELECT COUNT(*) AS count FROM force_withdrawal_audit WHERE student_account_id = ? AND offering_id = ?').get(studentId, offeringId).count,
      1
    );
  } finally {
    context.cleanup();
  }
});

test('force withdrawal preserves state on not-enrolled, cancel, failure, and pending-audit outcomes', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    await loginAsAdmin(agent);
    const offeringId = context.db.prepare("SELECT id FROM class_offerings WHERE offering_code = 'O_CONFLICT'").get().id;
    const studentId = context.db.prepare("SELECT id FROM accounts WHERE email = 'conflict.student@example.com'").get().id;

    const cancel = await agent.post('/admin/force-withdrawals').type('form').send({ action: 'cancel' });
    assert.equal(cancel.status, 200);
    assert.match(cancel.text, /Forced withdrawal was canceled/);

    const notEnrolled = await agent.post('/api/admin/force-withdrawals').send({
      offeringId,
      reason: 'Administrative removal after enrollment review.',
      studentIdentifier: 'userA'
    });
    assert.equal(notEnrolled.status, 409);
    assert.equal(notEnrolled.body.code, 'NOT_ENROLLED');

    context.forceWithdrawalTestState.failureIdentifiers.push('conflict.student@example.com');
    const failure = await agent.post('/api/admin/force-withdrawals').send({
      offeringId,
      reason: 'Administrative removal after enrollment review.',
      studentIdentifier: 'conflictStudent'
    });
    assert.equal(failure.status, 500);
    assert.equal(failure.body.code, 'TRANSACTION_FAILED');
    context.resetForceWithdrawalTestState();

    context.forceWithdrawalTestState.auditFailureIdentifiers.push('conflict.student@example.com');
    const pending = await agent.post('/api/admin/force-withdrawals').send({
      offeringId,
      reason: 'Administrative removal after enrollment review.',
      studentIdentifier: 'conflictStudent'
    });
    assert.equal(pending.status, 200);
    assert.equal(pending.body.status, 'pending_audit');
    assert.equal(
      context.db.prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = ? AND offering_id = ?').get(studentId, offeringId).count,
      0
    );
    assert.equal(
      context.db.prepare('SELECT COUNT(*) AS count FROM force_withdrawal_pending_audit').get().count,
      1
    );
  } finally {
    context.cleanup();
  }
});
