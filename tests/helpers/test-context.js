const fs = require('fs');
const os = require('os');
const path = require('path');

const { createApp } = require('../../src/app');
const { closeAll, getDb } = require('../../src/db/connection');
const { applySchema } = require('../../src/db/migrations/apply-schema');
const { seedLoginFixtures } = require('../../src/db/migrations/seed-login-fixtures');

function createDashboardTestState(initialState = {}) {
  return {
    roleFailureIdentifiers: [...(initialState.roleFailureIdentifiers || [])],
    unavailableSectionsByIdentifier: { ...(initialState.unavailableSectionsByIdentifier || {}) }
  };
}

function createTestContext(options = {}) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc02-login-'));
  const dbPath = path.join(tempDir, 'sis.db');
  const nowState = {
    value: options.now || new Date('2026-03-07T12:00:00.000Z')
  };
  const dashboardTestState = createDashboardTestState(options.dashboardTestState);

  applySchema(dbPath);
  seedLoginFixtures(dbPath, { now: nowState.value });

  const app = createApp({
    db: getDb(dbPath),
    dashboardTestState,
    now: () => nowState.value,
    sessionSecret: 'test-session-secret',
    simulatedPasswordChangeFailureIdentifiers: options.simulatedPasswordChangeFailureIdentifiers || [],
    unavailableIdentifiers: options.unavailableIdentifiers || []
  });

  return {
    advanceTime(ms) {
      nowState.value = new Date(nowState.value.getTime() + ms);
      return nowState.value;
    },
    app,
    cleanup() {
      closeAll();
      fs.rmSync(tempDir, { force: true, recursive: true });
    },
    dashboardTestState,
    db: getDb(dbPath),
    dbPath,
    now() {
      return nowState.value;
    },
    resetDashboardTestState() {
      dashboardTestState.roleFailureIdentifiers = [];
      dashboardTestState.unavailableSectionsByIdentifier = {};
    }
  };
}

module.exports = { createTestContext };
