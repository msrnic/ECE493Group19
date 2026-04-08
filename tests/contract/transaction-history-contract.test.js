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

test('GET /api/students/:studentId/financial-transactions returns a contract-compliant success payload', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');
  const response = await agent
    .get('/api/students/userA/financial-transactions')
    .set('Accept', 'application/json');

  assert.equal(response.status, 200);
  assert.equal(response.body.studentId, 'userA');
  assert.equal(response.body.sortOrder, 'newest_first');
  assert.equal(typeof response.body.generatedAt, 'string');
  assert.deepEqual(response.body.records.map((record) => record.transactionId), [
    'TXN-2026-0004',
    'TXN-2026-0001',
    'TXN-2026-0003',
    'TXN-2025-0099'
  ]);
  assert.equal(response.body.records[0].maskedMethodIdentifier.includes('0088'), true);
  assert.equal(response.body.records.some((record) => record.transactionId === 'PARK-2026-0008'), false);

  context.cleanup();
});

test('GET /api/students/:studentId/financial-transactions returns a 401 contract error for unauthenticated requests', async () => {
  const context = createTestContext();

  const response = await request(context.app)
    .get('/api/students/userA/financial-transactions')
    .set('Accept', 'application/json');

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, {
    code: 'auth_required',
    message: 'Sign in to view transaction history.'
  });

  context.cleanup();
});

test('GET /api/students/:studentId/financial-transactions returns a 403 contract error for forbidden access', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');
  const response = await agent
    .get('/api/students/noModules/financial-transactions')
    .set('Accept', 'application/json');

  assert.equal(response.status, 403);
  assert.deepEqual(response.body, {
    code: 'transaction_history_forbidden',
    message: 'You may view only your own transaction history.'
  });

  context.cleanup();
});

test('GET /api/students/:studentId/financial-transactions returns a 404 contract error for missing students', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');
  const response = await agent
    .get('/api/students/missing-student/financial-transactions')
    .set('Accept', 'application/json');

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, {
    code: 'student_not_found',
    message: 'Student account was not found.'
  });

  context.cleanup();
});

test('GET /api/students/:studentId/financial-transactions returns a 403 contract error for non-student actors', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'professor@example.com');
  const response = await agent
    .get('/api/students/userA/financial-transactions')
    .set('Accept', 'application/json');

  assert.equal(response.status, 403);
  assert.deepEqual(response.body, {
    code: 'transaction_history_forbidden',
    message: 'Only active student accounts may view transaction history.'
  });

  context.cleanup();
});

test('GET /api/students/:studentId/financial-transactions returns a 503 contract error with retryable flag when retrieval fails', async () => {
  const context = createTestContext({
    transactionHistoryTestState: { retrievalFailureIdentifiers: ['userA'] }
  });
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');
  const response = await agent
    .get('/api/students/userA/financial-transactions')
    .set('Accept', 'application/json');

  assert.equal(response.status, 503);
  assert.deepEqual(response.body, {
    code: 'transaction_history_unavailable',
    message: 'Transaction history is temporarily unavailable. Please retry.',
    retryable: true
  });

  context.cleanup();
});
