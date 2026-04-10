const test = require('node:test');
const assert = require('node:assert/strict');

const { createDashboardController } = require('../../src/controllers/dashboard-controller');

function createResponse() {
  return {
    body: '',
    statusCode: null,
    send(payload) {
      this.body = payload;
      return payload;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };
}

test('dashboard controller renders profile summaries, update buttons, and missing indicators when profile data is available', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'admin@example.com',
          id: 3,
          role: 'admin',
          username: 'adminA'
        };
      },
      listAccounts() {
        return [{}, {}, {}];
      },
      listPasswordManagementTargets() {
        return [{ id: 1, username: 'userA' }];
      }
    },
    contactInfoModel: {
      getByAccountId() {
        return {
          accountId: 3,
          contactEmail: 'admin.contact@example.com',
          emergencyFullName: null,
          emergencyPhoneNumber: null,
          emergencyRelationship: null,
          phoneNumber: null,
          updatedAt: '2026-03-07T12:00:00.000Z',
          version: 1
        };
      }
    },
    dashboardLoadModel: {
      recordEvent() {}
    },
    dashboardSectionModel: {
      listEnabledSectionsForModuleIds() {
        return [
          { id: 1, module_id: 1, section_key: 'personal-profile', section_title: 'Personal Profile' },
          { id: 2, module_id: 2, section_key: 'security-center', section_title: 'Security Center' }
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
          { display_name: 'Personal Profile', id: 1, module_key: 'personal-profile', route_path: '/dashboard#personal-profile' },
          { display_name: 'Security Center', id: 2, module_key: 'security-center', route_path: '/dashboard#security-center' }
        ];
      }
    },
    now() {
      return new Date('2026-03-07T12:00:00.000Z');
    },
    personalDetailsModel: {
      getByAccountId() {
        return {
          accountId: 3,
          birthDate: '1979-02-20',
          countryOfOrigin: 'Canada',
          firstName: 'Taylor',
          lastName: 'Admin',
          updatedAt: '2026-03-07T12:00:00.000Z',
          version: 1
        };
      }
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [{ display_name: 'Admin', id: 3 }];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:00:00.000Z', account_id: 3 };
      }
    }
  });

  const response = createResponse();
  controller.getDashboard(
    {
      get() {
        return '';
      },
      is() {
        return false;
      },
      session: { accountId: 3 },
      sessionID: 'session-admin-profile'
    },
    response
  );

  assert.equal(response.statusCode, 200);
  assert.match(response.body, /Full Name: Taylor Admin/);
  assert.match(response.body, /Birthday: 20\/02\/1979/);
  assert.match(response.body, /Country of Origin: Canada/);
  assert.match(response.body, /Phone Number: Not provided/);
  assert.match(response.body, /Email: admin\.contact@example\.com/);
  assert.match(response.body, /Emergency Contact Name: Not provided/);
  assert.match(response.body, /Emergency Contact Relation: Not provided/);
  assert.match(response.body, /Update Personal Information/);
  assert.match(response.body, /Update Contact Information/);
  assert.match(response.body, /Change Password/);
  assert.match(response.body, /Reset userA password/);
});

test('dashboard controller treats null profile-model reads as missing values while keeping update actions visible', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return {
          courses: [],
          email: 'student@example.com',
          id: 1,
          role: 'student',
          username: 'userA'
        };
      },
      listPasswordManagementTargets() {
        return [];
      }
    },
    contactInfoModel: {
      getByAccountId() {
        return null;
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
      return new Date('2026-03-07T12:00:00.000Z');
    },
    personalDetailsModel: {
      getByAccountId() {
        return null;
      }
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [{ display_name: 'Student', id: 1 }];
      }
    },
    sessionModel: {
      findActiveSession() {
        return { created_at: '2026-03-07T12:00:00.000Z', account_id: 1 };
      }
    }
  });

  const response = createResponse();
  controller.getDashboard(
    {
      get() {
        return '';
      },
      is() {
        return false;
      },
      session: { accountId: 1 },
      sessionID: 'session-student-profile'
    },
    response
  );

  assert.equal(response.statusCode, 200);
  assert.match(response.body, /Full Name: Not provided/);
  assert.match(response.body, /Birthday: Not provided/);
  assert.match(response.body, /Email: Not provided/);
  assert.match(response.body, /Update Personal Information/);
  assert.match(response.body, /Update Contact Information/);
});
