const test = require('node:test');
const assert = require('node:assert/strict');

const { createDashboardController } = require('../../src/controllers/dashboard-controller');

function createHtmlResponseCapture() {
  const capture = {
    body: '',
    statusCode: null
  };

  return {
    capture,
    res: {
      status(statusCode) {
        capture.statusCode = statusCode;
        return this;
      },
      send(body) {
        capture.body = body;
        return body;
      }
    }
  };
}

function createJsonResponseCapture() {
  const capture = {
    payload: null,
    statusCode: null
  };

  return {
    capture,
    res: {
      status(statusCode) {
        capture.statusCode = statusCode;
        return this;
      },
      json(payload) {
        capture.payload = payload;
        return payload;
      }
    }
  };
}

test('dashboard controller renders mixed section states, admin actions, and escaped content', () => {
  let recordedEvent = null;
  let upsertedStates = null;
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [
            {
              course_code: 'ECE<493>',
              role: 'student',
              title: 'Security & Testing'
            },
            {
              course_code: 'MATH201',
              role: 'instructor',
              title: 'Discrete Mathematics'
            }
          ],
          email: 'hybrid.staff@example.com',
          id: 9,
          role: 'admin',
          username: 'hybridAdmin'
        };
      },
      listAccounts() {
        return [{}, {}, {}, {}];
      },
      listPasswordManagementTargets() {
        return [{ id: 5, username: 'target<script>' }];
      }
    },
    dashboardLoadModel: {
      recordEvent(details) {
        recordedEvent = details;
      }
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        return [
          { id: 1, module_id: 1, section_key: 'student-academics', section_title: 'Student Academics' },
          { id: 2, module_id: 2, section_key: 'financial-summary', section_title: 'Financial Summary' },
          { id: 3, module_id: 3, section_key: 'teaching-workload', section_title: 'Teaching Workload' },
          { id: 4, module_id: 4, section_key: 'grading-queue', section_title: 'Grading Queue' },
          { id: 5, module_id: 5, section_key: 'admin-operations', section_title: 'Admin Operations' },
          { id: 6, module_id: 6, section_key: 'personal-profile', section_title: 'Personal Profile' },
          { id: 7, module_id: 7, section_key: 'security-center', section_title: 'Security Center' },
          { id: 8, module_id: 8, section_key: 'research-sandbox', section_title: 'Research Sandbox' }
        ];
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [
          {
            availability_status: 'available',
            last_attempt_at: '2026-03-07T11:59:00.000Z',
            last_success_at: '2026-03-07T11:58:30.000Z',
            section_id: 7,
            status_reason: null
          }
        ];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates(states) {
        upsertedStates = states;
      }
    },
    dashboardTestState: {
      roleFailureIdentifiers: [],
      unavailableSectionsByIdentifier: {
        'hybrid.staff@example.com': ['financial-summary'],
        hybridadmin: ['security-center']
      }
    },
    moduleModel: {
      hasEnabledModules() {
        return true;
      },
      listPermittedModulesForRoleIds() {
        return [
          { display_name: 'Student Academics', id: 1, module_key: 'student-academics', route_path: '/dashboard#student-academics' },
          { display_name: 'Financial Summary', id: 2, module_key: 'financial-summary', route_path: '/dashboard#financial-summary' },
          { display_name: 'Teaching Workload', id: 3, module_key: 'teaching-workload', route_path: '/dashboard#teaching-workload' },
          { display_name: 'Grading Queue', id: 4, module_key: 'grading-queue', route_path: '/dashboard#grading-queue' },
          { display_name: 'Admin Operations', id: 5, module_key: 'admin-operations', route_path: '/dashboard#admin-operations' },
          { display_name: 'Personal Profile', id: 6, module_key: 'personal-profile', route_path: '/dashboard#personal-profile' },
          { display_name: 'Security Center', id: 7, module_key: 'security-center', route_path: '/dashboard#security-center' },
          { display_name: 'Research Sandbox', id: 8, module_key: 'research-sandbox', route_path: '/dashboard#research-sandbox' }
        ];
      }
    },
    now() {
      return new Date('2026-03-07T12:00:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [
          { display_name: 'Professor', id: 2 },
          { display_name: 'Admin', id: 3 }
        ];
      }
    },
    sessionModel: {
      findActiveSession() {
        return null;
      }
    }
  });

  const response = createHtmlResponseCapture();
  controller.getDashboard(
    {
      get() {
        return '';
      },
      is() {
        return false;
      },
      session: { accountId: 9 },
      sessionID: 'session-1'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.match(response.capture.body, /Some dashboard sections are currently unavailable\./);
  assert.match(response.capture.body, /Session metadata unavailable/);
  assert.doesNotMatch(response.capture.body, /Reset target&lt;script&gt; password/);
  assert.equal(
    response.capture.body.indexOf('id="dashboard-sections"') < response.capture.body.indexOf('>Log out<'),
    true
  );
  assert.match(response.capture.body, /ECE&lt;493&gt; Security &amp; Testing \(student\)/);
  assert.match(response.capture.body, /1 teaching assignment\(s\) are ready for review\./);
  assert.match(response.capture.body, /Grade submission summary is ready/);
  assert.match(response.capture.body, /3 managed account\(s\) are available./);
  assert.match(response.capture.body, /Personal Profile/);
  assert.match(response.capture.body, /Change password/);
  assert.equal(response.capture.body.includes('Research Sandbox'), true);
  assert.match(response.capture.body, /Financial Summary <span class=['"]dashboard-pill['"]>Unavailable/);
  assert.match(response.capture.body, /Retry unavailable sections/);
  assert.match(response.capture.body, /dashboard-nav-link is-disabled[^>]*>Security Center/);
  assert.match(response.capture.body, /<span class=['"]dashboard-pill['"]>Professor<\/span><span class=['"]dashboard-pill['"]>Admin<\/span>/);
  assert.equal(upsertedStates.length, 8);
  assert.equal(recordedEvent.outcome, 'partial');
  assert.equal(recordedEvent.failedSections, 2);
});

test('dashboard controller renders no-course and no-teaching fallback content for non-admin actors', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'student@example.com',
          id: 4,
          role: 'student',
          username: 'studentA'
        };
      },
      listPasswordManagementTargets() {
        throw new Error('non-admin accounts should not request password reset targets');
      }
    },
    dashboardLoadModel: {
      recordEvent() {}
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        return [
          { id: 1, module_id: 1, section_key: 'student-academics', section_title: 'Student Academics' },
          { id: 2, module_id: 2, section_key: 'teaching-workload', section_title: 'Teaching Workload' },
          { id: 3, module_id: 3, section_key: 'security-center', section_title: 'Security Center' }
        ];
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates() {}
    },
    dashboardTestState: {
      roleFailureIdentifiers: [],
      unavailableSectionsByIdentifier: {}
    },
    moduleModel: {
      hasEnabledModules() {
        return true;
      },
      listPermittedModulesForRoleIds() {
        return [
          { display_name: 'Student Academics', id: 1, module_key: 'student-academics', route_path: '/dashboard#student-academics' },
          { display_name: 'Teaching Workload', id: 2, module_key: 'teaching-workload', route_path: '/dashboard#teaching-workload' },
          { display_name: 'Security Center', id: 3, module_key: 'security-center', route_path: '/dashboard#security-center' }
        ];
      }
    },
    now() {
      return new Date('2026-03-07T12:05:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [{ display_name: 'Student', id: 1 }];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:05:00.000Z' };
      }
    }
  });

  const response = createHtmlResponseCapture();
  controller.getDashboard(
    {
      get() {
        return '';
      },
      is() {
        return false;
      },
      session: { accountId: 4 },
      sessionID: 'session-2'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.match(response.capture.body, /No course records are currently assigned to this account./);
  assert.match(response.capture.body, /Teaching assignments will appear here once courses are assigned./);
  assert.match(response.capture.body, /No teaching assignments are currently linked to this account./);
  assert.match(response.capture.body, /Review your personal information and keep your account secure from one place./);
  assert.match(response.capture.body, /Your session started at 2026-03-07T12:05:00.000Z./);
  assert.doesNotMatch(response.capture.body, /Reset .* password/);
});

test('dashboard controller returns a failure payload when modules exist but no sections are enabled', () => {
  let recordedEvent = null;
  let upsertCalled = false;
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'student@example.com',
          id: 11,
          role: 'student',
          username: 'studentA'
        };
      },
      listPasswordManagementTargets() {
        return [];
      }
    },
    dashboardLoadModel: {
      recordEvent(details) {
        recordedEvent = details;
      }
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        return [];
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates() {
        upsertCalled = true;
      }
    },
    dashboardTestState: {
      roleFailureIdentifiers: [],
      unavailableSectionsByIdentifier: {}
    },
    moduleModel: {
      hasEnabledModules() {
        return true;
      },
      listPermittedModulesForRoleIds() {
        return [
          { display_name: 'Security Center', id: 6, module_key: 'security-center', route_path: '/dashboard#security-center' }
        ];
      }
    },
    now() {
      return new Date('2026-03-07T12:10:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [{ display_name: 'Student', id: 1 }];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:10:00.000Z' };
      }
    }
  });

  const response = createJsonResponseCapture();
  controller.getDashboard(
    {
      headers: { accept: 'application/json' },
      session: { accountId: 11 },
      sessionID: 'session-3'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.equal(response.capture.payload.status, 'failure');
  assert.equal(
    response.capture.payload.message,
    'Dashboard data is unavailable right now. Retry to load your sections again.'
  );
  assert.deepEqual(response.capture.payload.sections, []);
  assert.equal(response.capture.payload.modules[0].navigationState, 'enabled');
  assert.equal(response.capture.payload.retryAvailable, false);
  assert.equal(recordedEvent.attemptedSections, 0);
  assert.equal(recordedEvent.outcome, 'failure');
  assert.equal(upsertCalled, false);
});

test('dashboard controller retry updates requested sections and treats untouched sections as available by default', () => {
  let upsertedStates = null;
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'userA@example.com',
          id: 1,
          role: 'student',
          username: 'userA'
        };
      },
      listPasswordManagementTargets() {
        return [];
      }
    },
    dashboardLoadModel: {
      recordEvent() {}
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        return [
          { id: 1, module_id: 1, section_key: 'student-academics', section_title: 'Student Academics' },
          { id: 2, module_id: 2, section_key: 'financial-summary', section_title: 'Financial Summary' }
        ];
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [1];
      },
      upsertStates(states) {
        upsertedStates = states;
      }
    },
    dashboardTestState: {
      roleFailureIdentifiers: [],
      unavailableSectionsByIdentifier: {}
    },
    moduleModel: {
      hasEnabledModules() {
        return true;
      },
      listPermittedModulesForRoleIds() {
        return [
          { display_name: 'Student Academics', id: 1, module_key: 'student-academics', route_path: '/dashboard#student-academics' },
          { display_name: 'Financial Summary', id: 2, module_key: 'financial-summary', route_path: '/dashboard#financial-summary' }
        ];
      }
    },
    now() {
      return new Date('2026-03-07T12:15:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [{ display_name: 'Student', id: 1 }];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:15:00.000Z' };
      }
    }
  });

  const response = createJsonResponseCapture();
  controller.postRetry(
    {
      body: { sectionIds: [1] },
      session: { accountId: 1 }
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.equal(upsertedStates.length, 1);
  assert.equal(response.capture.payload.status, 'success');
  assert.equal(response.capture.payload.sections.length, 2);
  assert.deepEqual(
    response.capture.payload.sections.map((section) => section.availabilityStatus),
    ['available', 'available']
  );
  assert.deepEqual(response.capture.payload.unavailableSectionIds, []);
});

test('dashboard controller returns empty_access when roles exist but none of their modules are enabled', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'limited@example.com',
          id: 21,
          role: 'student',
          username: 'limitedUser'
        };
      },
      listPasswordManagementTargets() {
        return [];
      }
    },
    dashboardLoadModel: {
      recordEvent() {
        throw new Error('load events should not be recorded for empty_access');
      }
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        throw new Error('sections should not be loaded for empty_access');
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates() {}
    },
    dashboardTestState: {
      roleFailureIdentifiers: [],
      unavailableSectionsByIdentifier: {}
    },
    moduleModel: {
      hasEnabledModules() {
        return false;
      },
      listPermittedModulesForRoleIds() {
        return [{ display_name: 'Hidden Module', id: 5, module_key: 'hidden-module', route_path: '/dashboard#hidden-module' }];
      }
    },
    now() {
      return new Date('2026-03-07T12:20:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [{ display_name: 'Student', id: 1 }];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:20:00.000Z' };
      }
    }
  });

  const response = createJsonResponseCapture();
  controller.getDashboard(
    {
      is() {
        return true;
      },
      session: { accountId: 21 },
      sessionID: 'session-4'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.equal(response.capture.payload.status, 'empty_access');
  assert.deepEqual(response.capture.payload.modules, []);
  assert.deepEqual(response.capture.payload.sections, []);
  assert.equal(response.capture.payload.retryAvailable, false);
});

test('dashboard controller short-circuits empty_access for missing roles and returns JSON auth redirects for missing accounts', () => {
  let hasEnabledModulesCalled = false;
  const noRolesController = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'noroles@example.com',
          id: 22,
          role: 'student',
          username: 'noRolesUser'
        };
      },
      listPasswordManagementTargets() {
        return [];
      }
    },
    dashboardLoadModel: {
      recordEvent() {
        throw new Error('load events should not be recorded when no roles are available');
      }
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        throw new Error('sections should not be loaded when no roles are available');
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates() {}
    },
    dashboardTestState: {
      roleFailureIdentifiers: [],
      unavailableSectionsByIdentifier: {}
    },
    moduleModel: {
      hasEnabledModules() {
        hasEnabledModulesCalled = true;
        return true;
      },
      listPermittedModulesForRoleIds() {
        return [];
      }
    },
    now() {
      return new Date('2026-03-07T12:22:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:22:00.000Z' };
      }
    }
  });

  const noRolesResponse = createJsonResponseCapture();
  noRolesController.getDashboard(
    {
      headers: { accept: 'application/json' },
      session: { accountId: 22 },
      sessionID: 'session-no-roles'
    },
    noRolesResponse.res
  );

  assert.equal(noRolesResponse.capture.statusCode, 200);
  assert.equal(noRolesResponse.capture.payload.status, 'empty_access');
  assert.equal(hasEnabledModulesCalled, false);

  const missingAccountController = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return null;
      }
    }
  });
  const missingAccountResponse = createJsonResponseCapture();
  missingAccountController.getDashboard(
    {
      headers: { accept: 'application/json' },
      method: 'GET',
      session: { accountId: 99 }
    },
    missingAccountResponse.res
  );

  assert.equal(missingAccountResponse.capture.statusCode, 401);
  assert.deepEqual(missingAccountResponse.capture.payload, {
    loginUrl: '/login',
    returnTo: '/dashboard',
    status: 'auth_error'
  });
});

test('dashboard controller tolerates null dashboard test identifiers without changing the response payload', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'fixture@example.com',
          id: 23,
          role: 'student',
          username: 'fixtureUser'
        };
      },
      listPasswordManagementTargets() {
        return [];
      }
    },
    dashboardLoadModel: {
      recordEvent() {}
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        return [
          { id: 1, module_id: 1, section_key: 'security-center', section_title: 'Security Center' }
        ];
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates() {}
    },
    dashboardTestState: {
      roleFailureIdentifiers: [null],
      unavailableSectionsByIdentifier: {}
    },
    moduleModel: {
      hasEnabledModules() {
        return true;
      },
      listPermittedModulesForRoleIds() {
        return [
          { display_name: 'Security Center', id: 1, module_key: 'security-center', route_path: '/dashboard#security-center' }
        ];
      }
    },
    now() {
      return new Date('2026-03-07T12:23:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [{ display_name: 'Student', id: 1 }];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:23:00.000Z' };
      }
    }
  });

  const response = createJsonResponseCapture();
  controller.getDashboard(
    {
      headers: { accept: 'application/json' },
      session: { accountId: 23 },
      sessionID: 'session-null-fixture'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.equal(response.capture.payload.status, 'success');
});

test('dashboard controller includes teaching assistant assignments in workload content', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [
            {
              course_code: 'CMPUT174',
              role: 'ta',
              title: 'Introduction to Computing'
            }
          ],
          email: 'ta@example.com',
          id: 30,
          role: 'professor',
          username: 'taUser'
        };
      },
      listPasswordManagementTargets() {
        return [];
      }
    },
    dashboardLoadModel: {
      recordEvent() {}
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        return [
          { id: 1, module_id: 1, section_key: 'teaching-workload', section_title: 'Teaching Workload' }
        ];
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates() {}
    },
    dashboardTestState: {
      roleFailureIdentifiers: [],
      unavailableSectionsByIdentifier: {}
    },
    moduleModel: {
      hasEnabledModules() {
        return true;
      },
      listPermittedModulesForRoleIds() {
        return [
          { display_name: 'Teaching Workload', id: 1, module_key: 'teaching-workload', route_path: '/dashboard#teaching-workload' }
        ];
      }
    },
    now() {
      return new Date('2026-03-07T12:25:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [{ display_name: 'Professor', id: 2 }];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:25:00.000Z' };
      }
    }
  });

  const response = createHtmlResponseCapture();
  controller.getDashboard(
    {
      get() {
        return '';
      },
      is() {
        return false;
      },
      session: { accountId: 30 },
      sessionID: 'session-ta'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.equal(response.capture.body.includes('CMPUT174 Introduction to Computing (ta)'), true);
});

test('dashboard controller defaults omitted dashboardTestState to a healthy dashboard state', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'healthy@example.com',
          id: 41,
          role: 'student',
          username: 'healthyUser'
        };
      },
      listPasswordManagementTargets() {
        return [];
      }
    },
    dashboardLoadModel: {
      recordEvent() {}
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        return [
          { id: 1, module_id: 1, section_key: 'security-center', section_title: 'Security Center' }
        ];
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates() {}
    },
    moduleModel: {
      hasEnabledModules() {
        return true;
      },
      listPermittedModulesForRoleIds() {
        return [
          { display_name: 'Security Center', id: 1, module_key: 'security-center', route_path: '/dashboard#security-center' }
        ];
      }
    },
    now() {
      return new Date('2026-03-07T12:30:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [{ display_name: 'Student', id: 1 }];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:30:00.000Z' };
      }
    }
  });

  const response = createJsonResponseCapture();
  controller.getDashboard(
    {
      headers: { accept: 'application/json' },
      session: { accountId: 41 },
      sessionID: 'session-no-state'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.equal(response.capture.payload.status, 'success');
  assert.deepEqual(response.capture.payload.unavailableSectionIds, []);
});

test('dashboard controller applies professor presentation overrides for string role identifiers', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [
            {
              course_code: 'ECE493',
              role: 'instructor',
              title: 'Software Engineering'
            }
          ],
          email: 'string-role@example.com',
          id: 52,
          role: 'professor',
          username: 'profString'
        };
      },
      listPasswordManagementTargets() {
        return [];
      }
    },
    dashboardLoadModel: {
      recordEvent() {}
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        return [
          { id: 1, module_id: 1, section_key: 'inbox', section_title: 'Inbox' },
          { id: 2, module_id: 2, section_key: 'teaching-workload', section_title: 'Teaching Workload' },
          { id: 3, module_id: 3, section_key: 'security-center', section_title: 'Security Center' }
        ];
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates() {}
    },
    dashboardTestState: {
      roleFailureIdentifiers: [],
      unavailableSectionsByIdentifier: {}
    },
    moduleModel: {
      hasEnabledModules() {
        return true;
      },
      listPermittedModulesForRoleIds() {
        return [
          { display_name: 'Inbox', id: 1, module_key: 'inbox', route_path: '/dashboard#inbox' },
          { display_name: 'Teaching Workload', id: 2, module_key: 'teaching-workload', route_path: '/dashboard#teaching-workload' },
          { display_name: 'Security Center', id: 3, module_key: 'security-center', route_path: '/dashboard#security-center' }
        ];
      }
    },
    now() {
      return new Date('2026-03-07T12:40:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return ['professor'];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:40:00.000Z' };
      }
    }
  });

  const response = createHtmlResponseCapture();
  controller.getDashboard(
    {
      get() {
        return '';
      },
      is() {
        return false;
      },
      session: { accountId: 52 },
      sessionID: 'session-string-role'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.match(response.capture.body, /Personal Profile/);
  assert.match(response.capture.body, /Current Courses/);
  assert.match(response.capture.body, /ECE493 Software Engineering \(instructor\)/);
});

test('dashboard controller handles accounts without a primary role when no active roles are returned', () => {
  let hasEnabledModulesCalled = false;
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'norolefield@example.com',
          id: 53,
          username: 'noRoleField'
        };
      },
      listPasswordManagementTargets() {
        return [];
      }
    },
    dashboardLoadModel: {
      recordEvent() {
        throw new Error('load events should not be recorded when no roles are available');
      }
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        throw new Error('sections should not be loaded when no roles are available');
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates() {}
    },
    dashboardTestState: {
      roleFailureIdentifiers: [],
      unavailableSectionsByIdentifier: {}
    },
    moduleModel: {
      hasEnabledModules() {
        hasEnabledModulesCalled = true;
        return true;
      },
      listPermittedModulesForRoleIds() {
        return [];
      }
    },
    now() {
      return new Date('2026-03-07T12:41:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:41:00.000Z' };
      }
    }
  });

  const response = createJsonResponseCapture();
  controller.getDashboard(
    {
      headers: { accept: 'application/json' },
      session: { accountId: 53 },
      sessionID: 'session-no-role-field'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.equal(response.capture.payload.status, 'empty_access');
  assert.equal(hasEnabledModulesCalled, false);
});

test('dashboard controller ignores blank role entries when deriving presentation overrides', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'null-role@example.com',
          id: 54,
          role: 'student',
          username: 'nullRoleUser'
        };
      },
      listPasswordManagementTargets() {
        return [];
      }
    },
    dashboardLoadModel: {
      recordEvent() {}
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        return [
          { id: 1, module_id: 1, section_key: 'security-center', section_title: 'Security Center' }
        ];
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates() {}
    },
    dashboardTestState: {
      roleFailureIdentifiers: [],
      unavailableSectionsByIdentifier: {}
    },
    moduleModel: {
      hasEnabledModules() {
        return true;
      },
      listPermittedModulesForRoleIds() {
        return [
          { display_name: 'Security Center', id: 1, module_key: 'security-center', route_path: '/dashboard#security-center' }
        ];
      }
    },
    now() {
      return new Date('2026-03-07T12:42:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [''];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:42:00.000Z' };
      }
    }
  });

  const response = createJsonResponseCapture();
  controller.getDashboard(
    {
      headers: { accept: 'application/json' },
      session: { accountId: 54 },
      sessionID: 'session-null-role-entry'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.equal(response.capture.payload.modules[0].displayName, 'Personal Profile');
});

test('dashboard controller preserves admin security labeling when string roles include professor and admin', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [
            {
              course_code: 'ECE493',
              role: 'instructor',
              title: 'Software Engineering'
            }
          ],
          email: 'string-hybrid@example.com',
          id: 55,
          role: 'admin',
          username: 'hybridString'
        };
      },
      listAccounts() {
        return [{}, {}, {}];
      },
      listPasswordManagementTargets() {
        return [{ id: 8, username: 'userA' }];
      }
    },
    dashboardLoadModel: {
      recordEvent() {}
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        return [
          { id: 1, module_id: 1, section_key: 'inbox', section_title: 'Inbox' },
          { id: 2, module_id: 2, section_key: 'personal-profile', section_title: 'Personal Profile' },
          { id: 3, module_id: 3, section_key: 'teaching-workload', section_title: 'Teaching Workload' },
          { id: 4, module_id: 4, section_key: 'admin-operations', section_title: 'Admin Operations' },
          { id: 5, module_id: 5, section_key: 'security-center', section_title: 'Security Center' }
        ];
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates() {}
    },
    dashboardTestState: {
      roleFailureIdentifiers: [],
      unavailableSectionsByIdentifier: {}
    },
    moduleModel: {
      hasEnabledModules() {
        return true;
      },
      listPermittedModulesForRoleIds() {
        return [
          { display_name: 'Inbox', id: 1, module_key: 'inbox', route_path: '/dashboard#inbox' },
          { display_name: 'Personal Profile', id: 2, module_key: 'personal-profile', route_path: '/dashboard#personal-profile' },
          { display_name: 'Teaching Workload', id: 3, module_key: 'teaching-workload', route_path: '/dashboard#teaching-workload' },
          { display_name: 'Admin Operations', id: 4, module_key: 'admin-operations', route_path: '/dashboard#admin-operations' },
          { display_name: 'Security Center', id: 5, module_key: 'security-center', route_path: '/dashboard#security-center' }
        ];
      }
    },
    now() {
      return new Date('2026-03-07T12:43:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return ['professor', 'admin'];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:43:00.000Z' };
      }
    }
  });

  const response = createHtmlResponseCapture();
  controller.getDashboard(
    {
      get() {
        return '';
      },
      is() {
        return false;
      },
      session: { accountId: 55 },
      sessionID: 'session-string-hybrid'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.match(response.capture.body, /Inbox/);
  assert.match(response.capture.body, /Personal Profile/);
  assert.match(response.capture.body, /Current Courses/);
  assert.match(response.capture.body, /Admin Operations/);
  assert.match(response.capture.body, /Security Center/);
  assert.match(response.capture.body, /Change password/);
  assert.match(response.capture.body, /Reset userA password/);
});


test('dashboard controller returns role_data_error when the username matches a configured failure identifier', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'professor@example.com',
          id: 56,
          role: 'professor',
          username: 'profA'
        };
      },
      listPasswordManagementTargets() {
        return [];
      }
    },
    dashboardLoadModel: {
      recordEvent() {
        throw new Error('load events should not be recorded when role lookup fails');
      }
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        throw new Error('sections should not be loaded when role lookup fails');
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates() {}
    },
    dashboardTestState: {
      roleFailureIdentifiers: ['profA'],
      unavailableSectionsByIdentifier: {}
    },
    moduleModel: {
      hasEnabledModules() {
        throw new Error('modules should not be evaluated when role lookup fails');
      },
      listPermittedModulesForRoleIds() {
        throw new Error('modules should not be loaded when role lookup fails');
      }
    },
    now() {
      return new Date('2026-03-07T12:44:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [{ display_name: 'Professor', id: 2 }];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:44:00.000Z' };
      }
    }
  });

  const response = createJsonResponseCapture();
  controller.getDashboard(
    {
      headers: { accept: 'application/json' },
      session: { accountId: 56 },
      sessionID: 'session-username-role-failure'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.equal(response.capture.payload.status, 'role_data_error');
  assert.equal(response.capture.payload.retryAvailable, true);
});

test('dashboard controller returns an auth redirect payload for POST requests when the account is missing', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return null;
      }
    }
  });

  const response = createJsonResponseCapture();
  controller.postRetry(
    {
      body: { sectionIds: [1] },
      method: 'POST',
      session: { accountId: 57 }
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 401);
  assert.deepEqual(response.capture.payload, {
    loginUrl: '/login',
    returnTo: '/dashboard',
    status: 'auth_error'
  });
});


test('dashboard controller falls back to raw role objects without role labels when deriving presentation keys', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'fallback-role@example.com',
          id: 58,
          role: 'professor',
          username: 'fallbackRole'
        };
      },
      listPasswordManagementTargets() {
        return [];
      }
    },
    dashboardLoadModel: {
      recordEvent() {}
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        return [
          { id: 1, module_id: 1, section_key: 'security-center', section_title: 'Security Center' }
        ];
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates() {}
    },
    dashboardTestState: {
      roleFailureIdentifiers: [],
      unavailableSectionsByIdentifier: {}
    },
    moduleModel: {
      hasEnabledModules() {
        return true;
      },
      listPermittedModulesForRoleIds() {
        return [
          { display_name: 'Security Center', id: 1, module_key: 'security-center', route_path: '/dashboard#security-center' }
        ];
      }
    },
    now() {
      return new Date('2026-03-07T12:45:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [{ id: 2 }];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:45:00.000Z' };
      }
    }
  });

  const response = createJsonResponseCapture();
  controller.getDashboard(
    {
      headers: { accept: 'application/json' },
      session: { accountId: 58 },
      sessionID: 'session-fallback-role-object'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.equal(response.capture.payload.status, 'success');
  assert.equal(response.capture.payload.modules[0].displayName, 'Security Center');
});


test('dashboard controller treats omitted active role lists as an empty-access minimal dashboard', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'missing-roles@example.com',
          id: 59,
          role: 'student',
          username: 'missingRoles'
        };
      },
      listPasswordManagementTargets() {
        return [];
      }
    },
    dashboardLoadModel: {
      recordEvent() {
        throw new Error('load events should not be recorded without active roles');
      }
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        throw new Error('sections should not be loaded without active roles');
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates() {}
    },
    dashboardTestState: {
      roleFailureIdentifiers: [],
      unavailableSectionsByIdentifier: {}
    },
    moduleModel: {
      hasEnabledModules() {
        throw new Error('enabled-module checks should short-circuit when roles are omitted');
      },
      listPermittedModulesForRoleIds(roleIds) {
        assert.deepEqual(roleIds, []);
        return [];
      }
    },
    now() {
      return new Date('2026-03-07T12:46:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return undefined;
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:46:00.000Z' };
      }
    }
  });

  const response = createHtmlResponseCapture();
  controller.getDashboard(
    {
      get() {
        return '';
      },
      is() {
        return false;
      },
      session: { accountId: 59 },
      sessionID: 'session-missing-role-list'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.match(response.capture.body, /Minimal dashboard/);
  assert.match(response.capture.body, /No dashboard modules are available for this account./);
  assert.match(response.capture.body, /student/i);
});

test('dashboard controller renders live financial snapshot details for a student dashboard section', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'finance@example.com',
          id: 60,
          role: 'student',
          username: 'financeStudent'
        };
      },
      listPasswordManagementTargets() {
        return [];
      }
    },
    dashboardLoadModel: {
      recordEvent() {}
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        return [{ id: 1, module_id: 1, section_key: 'financial-summary', section_title: 'Financial Summary' }];
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [];
      },
      upsertStates() {}
    },
    dashboardTestState: {
      roleFailureIdentifiers: [],
      unavailableSectionsByIdentifier: {}
    },
    financialSummaryModel: {
      getLatestSnapshotByAccountId() {
        return {
          balanceDueCents: 100,
          lastConfirmedAt: '2026-03-07T12:47:00.000Z',
          outstandingFeesCents: 200,
          paymentStatus: 'mystery_status',
          sourceState: 'live'
        };
      }
    },
    moduleModel: {
      hasEnabledModules() {
        return true;
      },
      listPermittedModulesForRoleIds() {
        return [{ display_name: 'Financial Summary', id: 1, module_key: 'financial-summary', route_path: '/dashboard#financial-summary' }];
      }
    },
    now() {
      return new Date('2026-03-07T12:47:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [{ display_name: 'Student', id: 1, role_key: 'student' }];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:47:00.000Z' };
      }
    }
  });

  const response = createHtmlResponseCapture();
  controller.getDashboard(
    {
      get() {
        return '';
      },
      is() {
        return false;
      },
      session: { accountId: 60 },
      sessionID: 'session-finance-live'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.match(response.capture.body, /Outstanding balance: \$1\.00/);
  assert.match(response.capture.body, /Outstanding fees: \$2\.00/);
  assert.match(response.capture.body, /Payment status: Unknown/);
  assert.doesNotMatch(response.capture.body, /Live financial data is temporarily unavailable/);
});

test('dashboard controller returns stale financial snapshot data in JSON when the financial section is unavailable', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'finance@example.com',
          id: 61,
          role: 'student',
          username: 'financeStudent'
        };
      }
    },
    dashboardLoadModel: {
      recordEvent() {}
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        return [{ id: 1, module_id: 1, section_key: 'financial-summary', section_title: 'Financial Summary' }];
      }
    },
    dashboardSectionStateModel: {
      listStatesForAccount() {
        return [];
      },
      listUnavailableSectionIds() {
        return [1];
      },
      upsertStates() {}
    },
    dashboardTestState: {
      roleFailureIdentifiers: [],
      unavailableSectionsByIdentifier: {
        'finance@example.com': ['financial-summary']
      }
    },
    financialSummaryModel: {
      getLatestSnapshotByAccountId() {
        return {
          balanceDueCents: 4050,
          lastConfirmedAt: '2026-03-07T12:48:00.000Z',
          outstandingFeesCents: 500,
          paymentStatus: 'overdue',
          sourceState: 'live'
        };
      }
    },
    moduleModel: {
      hasEnabledModules() {
        return true;
      },
      listPermittedModulesForRoleIds() {
        return [{ display_name: 'Financial Summary', id: 1, module_key: 'financial-summary', route_path: '/dashboard#financial-summary' }];
      }
    },
    now() {
      return new Date('2026-03-07T12:48:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [{ display_name: 'Student', id: 1, role_key: 'student' }];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:48:00.000Z' };
      }
    }
  });

  const response = createJsonResponseCapture();
  controller.getDashboard(
    {
      get() {
        return 'application/json';
      },
      headers: { accept: 'application/json' },
      is() {
        return true;
      },
      session: { accountId: 61 },
      sessionID: 'session-finance-stale'
    },
    response.res
  );

  assert.equal(response.capture.statusCode, 200);
  assert.equal(response.capture.payload.status, 'failure');
  assert.deepEqual(response.capture.payload.sections[0].content.items, [
    'Outstanding balance: $40.50',
    'Outstanding fees: $5.00',
    'Payment status: Overdue',
    'Last confirmed: 2026-03-07T12:48:00.000Z'
  ]);
  assert.equal(
    response.capture.payload.sections[0].content.staleNotice,
    'Live financial data is temporarily unavailable. Showing the last confirmed values.'
  );
});
