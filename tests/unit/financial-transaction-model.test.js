const test = require('node:test');
const assert = require('node:assert/strict');

const { createTestContext } = require('../helpers/test-context');
const { createFinancialTransactionModel } = require('../../src/models/financial-transaction-model');

test('financial transaction model returns only fee transactions, newest first, with duplicate references de-duplicated', () => {
  const context = createTestContext();
  const model = createFinancialTransactionModel(context.db);
  const accountId = context.db.prepare('SELECT id FROM accounts WHERE email = ?').get('userA@example.com').id;

  const records = model.listFeeTransactionsForAccount(accountId);

  assert.deepEqual(records.map((record) => record.referenceNumber), [
    'TXN-2026-0004',
    'TXN-2026-0001',
    'TXN-2026-0003',
    'TXN-2025-0099'
  ]);
  assert.equal(records.some((record) => record.referenceNumber === 'PARK-2026-0008'), false);
  assert.equal(records.find((record) => record.referenceNumber === 'TXN-2026-0001').status, 'succeeded');

  context.cleanup();
});

test('financial transaction model returns an empty list when the student has no fee transaction records', () => {
  const context = createTestContext();
  const model = createFinancialTransactionModel(context.db);
  const accountId = context.db.prepare('SELECT id FROM accounts WHERE email = ?').get('nomodule.student@example.com').id;

  assert.deepEqual(model.listFeeTransactionsForAccount(accountId), []);

  context.cleanup();
});
