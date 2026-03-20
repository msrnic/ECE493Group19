const http = require('http');
const path = require('path');

const { createApp } = require('../../src/app');
const { getDb } = require('../../src/db/connection');
const { seedLoginFixtures } = require('../../src/db/migrations/seed-login-fixtures');

const port = Number(process.env.PORT || '3111');
const dbPath = process.env.DB_PATH || path.resolve('tmp/e2e-sis.db');
const fixedNow = new Date('2026-03-07T12:00:00.000Z');

seedLoginFixtures(dbPath, { now: fixedNow });

const app = createApp({
  db: getDb(dbPath),
  now: () => fixedNow,
  sessionSecret: 'acceptance-session-secret',
  unavailableIdentifiers: ['outage.user@example.com']
});

http.createServer(app).listen(port, () => {
  console.log(`UC-02 acceptance server listening on port ${port}`);
});
