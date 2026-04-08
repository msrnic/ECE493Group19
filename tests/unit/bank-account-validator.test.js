const test = require('node:test');
const assert = require('node:assert/strict');

const {
  BANK_ACCOUNT_NAME_LIMIT,
  validateBankAccountSubmission
} = require('../../src/controllers/validators/bank-account-validator');

test('bank account validator accepts valid banking details and normalizes digits', () => {
  const result = validateBankAccountSubmission({
    accountIdentifier: '1234-5678-90',
    bankHolderName: 'Taylor Example',
    routingIdentifier: '0210-0002-1'
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.fieldErrors, {});
  assert.deepEqual(result.values, {
    accountIdentifier: '1234567890',
    bankHolderName: 'Taylor Example',
    routingIdentifier: '021000021'
  });
});

test('bank account validator reports required and format errors', () => {
  const result = validateBankAccountSubmission({
    accountIdentifier: '12',
    bankHolderName: 'A'.repeat(BANK_ACCOUNT_NAME_LIMIT + 1),
    routingIdentifier: '12345'
  });

  assert.equal(result.isValid, false);
  assert.equal(
    result.fieldErrors.bankHolderName,
    `Account holder name must be ${BANK_ACCOUNT_NAME_LIMIT} characters or fewer.`
  );
  assert.equal(
    result.fieldErrors.routingIdentifier,
    'Routing number must contain exactly 9 digits.'
  );
  assert.equal(
    result.fieldErrors.accountIdentifier,
    'Account number must contain between 6 and 17 digits.'
  );
});

test('bank account validator reports missing values separately', () => {
  const result = validateBankAccountSubmission({});

  assert.equal(result.isValid, false);
  assert.deepEqual(result.fieldErrors, {
    accountIdentifier: 'Enter the bank account number.',
    bankHolderName: 'Enter the account holder name.',
    routingIdentifier: 'Enter the 9-digit routing number.'
  });
});
