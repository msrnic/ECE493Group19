function mapPersonalDetails(record) {
  if (!record) {
    return null;
  }

  return {
    accountId: record.account_id,
    birthDate: record.birth_date || null,
    countryOfOrigin: record.country_of_origin || null,
    firstName: record.first_name || null,
    lastName: record.last_name || null,
    updatedAt: record.updated_at || null,
    version: Number(record.version || 0)
  };
}

function createPersonalDetailsModel(db) {
  const selectPersonalDetails = db.prepare(`
    SELECT
      a.id AS account_id,
      pd.first_name,
      pd.last_name,
      pd.birth_date,
      pd.country_of_origin,
      pd.version,
      pd.updated_at
    FROM accounts a
    LEFT JOIN personal_details pd ON pd.account_id = a.id
    WHERE a.id = ?
  `);
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
  const savePersonalDetails = db.transaction((details) => {
    const existing = selectPersonalDetails.get(details.accountId);
    if (!existing) {
      throw new Error('Cannot update personal details for an unknown account.');
    }

    if (details.simulateFailure) {
      throw new Error('Simulated personal details save failure.');
    }

    const currentVersion = Number(existing.version || 0);
    const nextVersion = currentVersion + 1;
    upsertPersonalDetails.run({
      account_id: details.accountId,
      birth_date: details.birthDate,
      country_of_origin: details.countryOfOrigin,
      first_name: details.firstName,
      last_name: details.lastName,
      updated_at: details.updatedAt,
      version: nextVersion
    });

    return {
      conflictDetected:
        details.submittedVersion > 0 && currentVersion > details.submittedVersion,
      version: nextVersion
    };
  });

  return {
    getByAccountId(accountId) {
      return mapPersonalDetails(selectPersonalDetails.get(accountId) || null);
    },
    saveByAccountId(accountId, details, options = {}) {
      const result = savePersonalDetails({
        accountId,
        birthDate: details.birthDate,
        countryOfOrigin: details.countryOfOrigin,
        firstName: details.firstName,
        lastName: details.lastName,
        simulateFailure: Boolean(options.simulateFailure),
        submittedVersion: Number(options.submittedVersion || 0),
        updatedAt: options.updatedAt
      });

      return {
        conflictDetected: result.conflictDetected,
        personalDetails: this.getByAccountId(accountId)
      };
    }
  };
}

module.exports = { createPersonalDetailsModel };
