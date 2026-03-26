const test = require('node:test');
const assert = require('node:assert/strict');

const { validateCreateUserInput } = require('../../src/controllers/validators/admin-account-validator');
const { createPasswordPolicyService } = require('../../src/services/password-policy-service');

test('admin-account validator accepts valid input and reports missing and invalid values', () => {
  const passwordPolicyService = createPasswordPolicyService();

  const valid = validateCreateUserInput(
    {
      email: ' New.User@example.com ',
      password: 'ValidPass!234',
      roleId: '2'
    },
    passwordPolicyService
  );
  assert.equal(valid.isValid, true);
  assert.deepEqual(valid.errors, []);
  assert.deepEqual(valid.passwordGuidance, []);
  assert.equal(valid.values.email, 'New.User@example.com');
  assert.equal(valid.values.roleId, 2);

  const missing = validateCreateUserInput(
    {
      email: ' ',
      password: '',
      roleId: '0'
    },
    passwordPolicyService
  );
  assert.equal(missing.isValid, false);
  assert.deepEqual(missing.errors.map((error) => error.code), ['REQUIRED', 'INVALID_ROLE', 'REQUIRED']);
  assert.equal(missing.fieldErrors.email, 'Email is required.');
  assert.equal(missing.fieldErrors.roleId, 'Select an available role.');
  assert.equal(missing.fieldErrors.password, 'Password is required.');

  const invalid = validateCreateUserInput(
    {
      email: 'not-an-email',
      password: 'short',
      roleId: '3'
    },
    passwordPolicyService
  );
  assert.equal(invalid.isValid, false);
  assert.deepEqual(invalid.errors.map((error) => error.code), ['INVALID_EMAIL', 'PASSWORD_POLICY']);
  assert.equal(invalid.fieldErrors.email, 'Enter a valid email address.');
  assert.equal(invalid.fieldErrors.password, 'Password does not meet the policy requirements.');
  assert.equal(invalid.passwordGuidance.includes('Use at least 12 characters.'), true);
});
