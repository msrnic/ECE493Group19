function mapContactInformation(record) {
  if (!record) {
    return null;
  }

  return {
    accountId: record.account_id,
    contactEmail: record.contact_email || null,
    emergencyFullName: record.emergency_full_name || null,
    emergencyPhoneNumber: record.emergency_phone_number || null,
    emergencyRelationship: record.emergency_relationship || null,
    phoneNumber: record.phone_number || null,
    updatedAt: record.updated_at || null,
    version: Number(record.version || 0)
  };
}

function createContactInfoModel(db) {
  const selectContactInformation = db.prepare(`
    SELECT
      a.id AS account_id,
      cp.contact_email,
      cp.phone_number,
      cp.version,
      cp.updated_at,
      ec.full_name AS emergency_full_name,
      ec.phone_number AS emergency_phone_number,
      ec.relationship AS emergency_relationship
    FROM accounts a
    LEFT JOIN contact_profiles cp ON cp.account_id = a.id
    LEFT JOIN emergency_contacts ec ON ec.account_id = a.id
    WHERE a.id = ?
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
  const saveContactInformation = db.transaction((details) => {
    const existing = selectContactInformation.get(details.accountId);
    if (!existing) {
      throw new Error('Cannot update contact information for an unknown account.');
    }

    const currentVersion = Number(existing.version || 0);
    const nextVersion = currentVersion + 1;
    upsertContactProfile.run({
      account_id: details.accountId,
      contact_email: details.contactEmail,
      phone_number: details.phoneNumber,
      updated_at: details.updatedAt,
      version: nextVersion
    });

    if (details.simulateFailure) {
      throw new Error('Simulated contact information save failure.');
    }

    upsertEmergencyContact.run({
      account_id: details.accountId,
      full_name: details.emergencyFullName,
      phone_number: details.emergencyPhoneNumber,
      relationship: details.emergencyRelationship,
      updated_at: details.updatedAt
    });

    return {
      conflictDetected:
        details.submittedVersion > 0 && currentVersion > details.submittedVersion,
      version: nextVersion
    };
  });

  return {
    getByAccountId(accountId) {
      return mapContactInformation(selectContactInformation.get(accountId) || null);
    },
    saveByAccountId(accountId, details, options = {}) {
      const result = saveContactInformation({
        accountId,
        contactEmail: details.contactEmail,
        emergencyFullName: details.emergencyFullName,
        emergencyPhoneNumber: details.emergencyPhoneNumber,
        emergencyRelationship: details.emergencyRelationship,
        phoneNumber: details.phoneNumber,
        simulateFailure: Boolean(options.simulateFailure),
        submittedVersion: Number(options.submittedVersion || 0),
        updatedAt: options.updatedAt
      });

      return {
        conflictDetected: result.conflictDetected,
        contactInformation: this.getByAccountId(accountId)
      };
    }
  };
}

module.exports = { createContactInfoModel };
