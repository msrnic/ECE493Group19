const test = require('node:test');
const assert = require('node:assert/strict');

const { createAccountCreationService } = require('../../src/services/account-creation-service');

test('account creation service returns metadata, success, and failure outcomes for admin creation flows', async () => {
  const createdCalls = [];
  const service = createAccountCreationService({
    accountCreationTestState: {
      createFailureIdentifiers: [],
      notificationFailureIdentifiers: [],
      notificationsEnabled: false
    },
    accountModel: {
      findById(accountId) {
        if (accountId === 1) {
          return { id: 1, role: 'admin' };
        }

        if (accountId === 9) {
          return {
            email: 'new.user@example.com',
            id: 9,
            must_change_password: 1,
            status: 'active'
          };
        }

        return null;
      },
      findByIdentifier() {
        return null;
      }
    },
    notificationService: {
      notifyAccountCreated() {
        return { enabled: false, status: 'skipped_disabled' };
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z'),
    passwordPolicyService: {
      getPolicy() {
        return { minLength: 12, requiresDigit: true, requiresLower: true, requiresSpecial: true, requiresUpper: true };
      }
    },
    roleModel: {
      findAssignableRoleById(roleId) {
        return roleId === 2 ? { display_name: 'Student', id: 2, role_key: 'student' } : null;
      },
      listAssignableRoles() {
        return [{ display_name: 'Student', id: 2 }];
      }
    },
    userAccountModel: {
      createAccount(details, options) {
        createdCalls.push({ details, options });
        return { accountId: 9 };
      }
    }
  });

  const metadata = service.getFormMetadata(1);
  assert.equal(metadata.statusCode, 200);
  assert.equal(metadata.notificationsEnabled, false);
  assert.deepEqual(metadata.roles, [{ id: 2, name: 'Student' }]);

  const success = await service.createAccount({
    actorAccountId: 1,
    email: ' New.User@example.com ',
    password: 'ValidPass!234',
    roleId: 2
  });
  assert.equal(success.statusCode, 201);
  assert.equal(success.accountIdentifier, 'new.user@example.com');
  assert.equal(success.assignedRole, 'Student');
  assert.equal(success.mustChangePassword, true);
  assert.equal(createdCalls[0].options.simulateFailure, false);
  assert.equal(createdCalls[0].details.email, 'new.user@example.com');

  const forbidden = service.getFormMetadata(999);
  assert.equal(forbidden.statusCode, 403);

  const duplicate = await createAccountCreationService({
    accountCreationTestState: {
      createFailureIdentifiers: [],
      notificationFailureIdentifiers: [],
      notificationsEnabled: true
    },
    accountModel: {
      findById() {
        return { id: 1, role: 'admin' };
      },
      findByIdentifier() {
        return { id: 10 };
      }
    },
    notificationService: {
      notifyAccountCreated() {
        throw new Error('should not notify on duplicate');
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z'),
    passwordPolicyService: {
      getPolicy() {
        return {};
      }
    },
    roleModel: {
      findAssignableRoleById() {
        return { display_name: 'Student', id: 2, role_key: 'student' };
      },
      listAssignableRoles() {
        return [];
      }
    },
    userAccountModel: {
      createAccount() {
        throw new Error('should not create duplicates');
      }
    }
  }).createAccount({ actorAccountId: 1, email: 'userA@example.com', password: 'ValidPass!234', roleId: 2 });
  assert.equal(duplicate.statusCode, 409);

  const invalidRole = await createAccountCreationService({
    accountCreationTestState: {
      createFailureIdentifiers: [],
      notificationFailureIdentifiers: [],
      notificationsEnabled: true
    },
    accountModel: {
      findById() {
        return { id: 1, role: 'admin' };
      },
      findByIdentifier() {
        return null;
      }
    },
    notificationService: {
      notifyAccountCreated() {
        throw new Error('should not notify when role is invalid');
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z'),
    passwordPolicyService: {
      getPolicy() {
        return {};
      }
    },
    roleModel: {
      findAssignableRoleById() {
        return null;
      },
      listAssignableRoles() {
        return [];
      }
    },
    userAccountModel: {
      createAccount() {
        throw new Error('should not create without a valid role');
      }
    }
  }).createAccount({ actorAccountId: 1, email: 'new@example.com', password: 'ValidPass!234', roleId: 999 });
  assert.equal(invalidRole.statusCode, 400);

  const capturedErrors = [];
  const originalConsoleError = console.error;
  console.error = (...args) => {
    capturedErrors.push(args);
  };

  const duplicateConstraint = await createAccountCreationService({
    accountCreationTestState: {
      createFailureIdentifiers: [],
      notificationFailureIdentifiers: [],
      notificationsEnabled: true
    },
    accountModel: {
      findById(accountId) {
        return accountId === 1 ? { id: 1, role: 'admin' } : null;
      },
      findByIdentifier() {
        return null;
      }
    },
    notificationService: {
      notifyAccountCreated() {
        throw new Error('should not notify when create throws duplicate');
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z'),
    passwordPolicyService: {
      getPolicy() {
        return {};
      }
    },
    roleModel: {
      findAssignableRoleById() {
        return { display_name: 'Student', id: 2, role_key: 'student' };
      },
      listAssignableRoles() {
        return [];
      }
    },
    userAccountModel: {
      createAccount() {
        throw new Error('UNIQUE constraint failed: accounts.email');
      }
    }
  }).createAccount({ actorAccountId: 1, email: 'dup@example.com', password: 'ValidPass!234', roleId: 2 });
  assert.equal(duplicateConstraint.statusCode, 409);

  const systemFailure = await createAccountCreationService({
    accountCreationTestState: {
      createFailureIdentifiers: [],
      notificationFailureIdentifiers: [],
      notificationsEnabled: true
    },
    accountModel: {
      findById(accountId) {
        return accountId === 1 ? { id: 1, role: 'admin' } : null;
      },
      findByIdentifier() {
        return null;
      }
    },
    notificationService: {
      notifyAccountCreated() {
        throw new Error('should not notify when create fails');
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z'),
    passwordPolicyService: {
      getPolicy() {
        return {};
      }
    },
    roleModel: {
      findAssignableRoleById() {
        return { display_name: 'Student', id: 2, role_key: 'student' };
      },
      listAssignableRoles() {
        return [];
      }
    },
    userAccountModel: {
      createAccount() {
        throw new Error('database unavailable');
      }
    }
  }).createAccount({ actorAccountId: 1, email: 'fail@example.com', password: 'ValidPass!234', roleId: 2 });
  assert.equal(systemFailure.statusCode, 500);
  assert.equal(capturedErrors.length > 0, true);

  console.error = originalConsoleError;
});
