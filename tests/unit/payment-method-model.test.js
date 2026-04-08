const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createAccountFingerprint,
  createCardTokenFingerprint,
  createPaymentMethodModel,
  maskAccountIdentifier,
  normalizeDigits
} = require('../../src/models/payment-method-model');
const { createTestContext } = require('../helpers/test-context');

test('payment method model stores bank accounts and lists them newest first', () => {
  const context = createTestContext();
  const model = createPaymentMethodModel(context.db);

  const first = model.createBankAccountPaymentMethod(
    1,
    {
      accountIdentifier: '123456789',
      bankHolderName: 'First Holder',
      routingIdentifier: '021000021'
    },
    { now: () => '2026-03-07T12:00:00.000Z' }
  );
  const second = model.createBankAccountPaymentMethod(
    1,
    {
      accountIdentifier: '987654321',
      bankHolderName: 'Second Holder',
      routingIdentifier: '021000022'
    },
    { now: () => '2026-03-07T12:05:00.000Z' }
  );

  assert.equal(first.status, 'created');
  assert.equal(second.status, 'created');
  assert.deepEqual(
    model.listByAccountId(1).map((method) => [method.bankHolderName, method.accountIdentifierMasked]),
    [
      ['Second Holder', 'Acct ending 4321'],
      ['First Holder', 'Acct ending 6789']
    ]
  );

  context.cleanup();
});

test('payment method model rejects duplicate bank accounts for the same student using normalized fingerprints', () => {
  const context = createTestContext();
  const model = createPaymentMethodModel(context.db);

  model.createBankAccountPaymentMethod(1, {
    accountIdentifier: '123456789',
    bankHolderName: 'Taylor Example',
    routingIdentifier: '021000021'
  });
  const duplicate = model.createBankAccountPaymentMethod(1, {
    accountIdentifier: '1234-56789',
    bankHolderName: 'Taylor Example',
    routingIdentifier: '0210-0002-1'
  });

  assert.equal(duplicate.status, 'duplicate');
  assert.equal(
    context.db.prepare('SELECT COUNT(*) AS count FROM payment_methods WHERE account_id = 1').get().count,
    1
  );

  context.cleanup();
});

test('payment method helpers mask short values and fingerprint normalized digits', () => {
  assert.equal(maskAccountIdentifier('123'), 'Acct ending');
  assert.equal(normalizeDigits(undefined), '');
  assert.equal(
    createAccountFingerprint('0210-0002-1', '1234-56789'),
    createAccountFingerprint('021000021', '123456789')
  );
});

test('payment method model uses the current time when no explicit clock override is provided', () => {
  const context = createTestContext();
  const model = createPaymentMethodModel(context.db);

  const result = model.createBankAccountPaymentMethod(1, {
    accountIdentifier: '111122223333',
    bankHolderName: 'Clock Example',
    routingIdentifier: '021000030'
  });

  assert.equal(result.status, 'created');
  assert.match(result.paymentMethod.createdAt, /^\d{4}-\d{2}-\d{2}T/);

  context.cleanup();
});

test('payment method model tolerates blank holder names when called directly', () => {
  const context = createTestContext();
  const model = createPaymentMethodModel(context.db);

  const result = model.createBankAccountPaymentMethod(1, {
    accountIdentifier: '222233334444',
    bankHolderName: '',
    routingIdentifier: '021000031'
  });

  assert.equal(result.status, 'created');
  assert.equal(result.paymentMethod.bankHolderName, '');

  context.cleanup();
});

test('payment method model stores tokenized credit cards and rejects duplicate tokens', () => {
  const context = createTestContext();
  const model = createPaymentMethodModel(context.db);

  const created = model.createCreditCardPaymentMethod(
    1,
    {
      cardBrand: 'Visa',
      cardLast4: '4242',
      expiryMonth: 12,
      expiryYear: 2028,
      tokenReference: 'tok_4242'
    },
    { now: () => '2026-03-07T12:00:00.000Z' }
  );
  const duplicate = model.createCreditCardPaymentMethod(1, {
    cardBrand: 'Visa',
    cardLast4: '4242',
    expiryMonth: 12,
    expiryYear: 2028,
    tokenReference: 'tok_4242'
  });

  assert.equal(created.status, 'created');
  assert.equal(duplicate.status, 'duplicate');
  assert.equal(
    model.listByAccountId(1).find((method) => method.methodType === 'credit_card').cardLast4,
    '4242'
  );
  assert.equal(createCardTokenFingerprint('tok_abc'), createCardTokenFingerprint('tok_abc'));

  context.cleanup();
});
