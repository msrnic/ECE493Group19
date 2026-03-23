const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { getDb, closeAll, resolveDbPath } = require('../../src/db/connection');
const { applySchema } = require('../../src/db/migrations/apply-schema');
const { seedLoginFixtures } = require('../../src/db/migrations/seed-login-fixtures');
const { createAccountModel } = require('../../src/models/account-model');
const { createLoginAttemptModel } = require('../../src/models/login-attempt-model');
const { createSessionModel } = require('../../src/models/session-model');
const { createAuthAuditService } = require('../../src/services/auth-audit-service');

function createDatabase() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc02-branches-'));
  const dbPath = path.join(tempDir, 'sis.db');
  applySchema(dbPath);
  seedLoginFixtures(dbPath);
  return { tempDir, dbPath, db: getDb(dbPath) };
}

test('connection helpers reuse cached connections and respect DB_PATH defaults', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc02-conn-'));
  const dbPath = path.join(tempDir, 'sis.db');

  process.env.DB_PATH = dbPath;
  assert.equal(resolveDbPath(), path.resolve(dbPath));
  assert.equal(resolveDbPath('custom.db').endsWith(path.join('ECE493Group19', 'custom.db')), true);

  const firstDb = getDb(dbPath);
  const secondDb = getDb(dbPath);
  assert.equal(firstDb, secondDb);

  closeAll();
  closeAll();
  delete process.env.DB_PATH;
  assert.equal(resolveDbPath().endsWith(path.join('ECE493Group19', 'sis.db')), true);
  fs.rmSync(tempDir, { force: true, recursive: true });
});

test('account, attempt, session, and audit helpers cover null and optional-field branches', () => {
  const { db, tempDir } = createDatabase();
  const accountModel = createAccountModel(db);
  const loginAttemptModel = createLoginAttemptModel(db);
  const sessionModel = createSessionModel(db);
  const auditService = createAuthAuditService(loginAttemptModel);

  assert.equal(accountModel.findByIdentifier(''), null);
  assert.equal(accountModel.getDashboardAccount(999), null);

  loginAttemptModel.recordAttempt({
    identifier: 'unknown@example.com',
    outcome: 'invalid_credentials',
    attemptedAt: '2026-03-07T12:00:00.000Z'
  });

  assert.equal(
    db.prepare('SELECT source_ip, user_agent, account_id FROM login_attempts WHERE submitted_identifier = ?').get('unknown@example.com').source_ip,
    null
  );
  assert.equal(sessionModel.findActiveSession('missing-session'), null);
  assert.equal(sessionModel.invalidateSession('missing-session'), 0);
  assert.equal(sessionModel.invalidateSessionsForAccount(999), 0);

  const createdSession = sessionModel.createSession({
    id: 'session-1',
    accountId: 1,
    createdAt: '2026-03-07T12:05:00.000Z',
    expiresAt: '2026-03-07T13:05:00.000Z'
  });
  assert.equal(createdSession.id, 'session-1');
  assert.equal(
    sessionModel.invalidateSession('session-1', {
      reason: 'logout',
      revokedAt: '2026-03-07T12:10:00.000Z'
    }),
    1
  );
  assert.equal(sessionModel.findActiveSession('session-1'), null);
  assert.deepEqual(
    db.prepare('SELECT invalidation_reason, revoked_at FROM user_sessions WHERE id = ?').get('session-1'),
    {
      invalidation_reason: 'logout',
      revoked_at: '2026-03-07T12:10:00.000Z'
    }
  );

  auditService.recordFailure({
    accountId: null,
    identifier: 'unknown@example.com',
    outcome: 'service_unavailable'
  });

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});
