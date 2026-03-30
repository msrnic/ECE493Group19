const { resolveDbPath } = require('../src/db/connection');
const { seedLoginFixtures } = require('../src/db/migrations/seed-login-fixtures');

const resolvedPath = resolveDbPath(process.argv[2]);
seedLoginFixtures(resolvedPath);
console.log(`Seeded login fixtures in ${resolvedPath}`);
