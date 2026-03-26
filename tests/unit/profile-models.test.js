const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { closeAll, getDb } = require('../../src/db/connection');
const { applySchema } = require('../../src/db/migrations/apply-schema');
const { seedLoginFixtures } = require('../../src/db/migrations/seed-login-fixtures');
const { createContactInfoModel } = require('../../src/models/contact-info-model');
const { createPersonalDetailsModel } = require('../../src/models/personal-details-model');

function createDatabase() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc-profile-models-'));
  const dbPath = path.join(tempDir, 'sis.db');
  applySchema(dbPath);
  seedLoginFixtures(dbPath);
  return {
    cleanup() {
      closeAll();
      fs.rmSync(tempDir, { force: true, recursive: true });
    },
    db: getDb(dbPath)
  };
}

test('personal details model reads, saves, detects conflicts, and rolls back failures', () => {
  const context = createDatabase();
  const model = createPersonalDetailsModel(context.db);

  assert.equal(model.getByAccountId(999), null);
  assert.deepEqual(model.getByAccountId(1), {
    accountId: 1,
    birthDate: '2001-04-15',
    countryOfOrigin: 'Canada',
    firstName: 'Alex',
    lastName: 'Example',
    updatedAt: '2026-03-07T12:00:00.000Z',
    version: 1
  });

  context.db.prepare('DELETE FROM personal_details WHERE account_id = 8').run();
  assert.deepEqual(model.getByAccountId(8), {
    accountId: 8,
    birthDate: null,
    countryOfOrigin: null,
    firstName: null,
    lastName: null,
    updatedAt: null,
    version: 0
  });

  const insertedFromBlank = model.saveByAccountId(
    8,
    {
      birthDate: '2001-11-24',
      countryOfOrigin: 'Canada',
      firstName: 'Sam',
      lastName: 'Outage'
    },
    {
      updatedAt: '2026-03-07T12:20:00.000Z'
    }
  );
  assert.equal(insertedFromBlank.conflictDetected, false);
  assert.equal(insertedFromBlank.personalDetails.version, 1);
  assert.throws(
    () =>
      model.saveByAccountId(
        8,
        {
          birthDate: '2001-11-24',
          countryOfOrigin: 'Canada',
          firstName: 'Sam',
          lastName: 'Outage'
        }
      ),
    /updated_at|NOT NULL/i
  );

  const firstSave = model.saveByAccountId(
    1,
    {
      birthDate: '2002-05-16',
      countryOfOrigin: 'USA',
      firstName: 'Jamie',
      lastName: 'Updated'
    },
    {
      submittedVersion: 1,
      updatedAt: '2026-03-07T12:30:00.000Z'
    }
  );
  assert.equal(firstSave.conflictDetected, false);
  assert.deepEqual(firstSave.personalDetails, {
    accountId: 1,
    birthDate: '2002-05-16',
    countryOfOrigin: 'USA',
    firstName: 'Jamie',
    lastName: 'Updated',
    updatedAt: '2026-03-07T12:30:00.000Z',
    version: 2
  });

  context.db.prepare('UPDATE personal_details SET version = 5 WHERE account_id = 1').run();
  const conflictSave = model.saveByAccountId(
    1,
    {
      birthDate: '2003-06-17',
      countryOfOrigin: 'Mexico',
      firstName: 'Jamie',
      lastName: 'Conflict'
    },
    {
      submittedVersion: 1,
      updatedAt: '2026-03-07T12:45:00.000Z'
    }
  );
  assert.equal(conflictSave.conflictDetected, true);
  assert.equal(conflictSave.personalDetails.version, 6);
  assert.equal(conflictSave.personalDetails.lastName, 'Conflict');

  const baseline = model.getByAccountId(2);
  assert.throws(
    () =>
      model.saveByAccountId(
        2,
        {
          birthDate: '1984-10-08',
          countryOfOrigin: 'France',
          firstName: 'Broken',
          lastName: 'Write'
        },
        {
          simulateFailure: true,
          submittedVersion: baseline.version,
          updatedAt: '2026-03-07T13:00:00.000Z'
        }
      ),
    /Simulated personal details save failure\./
  );
  assert.deepEqual(model.getByAccountId(2), baseline);

  assert.throws(
    () =>
      model.saveByAccountId(
        999,
        {
          birthDate: '2000-01-01',
          countryOfOrigin: 'Canada',
          firstName: 'Ghost',
          lastName: 'User'
        },
        {
          submittedVersion: 0,
          updatedAt: '2026-03-07T13:05:00.000Z'
        }
      ),
    /unknown account/
  );

  context.cleanup();
});

test('contact info model reads, saves, detects conflicts, and rolls back partial writes', () => {
  const context = createDatabase();
  const model = createContactInfoModel(context.db);

  assert.equal(model.getByAccountId(999), null);
  assert.deepEqual(model.getByAccountId(1), {
    accountId: 1,
    contactEmail: 'userA.contact@example.com',
    emergencyFullName: 'Jordan Example',
    emergencyPhoneNumber: '+1 780 555 2234',
    emergencyRelationship: 'Parent',
    phoneNumber: '+1 780 555 1234',
    updatedAt: '2026-03-07T12:00:00.000Z',
    version: 1
  });

  context.db.prepare('DELETE FROM contact_profiles WHERE account_id = 8').run();
  context.db.prepare('DELETE FROM emergency_contacts WHERE account_id = 8').run();
  assert.deepEqual(model.getByAccountId(8), {
    accountId: 8,
    contactEmail: null,
    emergencyFullName: null,
    emergencyPhoneNumber: null,
    emergencyRelationship: null,
    phoneNumber: null,
    updatedAt: null,
    version: 0
  });

  const insertedFromBlank = model.saveByAccountId(
    8,
    {
      contactEmail: 'sam.outage.com',
      emergencyFullName: 'Robin Outage',
      emergencyPhoneNumber: '+1 780 555 9234',
      emergencyRelationship: 'Friend',
      phoneNumber: '+1 780 555 8234'
    },
    {
      updatedAt: '2026-03-07T12:25:00.000Z'
    }
  );
  assert.equal(insertedFromBlank.conflictDetected, false);
  assert.equal(insertedFromBlank.contactInformation.version, 1);
  assert.throws(
    () =>
      model.saveByAccountId(
        8,
        {
          contactEmail: 'sam.outage.com',
          emergencyFullName: 'Robin Outage',
          emergencyPhoneNumber: '+1 780 555 9234',
          emergencyRelationship: 'Friend',
          phoneNumber: '+1 780 555 8234'
        }
      ),
    /updated_at|NOT NULL/i
  );

  const firstSave = model.saveByAccountId(
    1,
    {
      contactEmail: 'jamie.updated@example.com',
      emergencyFullName: 'Morgan Updated',
      emergencyPhoneNumber: '+1 780 555 7777',
      emergencyRelationship: 'Sibling',
      phoneNumber: '+1 780 555 6666'
    },
    {
      submittedVersion: 1,
      updatedAt: '2026-03-07T12:35:00.000Z'
    }
  );
  assert.equal(firstSave.conflictDetected, false);
  assert.deepEqual(firstSave.contactInformation, {
    accountId: 1,
    contactEmail: 'jamie.updated@example.com',
    emergencyFullName: 'Morgan Updated',
    emergencyPhoneNumber: '+1 780 555 7777',
    emergencyRelationship: 'Sibling',
    phoneNumber: '+1 780 555 6666',
    updatedAt: '2026-03-07T12:35:00.000Z',
    version: 2
  });

  context.db.prepare('UPDATE contact_profiles SET version = 4 WHERE account_id = 1').run();
  const conflictSave = model.saveByAccountId(
    1,
    {
      contactEmail: 'jamie.conflict@example.com',
      emergencyFullName: 'Morgan Conflict',
      emergencyPhoneNumber: '+1 780 555 8888',
      emergencyRelationship: 'Partner',
      phoneNumber: '+1 780 555 9999'
    },
    {
      submittedVersion: 1,
      updatedAt: '2026-03-07T12:50:00.000Z'
    }
  );
  assert.equal(conflictSave.conflictDetected, true);
  assert.equal(conflictSave.contactInformation.version, 5);
  assert.equal(conflictSave.contactInformation.contactEmail, 'jamie.conflict@example.com');

  const baselineProfile = context.db
    .prepare('SELECT contact_email, phone_number, version, updated_at FROM contact_profiles WHERE account_id = 2')
    .get();
  const baselineEmergency = context.db
    .prepare('SELECT full_name, phone_number, relationship, updated_at FROM emergency_contacts WHERE account_id = 2')
    .get();

  assert.throws(
    () =>
      model.saveByAccountId(
        2,
        {
          contactEmail: 'broken.write@example.com',
          emergencyFullName: 'Broken Write',
          emergencyPhoneNumber: '+1 780 555 4444',
          emergencyRelationship: 'Friend',
          phoneNumber: '+1 780 555 3333'
        },
        {
          simulateFailure: true,
          submittedVersion: 1,
          updatedAt: '2026-03-07T13:10:00.000Z'
        }
      ),
    /Simulated contact information save failure\./
  );
  assert.deepEqual(
    context.db
      .prepare('SELECT contact_email, phone_number, version, updated_at FROM contact_profiles WHERE account_id = 2')
      .get(),
    baselineProfile
  );
  assert.deepEqual(
    context.db
      .prepare('SELECT full_name, phone_number, relationship, updated_at FROM emergency_contacts WHERE account_id = 2')
      .get(),
    baselineEmergency
  );

  assert.throws(
    () =>
      model.saveByAccountId(
        999,
        {
          contactEmail: 'ghost@example.com',
          emergencyFullName: 'Ghost User',
          emergencyPhoneNumber: '+1 780 555 0000',
          emergencyRelationship: 'Friend',
          phoneNumber: '+1 780 555 1111'
        },
        {
          submittedVersion: 0,
          updatedAt: '2026-03-07T13:15:00.000Z'
        }
      ),
    /unknown account/
  );

  context.cleanup();
});
