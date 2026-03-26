const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { closeAll, getDb } = require('../../src/db/connection');
const { applySchema } = require('../../src/db/migrations/apply-schema');
const { seedLoginFixtures } = require('../../src/db/migrations/seed-login-fixtures');
const { createAccountModel } = require('../../src/models/account-model');
const { createNotificationAttemptModel } = require('../../src/models/notification-attempt-model');
const { createRoleModel } = require('../../src/models/role-model');
const { createUserAccountModel } = require('../../src/models/user-account-model');

function buildTempDb() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc43-models-'));
  const dbPath = path.join(tempDir, 'sis.db');
  applySchema(dbPath);
  seedLoginFixtures(dbPath);
  return { db: getDb(dbPath), tempDir };
}

test('admin-account models cover assignable roles, account creation, rollback, notification attempts, and must-change reset', () => {
  const { db, tempDir } = buildTempDb();
  const accountModel = createAccountModel(db);
  const notificationAttemptModel = createNotificationAttemptModel(db);
  const roleModel = createRoleModel(db);
  const userAccountModel = createUserAccountModel(db);

  const roles = roleModel.listAssignableRoles();
  const studentRole = roles.find((role) => role.role_key === 'student');
  assert.equal(roles.length, 3);
  assert.equal(roleModel.findAssignableRoleById(studentRole.id).display_name, 'Student');

  db.prepare('UPDATE roles SET is_assignable = 0 WHERE id = ?').run(studentRole.id);
  assert.equal(roleModel.findAssignableRoleById(studentRole.id), null);
  db.prepare('UPDATE roles SET is_assignable = 1 WHERE id = ?').run(studentRole.id);

  const created = userAccountModel.createAccount(
    {
      createdAt: '2026-03-07T12:30:00.000Z',
      email: 'new.user@example.com',
      passwordHash: 'hash-1',
      roleId: studentRole.id,
      roleKey: 'student',
      username: 'new.user@example.com'
    },
    {}
  );
  const account = accountModel.findByIdentifier('new.user@example.com');
  assert.equal(created.accountId, account.id);
  assert.equal(account.must_change_password, 1);
  assert.equal(
    db.prepare('SELECT role_id FROM role_assignments WHERE account_id = ?').get(account.id).role_id,
    studentRole.id
  );

  const updated = accountModel.updatePasswordHash(
    account.id,
    'updated-hash',
    '2026-03-07T12:31:00.000Z'
  );
  assert.equal(updated.must_change_password, 0);

  notificationAttemptModel.recordAttempt({
    accountId: account.id,
    attemptedAt: '2026-03-07T12:31:00.000Z',
    channel: 'email',
    status: 'sent'
  });
  notificationAttemptModel.recordAttempt({
    accountId: account.id,
    attemptedAt: '2026-03-07T12:32:00.000Z',
    channel: 'email',
    errorCode: 'DELIVERY_FAILED',
    errorMessage: 'Failed to deliver.',
    status: 'failed'
  });
  assert.equal(notificationAttemptModel.listByAccount(account.id).length, 2);

  assert.throws(() => {
    userAccountModel.createAccount(
      {
        createdAt: '2026-03-07T12:33:00.000Z',
        email: 'rollback.user@example.com',
        passwordHash: 'hash-2',
        roleId: studentRole.id,
        roleKey: 'student',
        username: 'rollback.user@example.com'
      },
      { simulateFailure: true }
    );
  }, /Simulated account creation failure/);
  assert.equal(accountModel.findByIdentifier('rollback.user@example.com'), null);

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});
