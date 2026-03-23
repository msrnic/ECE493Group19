const fs = require('fs');
const path = require('path');

const { getDb, resolveDbPath } = require('../connection');

const ACCOUNTS_SCHEMA = `
  CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'professor', 'admin')),
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'locked', 'disabled')),
    failed_attempt_count INTEGER NOT NULL DEFAULT 0,
    last_failed_at TEXT,
    locked_until TEXT,
    password_changed_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`;

function listColumnNames(db, tableName) {
  return db.prepare(`PRAGMA table_info(${tableName})`).all().map((column) => column.name);
}

function getColumnNames(db, tableName) {
  return new Set(listColumnNames(db, tableName));
}

function getTableSql(db, tableName) {
  const row = db.prepare(
    `SELECT sql
     FROM sqlite_master
     WHERE type = 'table' AND name = ?`
  ).get(tableName);

  return row ? row.sql || '' : '';
}

function getCreateTableStatements(schema) {
  const statements = new Map();
  const createTablePattern = /CREATE TABLE IF NOT EXISTS (\w+) \([\s\S]*?\);/g;
  let match = createTablePattern.exec(schema);

  while (match) {
    statements.set(match[1], match[0]);
    match = createTablePattern.exec(schema);
  }

  return statements;
}

function recreateAccountsTable(db) {
  db.exec('PRAGMA foreign_keys = OFF');
  db.exec('ALTER TABLE accounts RENAME TO accounts_legacy');
  db.exec(ACCOUNTS_SCHEMA);
  db.exec(`
    INSERT INTO accounts (
      id,
      email,
      username,
      role,
      password_hash,
      status,
      failed_attempt_count,
      last_failed_at,
      locked_until,
      password_changed_at,
      created_at,
      updated_at
    )
    SELECT
      id,
      email,
      username,
      CASE
        WHEN role IN ('student', 'professor', 'admin') THEN role
        ELSE 'student'
      END,
      password_hash,
      status,
      COALESCE(failed_attempt_count, 0),
      last_failed_at,
      locked_until,
      COALESCE(password_changed_at, updated_at, created_at),
      created_at,
      updated_at
    FROM accounts_legacy
  `);
  db.exec('DROP TABLE accounts_legacy');
  db.exec('PRAGMA foreign_keys = ON');
}

function recreateTableFromSchema(db, tableName, createTableSql) {
  const legacyTableName = `${tableName}_legacy_fix`;
  const columnList = listColumnNames(db, tableName).join(', ');

  db.exec(`ALTER TABLE ${tableName} RENAME TO ${legacyTableName}`);
  db.exec(createTableSql);
  db.exec(`
    INSERT INTO ${tableName} (${columnList})
    SELECT ${columnList}
    FROM ${legacyTableName}
  `);
  db.exec(`DROP TABLE ${legacyTableName}`);
}

function repairBrokenAccountReferences(db, schema) {
  const brokenTables = db.prepare(
    `SELECT name
     FROM sqlite_master
     WHERE type = 'table'
       AND name NOT LIKE 'sqlite_%'
       AND sql LIKE '%accounts_legacy%'`
  ).all().map((row) => row.name).filter((tableName) => tableName !== 'accounts');

  if (brokenTables.length === 0) {
    return false;
  }

  const createTableStatements = getCreateTableStatements(schema);
  db.exec('PRAGMA foreign_keys = OFF');

  for (const tableName of brokenTables) {
    recreateTableFromSchema(db, tableName, createTableStatements.get(tableName));
  }

  db.exec('PRAGMA foreign_keys = ON');
  return true;
}

function ensureAccountsColumns(db) {
  const columns = getColumnNames(db, 'accounts');

  if (!columns.has('role')) {
    db.exec("ALTER TABLE accounts ADD COLUMN role TEXT NOT NULL DEFAULT 'student'");
  }

  if (!columns.has('password_changed_at')) {
    db.exec('ALTER TABLE accounts ADD COLUMN password_changed_at TEXT');
  }

  db.exec(`
    UPDATE accounts
    SET
      role = COALESCE(role, 'student'),
      password_changed_at = COALESCE(password_changed_at, updated_at, created_at)
    WHERE role IS NULL OR password_changed_at IS NULL
  `);

  const tableSql = getTableSql(db, 'accounts');
  if (tableSql.includes("CHECK (role IN ('student', 'admin'))")) {
    recreateAccountsTable(db);
  }
}

function ensureUserSessionColumns(db) {
  const columns = getColumnNames(db, 'user_sessions');

  if (!columns.has('invalidation_reason')) {
    db.exec('ALTER TABLE user_sessions ADD COLUMN invalidation_reason TEXT');
  }
}

function ensureDashboardLoadEventColumns(db) {
  const columns = getColumnNames(db, 'dashboard_load_events');

  if (!columns.has('duration_ms')) {
    db.exec('ALTER TABLE dashboard_load_events ADD COLUMN duration_ms INTEGER NOT NULL DEFAULT 0');
  }
}

function applySchema(dbPath) {
  const resolvedPath = resolveDbPath(dbPath);
  const db = getDb(resolvedPath);
  const schemaPath = path.resolve(__dirname, '../schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  db.exec(schema);
  ensureAccountsColumns(db);
  ensureUserSessionColumns(db);
  ensureDashboardLoadEventColumns(db);

  if (repairBrokenAccountReferences(db, schema)) {
    db.exec(schema);
  }

  ensureUserSessionColumns(db);
  ensureDashboardLoadEventColumns(db);
  return resolvedPath;
}

if (require.main === module) {
  const resolvedPath = applySchema(process.argv[2]);
  console.log(`Applied schema to ${resolvedPath}`);
}

module.exports = {
  __private: { getTableSql },
  applySchema
};
