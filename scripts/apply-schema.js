const { applySchema } = require('../src/db/migrations/apply-schema');

const resolvedPath = applySchema(process.argv[2]);
console.log(`Applied schema to ${resolvedPath}`);
