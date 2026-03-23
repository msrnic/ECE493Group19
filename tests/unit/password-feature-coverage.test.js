const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const request = require('supertest');

const { createApp } = require('../../src/app');
const { applySchema } = require('../../src/db/migrations/apply-schema');
const { closeAll, getDb } = require('../../src/db/connection');
const { seedLoginFixtures } = require('../../src/db/migrations/seed-login-fixtures');
const { createAccountModel } = require('../../src/models/account-model');
const { createNotificationModel } = require('../../src/models/notification-model');
const { createPasswordChangeAttemptModel } = require('../../src/models/password-change-attempt-model');
const { createResetTokenModel } = require('../../src/models/reset-token-model');
const { createSessionModel } = require('../../src/models/session-model');
const { createPasswordPolicyService } = require('../../src/services/password-policy-service');

function buildTempDb() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc01-coverage-'));
  const dbPath = path.join(tempDir, 'sis.db');
  applySchema(dbPath);
  seedLoginFixtures(dbPath);
  return { db: getDb(dbPath), tempDir };
}

test('createApp exposes the e2e reset route for both success and error paths', async () => {
  const successDb = buildTempDb();
  let resetCount = 0;
  const successApp = createApp({
    db: successDb.db,
    resetFixtures: async () => {
      resetCount += 1;
    }
  });

  await request(successApp).post('/__reset-e2e').expect(204);
  assert.equal(resetCount, 1);

  closeAll();
  fs.rmSync(successDb.tempDir, { force: true, recursive: true });

  const errorDb = buildTempDb();
  const errorApp = createApp({
    db: errorDb.db,
    resetFixtures: async () => {
      throw new Error('reset failed');
    }
  });

  await request(errorApp).post('/__reset-e2e').expect(500);

  closeAll();
  fs.rmSync(errorDb.tempDir, { force: true, recursive: true });
});

test('password feature models cover list and null-return helper branches', () => {
  const { db, tempDir } = buildTempDb();
  const accountModel = createAccountModel(db);
  const notificationModel = createNotificationModel(db);
  const passwordChangeAttemptModel = createPasswordChangeAttemptModel(db);
  const resetTokenModel = createResetTokenModel(db);
  const sessionModel = createSessionModel(db);
  const policyService = createPasswordPolicyService();

  const account = accountModel.findByIdentifier('userA@example.com');
  const targets = accountModel.listPasswordManagementTargets(account.id);
  assert.equal(targets.some((target) => target.email === 'admin@example.com'), true);

  const updated = accountModel.updatePasswordHash(account.id, 'updated-hash', '2026-03-07T12:30:00.000Z');
  assert.equal(updated.password_hash, 'updated-hash');
  assert.equal(updated.password_changed_at, '2026-03-07T12:30:00.000Z');

  notificationModel.queueNotification({
    accountId: account.id,
    eventType: 'password_changed',
    channel: 'email',
    payload: { initiatedBy: 'self_service' },
    createdAt: '2026-03-07T12:30:00.000Z'
  });
  assert.equal(notificationModel.listByAccount(account.id).length >= 1, true);

  passwordChangeAttemptModel.recordAttempt({
    actorAccountId: null,
    targetAccountId: account.id,
    verificationType: 'reset_token',
    outcome: 'cancelled',
    requestId: 'coverage-request',
    createdAt: '2026-03-07T12:30:00.000Z'
  });
  assert.equal(passwordChangeAttemptModel.listByTargetAccount(account.id).length >= 1, true);

  passwordChangeAttemptModel.recordAttempt({
    actorAccountId: account.id,
    verificationType: 'admin_override',
    outcome: 'cancelled',
    requestId: 'null-target-request',
    createdAt: '2026-03-07T12:30:30.000Z'
  });
  const nullTargetAttempt = db
    .prepare('SELECT * FROM password_change_attempts WHERE request_id = ?')
    .get('null-target-request');
  assert.equal(nullTargetAttempt.target_account_id, null);

  assert.equal(resetTokenModel.findByRawToken('missing'), null);
  assert.equal(resetTokenModel.consumeToken(999, '2026-03-07T12:30:00.000Z'), null);

  sessionModel.createSession({
    id: 'coverage-session',
    accountId: account.id,
    createdAt: '2026-03-07T12:30:00.000Z',
    expiresAt: '2026-03-07T13:30:00.000Z'
  });
  assert.equal(
    sessionModel.invalidateSessionsForAccount(account.id, {
      reason: 'password_changed',
      revokedAt: '2026-03-07T12:31:00.000Z'
    }),
    1
  );
  assert.equal(sessionModel.listSessionsForAccount(account.id).length >= 1, true);

  const blankPolicy = policyService.validate('   ', { currentPassword: 'Anything!234' });
  assert.equal(blankPolicy.failedRules.includes('trimmed'), true);
  assert.equal(blankPolicy.failedRules.includes('different_from_current'), false);

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});

test('password feature models cover preserved-session invalidation and explicit attempt metadata', () => {
  const { db, tempDir } = buildTempDb();
  const accountModel = createAccountModel(db);
  const passwordChangeAttemptModel = createPasswordChangeAttemptModel(db);
  const sessionModel = createSessionModel(db);
  const policyService = createPasswordPolicyService();

  const account = accountModel.findByIdentifier('userA@example.com');

  passwordChangeAttemptModel.recordAttempt({
    actorAccountId: account.id,
    targetAccountId: account.id,
    verificationType: 'admin_override',
    outcome: 'success',
    failureCountAfterAttempt: 3,
    cooldownUntil: '2026-03-07T12:35:00.000Z',
    requestId: 'coverage-attempt-full',
    metadata: { initiatedBy: 'admin_override' },
    createdAt: '2026-03-07T12:30:00.000Z'
  });

  const attempts = passwordChangeAttemptModel.listByTargetAccount(account.id);
  const recordedAttempt = attempts.find((attempt) => attempt.request_id === 'coverage-attempt-full');
  assert.equal(recordedAttempt.actor_account_id, account.id);
  assert.equal(recordedAttempt.failure_count_after_attempt, 3);
  assert.equal(recordedAttempt.cooldown_until, '2026-03-07T12:35:00.000Z');
  assert.equal(JSON.parse(recordedAttempt.metadata_json).initiatedBy, 'admin_override');

  sessionModel.createSession({
    id: 'keep-session',
    accountId: account.id,
    createdAt: '2026-03-07T12:30:00.000Z',
    expiresAt: '2026-03-07T13:30:00.000Z'
  });
  sessionModel.createSession({
    id: 'drop-session',
    accountId: account.id,
    createdAt: '2026-03-07T12:31:00.000Z',
    expiresAt: '2026-03-07T13:31:00.000Z'
  });

  assert.equal(sessionModel.findActiveSession('missing-session'), null);
  assert.equal(
    sessionModel.invalidateSessionsForAccount(account.id, {
      preserveSessionId: 'keep-session',
      reason: 'password_changed',
      revokedAt: '2026-03-07T12:32:00.000Z'
    }),
    1
  );
  assert.equal(sessionModel.findActiveSession('keep-session').id, 'keep-session');
  assert.equal(sessionModel.findActiveSession('drop-session'), null);

  sessionModel.createSession({
    id: 'fresh-session',
    accountId: account.id,
    createdAt: '2026-03-07T12:33:00.000Z',
    expiresAt: '2026-03-07T13:33:00.000Z'
  });
  sessionModel.invalidateSessionsForAccount(account.id, { preserveSessionId: 'keep-session' });

  const sessions = sessionModel.listSessionsForAccount(account.id);
  const revokedSession = sessions.find((session) => session.id === 'drop-session');
  const freshSession = sessions.find((session) => session.id === 'fresh-session');
  assert.equal(revokedSession.invalidation_reason, 'password_changed');
  assert.equal(revokedSession.revoked_at, '2026-03-07T12:32:00.000Z');
  assert.equal(freshSession.revoked_at, null);

  const undefinedPassword = policyService.validate();
  assert.equal(undefinedPassword.failedRules.includes('min_length'), true);
  assert.equal(undefinedPassword.failedRules.includes('uppercase'), true);

  const noCurrentPassword = policyService.validate('PolicyOnly!234');
  assert.equal(noCurrentPassword.isValid, true);
  assert.deepEqual(noCurrentPassword.failedRules, []);

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});
