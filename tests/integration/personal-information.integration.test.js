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

test('personal-information route redirects unauthenticated users and renders seeded values for authenticated users', async () => {
  const context = createTestContext();
  const response = await request(context.app).get('/account/personal-information');
  assert.equal(response.status, 302);
  assert.equal(response.headers.location, '/login?returnTo=%2Faccount%2Fpersonal-information');

  const agent = request.agent(context.app);
  await loginAs(agent, 'userA@example.com');

  const page = await agent.get('/account/personal-information');
  assert.equal(page.status, 200);
  assert.match(page.text, /Update Personal Information/);
  assert.match(page.text, /value='Alex'/);
  assert.match(page.text, /value='Example'/);
  assert.match(page.text, /value='15\/04\/2001'/);
  assert.match(page.text, /value='Canada'/);
  assert.match(page.text, /data-return-to='\/dashboard#security-center'/);

  context.cleanup();
});

test('personal-information route rejects invalid input and persists valid updates', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');

  const invalidResponse = await agent
    .post('/account/personal-information')
    .type('form')
    .send({
      birthday: 'bad-date',
      countryOfOrigin: '',
      firstName: '',
      lastName: '',
      submittedVersion: '1'
    });
  assert.equal(invalidResponse.status, 400);
  assert.match(invalidResponse.text, /Please correct the highlighted personal details\./);
  assert.equal(
    context.db
      .prepare('SELECT first_name, last_name, birth_date, country_of_origin, version FROM personal_details WHERE account_id = 1')
      .get().first_name,
    'Alex'
  );

  const validResponse = await agent
    .post('/account/personal-information')
    .type('form')
    .send({
      birthday: '16/05/2002',
      countryOfOrigin: 'United States',
      firstName: 'Jamie',
      lastName: 'Updated',
      submittedVersion: '1'
    });
  assert.equal(validResponse.status, 200);
  assert.match(validResponse.text, /Personal information updated successfully\./);

  assert.deepEqual(
    context.db
      .prepare('SELECT first_name, last_name, birth_date, country_of_origin, version FROM personal_details WHERE account_id = 1')
      .get(),
    {
      birth_date: '2002-05-16',
      country_of_origin: 'United States',
      first_name: 'Jamie',
      last_name: 'Updated',
      version: 2
    }
  );

  const refreshedPage = await agent.get('/account/personal-information');
  assert.equal(refreshedPage.status, 200);
  assert.match(refreshedPage.text, /value='Jamie'/);
  assert.match(refreshedPage.text, /value='Updated'/);
  assert.match(refreshedPage.text, /value='16\/05\/2002'/);
  assert.match(refreshedPage.text, /value='United States'/);

  context.cleanup();
});

test('personal-information route reports simulated save failures without changing stored data', async () => {
  const context = createTestContext({
    profileTestState: {
      contactSaveFailureIdentifiers: [],
      personalSaveFailureIdentifiers: ['usera@example.com']
    }
  });
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');

  const baseline = context.db
    .prepare('SELECT first_name, last_name, birth_date, country_of_origin, version FROM personal_details WHERE account_id = 1')
    .get();

  const response = await agent
    .post('/account/personal-information')
    .type('form')
    .send({
      birthday: '16/05/2002',
      countryOfOrigin: 'United States',
      firstName: 'Jamie',
      lastName: 'Updated',
      submittedVersion: '1'
    });
  assert.equal(response.status, 500);
  assert.match(response.text, /We could not save your personal information\. Please retry\./);
  assert.deepEqual(
    context.db
      .prepare('SELECT first_name, last_name, birth_date, country_of_origin, version FROM personal_details WHERE account_id = 1')
      .get(),
    baseline
  );

  context.cleanup();
});
