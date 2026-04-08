const test = require('node:test');
const assert = require('node:assert/strict');

const { createTestContext } = require('../helpers/test-context');
const { createStudentAccountModel } = require('../../src/models/student-account-model');

test('student account model finds student accounts by studentId and account id', () => {
  const context = createTestContext();
  const model = createStudentAccountModel(context.db);
  const student = model.findByStudentId('userA');

  assert.deepEqual(student, {
    accountId: student.accountId,
    displayName: 'userA',
    email: 'userA@example.com',
    role: 'student',
    status: 'active',
    studentId: 'userA'
  });
  assert.deepEqual(model.findByAccountId(student.accountId), student);

  context.cleanup();
});

test('student account model returns null for missing or inactive student lookups', () => {
  const context = createTestContext();
  const model = createStudentAccountModel(context.db);
  const lockedStudentId = context.db.prepare('SELECT id FROM accounts WHERE username = ?').get('lockedUser').id;
  const adminId = context.db.prepare('SELECT id FROM accounts WHERE username = ?').get('adminA').id;

  assert.equal(model.findByStudentId(''), null);
  assert.equal(model.findByAccountId(0), null);
  assert.equal(model.findByStudentId('missing-student'), null);
  assert.equal(model.findByAccountId(adminId), null);
  assert.equal(model.findActiveByAccountId(lockedStudentId), null);

  context.cleanup();
});
