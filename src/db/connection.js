const Database = require('better-sqlite3');
const path = require('path');

const connections = new Map();

function resolveDbPath(dbPath) {
  return path.resolve(dbPath || process.env.DB_PATH || 'sis.db');
}

function getDb(dbPath) {
  const resolvedPath = resolveDbPath(dbPath);
  if (!connections.has(resolvedPath)) {
    const db = new Database(resolvedPath);
    db.pragma('foreign_keys = ON');
    connections.set(resolvedPath, db);
  }

  return connections.get(resolvedPath);
}

function closeAll() {
  for (const db of connections.values()) {
    db.close();
  }

  connections.clear();
}

module.exports = {
  closeAll,
  getDb,
  resolveDbPath
};
