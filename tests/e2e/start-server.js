const fs = require('fs');
const http = require('http');
const path = require('path');

const { createApp } = require('../../src/app');
const { getDb } = require('../../src/db/connection');
const { seedLoginFixtures } = require('../../src/db/migrations/seed-login-fixtures');

const port = Number(process.env.PORT || '3111');
const dbPath = process.env.DB_PATH || path.resolve('tmp/e2e-sis.db');
const fixedNow = new Date('2026-03-07T12:00:00.000Z');
const dashboardTestState = {
  roleFailureIdentifiers: [],
  unavailableSectionsByIdentifier: {}
};

function applyDashboardState(nextState) {
  const requestedState = nextState || {};
  dashboardTestState.roleFailureIdentifiers = [
    ...((requestedState.roleFailureIdentifiers || []).map((value) => String(value)))
  ];
  dashboardTestState.unavailableSectionsByIdentifier = {};

  for (const entry of Object.entries(requestedState.unavailableSectionsByIdentifier || {})) {
    const identifier = String(entry[0]).toLowerCase();
    dashboardTestState.unavailableSectionsByIdentifier[identifier] = [...(entry[1] || [])];
  }
}

function resetFixtures() {
  seedLoginFixtures(dbPath, { now: fixedNow });
  applyDashboardState();
}

fs.rmSync(dbPath, { force: true });
resetFixtures();

const app = createApp({
  db: getDb(dbPath),
  dashboardTestState,
  now: () => fixedNow,
  resetFixtures,
  sessionSecret: 'acceptance-session-secret',
  unavailableIdentifiers: ['outage.user@example.com']
});

app.post('/__dashboard-fixtures', (req, res) => {
  applyDashboardState(req.body || {});
  return res.status(204).end();
});

http.createServer(app).listen(port, () => {
  console.log('Acceptance server listening on port ' + port);
});
