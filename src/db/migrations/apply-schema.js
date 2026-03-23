const fs = require('fs');
const path = require('path');

const { getDb, resolveDbPath } = require('../connection');

function getColumnNames(db, tableName) {
  return new Set(
    db.prepare(`PRAGMA table_info(${tableName})`).all().map((column) => column.name)
  );
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
}

function ensureUserSessionColumns(db) {
  const columns = getColumnNames(db, 'user_sessions');

  if (!columns.has('invalidation_reason')) {
    db.exec('ALTER TABLE user_sessions ADD COLUMN invalidation_reason TEXT');
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
  return resolvedPath;
}

if (require.main === module) {
  const resolvedPath = applySchema(process.argv[2]);
  console.log(`Applied schema to ${resolvedPath}`);
}

module.exports = { applySchema };
