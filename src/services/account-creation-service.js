const bcrypt = require('bcrypt');

function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function isDuplicateIdentifierError(error) {
  const message = String(error?.message || '');
  return (
    message.includes('UNIQUE constraint failed') &&
    (message.includes('accounts.email') || message.includes('accounts.username'))
  );
}

function createAccountCreationService(options) {
  function isAdmin(account) {
    return Boolean(account && account.role === 'admin');
  }

  function shouldSimulateFailure(identifier) {
    const identifiers = new Set(
      (options.accountCreationTestState?.createFailureIdentifiers || []).map(normalizeIdentifier)
    );

    return identifiers.has(normalizeIdentifier(identifier));
  }

  function buildForbiddenResult() {
    return {
      code: 'FORBIDDEN',
      message: 'Administrative authorization is required for this action.',
      status: 'error',
      statusCode: 403
    };
  }

  function buildDuplicateResult() {
    return {
      code: 'DUPLICATE_IDENTIFIER',
      field: 'email',
      message: 'An account with that email already exists.',
      status: 'error',
      statusCode: 409
    };
  }

  function buildRoleValidationResult() {
    return {
      code: 'INVALID_ROLE',
      fieldErrors: {
        roleId: 'Select an available role.'
      },
      message: 'Selected role is no longer available. Choose another role.',
      status: 'error',
      statusCode: 400
    };
  }

  return {
    async createAccount(details) {
      const actor = options.accountModel.findById(details.actorAccountId);
      if (!isAdmin(actor)) {
        return buildForbiddenResult();
      }

      const normalizedEmail = normalizeIdentifier(details.email);
      if (options.accountModel.findByIdentifier(normalizedEmail)) {
        return buildDuplicateResult();
      }

      const role = options.roleModel.findAssignableRoleById(details.roleId);
      if (!role) {
        return buildRoleValidationResult();
      }

      const passwordHash = await bcrypt.hash(details.password, 12);

      try {
        const created = options.userAccountModel.createAccount(
          {
            createdAt: options.now().toISOString(),
            email: normalizedEmail,
            passwordHash,
            roleId: role.id,
            roleKey: role.role_key,
            username: normalizedEmail
          },
          {
            simulateFailure: shouldSimulateFailure(normalizedEmail)
          }
        );
        const account = options.accountModel.findById(created.accountId);
        const notification = options.notificationService.notifyAccountCreated(account);

        return {
          accountId: account.id,
          accountIdentifier: account.email,
          accountStatus: account.status,
          assignedRole: role.display_name,
          mustChangePassword: Boolean(account.must_change_password),
          notification,
          status: 'success',
          statusCode: 201
        };
      } catch (error) {
        if (isDuplicateIdentifierError(error)) {
          return buildDuplicateResult();
        }

        console.error('Account creation failed', {
          actorAccountId: details.actorAccountId,
          email: normalizedEmail,
          error: error.message
        });

        return {
          code: 'INTERNAL_ERROR',
          message: 'We could not create the account. Please retry later.',
          status: 'error',
          statusCode: 500
        };
      }
    },

    getFormMetadata(actorAccountId) {
      const actor = options.accountModel.findById(actorAccountId);
      if (!isAdmin(actor)) {
        return buildForbiddenResult();
      }

      return {
        notificationsEnabled: options.accountCreationTestState?.notificationsEnabled !== false,
        passwordPolicy: options.passwordPolicyService.getPolicy(),
        roles: options.roleModel.listAssignableRoles().map((role) => ({
          id: role.id,
          name: role.display_name
        })),
        status: 'success',
        statusCode: 200
      };
    }
  };
}

module.exports = { createAccountCreationService };
