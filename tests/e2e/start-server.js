const fs = require('fs');
const http = require('http');
const path = require('path');

const { createApp } = require('../../src/app');
const { getDb } = require('../../src/db/connection');
const { seedLoginFixtures } = require('../../src/db/migrations/seed-login-fixtures');

const port = Number(process.env.PORT || '3112');
const dbPath = process.env.DB_PATH || path.resolve('tmp/e2e-sis.db');
const fixedNow = new Date('2026-03-07T12:00:00.000Z');
const dashboardTestState = {
  roleFailureIdentifiers: [],
  unavailableSectionsByIdentifier: {}
};
const profileTestState = {
  contactSaveFailureIdentifiers: [],
  personalSaveFailureIdentifiers: []
};
const accountCreationTestState = {
  createFailureIdentifiers: [],
  notificationFailureIdentifiers: [],
  notificationsEnabled: true
};
const scheduleBuilderTestState = {
  constraintSaveFailureIdentifiers: [],
  dataUnavailableIdentifiers: [],
  generationFailureIdentifiers: [],
  presetRenameFailureIdentifiers: [],
  presetSaveFailureIdentifiers: [],
  timeoutAfterResultsIdentifiers: [],
  timeoutBeforeResultsIdentifiers: []
};
const transactionHistoryTestState = {
  retrievalFailureIdentifiers: []
};
const enrollmentTestState = {
  capacityUnavailableIdentifiers: [],
  failureIdentifiers: [],
  removalFailureIdentifiers: [],
  remainingSeatsUnavailableIdentifiers: [],
  withdrawalFailureIdentifiers: []
};
const classSearchTestState = {
  failureIdentifiers: []
};
const courseRosterTestState = {
  failureIdentifiers: []
};
const forceEnrollTestState = {
  failureIdentifiers: []
};
const forceWithdrawalTestState = {
  auditFailureIdentifiers: [],
  failureIdentifiers: []
};
const offeringAdminTestState = {
  auditFailureIdentifiers: [],
  capacityFailureIdentifiers: [],
  createFailureIdentifiers: [],
  deleteFailureIdentifiers: []
};
const courseCapacityTestState = {
  failureIdentifiers: []
};
const deadlineTestState = {
  failureIdentifiers: []
};
const inboxTestState = {
  deliveryFailureIdentifiers: ['outage.user@example.com']
};
const adminNotificationTestState = {
  loggingFailureSubjects: []
};
let db = null;

function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function applyDashboardState(nextState) {
  const requestedState = nextState || {};
  dashboardTestState.roleFailureIdentifiers = [
    ...((requestedState.roleFailureIdentifiers || []).map((value) => String(value)))
  ];
  dashboardTestState.unavailableSectionsByIdentifier = {};

  for (const entry of Object.entries(requestedState.unavailableSectionsByIdentifier || {})) {
    const identifier = normalizeIdentifier(entry[0]);
    dashboardTestState.unavailableSectionsByIdentifier[identifier] = [...(entry[1] || [])];
  }
}

function applyProfileState(nextState) {
  const requestedState = nextState || {};
  profileTestState.contactSaveFailureIdentifiers = [
    ...((requestedState.contactSaveFailureIdentifiers || []).map(normalizeIdentifier))
  ];
  profileTestState.personalSaveFailureIdentifiers = [
    ...((requestedState.personalSaveFailureIdentifiers || []).map(normalizeIdentifier))
  ];

  const selectAccount = db.prepare(`
    SELECT id
    FROM accounts
    WHERE lower(email) = lower(?) OR lower(username) = lower(?)
    LIMIT 1
  `);
  const selectPersonalVersion = db.prepare(
    'SELECT version FROM personal_details WHERE account_id = ?'
  );
  const selectContactVersion = db.prepare(
    'SELECT version FROM contact_profiles WHERE account_id = ?'
  );
  const upsertPersonalDetails = db.prepare(`
    INSERT INTO personal_details (
      account_id,
      first_name,
      last_name,
      birth_date,
      country_of_origin,
      version,
      updated_at
    ) VALUES (
      @account_id,
      @first_name,
      @last_name,
      @birth_date,
      @country_of_origin,
      @version,
      @updated_at
    )
    ON CONFLICT(account_id) DO UPDATE SET
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      birth_date = excluded.birth_date,
      country_of_origin = excluded.country_of_origin,
      version = excluded.version,
      updated_at = excluded.updated_at
  `);
  const upsertContactProfile = db.prepare(`
    INSERT INTO contact_profiles (
      account_id,
      contact_email,
      phone_number,
      version,
      updated_at
    ) VALUES (
      @account_id,
      @contact_email,
      @phone_number,
      @version,
      @updated_at
    )
    ON CONFLICT(account_id) DO UPDATE SET
      contact_email = excluded.contact_email,
      phone_number = excluded.phone_number,
      version = excluded.version,
      updated_at = excluded.updated_at
  `);
  const upsertEmergencyContact = db.prepare(`
    INSERT INTO emergency_contacts (
      account_id,
      full_name,
      phone_number,
      relationship,
      updated_at
    ) VALUES (
      @account_id,
      @full_name,
      @phone_number,
      @relationship,
      @updated_at
    )
    ON CONFLICT(account_id) DO UPDATE SET
      full_name = excluded.full_name,
      phone_number = excluded.phone_number,
      relationship = excluded.relationship,
      updated_at = excluded.updated_at
  `);
  const updatedAt = fixedNow.toISOString();

  for (const [identifier, records] of Object.entries(requestedState.recordsByIdentifier || {})) {
    const account = selectAccount.get(identifier, identifier);
    if (!account) {
      throw new Error(`Unknown profile fixture account: ${identifier}`);
    }

    if (Object.prototype.hasOwnProperty.call(records || {}, 'personalDetails')) {
      const personalDetails = records.personalDetails || {};
      const currentVersion = Number(selectPersonalVersion.get(account.id)?.version || 1);
      upsertPersonalDetails.run({
        account_id: account.id,
        birth_date: personalDetails.birthDate ?? null,
        country_of_origin: personalDetails.countryOfOrigin ?? null,
        first_name: personalDetails.firstName ?? null,
        last_name: personalDetails.lastName ?? null,
        updated_at: updatedAt,
        version: Number(personalDetails.version || currentVersion)
      });
    }

    if (Object.prototype.hasOwnProperty.call(records || {}, 'contactInformation')) {
      const contactInformation = records.contactInformation || {};
      const currentVersion = Number(selectContactVersion.get(account.id)?.version || 1);
      upsertContactProfile.run({
        account_id: account.id,
        contact_email: contactInformation.contactEmail ?? null,
        phone_number: contactInformation.phoneNumber ?? null,
        updated_at: updatedAt,
        version: Number(contactInformation.version || currentVersion)
      });
      upsertEmergencyContact.run({
        account_id: account.id,
        full_name: contactInformation.emergencyFullName ?? null,
        phone_number: contactInformation.emergencyPhoneNumber ?? null,
        relationship: contactInformation.emergencyRelationship ?? null,
        updated_at: updatedAt
      });
    }
  }
}

function applyAccountCreationState(nextState) {
  const requestedState = nextState || {};
  accountCreationTestState.createFailureIdentifiers = [
    ...((requestedState.createFailureIdentifiers || []).map(normalizeIdentifier))
  ];
  accountCreationTestState.notificationFailureIdentifiers = [
    ...((requestedState.notificationFailureIdentifiers || []).map(normalizeIdentifier))
  ];
  accountCreationTestState.notificationsEnabled = requestedState.notificationsEnabled !== false;

  const updateRoleAssignability = db.prepare(`
    UPDATE roles
    SET is_assignable = ?
    WHERE role_key = ?
  `);
  const roleAssignabilityByKey = {
    admin: true,
    professor: true,
    student: true,
    ...(requestedState.roleAssignabilityByKey || {})
  };

  for (const [roleKey, isAssignable] of Object.entries(roleAssignabilityByKey)) {
    updateRoleAssignability.run(isAssignable ? 1 : 0, roleKey);
  }
}

function applyScheduleBuilderState(nextState) {
  const requestedState = nextState || {};
  scheduleBuilderTestState.constraintSaveFailureIdentifiers = [
    ...((requestedState.constraintSaveFailureIdentifiers || []).map(normalizeIdentifier))
  ];
  scheduleBuilderTestState.dataUnavailableIdentifiers = [
    ...((requestedState.dataUnavailableIdentifiers || []).map(normalizeIdentifier))
  ];
  scheduleBuilderTestState.generationFailureIdentifiers = [
    ...((requestedState.generationFailureIdentifiers || []).map(normalizeIdentifier))
  ];
  scheduleBuilderTestState.presetRenameFailureIdentifiers = [
    ...((requestedState.presetRenameFailureIdentifiers || []).map(normalizeIdentifier))
  ];
  scheduleBuilderTestState.presetSaveFailureIdentifiers = [
    ...((requestedState.presetSaveFailureIdentifiers || []).map(normalizeIdentifier))
  ];
  scheduleBuilderTestState.timeoutAfterResultsIdentifiers = [
    ...((requestedState.timeoutAfterResultsIdentifiers || []).map(normalizeIdentifier))
  ];
  scheduleBuilderTestState.timeoutBeforeResultsIdentifiers = [
    ...((requestedState.timeoutBeforeResultsIdentifiers || []).map(normalizeIdentifier))
  ];

  const updateTermAvailability = db.prepare(`
    UPDATE planning_terms
    SET is_available = ?
    WHERE term_code = ?
  `);
  const updateCourseActivity = db.prepare(`
    UPDATE schedule_builder_courses
    SET is_active = ?
    WHERE course_code = ?
  `);
  const updateCompatibilityStatus = db.prepare(`
    UPDATE schedule_builder_courses
    SET compatibility_status = ?
    WHERE course_code = ?
  `);
  const updateOptionSeats = db.prepare(`
    UPDATE schedule_builder_option_groups
    SET seats_remaining = ?
    WHERE option_code = ?
  `);

  for (const [termCode, isAvailable] of Object.entries(requestedState.termAvailabilityByCode || {})) {
    updateTermAvailability.run(isAvailable ? 1 : 0, termCode);
  }

  for (const [courseCode, isActive] of Object.entries(requestedState.courseActivityByCode || {})) {
    updateCourseActivity.run(isActive ? 1 : 0, courseCode);
  }

  for (const [courseCode, status] of Object.entries(requestedState.compatibilityStatusByCode || {})) {
    updateCompatibilityStatus.run(status, courseCode);
  }

  for (const [optionCode, seatsRemaining] of Object.entries(requestedState.optionSeatsByCode || {})) {
    updateOptionSeats.run(Number(seatsRemaining), optionCode);
  }
}

function applyTransactionHistoryState(nextState) {
  const requestedState = nextState || {};
  transactionHistoryTestState.retrievalFailureIdentifiers = [
    ...((requestedState.retrievalFailureIdentifiers || []).map(normalizeIdentifier))
  ];

  const selectAccount = db.prepare(`
    SELECT id
    FROM accounts
    WHERE lower(email) = lower(?) OR lower(username) = lower(?)
    LIMIT 1
  `);
  const deleteTransactionsForAccount = db.prepare(`
    DELETE FROM financial_transactions
    WHERE account_id = ?
  `);
  const insertFinancialTransaction = db.prepare(`
    INSERT INTO financial_transactions (
      account_id,
      transaction_reference,
      posted_at,
      amount_cents,
      currency,
      payment_method_label,
      masked_method_identifier,
      status,
      transaction_scope,
      source_system,
      created_at,
      updated_at
    ) VALUES (
      @account_id,
      @transaction_reference,
      @posted_at,
      @amount_cents,
      @currency,
      @payment_method_label,
      @masked_method_identifier,
      @status,
      @transaction_scope,
      @source_system,
      @created_at,
      @updated_at
    )
  `);

  for (const [identifier, records] of Object.entries(requestedState.recordsByIdentifier || {})) {
    const account = selectAccount.get(identifier, identifier);
    if (!account) {
      throw new Error(`Unknown transaction fixture account: ${identifier}`);
    }

    deleteTransactionsForAccount.run(account.id);

    for (const record of records || []) {
      insertFinancialTransaction.run({
        account_id: account.id,
        amount_cents: Number(record.amountCents),
        created_at: record.createdAt,
        currency: record.currency || 'USD',
        masked_method_identifier: record.maskedMethodIdentifier || null,
        payment_method_label: record.paymentMethodLabel,
        posted_at: record.postedAt,
        source_system: record.sourceSystem || 'sis',
        status: record.status,
        transaction_reference: record.transactionReference,
        transaction_scope: record.transactionScope || 'sis_fee_payment',
        updated_at: record.updatedAt || record.postedAt
      });
    }
  }
}

function applyForceEnrollState(nextState) {
  const requestedState = nextState || {};
  forceEnrollTestState.failureIdentifiers = [
    ...((requestedState.failureIdentifiers || []).map(normalizeIdentifier))
  ];
}

function applyForceWithdrawalState(nextState) {
  const requestedState = nextState || {};
  forceWithdrawalTestState.auditFailureIdentifiers = [
    ...((requestedState.auditFailureIdentifiers || []).map(normalizeIdentifier))
  ];
  forceWithdrawalTestState.failureIdentifiers = [
    ...((requestedState.failureIdentifiers || []).map(normalizeIdentifier))
  ];
}

function applyOfferingAdminState(nextState) {
  const requestedState = nextState || {};
  offeringAdminTestState.auditFailureIdentifiers = [
    ...((requestedState.auditFailureIdentifiers || []).map(normalizeIdentifier))
  ];
  offeringAdminTestState.capacityFailureIdentifiers = [
    ...((requestedState.capacityFailureIdentifiers || []).map(normalizeIdentifier))
  ];
  offeringAdminTestState.createFailureIdentifiers = [
    ...((requestedState.createFailureIdentifiers || []).map(normalizeIdentifier))
  ];
  offeringAdminTestState.deleteFailureIdentifiers = [
    ...((requestedState.deleteFailureIdentifiers || []).map(normalizeIdentifier))
  ];
}

function applyCourseCapacityState(nextState) {
  const requestedState = nextState || {};
  courseCapacityTestState.failureIdentifiers = [
    ...((requestedState.failureIdentifiers || []).map(normalizeIdentifier))
  ];
}

function applyEnrollmentState(nextState) {
  const requestedState = nextState || {};
  enrollmentTestState.capacityUnavailableIdentifiers = [
    ...((requestedState.capacityUnavailableIdentifiers || []).map(normalizeIdentifier))
  ];
  enrollmentTestState.failureIdentifiers = [
    ...((requestedState.failureIdentifiers || []).map(normalizeIdentifier))
  ];
  enrollmentTestState.removalFailureIdentifiers = [
    ...((requestedState.removalFailureIdentifiers || []).map(normalizeIdentifier))
  ];
  enrollmentTestState.remainingSeatsUnavailableIdentifiers = [
    ...((requestedState.remainingSeatsUnavailableIdentifiers || []).map(normalizeIdentifier))
  ];
  enrollmentTestState.waitlistClosedTermIdentifiers = [
    ...((requestedState.waitlistClosedTermIdentifiers || []).map(normalizeIdentifier))
  ];
  enrollmentTestState.waitlistFailureIdentifiers = [
    ...((requestedState.waitlistFailureIdentifiers || []).map(normalizeIdentifier))
  ];
  enrollmentTestState.withdrawalFailureIdentifiers = [
    ...((requestedState.withdrawalFailureIdentifiers || []).map(normalizeIdentifier))
  ];
}

function applyClassSearchState(nextState) {
  const requestedState = nextState || {};
  classSearchTestState.failureIdentifiers = [
    ...((requestedState.failureIdentifiers || []).map(normalizeIdentifier))
  ];
}

function applyCourseRosterState(nextState) {
  const requestedState = nextState || {};
  courseRosterTestState.failureIdentifiers = [
    ...((requestedState.failureIdentifiers || []).map(normalizeIdentifier))
  ];
}

function applyDeadlineState(nextState) {
  const requestedState = nextState || {};
  deadlineTestState.failureIdentifiers = [
    ...((requestedState.failureIdentifiers || []).map(normalizeIdentifier))
  ];

  const updateDeadlineRule = db.prepare(`
    UPDATE drop_deadline_rules
    SET deadline_at = ?, timezone_name = ?
    WHERE term_code = ?
  `);

  for (const [termCode, deadlineAt] of Object.entries(requestedState.deadlineAtByTerm || {})) {
    updateDeadlineRule.run(deadlineAt, requestedState.timezoneName || 'America/Edmonton', termCode);
  }
}

function applyInboxState(nextState) {
  const requestedState = nextState || {};
  inboxTestState.deliveryFailureIdentifiers = [
    ...((requestedState.deliveryFailureIdentifiers || ['outage.user@example.com']).map(normalizeIdentifier))
  ];

  const selectAccount = db.prepare(`
    SELECT id
    FROM accounts
    WHERE lower(email) = lower(?) OR lower(username) = lower(?)
    LIMIT 1
  `);
  const upsertInboxAccess = db.prepare(`
    INSERT INTO inbox_access_states (
      account_id,
      access_state,
      restriction_reason,
      show_status_indicator,
      updated_at
    ) VALUES (
      @account_id,
      @access_state,
      @restriction_reason,
      @show_status_indicator,
      @updated_at
    )
    ON CONFLICT(account_id) DO UPDATE SET
      access_state = excluded.access_state,
      restriction_reason = excluded.restriction_reason,
      show_status_indicator = excluded.show_status_indicator,
      updated_at = excluded.updated_at
  `);

  for (const [identifier, accessState] of Object.entries(requestedState.accessStatesByIdentifier || {})) {
    const account = selectAccount.get(identifier, identifier);
    if (!account) {
      throw new Error(`Unknown inbox fixture account: ${identifier}`);
    }

    upsertInboxAccess.run({
      access_state: accessState.accessState || 'enabled',
      account_id: account.id,
      restriction_reason: accessState.restrictionReason || null,
      show_status_indicator: accessState.showStatusIndicator === false ? 0 : 1,
      updated_at: fixedNow.toISOString()
    });
  }
}

function applyAdminNotificationState(nextState) {
  const requestedState = nextState || {};
  adminNotificationTestState.loggingFailureSubjects = [
    ...((requestedState.loggingFailureSubjects || []).map((value) => String(value)))
  ];
}

function resetFixtures() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  seedLoginFixtures(dbPath, { now: fixedNow });
  db = getDb(dbPath);
  applyAccountCreationState();
  applyDashboardState();
  applyProfileState();
  applyScheduleBuilderState();
  applyTransactionHistoryState();
  applyEnrollmentState();
  applyForceEnrollState();
  applyForceWithdrawalState();
  applyOfferingAdminState();
  applyCourseCapacityState();
  applyClassSearchState();
  applyCourseRosterState();
  applyDeadlineState();
  applyInboxState();
  applyAdminNotificationState();
}

fs.rmSync(dbPath, { force: true });
resetFixtures();

const app = createApp({
  accountCreationTestState,
  db,
  dashboardTestState,
  now: () => fixedNow,
  classSearchTestState,
  courseRosterTestState,
  deadlineTestState,
  enrollmentTestState,
  forceEnrollTestState,
  forceWithdrawalTestState,
  offeringAdminTestState,
  courseCapacityTestState,
  profileTestState,
  resetFixtures,
  scheduleBuilderTestState,
  sessionSecret: 'acceptance-session-secret',
  inboxTestState,
  adminNotificationTestState,
  transactionHistoryTestState,
  unavailableIdentifiers: ['outage.user@example.com']
});

app.post('/__dashboard-fixtures', (req, res) => {
  applyDashboardState(req.body || {});
  return res.status(204).end();
});

app.post('/__profile-fixtures', (req, res, next) => {
  try {
    applyProfileState(req.body || {});
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.post('/__account-creation-fixtures', (req, res, next) => {
  try {
    applyAccountCreationState(req.body || {});
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.post('/__schedule-builder-fixtures', (req, res, next) => {
  try {
    applyScheduleBuilderState(req.body || {});
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.post('/__transaction-history-fixtures', (req, res, next) => {
  try {
    applyTransactionHistoryState(req.body || {});
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.post('/__enrollment-fixtures', (req, res, next) => {
  try {
    applyEnrollmentState(req.body || {});
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.post('/__force-enroll-fixtures', (req, res, next) => {
  try {
    applyForceEnrollState(req.body || {});
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.post('/__force-withdrawal-fixtures', (req, res, next) => {
  try {
    applyForceWithdrawalState(req.body || {});
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.post('/__offering-admin-fixtures', (req, res, next) => {
  try {
    applyOfferingAdminState(req.body || {});
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.post('/__course-capacity-fixtures', (req, res, next) => {
  try {
    applyCourseCapacityState(req.body || {});
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.post('/__class-search-fixtures', (req, res, next) => {
  try {
    applyClassSearchState(req.body || {});
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.post('/__course-roster-fixtures', (req, res, next) => {
  try {
    applyCourseRosterState(req.body || {});
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.post('/__deadline-fixtures', (req, res, next) => {
  try {
    applyDeadlineState(req.body || {});
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.post('/__inbox-fixtures', (req, res, next) => {
  try {
    applyInboxState(req.body || {});
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.post('/__admin-notification-fixtures', (req, res, next) => {
  try {
    applyAdminNotificationState(req.body || {});
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

http.createServer(app).listen(port, () => {
  console.log('Acceptance server listening on port ' + port);
});
