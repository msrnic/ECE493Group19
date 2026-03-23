const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { closeAll, getDb } = require('../../src/db/connection');
const { applySchema } = require('../../src/db/migrations/apply-schema');

test('applySchema backfills missing columns for pre-feature databases', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc02-upgrade-'));
  const dbPath = path.join(tempDir, 'sis.db');
  const db = getDb(dbPath);

  db.exec(`
    CREATE TABLE accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      status TEXT NOT NULL,
      failed_attempt_count INTEGER NOT NULL DEFAULT 0,
      last_failed_at TEXT,
      locked_until TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE user_sessions (
      id TEXT PRIMARY KEY,
      account_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked_at TEXT
    );
    INSERT INTO accounts (
      email, username, password_hash, status, failed_attempt_count,
      last_failed_at, locked_until, created_at, updated_at
    ) VALUES (
      'legacy@example.com', 'legacy', 'hash', 'active', 0,
      NULL, NULL, '2026-03-07T12:00:00.000Z', '2026-03-07T12:00:00.000Z'
    );
  `);

  applySchema(dbPath);

  const columns = db.prepare('PRAGMA table_info(accounts)').all();
  assert.equal(columns.some((column) => column.name === 'role'), true);
  assert.equal(columns.some((column) => column.name === 'password_changed_at'), true);
  const sessionColumns = db.prepare('PRAGMA table_info(user_sessions)').all();
  assert.equal(sessionColumns.some((column) => column.name === 'invalidation_reason'), true);

  const row = db.prepare('SELECT role, password_changed_at FROM accounts WHERE email = ?').get('legacy@example.com');
  assert.equal(row.role, 'student');
  assert.equal(row.password_changed_at, '2026-03-07T12:00:00.000Z');

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});
