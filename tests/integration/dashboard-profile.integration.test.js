const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';
const ADMIN_PASSWORD = 'AdminPass' + String.fromCharCode(33) + '234';

async function loginAs(agent, identifier, password = USER_PASSWORD) {
  await agent
    .post('/login')
    .type('form')
    .send({ identifier, password })
    .expect(302);
}

test('student dashboard displays personal and contact information with both update actions', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await loginAs(agent, 'userA@example.com');

  const response = await agent.get('/dashboard');
  assert.equal(response.status, 200);
  assert.match(response.text, /Full Name: Alex Example/);
  assert.match(response.text, /Birthday: 15\/04\/2001/);
  assert.match(response.text, /Country of Origin: Canada/);
  assert.match(response.text, /Phone Number: \+1 780 555 1234/);
  assert.match(response.text, /Email: userA\.contact@example\.com/);
  assert.match(response.text, /Emergency Contact Name: Jordan Example/);
  assert.match(response.text, /Emergency Contact Phone Number: \+1 780 555 2234/);
  assert.match(response.text, /Emergency Contact Relation: Parent/);
  assert.match(response.text, /Update Personal Information/);
  assert.match(response.text, /Update Contact Information/);
  assert.match(response.text, /Change Password/);

  context.cleanup();
});

test('professor and admin dashboards both expose profile summaries while admin security actions remain intact', async () => {
  const professorContext = createTestContext();
  const professorAgent = request.agent(professorContext.app);

  await loginAs(professorAgent, 'professor@example.com');

  const professorResponse = await professorAgent.get('/dashboard');
  assert.equal(professorResponse.status, 200);
  assert.match(professorResponse.text, /Full Name: Morgan Faculty/);
  assert.match(professorResponse.text, /Birthday: 08\/10\/1983/);
  assert.match(professorResponse.text, /Email: professor\.contact@example\.com/);
  assert.match(professorResponse.text, /Update Personal Information/);
  assert.match(professorResponse.text, /Update Contact Information/);

  professorContext.cleanup();

  const adminContext = createTestContext();
  const adminAgent = request.agent(adminContext.app);

  await loginAs(adminAgent, 'admin@example.com', ADMIN_PASSWORD);

  const adminResponse = await adminAgent.get('/dashboard');
  assert.equal(adminResponse.status, 200);
  assert.match(adminResponse.text, /Full Name: Taylor Admin/);
  assert.match(adminResponse.text, /Birthday: 20\/02\/1979/);
  assert.match(adminResponse.text, /Email: admin\.contact@example\.com/);
  assert.match(adminResponse.text, /Update Personal Information/);
  assert.match(adminResponse.text, /Update Contact Information/);
  assert.match(adminResponse.text, /Reset userA password/);

  adminContext.cleanup();
});

test('dashboard displays available profile data and labels missing items as Not provided', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  context.db.prepare('UPDATE personal_details SET birth_date = NULL, country_of_origin = NULL WHERE account_id = 1').run();
  context.db.prepare('UPDATE contact_profiles SET phone_number = NULL WHERE account_id = 1').run();
  context.db.prepare('UPDATE emergency_contacts SET full_name = NULL, phone_number = NULL, relationship = NULL WHERE account_id = 1').run();

  await loginAs(agent, 'userA@example.com');

  const response = await agent.get('/dashboard');
  assert.equal(response.status, 200);
  assert.match(response.text, /Full Name: Alex Example/);
  assert.match(response.text, /Birthday: Not provided/);
  assert.match(response.text, /Country of Origin: Not provided/);
  assert.match(response.text, /Phone Number: Not provided/);
  assert.match(response.text, /Email: userA\.contact@example\.com/);
  assert.match(response.text, /Emergency Contact Name: Not provided/);
  assert.match(response.text, /Emergency Contact Phone Number: Not provided/);
  assert.match(response.text, /Emergency Contact Relation: Not provided/);

  context.cleanup();
});
