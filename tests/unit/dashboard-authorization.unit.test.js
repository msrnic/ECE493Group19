const test = require('node:test');
const assert = require('node:assert/strict');

const { createTestContext } = require('../helpers/test-context');

test('module authorization helpers deduplicate overlapping role mappings and report enabled access correctly', () => {
  const context = createTestContext();
  const hybridAccountId = context.db
    .prepare('SELECT id FROM accounts WHERE email = ?')
    .get('hybrid.staff@example.com').id;
  const roleIds = context.app.locals.services.roleModel
    .listActiveRolesForAccount(hybridAccountId)
    .map((role) => role.id);

  const modules = context.app.locals.services.moduleModel.listPermittedModulesForRoleIds([
    ...roleIds,
    ...roleIds
  ]);
  const moduleKeys = modules.map((module) => module.module_key);

  assert.deepEqual(moduleKeys, ['inbox', 'personal-profile', 'teaching-workload', 'admin-operations', 'security-center']);
  assert.deepEqual([...new Set(moduleKeys)], moduleKeys);
  assert.equal(context.app.locals.services.moduleModel.hasEnabledModules(roleIds), true);
  assert.equal(context.app.locals.services.moduleModel.hasEnabledModules([]), false);

  context.cleanup();
});
