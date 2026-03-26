const test = require('node:test');
const assert = require('node:assert/strict');

const { createAdminAccountController } = require('../../src/controllers/admin-account-controller');

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

function createServices(overrides = {}) {
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
      describeFailedRules(failedRules) {
        return failedRules.map((rule) => `Rule: ${rule}`);
      },
      validate(password) {
        return {
          failedRules: password === 'short' ? ['min_length'] : [],
          isValid: password !== 'short'
        };
      }
    },
    ...overrides
  };
}

test('admin-account controller covers page rendering, metadata JSON, validation, success, duplicate, and failure branches', async () => {
  const controller = createAdminAccountController(createServices());

  const pageRes = createResponse();
  controller.getCreateUserPage({ session: { accountId: 1 } }, pageRes);
  assert.equal(pageRes.statusCode, 200);
  assert.match(pageRes.body, /Create New User/);
  assert.match(pageRes.body, /Notifications are enabled for new accounts/);

  const metadataRes = createResponse();
  controller.getFormMetadata({ session: { accountId: 1 } }, metadataRes);
  assert.equal(metadataRes.statusCode, 200);
  assert.deepEqual(metadataRes.jsonBody.roles, [{ id: 2, name: 'Student' }]);

  const validationHtmlRes = createResponse();
  await controller.postCreateUser(
    {
      body: { email: 'bad-email', password: 'short', roleId: '2' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1 }
    },
    validationHtmlRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(validationHtmlRes.statusCode, 400);
  assert.match(validationHtmlRes.body, /Please correct the highlighted fields/);
  assert.match(validationHtmlRes.body, /Enter a valid email address/);
  assert.match(validationHtmlRes.body, /Password does not meet the policy requirements/);

  const validationJsonRes = createResponse();
  await controller.postCreateUser(
    {
      body: { email: '', password: '', roleId: '' },
      get() {
        return 'application/json';
      },
      headers: { accept: 'application/json' },
      is(type) {
        return type === 'application/json';
      },
      session: { accountId: 1 }
    },
    validationJsonRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(validationJsonRes.statusCode, 400);
  assert.equal(validationJsonRes.jsonBody.errors.length, 3);
  assert.equal(validationJsonRes.jsonBody.preservedValues.email, '');

  const successJsonRes = createResponse();
  await controller.postCreateUser(
    {
      body: { email: 'new.user@example.com', password: 'ValidPass!234', roleId: '2' },
      get() {
        return 'application/json';
      },
      headers: { accept: 'application/json' },
      is(type) {
        return type === 'application/json';
      },
      session: { accountId: 1 }
    },
    successJsonRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(successJsonRes.statusCode, 201);
  assert.equal(successJsonRes.jsonBody.accountIdentifier, 'new.user@example.com');

  const successHtmlRes = createResponse();
  await controller.postCreateUser(
    {
      body: { email: 'new.user@example.com', password: 'ValidPass!234', roleId: '2' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1 }
    },
    successHtmlRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(successHtmlRes.statusCode, 201);
  assert.match(successHtmlRes.body, /User created successfully/);
  assert.match(successHtmlRes.body, /Account identifier: new.user@example.com/);

  const duplicateController = createAdminAccountController(
    createServices({
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
      }
    })
  );
  const duplicateJsonRes = createResponse();
  await duplicateController.postCreateUser(
    {
      body: { email: 'userA@example.com', password: 'ValidPass!234', roleId: '2' },
      get() {
        return 'application/json';
      },
      headers: { accept: 'application/json' },
      is(type) {
        return type === 'application/json';
      },
      session: { accountId: 1 }
    },
    duplicateJsonRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(duplicateJsonRes.statusCode, 409);
  assert.equal(duplicateJsonRes.jsonBody.code, 'DUPLICATE_IDENTIFIER');

  const roleValidationController = createAdminAccountController(
    createServices({
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
      }
    })
  );
  const roleValidationJsonRes = createResponse();
  await roleValidationController.postCreateUser(
    {
      body: { email: 'new.user@example.com', password: 'ValidPass!234', roleId: '2' },
      get() {
        return 'application/json';
      },
      headers: { accept: 'application/json' },
      is(type) {
        return type === 'application/json';
      },
      session: { accountId: 1 }
    },
    roleValidationJsonRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(roleValidationJsonRes.statusCode, 400);
  assert.equal(roleValidationJsonRes.jsonBody.errors[0].code, 'INVALID_ROLE');

  const failureController = createAdminAccountController(
    createServices({
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
              requiresDigit: true,
              requiresLower: true,
              requiresSpecial: true,
              requiresUpper: true
            },
            roles: [{ id: 2, name: 'Student' }],
            statusCode: 200
          };
        }
      }
    })
  );
  const failureHtmlRes = createResponse();
  await failureController.postCreateUser(
    {
      body: { email: 'fail.user@example.com', password: 'ValidPass!234', roleId: '2' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1 }
    },
    failureHtmlRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(failureHtmlRes.statusCode, 500);
  assert.match(failureHtmlRes.body, /We could not create the account. Please retry later/);

  const forbiddenController = createAdminAccountController(
    createServices({
      accountCreationService: {
        async createAccount() {
          throw new Error('createAccount should not be called when metadata is forbidden');
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
  const forbiddenPageRes = createResponse();
  forbiddenController.getCreateUserPage({ session: { accountId: 2 } }, forbiddenPageRes);
  assert.equal(forbiddenPageRes.statusCode, 403);
  assert.match(forbiddenPageRes.body, /Access denied/);

  const forbiddenJsonRes = createResponse();
  forbiddenController.getFormMetadata({ session: { accountId: 2 } }, forbiddenJsonRes);
  assert.equal(forbiddenJsonRes.statusCode, 403);
  assert.equal(forbiddenJsonRes.jsonBody.code, 'FORBIDDEN');
});
