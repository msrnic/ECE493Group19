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
        if (accountId !== 1) {
          return null;
        }

        return {
          accountId: 1,
          displayName: 'userA',
          email: 'userA@example.com',
          studentId: 'userA'
        };
      }
    },
    ...overrides
  };
}

test('payment methods controller redirects missing accounts and renders add pages for students', () => {
  const controller = createPaymentMethodsController(createServices());

  const listResponse = createResponseRecorder();
  controller.getPaymentMethodsPage({ query: {}, session: { accountId: 99 } }, listResponse);
  assert.equal(listResponse.redirectedTo, '/login?returnTo=%2Faccount%2Fpayment-methods');

  const bankResponse = createResponseRecorder();
  controller.getAddBankAccountPage({ session: { accountId: 1 } }, bankResponse);
  assert.equal(bankResponse.statusCode, 200);
  assert.match(bankResponse.body, /Add Bank Account/);

  const cardResponse = createResponseRecorder();
  controller.getAddCreditCardPage({ session: { accountId: 1 } }, cardResponse);
  assert.equal(cardResponse.statusCode, 200);
  assert.match(cardResponse.body, /Add Credit Card/);
});

test('payment methods controller renders forbidden pages for non-student access', () => {
  const controller = createPaymentMethodsController(
    createServices({
      studentAccountModel: {
        findActiveByAccountId() {
          return null;
        }
      }
    })
  );

  const response = createResponseRecorder();
  controller.getAddCreditCardPage({ session: { accountId: 1 } }, response);
  assert.equal(response.statusCode, 403);
  assert.match(response.body, /Only active student accounts may manage payment methods\./);
});

test('payment methods controller renders cancel state and successful bank and card saves', () => {
  const controller = createPaymentMethodsController(
    createServices({
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
          return [
            {
              accountIdentifierMasked: 'Acct ending 6789',
              methodType: 'bank_account'
            },
            {
              cardBrand: 'Visa',
              cardLast4: '4242',
              displayLabel: 'Visa ending 4242',
              expiryMonth: 12,
              expiryYear: 2028,
              methodType: 'credit_card'
            }
          ];
        }
      }
    })
  );

  const cancelledResponse = createResponseRecorder();
  controller.getPaymentMethodsPage(
    { query: { cancelled: '1' }, session: { accountId: 1 } },
    cancelledResponse
  );
  assert.match(cancelledResponse.body, /Payment method entry cancelled\. No changes were saved\./);

  const bankSave = createResponseRecorder();
  controller.postAddBankAccount(
    {
      body: {
        accountIdentifier: '123456789',
        bankHolderName: 'Taylor Example',
        routingIdentifier: '021000021'
      },
      session: { accountId: 1 }
    },
    bankSave
  );
  assert.equal(bankSave.statusCode, 200);
  assert.match(bankSave.body, /Bank account saved\./);

  const cardSave = createResponseRecorder();
  controller.postAddCreditCard(
    {
      body: {
        cardHolderName: 'Taylor Example',
        cardNumber: '4111111111114242',
        expiryMonth: '12',
        expiryYear: '2028'
      },
      session: { accountId: 1 }
    },
    cardSave
  );
  assert.equal(cardSave.statusCode, 200);
  assert.match(cardSave.body, /Visa ending 4242 was saved for future fee payments\./);
});

test('payment methods controller renders validation, rejection, unavailability, and duplicate errors', () => {
  let bankCreates = 0;
  let cardCreates = 0;
  const controller = createPaymentMethodsController(
    createServices({
      bankingNetworkService: {
        validateBankAccount(details) {
          if (details.accountIdentifier === '5555550000') {
            return {
              reason:
                'The banking network rejected this account. Confirm the routing and account numbers.',
              status: 'network_rejected'
            };
          }

          return { status: 'accepted' };
        }
      },
      paymentMethodModel: {
        createBankAccountPaymentMethod() {
          bankCreates += 1;
          return {
            fieldErrors: {
              accountIdentifier:
                'This bank account is already stored for fee payments on your account.'
            },
            status: 'duplicate'
          };
        },
        createCreditCardPaymentMethod() {
          cardCreates += 1;
          return {
            fieldErrors: {
              cardNumber: 'This credit card is already stored for future fee payments.'
            },
            status: 'duplicate'
          };
        },
        listByAccountId() {
          return [];
        }
      },
      paymentTokenizationService: {
        tokenize(details) {
          if (details.cardNumber.endsWith('0002')) {
            return {
              message: 'The credit card was declined. Check the details and try again.',
              status: 'rejected'
            };
          }

          if (details.cardNumber.endsWith('0009')) {
            return {
              message:
                'Credit card processing is temporarily unavailable. Try again later or use another payment method.',
              status: 'unavailable'
            };
          }

          return {
            cardBrand: 'Visa',
            cardLast4: '4242',
            expiryMonth: 12,
            expiryYear: 2028,
            status: 'tokenized',
            tokenReference: 'tok_1234'
          };
        }
      }
    })
  );

  const invalidBank = createResponseRecorder();
  controller.postAddBankAccount(
    {
      body: { accountIdentifier: '12', bankHolderName: '', routingIdentifier: '123' },
      session: { accountId: 1 }
    },
    invalidBank
  );
  assert.equal(invalidBank.statusCode, 400);
  assert.equal(bankCreates, 0);

  const rejectedBank = createResponseRecorder();
  controller.postAddBankAccount(
    {
      body: {
        accountIdentifier: '5555550000',
        bankHolderName: 'Taylor Example',
        routingIdentifier: '021000021'
      },
      session: { accountId: 1 }
    },
    rejectedBank
  );
  assert.equal(rejectedBank.statusCode, 400);
  assert.equal(bankCreates, 0);

  const duplicateBank = createResponseRecorder();
  controller.postAddBankAccount(
    {
      body: {
        accountIdentifier: '123456789',
        bankHolderName: 'Taylor Example',
        routingIdentifier: '021000021'
      },
      session: { accountId: 1 }
    },
    duplicateBank
  );
  assert.equal(duplicateBank.statusCode, 400);
  assert.equal(bankCreates, 1);

  const invalidCard = createResponseRecorder();
  controller.postAddCreditCard(
    {
      body: { cardHolderName: '', cardNumber: '12', expiryMonth: '99', expiryYear: '2000' },
      session: { accountId: 1 }
    },
    invalidCard
  );
  assert.equal(invalidCard.statusCode, 400);
  assert.equal(cardCreates, 0);

  const rejectedCard = createResponseRecorder();
  controller.postAddCreditCard(
    {
      body: {
        cardHolderName: 'Taylor Example',
        cardNumber: '4111111111110002',
        expiryMonth: '12',
        expiryYear: '2028'
      },
      session: { accountId: 1 }
    },
    rejectedCard
  );
  assert.equal(rejectedCard.statusCode, 400);
  assert.equal(cardCreates, 0);

  const unavailableCard = createResponseRecorder();
  controller.postAddCreditCard(
    {
      body: {
        cardHolderName: 'Taylor Example',
        cardNumber: '4111111111110009',
        expiryMonth: '12',
        expiryYear: '2028'
      },
      session: { accountId: 1 }
    },
    unavailableCard
  );
  assert.equal(unavailableCard.statusCode, 503);
  assert.equal(cardCreates, 0);

  const duplicateCard = createResponseRecorder();
  controller.postAddCreditCard(
    {
      body: {
        cardHolderName: 'Taylor Example',
        cardNumber: '4111111111114242',
        expiryMonth: '12',
        expiryYear: '2028'
      },
      session: { accountId: 1 }
    },
    duplicateCard
  );
  assert.equal(duplicateCard.statusCode, 400);
  assert.equal(cardCreates, 1);
});
