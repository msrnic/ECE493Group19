function createModuleModel(db) {
  function listPermittedModulesForRoleIds(roleIds) {
    if (!Array.isArray(roleIds) || roleIds.length === 0) {
      return [];
    }

    const placeholders = roleIds.map(() => '?').join(', ');
    return db.prepare(`
      SELECT DISTINCT
        m.id,
        m.module_key,
        m.display_name,
        m.route_path,
        m.sort_order
      FROM role_modules rm
      INNER JOIN modules m ON m.id = rm.module_id
      WHERE rm.is_active = 1
        AND m.is_enabled = 1
        AND rm.role_id IN (${placeholders})
      ORDER BY m.sort_order ASC, m.display_name ASC
    `).all(...roleIds);
  }

  return {
    hasEnabledModules(roleIds) {
      return listPermittedModulesForRoleIds(roleIds).length > 0;
    },
    listPermittedModulesForRoleIds
  };
}

module.exports = { createModuleModel };
