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
const profileTestState = {
  contactSaveFailureIdentifiers: [],
  personalSaveFailureIdentifiers: []
};
const accountCreationTestState = {
  createFailureIdentifiers: [],
  notificationFailureIdentifiers: [],
  notificationsEnabled: true
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

function resetFixtures() {
  seedLoginFixtures(dbPath, { now: fixedNow });
  db = getDb(dbPath);
  applyAccountCreationState();
  applyDashboardState();
  applyProfileState();
}

fs.rmSync(dbPath, { force: true });
resetFixtures();

const app = createApp({
  accountCreationTestState,
  db,
  dashboardTestState,
  now: () => fixedNow,
  profileTestState,
  resetFixtures,
  sessionSecret: 'acceptance-session-secret',
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

http.createServer(app).listen(port, () => {
  console.log('Acceptance server listening on port ' + port);
});
