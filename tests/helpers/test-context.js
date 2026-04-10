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

function createCourseHistoryTestState(initialState = {}) {
  return {
    retrievalFailureIdentifiers: [...(initialState.retrievalFailureIdentifiers || [])]
  };
}

function createGradebookTestState(initialState = {}) {
  return {
    auditFailureIdentifiersByFeature: { ...(initialState.auditFailureIdentifiersByFeature || {}) },
    saveFailureIdentifiers: [...(initialState.saveFailureIdentifiers || [])],
    summaryFailureIdentifiers: [...(initialState.summaryFailureIdentifiers || [])]
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

function createStudentRecordTestState(initialState = {}) {
  return {
    auditFailureIdentifiersByFeature: {
      ...(initialState.auditFailureIdentifiersByFeature || {})
    }
  };
}

function createTranscriptTestState(initialState = {}) {
  return {
    retrievalFailureIdentifiers: [...(initialState.retrievalFailureIdentifiers || [])]
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
  const courseHistoryTestState = createCourseHistoryTestState(options.courseHistoryTestState);
  const gradebookTestState = createGradebookTestState(options.gradebookTestState);
  const inboxTestState = createInboxTestState(options.inboxTestState);
  const adminNotificationTestState = createAdminNotificationTestState(options.adminNotificationTestState);
  const studentRecordTestState = createStudentRecordTestState(options.studentRecordTestState);
  const transcriptTestState = createTranscriptTestState(options.transcriptTestState);

  applySchema(dbPath);
  seedLoginFixtures(dbPath, { now: nowState.value });

  const app = createApp({
    accountCreationTestState,
    db: getDb(dbPath),
    dashboardTestState,
    now: () => nowState.value,
    courseHistoryTestState,
    gradebookTestState,
    enrollmentTestState,
    inboxTestState,
    adminNotificationTestState,
    profileTestState,
    scheduleBuilderTestState,
    sessionSecret: 'test-session-secret',
    simulatedPasswordChangeFailureIdentifiers: options.simulatedPasswordChangeFailureIdentifiers || [],
    studentRecordTestState,
    transcriptTestState,
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
    courseHistoryTestState,
    gradebookTestState,
    enrollmentTestState,
    inboxTestState,
    adminNotificationTestState,
    profileTestState,
    scheduleBuilderTestState,
    studentRecordTestState,
    transcriptTestState,
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
    resetCourseHistoryTestState() {
      courseHistoryTestState.retrievalFailureIdentifiers = [];
    },
    resetGradebookTestState() {
      gradebookTestState.auditFailureIdentifiersByFeature = {};
      gradebookTestState.saveFailureIdentifiers = [];
      gradebookTestState.summaryFailureIdentifiers = [];
    },
    resetInboxTestState() {
      inboxTestState.deliveryFailureIdentifiers = ['outage.user@example.com'];
    },
    resetAdminNotificationTestState() {
      adminNotificationTestState.loggingFailureSubjects = [];
    },
    resetStudentRecordTestState() {
      studentRecordTestState.auditFailureIdentifiersByFeature = {};
    },
    resetTranscriptTestState() {
      transcriptTestState.retrievalFailureIdentifiers = [];
    },
    resetTransactionHistoryTestState() {
      transactionHistoryTestState.retrievalFailureIdentifiers = [];
    }
  };
}

module.exports = { createTestContext };
