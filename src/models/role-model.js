function createRoleModel(db) {
  const selectActiveRolesForAccount = db.prepare(`
    SELECT r.id, r.role_key, r.display_name
    FROM role_assignments ra
    INNER JOIN roles r ON r.id = ra.role_id
    WHERE ra.account_id = ?
      AND ra.is_active = 1
      AND r.is_active = 1
    ORDER BY r.display_name ASC
  `);

  return {
    listActiveRolesForAccount(accountId) {
      return selectActiveRolesForAccount.all(accountId);
    }
  };
}

module.exports = { createRoleModel };
