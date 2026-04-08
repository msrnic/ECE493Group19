const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function loginAs(agent, identifier, password = USER_PASSWORD) {
  await agent
    .post('/login')
    .type('form')
    .send({ identifier, password })
    .expect(302);
}

test('transaction history page renders the signed-in student fee-payment records with masked identifiers only', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');
  const response = await agent.get('/transactions/history');

  assert.equal(response.status, 200);
  assert.equal(response.text.includes('Transaction History'), true);
  assert.equal(response.text.includes('TXN-2026-0004'), true);
  assert.equal(response.text.includes('Pending'), true);
  assert.equal(response.text.includes('Succeeded'), true);
  assert.equal(response.text.includes('Campus Parking'), false);
  assert.equal(response.text.includes('4111111111111111'), false);
  assert.equal(response.text.includes('Records of past financial transactions'), false);

  context.cleanup();
});

test('transaction history page shows an empty state when the student has no in-scope fee records', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  const accountId = context.db.prepare('SELECT id FROM accounts WHERE email = ?').get('userA@example.com').id;
  context.db.prepare('DELETE FROM financial_transactions WHERE account_id = ?').run(accountId);

  await loginAs(agent, 'userA@example.com');
  const response = await agent.get('/transactions/history');

  assert.equal(response.status, 200);
  assert.equal(response.text.includes('No transactions found'), true);
  assert.equal(response.text.includes('Unable to load transaction history'), false);

  context.cleanup();
});

test('transaction history page shows a retryable failure without mutating transaction data and recovers after retry', async () => {
  const context = createTestContext({
    transactionHistoryTestState: { retrievalFailureIdentifiers: ['userA@example.com'] }
  });
  const agent = request.agent(context.app);
  const beforeCount = context.db.prepare('SELECT COUNT(*) AS count FROM financial_transactions').get().count;

  await loginAs(agent, 'userA@example.com');
  const failedResponse = await agent.get('/transactions/history');

  assert.equal(failedResponse.status, 503);
  assert.equal(failedResponse.text.includes('Unable to load transaction history'), true);
  assert.equal(failedResponse.text.includes('Retry transaction history'), true);
  assert.equal(context.db.prepare('SELECT COUNT(*) AS count FROM financial_transactions').get().count, beforeCount);

  context.resetTransactionHistoryTestState();
  const recoveredResponse = await agent.get('/transactions/history');

  assert.equal(recoveredResponse.status, 200);
  assert.equal(recoveredResponse.text.includes('Transaction history loaded successfully.'), true);
  assert.equal(recoveredResponse.text.includes('TXN-2026-0004'), true);

  context.cleanup();
});

test('transaction history page rejects non-student actors', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'professor@example.com');
  const response = await agent.get('/transactions/history');

  assert.equal(response.status, 403);
  assert.equal(response.text.includes('Only active student accounts may view transaction history.'), true);

  context.cleanup();
});

test('transaction history page omits masked-identifier suffixes when the record has no stored identifier', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  context.db.prepare(`
    UPDATE financial_transactions
    SET masked_method_identifier = NULL
    WHERE transaction_reference = 'TXN-2026-0004'
  `).run();

  await loginAs(agent, 'userA@example.com');
  const response = await agent.get('/transactions/history');

  assert.equal(response.status, 200);
  assert.equal(response.text.includes('Payment method: Mastercard ()'), false);
  assert.match(response.text, /Payment method: Mastercard/);

  context.cleanup();
});
