const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { closeAll, getDb } = require('../../src/db/connection');
const { applySchema } = require('../../src/db/migrations/apply-schema');
const { seedLoginFixtures } = require('../../src/db/migrations/seed-login-fixtures');

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
    CREATE TABLE dashboard_load_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      request_type TEXT NOT NULL,
      outcome TEXT NOT NULL,
      attempted_sections INTEGER NOT NULL,
      successful_sections INTEGER NOT NULL,
      failed_sections INTEGER NOT NULL,
      occurred_at TEXT NOT NULL
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
  const loadColumns = db.prepare('PRAGMA table_info(dashboard_load_events)').all();
  assert.equal(loadColumns.some((column) => column.name === 'duration_ms'), true);

  const row = db.prepare('SELECT role, password_changed_at FROM accounts WHERE email = ?').get('legacy@example.com');
  assert.equal(row.role, 'student');
  assert.equal(row.password_changed_at, '2026-03-07T12:00:00.000Z');

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});

test('applySchema recreates the accounts table when the professor role is missing from the legacy check constraint', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc02-upgrade-role-'));
  const dbPath = path.join(tempDir, 'sis.db');
  const db = getDb(dbPath);

  db.exec(`
    CREATE TABLE accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
      password_hash TEXT NOT NULL,
      status TEXT NOT NULL,
      failed_attempt_count INTEGER NOT NULL DEFAULT 0,
      last_failed_at TEXT,
      locked_until TEXT,
      password_changed_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE user_sessions (
      id TEXT PRIMARY KEY,
      account_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      invalidation_reason TEXT
    );
    INSERT INTO accounts (
      email, username, role, password_hash, status, failed_attempt_count,
      last_failed_at, locked_until, password_changed_at, created_at, updated_at
    ) VALUES (
      'legacy-admin@example.com', 'legacyAdmin', 'admin', 'hash', 'active', 0,
      NULL, NULL, '2026-03-07T12:00:00.000Z', '2026-03-07T12:00:00.000Z', '2026-03-07T12:00:00.000Z'
    );
  `);

  applySchema(dbPath);

  const tableSql = db.prepare(
    `SELECT sql
     FROM sqlite_master
     WHERE type = 'table' AND name = 'accounts'`
  ).get().sql;
  assert.match(tableSql, /professor/);

  db.prepare(`
    INSERT INTO accounts (
      email, username, role, password_hash, status, failed_attempt_count,
      last_failed_at, locked_until, password_changed_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'professor-legacy@example.com',
    'legacyProfessor',
    'professor',
    'hash',
    'active',
    0,
    null,
    null,
    '2026-03-07T12:00:00.000Z',
    '2026-03-07T12:00:00.000Z',
    '2026-03-07T12:00:00.000Z'
  );

  assert.equal(
    db.prepare('SELECT role FROM accounts WHERE email = ?').get('professor-legacy@example.com').role,
    'professor'
  );

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});

test('applySchema repairs child tables that still reference accounts_legacy so fixture seeding succeeds', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc02-upgrade-fk-'));
  const dbPath = path.join(tempDir, 'sis.db');
  const db = getDb(dbPath);

  db.exec(`
    CREATE TABLE accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
      password_hash TEXT NOT NULL,
      status TEXT NOT NULL,
      failed_attempt_count INTEGER NOT NULL DEFAULT 0,
      last_failed_at TEXT,
      locked_until TEXT,
      password_changed_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_key TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
    );
    CREATE TABLE role_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      role_id INTEGER NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      assigned_at TEXT NOT NULL,
      UNIQUE(account_id, role_id),
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );
    CREATE TABLE user_sessions (
      id TEXT PRIMARY KEY,
      account_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      invalidation_reason TEXT,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );
    CREATE TABLE dashboard_load_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      request_type TEXT NOT NULL CHECK (request_type IN ('initial_load', 'retry')),
      outcome TEXT NOT NULL CHECK (outcome IN ('success', 'partial', 'failure', 'auth_error')),
      attempted_sections INTEGER NOT NULL,
      successful_sections INTEGER NOT NULL,
      failed_sections INTEGER NOT NULL,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      occurred_at TEXT NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );
    INSERT INTO accounts (
      email, username, role, password_hash, status, failed_attempt_count,
      last_failed_at, locked_until, password_changed_at, created_at, updated_at
    ) VALUES (
      'legacy-admin@example.com', 'legacyAdmin', 'admin', 'hash', 'active', 0,
      NULL, NULL, '2026-03-07T12:00:00.000Z', '2026-03-07T12:00:00.000Z', '2026-03-07T12:00:00.000Z'
    );
    INSERT INTO roles (role_key, display_name, is_active) VALUES ('admin', 'Admin', 1);
    INSERT INTO role_assignments (account_id, role_id, is_active, assigned_at) VALUES (1, 1, 1, '2026-03-07T12:00:00.000Z');
    INSERT INTO user_sessions (id, account_id, created_at, expires_at, revoked_at, invalidation_reason) VALUES ('session-1', 1, '2026-03-07T12:00:00.000Z', '2026-03-07T13:00:00.000Z', NULL, NULL);
    INSERT INTO dashboard_load_events (account_id, request_type, outcome, attempted_sections, successful_sections, failed_sections, duration_ms, occurred_at) VALUES (1, 'initial_load', 'success', 1, 1, 0, 15, '2026-03-07T12:00:00.000Z');
  `);

  applySchema(dbPath);

  const roleAssignmentSql = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'role_assignments'").get().sql;
  const userSessionsSql = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'user_sessions'").get().sql;
  assert.doesNotMatch(roleAssignmentSql, /accounts_legacy/);
  assert.doesNotMatch(userSessionsSql, /accounts_legacy/);
  assert.equal(db.prepare('PRAGMA foreign_key_list(role_assignments)').all().some((foreignKey) => foreignKey.table === 'accounts'), true);

  seedLoginFixtures(dbPath);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM accounts').get().count >= 3, true);

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});

test('applySchema is idempotent for databases that already match the current schema', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc02-upgrade-current-'));
  const dbPath = path.join(tempDir, 'sis.db');

  const firstPath = applySchema(dbPath);
  const secondPath = applySchema(dbPath);
  assert.equal(secondPath, firstPath);

  const db = getDb(dbPath);
  const accountsSql = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'accounts'").get();
  assert.equal(accountsSql.sql.includes("'professor'"), true);
  assert.equal(db.prepare('PRAGMA table_info(user_sessions)').all().some((column) => column.name === 'invalidation_reason'), true);
  assert.equal(db.prepare('PRAGMA table_info(dashboard_load_events)').all().some((column) => column.name === 'duration_ms'), true);

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});

test('applySchema exposes getTableSql for missing-table checks used by migrations', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc02-upgrade-private-'));
  const dbPath = path.join(tempDir, 'sis.db');
  const db = getDb(dbPath);

  const { __private } = require('../../src/db/migrations/apply-schema');
  assert.equal(__private.getTableSql(db, 'missing_table'), '');

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});

test('applySchema getTableSql returns an empty string when sqlite metadata rows have null SQL', () => {
  const { __private } = require('../../src/db/migrations/apply-schema');
  const fakeDb = {
    prepare() {
      return {
        get() {
          return { sql: null };
        }
      };
    }
  };

  assert.equal(__private.getTableSql(fakeDb, 'accounts'), '');
});
