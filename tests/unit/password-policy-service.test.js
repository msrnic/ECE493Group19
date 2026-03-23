const test = require('node:test');
const assert = require('node:assert/strict');

const { createPasswordPolicyService } = require('../../src/services/password-policy-service');

test('password policy validates compliant passwords and describes failures', () => {
  const service = createPasswordPolicyService();

  const valid = service.validate('NewSecure!234', { currentPassword: 'CorrectPass!234' });
  assert.equal(valid.isValid, true);
  assert.deepEqual(valid.failedRules, []);
  assert.equal(valid.message, 'Password policy satisfied.');
  assert.deepEqual(service.describeFailedRules([]), []);

  const invalid = service.validate(' SHORT1 ', { currentPassword: ' SHORT1 ' });
  assert.equal(invalid.isValid, false);
  assert.deepEqual(invalid.failedRules, [
    'trimmed',
    'min_length',
    'lowercase',
    'different_from_current'
  ]);
  assert.deepEqual(service.describeFailedRules(['trimmed', 'lowercase', 'unknown_rule']), [
    'Remove leading or trailing spaces.',
    'Include at least one lowercase letter.',
    'Resolve the listed password issue.'
  ]);
});
