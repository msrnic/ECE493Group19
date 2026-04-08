const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createCardTokenFingerprint,
  createPaymentMethodModel
} = require('../../src/models/payment-method-model');
const { createTestContext } = require('../helpers/test-context');

test('payment method model returns an empty list for accounts without saved methods', () => {
  const context = createTestContext();
  const model = createPaymentMethodModel(context.db);

  assert.deepEqual(model.listByAccountId(999), []);

  context.cleanup();
});

test('payment method token fingerprints normalize blank references', () => {
  assert.equal(createCardTokenFingerprint(undefined), createCardTokenFingerprint(''));
});
