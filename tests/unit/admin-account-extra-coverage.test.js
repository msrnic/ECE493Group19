const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { createAdminAccountController } = require('../../src/controllers/admin-account-controller');
const { applySchema } = require('../../src/db/migrations/apply-schema');
const { seedLoginFixtures } = require('../../src/db/migrations/seed-login-fixtures');
const { closeAll, getDb } = require('../../src/db/connection');
const { createUserAccountModel } = require('../../src/models/user-account-model');
const { createAccountCreationService } = require('../../src/services/account-creation-service');
const { createNotificationService } = require('../../src/services/notification-service');
const { createPasswordPolicyService } = require('../../src/services/password-policy-service');

function createResponse() {
  return {
    body: '',
    jsonBody: null,
    statusCode: 200,
    json(payload) {
      this.jsonBody = payload;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };
}

function createHtmlRequest(body, session = { accountId: 1 }) {
  return {
    body,
    get() {
      return 'text/html';
    },
    is() {
      return false;
    },
    session
  };
}

function createJsonRequest(body, session = { accountId: 1 }) {
  return {
    body,
    get() {
      return 'application/json';
    },
    headers: { accept: 'application/json' },
    is(type) {
      return type === 'application/json';
    },
    session
  };
}

function createControllerServices(overrides = {}) {
  return {
    accountCreationService: {
      async createAccount() {
        return {
          accountId: 9,
          accountIdentifier: 'new.user@example.com',
          accountStatus: 'active',
          assignedRole: 'Student',
          mustChangePassword: true,
          notification: { enabled: true, status: 'sent' },
          statusCode: 201
        };
      },
      getFormMetadata() {
        return {
          notificationsEnabled: true,
          passwordPolicy: {
            minLength: 12,
            requiresDigit: true,
            requiresLower: true,
            requiresSpecial: true,
            requiresUpper: true
          },
          roles: [{ id: 2, name: 'Student' }],
          statusCode: 200
        };
      }
    },
    passwordPolicyService: {
      describeFailedRules() {
        return [];
      },
      validate() {
        return { failedRules: [], isValid: true };
      }
    },
    ...overrides
  };
}

function buildTempDb() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc43-extra-'));
  const dbPath = path.join(tempDir, 'sis.db');
  applySchema(dbPath);
  seedLoginFixtures(dbPath);
  return { db: getDb(dbPath), tempDir };
}

test('admin-account controller covers forbidden post branches, html error pages, json error payloads, and thrown errors', async () => {
  const forbiddenController = createAdminAccountController(
    createControllerServices({
      accountCreationService: {
        async createAccount() {
          throw new Error('createAccount should not be reached when metadata is forbidden');
        },
        getFormMetadata() {
          return {
            code: 'FORBIDDEN',
            message: 'Administrative authorization is required for this action.',
            statusCode: 403
          };
        }
      }
    })
  );
  const forbiddenHtmlResponse = createResponse();
  await forbiddenController.postCreateUser(
    createHtmlRequest({ email: 'blocked@example.com', password: 'ValidPass!234', roleId: '2' }, { accountId: 2 }),
    forbiddenHtmlResponse,
    (error) => {
      throw error;
    }
  );
  assert.equal(forbiddenHtmlResponse.statusCode, 403);
  assert.match(forbiddenHtmlResponse.body, /Access denied/);

  const forbiddenJsonResponse = createResponse();
  await forbiddenController.postCreateUser(
    createJsonRequest({ email: 'blocked@example.com', password: 'ValidPass!234', roleId: '2' }, { accountId: 2 }),
    forbiddenJsonResponse,
    (error) => {
      throw error;
    }
  );
  assert.equal(forbiddenJsonResponse.statusCode, 403);
  assert.deepEqual(forbiddenJsonResponse.jsonBody, {
    code: 'FORBIDDEN',
    error: 'Administrative authorization is required for this action.'
  });

  const roleErrorController = createAdminAccountController(
    createControllerServices({
      accountCreationService: {
        async createAccount() {
          return {
            code: 'INVALID_ROLE',
            fieldErrors: { roleId: 'Select an available role.' },
            message: 'Selected role is no longer available. Choose another role.',
            statusCode: 400
          };
        },
        getFormMetadata() {
          return createControllerServices().accountCreationService.getFormMetadata();
        }
      }
    })
  );
  const roleErrorResponse = createResponse();
  await roleErrorController.postCreateUser(
    createHtmlRequest({ email: 'role.user@example.com', password: 'ValidPass!234', roleId: '2' }),
    roleErrorResponse,
    (error) => {
      throw error;
    }
  );
  assert.equal(roleErrorResponse.statusCode, 400);
  assert.match(roleErrorResponse.body, /Selected role is no longer available\. Choose another role\./);

  const duplicateController = createAdminAccountController(
    createControllerServices({
      accountCreationService: {
        async createAccount() {
          return {
            code: 'DUPLICATE_IDENTIFIER',
            field: 'email',
            message: 'An account with that email already exists.',
            statusCode: 409
          };
        },
        getFormMetadata() {
          return createControllerServices().accountCreationService.getFormMetadata();
        }
      }
    })
  );
  const duplicateResponse = createResponse();
  await duplicateController.postCreateUser(
    createHtmlRequest({ email: 'duplicate@example.com', password: 'ValidPass!234', roleId: '2' }),
    duplicateResponse,
    (error) => {
      throw error;
    }
  );
  assert.equal(duplicateResponse.statusCode, 409);
  assert.match(duplicateResponse.body, /An account with that email already exists\./);

  const warningController = createAdminAccountController(
    createControllerServices({
      accountCreationService: {
        async createAccount() {
          return {
            accountId: 9,
            accountIdentifier: 'warning.user@example.com',
            accountStatus: 'active',
            assignedRole: 'Student',
            mustChangePassword: true,
            notification: {
              enabled: true,
              status: 'failed',
              warning: 'The account was created, but notification delivery failed.'
            },
            statusCode: 201
          };
        },
        getFormMetadata() {
          return createControllerServices().accountCreationService.getFormMetadata();
        }
      }
    })
  );
  const warningResponse = createResponse();
  await warningController.postCreateUser(
    createHtmlRequest({ email: 'warning.user@example.com', password: 'ValidPass!234', roleId: '2' }),
    warningResponse,
    (error) => {
      throw error;
    }
  );
  assert.equal(warningResponse.statusCode, 201);
  assert.match(warningResponse.body, /User created successfully, but notification delivery failed\./);
  assert.match(warningResponse.body, /Notification status: failed/);

  const noPasswordChangeController = createAdminAccountController(
    createControllerServices({
      accountCreationService: {
        async createAccount() {
          return {
            accountId: 10,
            accountIdentifier: 'stable.user@example.com',
            accountStatus: 'active',
            assignedRole: 'Student',
            mustChangePassword: false,
            notification: { enabled: true, status: 'sent' },
            statusCode: 201
          };
        },
        getFormMetadata() {
          return createControllerServices().accountCreationService.getFormMetadata();
        }
      }
    })
  );
  const noPasswordChangeResponse = createResponse();
  await noPasswordChangeController.postCreateUser(
    createHtmlRequest({ email: 'stable.user@example.com', password: 'ValidPass!234', roleId: '2' }),
    noPasswordChangeResponse,
    (error) => {
      throw error;
    }
  );
  assert.equal(noPasswordChangeResponse.statusCode, 201);
  assert.match(noPasswordChangeResponse.body, /Must change password on first sign-in: No/);

  const genericJsonErrorController = createAdminAccountController(
    createControllerServices({
      accountCreationService: {
        async createAccount() {
          return {
            code: 'INTERNAL_ERROR',
            message: 'We could not create the account. Please retry later.',
            statusCode: 500
          };
        },
        getFormMetadata() {
          return createControllerServices().accountCreationService.getFormMetadata();
        }
      }
    })
  );
  const genericJsonErrorResponse = createResponse();
  await genericJsonErrorController.postCreateUser(
    createJsonRequest({ email: 'fail.user@example.com', password: 'ValidPass!234', roleId: '2' }),
    genericJsonErrorResponse,
    (error) => {
      throw error;
    }
  );
  assert.equal(genericJsonErrorResponse.statusCode, 500);
  assert.deepEqual(genericJsonErrorResponse.jsonBody, {
    code: 'INTERNAL_ERROR',
    error: 'We could not create the account. Please retry later.'
  });

  const thrownError = new Error('controller boom');
  const throwingController = createAdminAccountController(
    createControllerServices({
      accountCreationService: {
        async createAccount() {
          throw thrownError;
        },
        getFormMetadata() {
          return createControllerServices().accountCreationService.getFormMetadata();
        }
      }
    })
  );
  let capturedError = null;
  await throwingController.postCreateUser(
    createHtmlRequest({ email: 'throw.user@example.com', password: 'ValidPass!234', roleId: '2' }),
    createResponse(),
    (error) => {
      capturedError = error;
    }
  );
  assert.equal(capturedError, thrownError);
});

test('admin-account controller covers accept-header fallback, missing request helpers, and disabled password-policy messaging', async () => {
  const controller = createAdminAccountController(
    createControllerServices({
      accountCreationService: {
        async createAccount() {
          return {
            code: 'INTERNAL_ERROR',
            message: 'We could not create the account. Please retry later.',
            statusCode: 500
          };
        },
        getFormMetadata() {
          return {
            notificationsEnabled: false,
            passwordPolicy: {
              minLength: 12,
              requiresDigit: false,
              requiresLower: false,
              requiresSpecial: false,
              requiresUpper: false
            },
            roles: [{ id: 2, name: 'Student' }],
            statusCode: 200
          };
        }
      }
    })
  );

  const pageResponse = createResponse();
  controller.getCreateUserPage({ session: { accountId: 1 } }, pageResponse);
  assert.equal(pageResponse.statusCode, 200);
  assert.match(pageResponse.body, /Notifications are disabled for this environment\./);
  assert.match(pageResponse.body, /Use at least 12 characters\./);
  assert.doesNotMatch(pageResponse.body, /Include at least one uppercase letter\./);
  assert.doesNotMatch(pageResponse.body, /Include at least one lowercase letter\./);
  assert.doesNotMatch(pageResponse.body, /Include at least one number\./);
  assert.doesNotMatch(pageResponse.body, /Include at least one special character\./);

  const headerOnlyJsonResponse = createResponse();
  await controller.postCreateUser(
    {
      body: { email: 'header.only@example.com', password: 'ValidPass!234', roleId: '2' },
      headers: { accept: 'application/json' },
      session: { accountId: 1 }
    },
    headerOnlyJsonResponse,
    (error) => {
      throw error;
    }
  );
  assert.equal(headerOnlyJsonResponse.statusCode, 500);
  assert.deepEqual(headerOnlyJsonResponse.jsonBody, {
    code: 'INTERNAL_ERROR',
    error: 'We could not create the account. Please retry later.'
  });

  const getOnlyJsonResponse = createResponse();
  await controller.postCreateUser(
    {
      body: { email: 'get.only@example.com', password: 'ValidPass!234', roleId: '2' },
      get() {
        return 'application/json';
      },
      is() {
        return false;
      },
      session: { accountId: 1 }
    },
    getOnlyJsonResponse,
    (error) => {
      throw error;
    }
  );
  assert.equal(getOnlyJsonResponse.statusCode, 500);
  assert.deepEqual(getOnlyJsonResponse.jsonBody, {
    code: 'INTERNAL_ERROR',
    error: 'We could not create the account. Please retry later.'
  });

  const helperlessHtmlResponse = createResponse();
  await controller.postCreateUser(
    {
      body: { email: '', password: '', roleId: '' },
      session: { accountId: 1 }
    },
    helperlessHtmlResponse,
    (error) => {
      throw error;
    }
  );
  assert.equal(helperlessHtmlResponse.statusCode, 400);
  assert.match(helperlessHtmlResponse.body, /Please correct the highlighted fields\./);
});

test('account-creation service covers unauthorized creation, simulate-failure flags, duplicate username errors, and metadata defaults', async () => {
  const forbiddenService = createAccountCreationService({
    accountModel: {
      findById() {
        return { id: 3, role: 'student' };
      },
      findByIdentifier() {
        throw new Error('duplicate lookup should not run for unauthorized requests');
      }
    },
    notificationService: {
      notifyAccountCreated() {
        throw new Error('notification should not run for unauthorized requests');
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
        throw new Error('role lookup should not run for unauthorized requests');
      },
      listAssignableRoles() {
        return [];
      }
    },
    userAccountModel: {
      createAccount() {
        throw new Error('account creation should not run for unauthorized requests');
      }
    }
  });
  const forbiddenResult = await forbiddenService.createAccount({
    actorAccountId: 3,
    email: 'blocked@example.com',
    password: 'ValidPass!234',
    roleId: 2
  });
  assert.equal(forbiddenResult.statusCode, 403);

  let capturedCreateDetails = null;
  let capturedCreateOptions = null;
  const simulateFailureService = createAccountCreationService({
    accountCreationTestState: {
      createFailureIdentifiers: [' scenario.user@example.com '],
      notificationFailureIdentifiers: [],
      notificationsEnabled: true
    },
    accountModel: {
      findById(accountId) {
        if (accountId === 1) {
          return { id: 1, role: 'admin' };
        }

        if (accountId === 9) {
          return {
            email: 'scenario.user@example.com',
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
        return { enabled: true, status: 'sent' };
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z'),
    passwordPolicyService: {
      getPolicy() {
        return { minLength: 12 };
      }
    },
    roleModel: {
      findAssignableRoleById() {
        return { display_name: 'Student', id: 2, role_key: 'student' };
      },
      listAssignableRoles() {
        return [{ display_name: 'Student', id: 2 }];
      }
    },
    userAccountModel: {
      createAccount(details, options) {
        capturedCreateDetails = details;
        capturedCreateOptions = options;
        return { accountId: 9 };
      }
    }
  });
  const simulatedSuccess = await simulateFailureService.createAccount({
    actorAccountId: 1,
    email: ' Scenario.User@example.com ',
    password: 'ValidPass!234',
    roleId: 2
  });
  assert.equal(simulatedSuccess.statusCode, 201);
  assert.equal(capturedCreateDetails.email, 'scenario.user@example.com');
  assert.equal(capturedCreateDetails.username, 'scenario.user@example.com');
  assert.equal(capturedCreateOptions.simulateFailure, true);

  const metadataService = createAccountCreationService({
    accountModel: {
      findById(accountId) {
        return accountId === 1 ? { id: 1, role: 'admin' } : null;
      }
    },
    notificationService: {
      notifyAccountCreated() {
        return { enabled: true, status: 'sent' };
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z'),
    passwordPolicyService: {
      getPolicy() {
        return { minLength: 12, requiresDigit: true };
      }
    },
    roleModel: {
      findAssignableRoleById() {
        return null;
      },
      listAssignableRoles() {
        return [{ display_name: 'Professor', id: 3 }];
      }
    },
    userAccountModel: {
      createAccount() {
        return { accountId: 9 };
      }
    }
  });
  const metadata = metadataService.getFormMetadata(1);
  assert.equal(metadata.statusCode, 200);
  assert.equal(metadata.notificationsEnabled, true);
  assert.deepEqual(metadata.roles, [{ id: 3, name: 'Professor' }]);

  const duplicateUsernameService = createAccountCreationService({
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
        throw new Error('notification should not run when duplicate username creation fails');
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
        throw new Error('UNIQUE constraint failed: accounts.username');
      }
    }
  });
  const duplicateUsernameResult = await duplicateUsernameService.createAccount({
    actorAccountId: 1,
    email: 'duplicate@example.com',
    password: 'ValidPass!234',
    roleId: 2
  });
  assert.equal(duplicateUsernameResult.statusCode, 409);
});

test('account-creation service covers missing actors and default create-state handling', async () => {
  const missingActorService = createAccountCreationService({
    accountModel: {
      findById() {
        return null;
      },
      findByIdentifier() {
        throw new Error('duplicate lookup should not run without an actor');
      }
    },
    notificationService: {
      notifyAccountCreated() {
        throw new Error('notification should not run without an actor');
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
        throw new Error('role lookup should not run without an actor');
      },
      listAssignableRoles() {
        return [];
      }
    },
    userAccountModel: {
      createAccount() {
        throw new Error('account creation should not run without an actor');
      }
    }
  });
  const missingActorResult = await missingActorService.createAccount({
    actorAccountId: 999,
    email: 'missing.actor@example.com',
    password: 'ValidPass!234',
    roleId: 2
  });
  assert.equal(missingActorResult.statusCode, 403);

  let capturedOptions = null;
  const defaultStateService = createAccountCreationService({
    accountModel: {
      findById(accountId) {
        if (accountId === 1) {
          return { id: 1, role: 'admin' };
        }

        if (accountId === 11) {
          return {
            email: 'default.state@example.com',
            id: 11,
            must_change_password: 0,
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
        return { enabled: true, status: 'sent' };
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
      createAccount(details, options) {
        capturedOptions = options;
        return { accountId: 11 };
      }
    }
  });
  const defaultStateResult = await defaultStateService.createAccount({
    actorAccountId: 1,
    email: 'default.state@example.com',
    password: 'ValidPass!234',
    roleId: 2
  });
  assert.equal(defaultStateResult.statusCode, 201);
  assert.equal(defaultStateResult.mustChangePassword, false);
  assert.equal(capturedOptions.simulateFailure, false);

  const unrelatedConstraintService = createAccountCreationService({
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
        throw new Error('notification should not run after an internal create failure');
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
        throw new Error('UNIQUE constraint failed: role_assignments.account_id, role_assignments.role_id');
      }
    }
  });
  const unrelatedConstraintResult = await unrelatedConstraintService.createAccount({
    actorAccountId: 1,
    email: 'unrelated.constraint@example.com',
    password: 'ValidPass!234',
    roleId: 2
  });
  assert.equal(unrelatedConstraintResult.statusCode, 500);

  let blankLookupIdentifier = null;
  const blankIdentifierService = createAccountCreationService({
    accountModel: {
      findById(accountId) {
        return accountId === 1 ? { id: 1, role: 'admin' } : null;
      },
      findByIdentifier(identifier) {
        blankLookupIdentifier = identifier;
        return { id: 71 };
      }
    },
    notificationService: {
      notifyAccountCreated() {
        throw new Error('notification should not run for duplicate identifiers');
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
        throw new Error('role lookup should not run for duplicate identifiers');
      },
      listAssignableRoles() {
        return [];
      }
    },
    userAccountModel: {
      createAccount() {
        throw new Error('account creation should not run for duplicate identifiers');
      }
    }
  });
  const blankIdentifierResult = await blankIdentifierService.createAccount({
    actorAccountId: 1,
    password: 'ValidPass!234',
    roleId: 2
  });
  assert.equal(blankIdentifierResult.statusCode, 409);
  assert.equal(blankLookupIdentifier, '');

  const emptyErrorService = createAccountCreationService({
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
        throw new Error('notification should not run after an empty error object');
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
        throw {};
      }
    }
  });
  const emptyErrorResult = await emptyErrorService.createAccount({
    actorAccountId: 1,
    email: 'empty.error@example.com',
    password: 'ValidPass!234',
    roleId: 2
  });
  assert.equal(emptyErrorResult.statusCode, 500);
});

test('notification service defaults to enabled delivery and tolerates a missing audit model', () => {
  const service = createNotificationService({
    notificationModel: {
      queueNotification() {}
    },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });

  assert.deepEqual(service.notifyAccountCreated({ email: 'default@example.com', id: 1 }), {
    enabled: true,
    status: 'sent'
  });
});

test('password policy getPolicy returns a copy of the configured policy', () => {
  const service = createPasswordPolicyService();
  const firstPolicy = service.getPolicy();
  assert.deepEqual(firstPolicy, {
    minLength: 12,
    requiresDigit: true,
    requiresLower: true,
    requiresSpecial: true,
    requiresUpper: true
  });

  firstPolicy.minLength = 1;
  const secondPolicy = service.getPolicy();
  assert.equal(secondPolicy.minLength, 12);
});

test('user-account model defaults the username to the email when none is supplied', () => {
  const { db, tempDir } = buildTempDb();

  try {
    const model = createUserAccountModel(db);
    const studentRoleId = db.prepare('SELECT id FROM roles WHERE role_key = ?').get('student').id;

    const created = model.createAccount({
      createdAt: '2026-03-07T12:30:00.000Z',
      email: 'fallback.username@example.com',
      passwordHash: 'hash-3',
      roleId: studentRoleId,
      roleKey: 'student'
    });
    const stored = db
      .prepare('SELECT email, username FROM accounts WHERE id = ?')
      .get(created.accountId);

    assert.deepEqual(stored, {
      email: 'fallback.username@example.com',
      username: 'fallback.username@example.com'
    });
  } finally {
    closeAll();
    fs.rmSync(tempDir, { force: true, recursive: true });
  }
});
