const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createPaymentTokenizationService,
  inferCardBrand
} = require('../../src/services/payment-tokenization-service');

test('payment tokenization service tokenizes valid cards and infers brand', () => {
  const service = createPaymentTokenizationService();
  const result = service.tokenize({
    cardNumber: '4111111111114242',
    expiryMonth: '12',
    expiryYear: '2028'
  });

  assert.equal(result.status, 'tokenized');
  assert.equal(result.cardBrand, 'Visa');
  assert.equal(result.cardLast4, '4242');
  assert.equal(result.tokenReference.startsWith('tok_'), true);
});

test('payment tokenization service handles rejection and unavailability branches', () => {
  const service = createPaymentTokenizationService();

  assert.equal(
    service.tokenize({
      cardNumber: '4111111111110002',
      expiryMonth: '12',
      expiryYear: '2028'
    }).status,
    'rejected'
  );
  assert.equal(
    service.tokenize({
      cardNumber: '5111111111110009',
      expiryMonth: '12',
      expiryYear: '2028'
    }).status,
    'unavailable'
  );
  assert.equal(inferCardBrand('5111111111111111'), 'Mastercard');
  assert.equal(inferCardBrand('9111111111111111'), 'Credit card');
});
