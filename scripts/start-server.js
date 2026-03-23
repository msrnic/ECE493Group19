#!/usr/bin/env node

const path = require('path');

const { createApp } = require('../src/app');
const { getDb } = require('../src/db/connection');
const { applySchema } = require('../src/db/migrations/apply-schema');
const { seedLoginFixtures } = require('../src/db/migrations/seed-login-fixtures');

const port = Number(process.env.PORT || '3000');
const dbPath = process.env.DB_PATH || 'sis.db';
const forceSeedLoginFixtures = process.env.SEED_LOGIN_FIXTURES === '1';

applySchema(dbPath);
const db = getDb(dbPath);
const accountCount = db.prepare('SELECT COUNT(*) AS count FROM accounts').get().count;

if (forceSeedLoginFixtures || accountCount === 0) {
  seedLoginFixtures(dbPath);
  console.log(`Seeded demo accounts into ${path.resolve(dbPath)}.`);
  console.log('Demo credentials after reset: userA@example.com / CorrectPass!234 and admin@example.com / AdminPass!234.');
  console.log('Password policy: 12+ characters with uppercase, lowercase, number, special character, and no leading or trailing spaces.');
  console.log('Example valid new passwords: NewSecure!234, AdminSet!234, TokenSecure!234.');
} else {
  console.log(`Using existing database at ${path.resolve(dbPath)}.`);
  console.log('Stored password changes will persist across restarts.');
  console.log('Run npm run setup or start with SEED_LOGIN_FIXTURES=1 to restore the demo credentials.');
}

const app = createApp({
  db: getDb(dbPath),
  unavailableIdentifiers: ['outage.user@example.com']
});

app.listen(port, () => {
  console.log(`User Login app running at http://127.0.0.1:${port}/`);
});
