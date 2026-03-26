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

test('contact-information route redirects unauthenticated users and renders seeded values for authenticated users', async () => {
  const context = createTestContext();
  const response = await request(context.app).get('/account/contact-information');
  assert.equal(response.status, 302);
  assert.equal(response.headers.location, '/login?returnTo=%2Faccount%2Fcontact-information');

  const agent = request.agent(context.app);
  await loginAs(agent, 'userA@example.com');

  const page = await agent.get('/account/contact-information');
  assert.equal(page.status, 200);
  assert.match(page.text, /Update Contact Information/);
  assert.match(page.text, /value='userA\.contact@example\.com'/);
  assert.match(page.text, /value='\+1 780 555 1234'/);
  assert.match(page.text, /value='Jordan Example'/);
  assert.match(page.text, /value='\+1 780 555 2234'/);
  assert.match(page.text, /value='Parent'/);
  assert.match(page.text, /data-return-to='\/dashboard#security-center'/);

  context.cleanup();
});

test('contact-information route rejects invalid input and persists corrected values', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');

  const invalidResponse = await agent
    .post('/account/contact-information')
    .type('form')
    .send({
      contactEmail: 'userA.contact@example.com',
      emergencyFullName: 'Jordan Example',
      emergencyPhoneNumber: 'abc123',
      emergencyRelationship: '',
      phoneNumber: '123456',
      submittedVersion: '1'
    });
  assert.equal(invalidResponse.status, 400);
  assert.match(invalidResponse.text, /Please correct the highlighted contact details\./);
  assert.deepEqual(
    context.db
      .prepare('SELECT contact_email, phone_number, version FROM contact_profiles WHERE account_id = 1')
      .get(),
    {
      contact_email: 'userA.contact@example.com',
      phone_number: '+1 780 555 1234',
      version: 1
    }
  );

  const validResponse = await agent
    .post('/account/contact-information')
    .type('form')
    .send({
      contactEmail: 'jamie.updated@example.com',
      emergencyFullName: 'Morgan Updated',
      emergencyPhoneNumber: '+1 780 555 7777',
      emergencyRelationship: 'Sibling',
      phoneNumber: '+1 780 555 6666',
      submittedVersion: '1'
    });
  assert.equal(validResponse.status, 200);
  assert.match(validResponse.text, /Contact information updated successfully\./);
  assert.deepEqual(
    context.db
      .prepare('SELECT contact_email, phone_number, version FROM contact_profiles WHERE account_id = 1')
      .get(),
    {
      contact_email: 'jamie.updated@example.com',
      phone_number: '+1 780 555 6666',
      version: 2
    }
  );
  assert.deepEqual(
    context.db
      .prepare('SELECT full_name, phone_number, relationship FROM emergency_contacts WHERE account_id = 1')
      .get(),
    {
      full_name: 'Morgan Updated',
      phone_number: '+1 780 555 7777',
      relationship: 'Sibling'
    }
  );

  const refreshedPage = await agent.get('/account/contact-information');
  assert.equal(refreshedPage.status, 200);
  assert.match(refreshedPage.text, /value='jamie\.updated@example\.com'/);
  assert.match(refreshedPage.text, /value='\+1 780 555 6666'/);
  assert.match(refreshedPage.text, /value='Morgan Updated'/);

  context.cleanup();
});

test('contact-information route rolls back simulated save failures without partial writes', async () => {
  const context = createTestContext({
    profileTestState: {
      contactSaveFailureIdentifiers: ['usera@example.com'],
      personalSaveFailureIdentifiers: []
    }
  });
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');

  const baselineProfile = context.db
    .prepare('SELECT contact_email, phone_number, version FROM contact_profiles WHERE account_id = 1')
    .get();
  const baselineEmergency = context.db
    .prepare('SELECT full_name, phone_number, relationship FROM emergency_contacts WHERE account_id = 1')
    .get();

  const response = await agent
    .post('/account/contact-information')
    .type('form')
    .send({
      contactEmail: 'broken.write@example.com',
      emergencyFullName: 'Broken Write',
      emergencyPhoneNumber: '+1 780 555 4444',
      emergencyRelationship: 'Friend',
      phoneNumber: '+1 780 555 3333',
      submittedVersion: '1'
    });
  assert.equal(response.status, 500);
  assert.match(response.text, /We could not save your contact information\. Please retry later\./);
  assert.deepEqual(
    context.db
      .prepare('SELECT contact_email, phone_number, version FROM contact_profiles WHERE account_id = 1')
      .get(),
    baselineProfile
  );
  assert.deepEqual(
    context.db
      .prepare('SELECT full_name, phone_number, relationship FROM emergency_contacts WHERE account_id = 1')
      .get(),
    baselineEmergency
  );

  context.cleanup();
});

test('contact-information route saves the latest version and reports stale-edit conflicts', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');

  context.db
    .prepare(
      `
        UPDATE contact_profiles
        SET contact_email = 'external.update@example.com', phone_number = '+1 780 555 5555', version = 3
        WHERE account_id = 1
      `
    )
    .run();

  const response = await agent
    .post('/account/contact-information')
    .type('form')
    .send({
      contactEmail: 'latest.write@example.com',
      emergencyFullName: 'Latest Write',
      emergencyPhoneNumber: '+1 780 555 2222',
      emergencyRelationship: 'Partner',
      phoneNumber: '+1 780 555 1111',
      submittedVersion: '1'
    });
  assert.equal(response.status, 200);
  assert.match(
    response.text,
    /Another update occurred while you were editing, so your changes were saved as the latest version\./
  );
  assert.deepEqual(
    context.db
      .prepare('SELECT contact_email, phone_number, version FROM contact_profiles WHERE account_id = 1')
      .get(),
    {
      contact_email: 'latest.write@example.com',
      phone_number: '+1 780 555 1111',
      version: 4
    }
  );
  assert.deepEqual(
    context.db
      .prepare('SELECT full_name, phone_number, relationship FROM emergency_contacts WHERE account_id = 1')
      .get(),
    {
      full_name: 'Latest Write',
      phone_number: '+1 780 555 2222',
      relationship: 'Partner'
    }
  );

  context.cleanup();
});
