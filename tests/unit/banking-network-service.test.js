const test = require('node:test');
const assert = require('node:assert/strict');

const { createBankingNetworkService } = require('../../src/services/banking-network-service');

test('banking network service accepts normal bank details', () => {
  const service = createBankingNetworkService();

  assert.deepEqual(
    service.validateBankAccount({
      accountIdentifier: '123456789',
      routingIdentifier: '021000021'
    }),
    { status: 'accepted' }
  );
});

test('banking network service rejects configured routing or account patterns', () => {
  const service = createBankingNetworkService();

  assert.equal(
    service.validateBankAccount({
      accountIdentifier: '123450000',
      routingIdentifier: '021000021'
    }).status,
    'network_rejected'
  );
  assert.equal(
    service.validateBankAccount({
      accountIdentifier: '123456789',
      routingIdentifier: '999999999'
    }).status,
    'network_rejected'
  );
});

test('banking network service accepts missing optional detail inputs as empty strings', () => {
  const service = createBankingNetworkService();

  assert.deepEqual(service.validateBankAccount({}), { status: 'accepted' });
});
