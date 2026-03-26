const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createValidationError(field, message, code) {
  return { code, field, message };
}

function validateCreateUserInput(input, passwordPolicyService) {
  const email = String(input.email || '').trim();
  const password = String(input.password || '');
  const rawRoleId = String(input.roleId || '').trim();
  const parsedRoleId = Number(rawRoleId);
  const roleId = Number.isInteger(parsedRoleId) && parsedRoleId > 0 ? parsedRoleId : null;
  const errors = [];
  const fieldErrors = {};
  let passwordGuidance = [];

  if (!email) {
    fieldErrors.email = 'Email is required.';
    errors.push(createValidationError('email', fieldErrors.email, 'REQUIRED'));
  } else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = 'Enter a valid email address.';
    errors.push(createValidationError('email', fieldErrors.email, 'INVALID_EMAIL'));
  }

  if (!roleId) {
    fieldErrors.roleId = 'Select an available role.';
    errors.push(createValidationError('roleId', fieldErrors.roleId, 'INVALID_ROLE'));
  }

  if (!password) {
    fieldErrors.password = 'Password is required.';
    errors.push(createValidationError('password', fieldErrors.password, 'REQUIRED'));
  } else {
    const policyResult = passwordPolicyService.validate(password);
    passwordGuidance = passwordPolicyService.describeFailedRules(policyResult.failedRules);

    if (!policyResult.isValid) {
      fieldErrors.password = 'Password does not meet the policy requirements.';
      errors.push(createValidationError('password', fieldErrors.password, 'PASSWORD_POLICY'));
    }
  }

  return {
    errors,
    fieldErrors,
    isValid: errors.length === 0,
    passwordGuidance,
    preservedValues: {
      email,
      roleId: roleId || ''
    },
    values: {
      email,
      password,
      roleId
    }
  };
}

module.exports = { validateCreateUserInput };
