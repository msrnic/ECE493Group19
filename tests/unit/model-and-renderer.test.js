const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { closeAll, getDb } = require('../../src/db/connection');
const { applySchema } = require('../../src/db/migrations/apply-schema');
const { seedLoginFixtures } = require('../../src/db/migrations/seed-login-fixtures');
const { createAccountModel } = require('../../src/models/account-model');
const { createDashboardLoadModel } = require('../../src/models/dashboard-load-model');
const { createDashboardSectionModel } = require('../../src/models/dashboard-section-model');
const { createDashboardSectionStateModel } = require('../../src/models/dashboard-section-state-model');
const { createModuleModel } = require('../../src/models/module-model');
const { createRoleModel } = require('../../src/models/role-model');
const { renderHtml } = require('../../src/views/render');

function buildDb() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc02-models-'));
  const dbPath = path.join(tempDir, 'sis.db');
  applySchema(dbPath);
  seedLoginFixtures(dbPath);
  return { db: getDb(dbPath), tempDir };
}

test('dashboard models provide account, role, module, section, state, and telemetry operations', () => {
  const { db, tempDir } = buildDb();
  const accountModel = createAccountModel(db);
  const roleModel = createRoleModel(db);
  const moduleModel = createModuleModel(db);
  const sectionModel = createDashboardSectionModel(db);
  const sectionStateModel = createDashboardSectionStateModel(db);
  const dashboardLoadModel = createDashboardLoadModel(db);

  const studentAccount = accountModel.findByIdentifier('userA@example.com');
  const hybridAccount = accountModel.findByIdentifier('hybrid.staff@example.com');
  assert.equal(accountModel.findByIdentifier('missing@example.com'), null);
  assert.equal(accountModel.listAccounts().length, 8);
  assert.equal(accountModel.getDashboardAccount(studentAccount.id).courses.length, 2);

  const studentRoles = roleModel.listActiveRolesForAccount(studentAccount.id);
  const hybridRoles = roleModel.listActiveRolesForAccount(hybridAccount.id);
  assert.equal(studentRoles.length, 1);
  assert.equal(studentRoles[0].role_key, 'student');
  assert.equal(hybridRoles.length, 2);

  assert.equal(moduleModel.hasEnabledModules([]), false);
  const studentModules = moduleModel.listPermittedModulesForRoleIds(studentRoles.map((role) => role.id));
  const hybridModules = moduleModel.listPermittedModulesForRoleIds(hybridRoles.map((role) => role.id));
  assert.equal(studentModules.length, 6);
  assert.deepEqual(
    hybridModules.map((module) => module.module_key),
    ['inbox', 'personal-profile', 'teaching-workload', 'admin-operations', 'security-center']
  );

  assert.deepEqual(sectionModel.listEnabledSectionsForModuleIds([]), []);
  const studentSections = sectionModel.listEnabledSectionsForModuleIds(
    studentModules.map((module) => module.id)
  );
  assert.equal(studentSections.length, 6);

  sectionStateModel.upsertStates([
    {
      accountId: studentAccount.id,
      availabilityStatus: 'available',
      lastAttemptAt: '2026-03-07T12:00:00.000Z',
      lastSuccessAt: '2026-03-07T12:00:00.000Z',
      sectionId: studentSections[0].id,
      statusReason: null
    },
    {
      accountId: studentAccount.id,
      availabilityStatus: 'unavailable',
      lastAttemptAt: '2026-03-07T12:01:00.000Z',
      lastSuccessAt: null,
      sectionId: studentSections[1].id,
      statusReason: 'Simulated outage.'
    }
  ]);
  assert.equal(sectionStateModel.listStatesForAccount(studentAccount.id).length, 2);
  assert.deepEqual(sectionStateModel.listUnavailableSectionIds(studentAccount.id), [studentSections[1].id]);

  dashboardLoadModel.recordEvent({
    accountId: studentAccount.id,
    attemptedSections: 6,
    durationMs: 125,
    failedSections: 1,
    occurredAt: '2026-03-07T12:00:00.000Z',
    outcome: 'partial',
    requestType: 'initial_load',
    successfulSections: 5
  });
  dashboardLoadModel.recordEvent({
    accountId: studentAccount.id,
    attemptedSections: 1,
    durationMs: 80,
    failedSections: 0,
    occurredAt: '2026-03-07T12:02:00.000Z',
    outcome: 'success',
    requestType: 'retry',
    successfulSections: 1
  });

  assert.equal(dashboardLoadModel.listEventsForAccount(studentAccount.id).length, 2);
  assert.deepEqual(dashboardLoadModel.getPerformanceSummary('initial_load'), {
    percentile: 95,
    sampleSize: 1,
    valueMs: 125
  });

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});

test('renderHtml escapes plain text and preserves html/json placeholders', () => {
  const templatePath = path.resolve(__dirname, '../../src/views/dashboard.html');
  const html = renderHtml(templatePath, {
    dashboard_message: 'Status <unsafe>',
    dashboard_navigation_html: '<p>Safe nav</p>',
    dashboard_sections_html: '<section>Safe section</section>',
    dashboard_state_json: '{"unsafe":"<x>"}',
    dashboard_status: 'success',
    retry_panel_html: '<button>Retry</button>',
    role_badges_html: '<span>Student</span>',
    security_actions_html: '<li>Safe link</li>',
    session_created_at: '<unsafe>',
    username: 'User <A>'
  });

  assert.match(html, /User &lt;A&gt;/);
  assert.match(html, /Status &lt;unsafe&gt;/);
  assert.match(html, /&lt;unsafe&gt;/);
  assert.match(html, /<p>Safe nav<\/p>/);
  assert.match(html, /<section>Safe section<\/section>/);
  assert.match(html, /<button>Retry<\/button>/);
  assert.match(html, /<span>Student<\/span>/);
  assert.match(html, /\{"unsafe":"<x>"\}/);
});
