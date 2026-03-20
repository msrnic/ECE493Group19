const fs = require('fs');
const path = require('path');

const { getDb, resolveDbPath } = require('../connection');

function applySchema(dbPath) {
  const resolvedPath = resolveDbPath(dbPath);
  const db = getDb(resolvedPath);
  const schemaPath = path.resolve(__dirname, '../schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  db.exec(schema);
  return resolvedPath;
}

if (require.main === module) {
  const resolvedPath = applySchema(process.argv[2]);
  console.log(`Applied schema to ${resolvedPath}`);
}

module.exports = { applySchema };
