const test = require('node:test');
const assert = require('node:assert/strict');

const {
  CARD_HOLDER_NAME_LIMIT,
  validateCreditCardSubmission
} = require('../../src/controllers/validators/credit-card-validator');

test('credit card validator rejects long holder names and malformed expiry fields', () => {
  const result = validateCreditCardSubmission({
    cardHolderName: 'A'.repeat(CARD_HOLDER_NAME_LIMIT + 1),
    cardNumber: '4111111111114242',
    expiryMonth: 'Jan',
    expiryYear: '28'
  });

  assert.equal(result.isValid, false);
  assert.equal(
    result.fieldErrors.cardHolderName,
    `Card holder name must be ${CARD_HOLDER_NAME_LIMIT} characters or fewer.`
  );
  assert.equal(result.fieldErrors.expiryMonth, 'Enter a valid expiry month.');
  assert.equal(result.fieldErrors.expiryYear, 'Enter a valid 4-digit expiry year.');
});

test('credit card validator rejects expired cards when month and year are otherwise valid', () => {
  const currentDate = new Date();
  const expiredMonth = String(Math.max(1, currentDate.getUTCMonth()));
  const expiredYear = String(currentDate.getUTCFullYear());
  const result = validateCreditCardSubmission({
    cardHolderName: 'Taylor Example',
    cardNumber: '4111111111114242',
    expiryMonth: expiredMonth,
    expiryYear: expiredYear
  });

  assert.equal(result.isValid, false);
  assert.equal(result.fieldErrors.expiryYear, 'This credit card is expired. Use a current card.');
});

test('credit card validator rejects month zero and cards expired in prior years', () => {
  const invalidMonth = validateCreditCardSubmission({
    cardHolderName: 'Taylor Example',
    cardNumber: '4111111111114242',
    expiryMonth: '0',
    expiryYear: String(new Date().getUTCFullYear() + 1)
  });
  assert.equal(invalidMonth.fieldErrors.expiryMonth, 'Expiry month must be between 1 and 12.');

  const expiredYear = validateCreditCardSubmission({
    cardHolderName: 'Taylor Example',
    cardNumber: '4111111111114242',
    expiryMonth: '12',
    expiryYear: String(new Date().getUTCFullYear() - 1)
  });
  assert.equal(expiredYear.fieldErrors.expiryYear, 'This credit card is expired. Use a current card.');
});

test('credit card validator accepts cards in the current year when the expiry month is still ahead', () => {
  const currentDate = new Date();
  const futureMonth = String(Math.min(12, currentDate.getUTCMonth() + 2));
  const result = validateCreditCardSubmission({
    cardHolderName: 'Taylor Example',
    cardNumber: '4111111111114242',
    expiryMonth: futureMonth,
    expiryYear: String(currentDate.getUTCFullYear())
  });

  assert.equal(result.isValid, true);
});

test('credit card validator handles omitted input objects', () => {
  const result = validateCreditCardSubmission();

  assert.equal(result.isValid, false);
  assert.equal(result.fieldErrors.cardHolderName, 'Enter the name shown on the credit card.');
});
