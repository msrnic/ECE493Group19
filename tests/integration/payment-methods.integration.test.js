const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function loginAs(agent, identifier, password = USER_PASSWORD) {
  await agent.post('/login').type('form').send({ identifier, password }).expect(302);
}

test('payment methods routes render empty state and allow both add flows', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');
  const page = await agent.get('/account/payment-methods');
  assert.equal(page.status, 200);
  assert.match(page.text, /No payment methods yet/);
  assert.match(page.text, /Add bank account/);
  assert.match(page.text, /Add credit card/);

  context.cleanup();
});

test('payment methods routes add a bank account and a tokenized credit card successfully', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');

  const bankResponse = await agent
    .post('/account/payment-methods/bank-accounts')
    .type('form')
    .send({
      accountIdentifier: '123456789',
      bankHolderName: 'Taylor Example',
      routingIdentifier: '021000021'
    });
  assert.equal(bankResponse.status, 200);
  assert.match(bankResponse.text, /Acct ending 6789/);

  const cardResponse = await agent
    .post('/account/payment-methods/credit-cards')
    .type('form')
    .send({
      cardHolderName: 'Taylor Example',
      cardNumber: '4111111111114242',
      expiryMonth: '12',
      expiryYear: '2028'
    });
  assert.equal(cardResponse.status, 200);
  assert.match(cardResponse.text, /Visa ending 4242 was saved for future fee payments\./);

  const methods = context.db
    .prepare(
      'SELECT method_type, display_label, bank_holder_name, account_identifier_masked, card_last4, token_reference FROM payment_methods WHERE account_id = 1 ORDER BY id ASC'
    )
    .all();
  assert.equal(methods.length, 2);
  assert.equal(methods[0].method_type, 'bank_account');
  assert.equal(methods[1].method_type, 'credit_card');
  assert.equal(methods[1].card_last4, '4242');
  assert.equal(methods[1].token_reference.startsWith('tok_'), true);
  assert.equal(cardResponse.text.includes('4111111111114242'), false);

  context.cleanup();
});

test('payment methods routes block invalid, rejected, unavailable, and duplicate credit cards without persistence', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');

  const invalid = await agent
    .post('/account/payment-methods/credit-cards')
    .type('form')
    .send({ cardHolderName: '', cardNumber: '12', expiryMonth: '99', expiryYear: '2000' });
  assert.equal(invalid.status, 400);

  const rejected = await agent
    .post('/account/payment-methods/credit-cards')
    .type('form')
    .send({
      cardHolderName: 'Taylor Example',
      cardNumber: '4111111111110002',
      expiryMonth: '12',
      expiryYear: '2028'
    });
  assert.equal(rejected.status, 400);

  const unavailable = await agent
    .post('/account/payment-methods/credit-cards')
    .type('form')
    .send({
      cardHolderName: 'Taylor Example',
      cardNumber: '4111111111110009',
      expiryMonth: '12',
      expiryYear: '2028'
    });
  assert.equal(unavailable.status, 503);

  assert.equal(
    context.db.prepare("SELECT COUNT(*) AS count FROM payment_methods WHERE method_type = 'credit_card'").get().count,
    0
  );

  await agent
    .post('/account/payment-methods/credit-cards')
    .type('form')
    .send({
      cardHolderName: 'Taylor Example',
      cardNumber: '4111111111114242',
      expiryMonth: '12',
      expiryYear: '2028'
    })
    .expect(200);

  const duplicate = await agent
    .post('/account/payment-methods/credit-cards')
    .type('form')
    .send({
      cardHolderName: 'Taylor Example',
      cardNumber: '4111111111114242',
      expiryMonth: '12',
      expiryYear: '2028'
    });
  assert.equal(duplicate.status, 400);
  assert.equal(
    context.db.prepare("SELECT COUNT(*) AS count FROM payment_methods WHERE method_type = 'credit_card'").get().count,
    1
  );

  context.cleanup();
});

test('payment methods routes preserve cancel state and forbid non-students', async () => {
  const context = createTestContext();
  const studentAgent = request.agent(context.app);
  await loginAs(studentAgent, 'userA@example.com');

  const cancelled = await studentAgent.get('/account/payment-methods?cancelled=1');
  assert.equal(cancelled.status, 200);
  assert.match(cancelled.text, /Payment method entry cancelled\. No changes were saved\./);

  const professorAgent = request.agent(context.app);
  await loginAs(professorAgent, 'professor@example.com');
  const forbidden = await professorAgent.get('/account/payment-methods');
  assert.equal(forbidden.status, 403);

  context.cleanup();
});
