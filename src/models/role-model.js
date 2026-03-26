function createRoleModel(db) {
  const selectAssignableRoles = db.prepare(`
    SELECT id, role_key, display_name
    FROM roles
    WHERE is_active = 1
      AND is_assignable = 1
    ORDER BY display_name ASC
  `);
  const selectAssignableRoleById = db.prepare(`
    SELECT id, role_key, display_name
    FROM roles
    WHERE id = ?
      AND is_active = 1
      AND is_assignable = 1
    LIMIT 1
  `);
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
    findAssignableRoleById(roleId) {
      return selectAssignableRoleById.get(roleId) || null;
    },
    listAssignableRoles() {
      return selectAssignableRoles.all();
    },
    listActiveRolesForAccount(accountId) {
      return selectActiveRolesForAccount.all(accountId);
    }
  };
}

module.exports = { createRoleModel };
