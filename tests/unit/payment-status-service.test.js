const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createPaymentStatusService,
  mapDependencyError,
  mapTransactionStatus,
  maskMethodIdentifier
} = require('../../src/services/payment-status-service');

test('payment status helpers map statuses and mask identifiers safely', () => {
  assert.equal(mapTransactionStatus('pending'), 'Pending');
  assert.equal(mapTransactionStatus('succeeded'), 'Succeeded');
  assert.equal(mapTransactionStatus('failed'), 'Failed');
  assert.equal(mapTransactionStatus('reversed'), 'Reversed');
  assert.equal(mapTransactionStatus('unexpected'), 'Pending');

  assert.equal(maskMethodIdentifier(''), null);
  assert.equal(maskMethodIdentifier('**** 4242'), '**** 4242');
  assert.equal(maskMethodIdentifier('Acct ending 1023'), 'Acct ending 1023');
  assert.equal(maskMethodIdentifier('4242424242424242'), '**** 4242');
  assert.equal(maskMethodIdentifier('12'), '****');
});

test('payment status service returns formatted transaction history and supports failure injection by username or email', () => {
  const service = createPaymentStatusService({
    financialTransactionModel: {
      listFeeTransactionsForAccount() {
        return [{
          amountCents: 124567,
          currency: 'USD',
          maskedMethodIdentifier: '4111111111111111',
          paymentMethodLabel: 'Visa',
          postedAt: '2026-03-05T15:00:00.000Z',
          referenceNumber: 'TXN-2026-0001',
          status: 'succeeded'
        }];
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z'),
    transactionHistoryTestState: { retrievalFailureIdentifiers: [] }
  });

  assert.deepEqual(service.createTransactionHistoryResponse({
    accountId: 1,
    email: 'userA@example.com',
    studentId: 'userA'
  }), {
    generatedAt: '2026-03-07T12:00:00.000Z',
    records: [{
      amount: 1245.67,
      currency: 'USD',
      maskedMethodIdentifier: '**** 1111',
      paymentMethodLabel: 'Visa',
      postedAt: '2026-03-05T15:00:00.000Z',
      referenceNumber: 'TXN-2026-0001',
      status: 'Succeeded',
      transactionId: 'TXN-2026-0001'
    }],
    sortOrder: 'newest_first',
    studentId: 'userA'
  });

  service.createDependencyErrorPayload(Object.assign(new Error('fail'), {
    code: 'transaction_history_unavailable'
  }));

  const usernameFailureService = createPaymentStatusService({
    financialTransactionModel: { listFeeTransactionsForAccount() { return []; } },
    now: () => new Date('2026-03-07T12:00:00.000Z'),
    transactionHistoryTestState: { retrievalFailureIdentifiers: ['userA'] }
  });
  assert.throws(() => usernameFailureService.createTransactionHistoryResponse({
    accountId: 1,
    email: 'ignored@example.com',
    studentId: 'userA'
  }), /temporarily unavailable/);

  const emailFailureService = createPaymentStatusService({
    financialTransactionModel: { listFeeTransactionsForAccount() { return []; } },
    now: () => new Date('2026-03-07T12:00:00.000Z'),
    transactionHistoryTestState: { retrievalFailureIdentifiers: ['usera@example.com'] }
  });
  assert.throws(() => emailFailureService.createTransactionHistoryResponse({
    accountId: 1,
    email: 'userA@example.com',
    studentId: 'userA'
  }), /temporarily unavailable/);
});

test('payment status service rethrows unexpected dependency errors', () => {
  assert.deepEqual(
    mapDependencyError({ code: 'transaction_history_unavailable' }),
    {
      code: 'transaction_history_unavailable',
      message: 'Transaction history is temporarily unavailable. Please retry.',
      retryable: true,
      statusCode: 503
    }
  );

  assert.throws(() => mapDependencyError(new Error('unexpected')), /unexpected/);
});

test('payment status service works when transaction history fixtures are not configured', () => {
  const service = createPaymentStatusService({
    financialTransactionModel: {
      listFeeTransactionsForAccount() {
        return [{
          amountCents: 0,
          currency: 'USD',
          maskedMethodIdentifier: null,
          paymentMethodLabel: 'Bank Transfer',
          postedAt: '2026-03-07T12:00:00.000Z',
          referenceNumber: 'TXN-EMPTY-1',
          status: 'pending'
        }];
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });

  assert.deepEqual(service.createTransactionHistoryResponse({
    accountId: 1,
    email: '',
    studentId: 'userA'
  }), {
    generatedAt: '2026-03-07T12:00:00.000Z',
    records: [{
      amount: 0,
      currency: 'USD',
      maskedMethodIdentifier: null,
      paymentMethodLabel: 'Bank Transfer',
      postedAt: '2026-03-07T12:00:00.000Z',
      referenceNumber: 'TXN-EMPTY-1',
      status: 'Pending',
      transactionId: 'TXN-EMPTY-1'
    }],
    sortOrder: 'newest_first',
    studentId: 'userA'
  });
});
