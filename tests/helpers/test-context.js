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

function createProfileTestState(initialState = {}) {
  return {
    contactSaveFailureIdentifiers: [...(initialState.contactSaveFailureIdentifiers || [])],
    personalSaveFailureIdentifiers: [...(initialState.personalSaveFailureIdentifiers || [])]
  };
}

function createAccountCreationTestState(initialState = {}) {
  return {
    createFailureIdentifiers: [...(initialState.createFailureIdentifiers || [])],
    notificationFailureIdentifiers: [...(initialState.notificationFailureIdentifiers || [])],
    notificationsEnabled: initialState.notificationsEnabled !== false
  };
}

function createScheduleBuilderTestState(initialState = {}) {
  return {
    constraintSaveFailureIdentifiers: [...(initialState.constraintSaveFailureIdentifiers || [])],
    dataUnavailableIdentifiers: [...(initialState.dataUnavailableIdentifiers || [])],
    generationFailureIdentifiers: [...(initialState.generationFailureIdentifiers || [])],
    presetRenameFailureIdentifiers: [...(initialState.presetRenameFailureIdentifiers || [])],
    presetSaveFailureIdentifiers: [...(initialState.presetSaveFailureIdentifiers || [])],
    timeoutAfterResultsIdentifiers: [...(initialState.timeoutAfterResultsIdentifiers || [])],
    timeoutBeforeResultsIdentifiers: [...(initialState.timeoutBeforeResultsIdentifiers || [])]
  };
}

function createTransactionHistoryTestState(initialState = {}) {
  return {
    retrievalFailureIdentifiers: [...(initialState.retrievalFailureIdentifiers || [])]
  };
}

function createEnrollmentTestState(initialState = {}) {
  return {
    failureIdentifiers: [...(initialState.failureIdentifiers || [])]
  };
}

function createInboxTestState(initialState = {}) {
  return {
    deliveryFailureIdentifiers: [...(initialState.deliveryFailureIdentifiers || ['outage.user@example.com'])]
  };
}

function createAdminNotificationTestState(initialState = {}) {
  return {
    loggingFailureSubjects: [...(initialState.loggingFailureSubjects || [])]
  };
}

function createTestContext(options = {}) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc02-login-'));
  const dbPath = path.join(tempDir, 'sis.db');
  const nowState = {
    value: options.now || new Date('2026-03-07T12:00:00.000Z')
  };
  const accountCreationTestState = createAccountCreationTestState(options.accountCreationTestState);
  const dashboardTestState = createDashboardTestState(options.dashboardTestState);
  const profileTestState = createProfileTestState(options.profileTestState);
  const scheduleBuilderTestState = createScheduleBuilderTestState(options.scheduleBuilderTestState);
  const transactionHistoryTestState = createTransactionHistoryTestState(options.transactionHistoryTestState);
  const enrollmentTestState = createEnrollmentTestState(options.enrollmentTestState);
  const inboxTestState = createInboxTestState(options.inboxTestState);
  const adminNotificationTestState = createAdminNotificationTestState(options.adminNotificationTestState);

  applySchema(dbPath);
  seedLoginFixtures(dbPath, { now: nowState.value });

  const app = createApp({
    accountCreationTestState,
    db: getDb(dbPath),
    dashboardTestState,
    now: () => nowState.value,
    enrollmentTestState,
    inboxTestState,
    adminNotificationTestState,
    profileTestState,
    scheduleBuilderTestState,
    sessionSecret: 'test-session-secret',
    simulatedPasswordChangeFailureIdentifiers: options.simulatedPasswordChangeFailureIdentifiers || [],
    transactionHistoryTestState,
    unavailableIdentifiers: options.unavailableIdentifiers || []
  });

  return {
    advanceTime(ms) {
      nowState.value = new Date(nowState.value.getTime() + ms);
      return nowState.value;
    },
    app,
    accountCreationTestState,
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
    enrollmentTestState,
    inboxTestState,
    adminNotificationTestState,
    profileTestState,
    scheduleBuilderTestState,
    transactionHistoryTestState,
    resetAccountCreationTestState() {
      accountCreationTestState.createFailureIdentifiers = [];
      accountCreationTestState.notificationFailureIdentifiers = [];
      accountCreationTestState.notificationsEnabled = true;
    },
    resetDashboardTestState() {
      dashboardTestState.roleFailureIdentifiers = [];
      dashboardTestState.unavailableSectionsByIdentifier = {};
    },
    resetProfileTestState() {
      profileTestState.contactSaveFailureIdentifiers = [];
      profileTestState.personalSaveFailureIdentifiers = [];
    },
    resetScheduleBuilderTestState() {
      scheduleBuilderTestState.constraintSaveFailureIdentifiers = [];
      scheduleBuilderTestState.dataUnavailableIdentifiers = [];
      scheduleBuilderTestState.generationFailureIdentifiers = [];
      scheduleBuilderTestState.presetRenameFailureIdentifiers = [];
      scheduleBuilderTestState.presetSaveFailureIdentifiers = [];
      scheduleBuilderTestState.timeoutAfterResultsIdentifiers = [];
      scheduleBuilderTestState.timeoutBeforeResultsIdentifiers = [];
    },
    resetEnrollmentTestState() {
      enrollmentTestState.failureIdentifiers = [];
    },
    resetInboxTestState() {
      inboxTestState.deliveryFailureIdentifiers = ['outage.user@example.com'];
    },
    resetAdminNotificationTestState() {
      adminNotificationTestState.loggingFailureSubjects = [];
    },
    resetTransactionHistoryTestState() {
      transactionHistoryTestState.retrievalFailureIdentifiers = [];
    }
  };
}

module.exports = { createTestContext };
