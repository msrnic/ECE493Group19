const test = require('node:test');
const assert = require('node:assert/strict');

const { createTestContext } = require('../helpers/test-context');
const { createFinancialSummaryModel } = require('../../src/models/financial-summary-model');

test('financial summary model returns the latest snapshot for an account and can persist a newer one', () => {
  const context = createTestContext();
  const model = createFinancialSummaryModel(context.db);
  const accountId = context.db.prepare('SELECT id FROM accounts WHERE email = ?').get('userA@example.com').id;

  assert.deepEqual(model.getLatestSnapshotByAccountId(accountId), {
    accountId,
    balanceDueCents: 124567,
    createdAt: '2026-03-07T12:00:00.000Z',
    id: 1,
    lastConfirmedAt: '2026-03-07T12:00:00.000Z',
    outstandingFeesCents: 32500,
    paymentStatus: 'pending_confirmation',
    sourceState: 'live'
  });

  const savedSnapshot = model.saveSnapshot({
    accountId,
    balanceDueCents: 5010,
    createdAt: '2026-03-07T12:05:00.000Z',
    lastConfirmedAt: '2026-03-07T12:05:00.000Z',
    outstandingFeesCents: 2500,
    paymentStatus: 'current',
    sourceState: 'live'
  });

  assert.deepEqual(savedSnapshot, {
    accountId,
    balanceDueCents: 5010,
    createdAt: '2026-03-07T12:05:00.000Z',
    id: savedSnapshot.id,
    lastConfirmedAt: '2026-03-07T12:05:00.000Z',
    outstandingFeesCents: 2500,
    paymentStatus: 'current',
    sourceState: 'live'
  });
  assert.equal(savedSnapshot.id > 1, true);

  context.cleanup();
});

test('financial summary model returns null when an account has no stored snapshot', () => {
  const context = createTestContext();
  const model = createFinancialSummaryModel(context.db);
  const accountId = context.db.prepare('SELECT id FROM accounts WHERE email = ?').get('hybrid.staff@example.com').id;

  assert.equal(model.getLatestSnapshotByAccountId(accountId), null);

  context.cleanup();
});
