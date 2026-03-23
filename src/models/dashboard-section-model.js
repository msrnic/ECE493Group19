function createDashboardSectionModel(db) {
  function listEnabledSectionsForModuleIds(moduleIds) {
    if (!Array.isArray(moduleIds) || moduleIds.length === 0) {
      return [];
    }

    const placeholders = moduleIds.map(() => '?').join(', ');
    return db.prepare(`
      SELECT
        ds.id,
        ds.module_id,
        ds.section_key,
        ds.section_title,
        ds.sort_order
      FROM dashboard_sections ds
      WHERE ds.is_enabled = 1
        AND ds.module_id IN (${placeholders})
      ORDER BY ds.sort_order ASC, ds.section_title ASC
    `).all(...moduleIds);
  }

  return {
    listEnabledSectionsForModuleIds
  };
}

module.exports = { createDashboardSectionModel };
