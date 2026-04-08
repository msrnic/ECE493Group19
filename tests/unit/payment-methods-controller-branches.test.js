const test = require('node:test');
const assert = require('node:assert/strict');

const { createPaymentMethodsController } = require('../../src/controllers/payment-methods-controller');

function createResponseRecorder() {
  return {
    body: '',
    redirectedTo: null,
    statusCode: 200,
    redirect(value) {
      this.redirectedTo = value;
      return this;
    },
    send(value) {
      this.body = value;
      return this;
    },
    status(value) {
      this.statusCode = value;
      return this;
    }
  };
}

function createServices(overrides = {}) {
  return {
    accountModel: {
      findById(accountId) {
        return accountId === 1 ? { id: 1, role: 'student' } : null;
      }
    },
    bankingNetworkService: {
      validateBankAccount() {
        return { status: 'accepted' };
      }
    },
    now() {
      return new Date('2026-03-07T12:00:00.000Z');
    },
    paymentMethodModel: {
      createBankAccountPaymentMethod() {
        return {
          paymentMethod: { accountIdentifierMasked: 'Acct ending 6789' },
          status: 'created'
        };
      },
      createCreditCardPaymentMethod() {
        return {
          paymentMethod: { displayLabel: 'Visa ending 4242' },
          status: 'created'
        };
      },
      listByAccountId() {
        return [];
      }
    },
    paymentTokenizationService: {
      tokenize() {
        return {
          cardBrand: 'Visa',
          cardLast4: '4242',
          expiryMonth: 12,
          expiryYear: 2028,
          status: 'tokenized',
          tokenReference: 'tok_1234'
        };
      }
    },
    studentAccountModel: {
      findActiveByAccountId(accountId) {
        return accountId === 1 ? { accountId: 1 } : null;
      }
    },
    ...overrides
  };
}

test('payment methods controller redirects unauthenticated requests for each entry point', () => {
  const controller = createPaymentMethodsController(createServices());

  const bankGetResponse = createResponseRecorder();
  controller.getAddBankAccountPage({ session: {} }, bankGetResponse);
  assert.equal(
    bankGetResponse.redirectedTo,
    '/login?returnTo=%2Faccount%2Fpayment-methods%2Fbank-accounts%2Fnew'
  );

  const cardGetResponse = createResponseRecorder();
  controller.getAddCreditCardPage({ session: {} }, cardGetResponse);
  assert.equal(
    cardGetResponse.redirectedTo,
    '/login?returnTo=%2Faccount%2Fpayment-methods%2Fcredit-cards%2Fnew'
  );

  const bankPostResponse = createResponseRecorder();
  controller.postAddBankAccount({ body: {}, session: {} }, bankPostResponse);
  assert.equal(
    bankPostResponse.redirectedTo,
    '/login?returnTo=%2Faccount%2Fpayment-methods%2Fbank-accounts%2Fnew'
  );

  const cardPostResponse = createResponseRecorder();
  controller.postAddCreditCard({ body: {}, session: {} }, cardPostResponse);
  assert.equal(
    cardPostResponse.redirectedTo,
    '/login?returnTo=%2Faccount%2Fpayment-methods%2Fcredit-cards%2Fnew'
  );
});

test('payment methods controller forbids non-students for each mutating endpoint', () => {
  const controller = createPaymentMethodsController(
    createServices({
      studentAccountModel: {
        findActiveByAccountId() {
          return null;
        }
      }
    })
  );

  const bankGetResponse = createResponseRecorder();
  controller.getAddBankAccountPage({ session: { accountId: 1 } }, bankGetResponse);
  assert.equal(bankGetResponse.statusCode, 403);

  const bankPostResponse = createResponseRecorder();
  controller.postAddBankAccount({ body: {}, session: { accountId: 1 } }, bankPostResponse);
  assert.equal(bankPostResponse.statusCode, 403);

  const cardPostResponse = createResponseRecorder();
  controller.postAddCreditCard({ body: {}, session: { accountId: 1 } }, cardPostResponse);
  assert.equal(cardPostResponse.statusCode, 403);
});

test('payment methods controller treats accounts without a session account id as forbidden students', () => {
  const controller = createPaymentMethodsController(
    createServices({
      accountModel: {
        findById() {
          return { id: 1, role: 'student' };
        }
      }
    })
  );

  const response = createResponseRecorder();
  controller.getPaymentMethodsPage({ query: {}, session: {} }, response);
  assert.equal(response.statusCode, 403);
});

test('payment methods controller renders fallback labels when saved metadata is blank', () => {
  const controller = createPaymentMethodsController(
    createServices({
      paymentMethodModel: {
        listByAccountId() {
          return [
            {
              accountIdentifierMasked: '',
              displayLabel: 'Fallback bank label',
              methodType: 'bank_account'
            }
          ];
        }
      }
    })
  );

  const response = createResponseRecorder();
  controller.getPaymentMethodsPage({ query: {}, session: { accountId: 1 } }, response);
  assert.equal(response.statusCode, 200);
  assert.match(response.body, /Fallback bank label/);
});
