function createUserAccountModel(db) {
  const insertAccount = db.prepare(`
    INSERT INTO accounts (
      email,
      username,
      role,
      password_hash,
      must_change_password,
      status,
      failed_attempt_count,
      last_failed_at,
      locked_until,
      password_changed_at,
      created_at,
      updated_at
    ) VALUES (
      @email,
      @username,
      @role,
      @password_hash,
      1,
      'active',
      0,
      NULL,
      NULL,
      @password_changed_at,
      @created_at,
      @updated_at
    )
  `);
  const insertRoleAssignment = db.prepare(`
    INSERT INTO role_assignments (
      account_id,
      role_id,
      is_active,
      assigned_at
    ) VALUES (
      @account_id,
      @role_id,
      1,
      @assigned_at
    )
  `);
  const createAccountRecord = db.transaction((details) => {
    const result = insertAccount.run({
      created_at: details.createdAt,
      email: details.email,
      password_changed_at: details.createdAt,
      password_hash: details.passwordHash,
      role: details.roleKey,
      updated_at: details.createdAt,
      username: details.username || details.email
    });
    const accountId = Number(result.lastInsertRowid);

    insertRoleAssignment.run({
      account_id: accountId,
      assigned_at: details.createdAt,
      role_id: details.roleId
    });

    if (details.simulateFailure) {
      throw new Error('Simulated account creation failure.');
    }

    return { accountId };
  });

  return {
    createAccount(details, options = {}) {
      return createAccountRecord({
        createdAt: details.createdAt,
        email: details.email,
        passwordHash: details.passwordHash,
        roleId: details.roleId,
        roleKey: details.roleKey,
        simulateFailure: Boolean(options.simulateFailure),
        username: details.username
      });
    }
  };
}

module.exports = { createUserAccountModel };
