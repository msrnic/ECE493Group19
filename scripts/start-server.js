#!/usr/bin/env node

const { createApp } = require('../src/app');
const { getDb } = require('../src/db/connection');

const port = Number(process.env.PORT || '3000');
const dbPath = process.env.DB_PATH || 'sis.db';
const app = createApp({
  db: getDb(dbPath),
  unavailableIdentifiers: ['outage.user@example.com']
});

app.listen(port, () => {
  console.log(`User Login app running at http://127.0.0.1:${port}/`);
});
