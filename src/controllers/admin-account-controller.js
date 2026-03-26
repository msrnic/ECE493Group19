const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');
const { validateCreateUserInput } = require('./validators/admin-account-validator');

function wantsJson(req) {
  const matchesContentType = typeof req.is === 'function' ? req.is('application/json') : false;
  const acceptHeader = typeof req.get === 'function' ? req.get('accept') : req.headers?.accept;
  return matchesContentType || String(acceptHeader || '').includes('application/json');
}

function createFieldErrorHtml(errorMessage) {
  if (!errorMessage) {
    return '';
  }

  return `<p class='field-error'>${escapeHtml(errorMessage)}</p>`;
}

function createInputClass(errorMessage) {
  return errorMessage ? 'input-error' : '';
}

function renderListItems(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function buildPasswordPolicyItems(policy) {
  return [
    `Use at least ${policy.minLength} characters.`,
    policy.requiresUpper ? 'Include at least one uppercase letter.' : '',
    policy.requiresLower ? 'Include at least one lowercase letter.' : '',
    policy.requiresDigit ? 'Include at least one number.' : '',
    policy.requiresSpecial ? 'Include at least one special character.' : ''
  ].filter(Boolean);
}

function renderRoleOptions(roles, selectedRoleId) {
  const options = [
    `<option value=''>Select a role</option>`
  ];

  for (const role of roles) {
    options.push(
      `<option value='${escapeHtml(role.id)}'${String(selectedRoleId) === String(role.id) ? ' selected' : ''}>${escapeHtml(role.name)}</option>`
    );
  }

  return options.join('');
}

function createAdminAccountController(services) {
  function renderResultPage(res, result, extra = {}) {
    const html = renderHtml(path.resolve(__dirname, '../views/change-password-result.html'), {
      continue_href: extra.continueHref ?? '/dashboard#admin-operations',
      continue_label: extra.continueLabel ?? 'Return to dashboard',
      detail_items_html: renderListItems(extra.detailItems ?? []),
      outcome_heading: extra.heading,
      outcome_message: result.message,
      status_chip: String(result.statusCode)
    });

    return res.status(result.statusCode).send(html);
  }

  function renderCreateUserPage(res, metadata, overrides = {}) {
    const html = renderHtml(path.resolve(__dirname, '../views/create-user-account.html'), {
      email_error_html: createFieldErrorHtml(overrides.fieldErrors?.email),
      email_input_class: createInputClass(overrides.fieldErrors?.email),
      email_value: overrides.values?.email || '',
      error_message: overrides.errorMessage || '',
      notifications_text: metadata.notificationsEnabled
        ? 'Notifications are enabled for new accounts.'
        : 'Notifications are disabled for this environment.',
      password_error_html: createFieldErrorHtml(overrides.fieldErrors?.password),
      password_feedback_html: renderListItems(overrides.passwordGuidance || []),
      password_input_class: createInputClass(overrides.fieldErrors?.password),
      password_policy_items_html: renderListItems(buildPasswordPolicyItems(metadata.passwordPolicy)),
      return_path: '/dashboard#admin-operations',
      role_error_html: createFieldErrorHtml(overrides.fieldErrors?.roleId),
      role_input_class: createInputClass(overrides.fieldErrors?.roleId),
      role_options_html: renderRoleOptions(metadata.roles, overrides.values?.roleId)
    });

    return res.status(overrides.statusCode || 200).send(html);
  }

  function sendJsonError(res, result) {
    return res.status(result.statusCode).json({
      code: result.code,
      error: result.message
    });
  }

  function loadMetadata(actorAccountId) {
    return services.accountCreationService.getFormMetadata(actorAccountId);
  }

  return {
    getCreateUserPage(req, res) {
      const metadata = loadMetadata(req.session.accountId);
      if (metadata.statusCode !== 200) {
        return renderResultPage(res, metadata, { heading: 'Access denied' });
      }

      return renderCreateUserPage(res, metadata);
    },

    getFormMetadata(req, res) {
      const metadata = loadMetadata(req.session.accountId);
      if (metadata.statusCode !== 200) {
        return sendJsonError(res, metadata);
      }

      return res.status(200).json({
        notificationsEnabled: metadata.notificationsEnabled,
        passwordPolicy: metadata.passwordPolicy,
        roles: metadata.roles
      });
    },

    async postCreateUser(req, res, next) {
      try {
        const metadata = loadMetadata(req.session.accountId);
        if (metadata.statusCode !== 200) {
          return wantsJson(req)
            ? sendJsonError(res, metadata)
            : renderResultPage(res, metadata, { heading: 'Access denied' });
        }

        const validation = validateCreateUserInput(req.body, services.passwordPolicyService);
        if (!validation.isValid) {
          if (wantsJson(req)) {
            return res.status(400).json({
              error: 'Validation failed',
              errors: validation.errors,
              preservedValues: validation.preservedValues
            });
          }

          return renderCreateUserPage(res, metadata, {
            errorMessage: 'Please correct the highlighted fields.',
            fieldErrors: validation.fieldErrors,
            passwordGuidance: validation.passwordGuidance,
            statusCode: 400,
            values: validation.preservedValues
          });
        }

        const result = await services.accountCreationService.createAccount({
          actorAccountId: req.session.accountId,
          email: validation.values.email,
          password: validation.values.password,
          roleId: validation.values.roleId
        });

        if (result.statusCode === 201) {
          if (wantsJson(req)) {
            return res.status(201).json({
              accountId: result.accountId,
              accountIdentifier: result.accountIdentifier,
              assignedRole: result.assignedRole,
              accountStatus: result.accountStatus,
              mustChangePassword: result.mustChangePassword,
              notification: result.notification
            });
          }

          return renderResultPage(
            res,
            {
              message:
                result.notification.status === 'failed'
                  ? 'User created successfully, but notification delivery failed.'
                  : 'User created successfully.',
              statusCode: 201
            },
            {
              continueHref: '/admin/users/new',
              continueLabel: 'Create another user',
              detailItems: [
                `Account identifier: ${result.accountIdentifier}`,
                `Assigned role: ${result.assignedRole}`,
                `Account status: ${result.accountStatus}`,
                `Must change password on first sign-in: ${result.mustChangePassword ? 'Yes' : 'No'}`,
                `Notification status: ${result.notification.status}`
              ],
              heading: 'User created'
            }
          );
        }

        if (result.statusCode === 400) {
          if (wantsJson(req)) {
            return res.status(400).json({
              error: 'Validation failed',
              errors: [
                {
                  code: result.code,
                  field: 'roleId',
                  message: result.message
                }
              ],
              preservedValues: validation.preservedValues
            });
          }

          return renderCreateUserPage(res, metadata, {
            errorMessage: result.message,
            fieldErrors: result.fieldErrors,
            statusCode: 400,
            values: validation.preservedValues
          });
        }

        if (result.statusCode === 409) {
          if (wantsJson(req)) {
            return res.status(409).json({
              code: result.code,
              error: result.message,
              field: result.field
            });
          }

          return renderCreateUserPage(res, metadata, {
            errorMessage: result.message,
            fieldErrors: { email: result.message },
            statusCode: 409,
            values: validation.preservedValues
          });
        }

        if (wantsJson(req)) {
          return sendJsonError(res, result);
        }

        return renderCreateUserPage(res, metadata, {
          errorMessage: result.message,
          statusCode: result.statusCode,
          values: validation.preservedValues
        });
      } catch (error) {
        return next(error);
      }
    }
  };
}

module.exports = { createAdminAccountController };
