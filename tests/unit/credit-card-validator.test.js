const test = require('node:test');
const assert = require('node:assert/strict');

const { validateCreditCardSubmission } = require('../../src/controllers/validators/credit-card-validator');

test('credit card validator accepts valid card details', () => {
  const result = validateCreditCardSubmission({
    cardHolderName: 'Taylor Example',
    cardNumber: '4111 1111 1111 4242',
    expiryMonth: '12',
    expiryYear: '2028'
  });

  assert.equal(result.isValid, true);
  assert.equal(result.values.cardNumber, '4111111111114242');
});

test('credit card validator rejects missing, malformed, and expired cards', () => {
  const result = validateCreditCardSubmission({
    cardHolderName: '',
    cardNumber: '12',
    expiryMonth: '13',
    expiryYear: '2000'
  });

  assert.equal(result.isValid, false);
  assert.equal(Boolean(result.fieldErrors.cardHolderName), true);
  assert.equal(Boolean(result.fieldErrors.cardNumber), true);
  assert.equal(Boolean(result.fieldErrors.expiryMonth) || Boolean(result.fieldErrors.expiryYear), true);
});
