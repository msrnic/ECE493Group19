function createBankingNetworkService() {
  return {
    validateBankAccount(details) {
      const routingIdentifier = String(details.routingIdentifier || '');
      const accountIdentifier = String(details.accountIdentifier || '');

      if (routingIdentifier === '999999999' || accountIdentifier.endsWith('0000')) {
        return {
          reason: 'The banking network rejected this account. Confirm the routing and account numbers.',
          status: 'network_rejected'
        };
      }

      return { status: 'accepted' };
    }
  };
}

module.exports = { createBankingNetworkService };
