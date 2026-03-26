const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const ADMIN_PASSWORD = 'AdminPass!234';
const VALID_PASSWORD = 'ValidPass!234';

async function loginAsAdmin(agent) {
  await agent
    .post('/login')
    .type('form')
    .send({ identifier: 'admin@example.com', password: ADMIN_PASSWORD })
    .expect(302);
}

function getRoleId(context, roleKey) {
  return context.db.prepare('SELECT id FROM roles WHERE role_key = ?').get(roleKey).id;
}

test('admin account creation renders the dashboard entry, persists the account, records notification delivery, and requires a password change at first login', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    const studentRoleId = getRoleId(context, 'student');
    await loginAsAdmin(agent);

    const dashboardResponse = await agent.get('/dashboard');
    assert.equal(dashboardResponse.status, 200);
    assert.match(dashboardResponse.text, /Create New User/);

    const formResponse = await agent.get('/admin/users/new');
    assert.equal(formResponse.status, 200);
    assert.match(formResponse.text, /Create New User/);

    const createResponse = await agent
      .post('/admin/users')
      .type('form')
      .send({
        email: 'integration.user@example.com',
        password: VALID_PASSWORD,
        roleId: String(studentRoleId)
      });
    assert.equal(createResponse.status, 201);
    assert.match(createResponse.text, /User created successfully\./);
    assert.match(createResponse.text, /Assigned role: Student/);
    assert.match(createResponse.text, /Notification status: sent/);

    const account = context.db
      .prepare(
        `
          SELECT id, email, must_change_password, password_hash, role, status
          FROM accounts
          WHERE lower(email) = lower(?)
        `
      )
      .get('integration.user@example.com');
    assert.equal(account.email, 'integration.user@example.com');
    assert.equal(account.role, 'student');
    assert.equal(account.status, 'active');
    assert.equal(account.must_change_password, 1);
    assert.match(account.password_hash, /^\$2[abxy]?\$.+/);

    const roleAssignment = context.db
      .prepare(
        `
          SELECT r.role_key
          FROM role_assignments ra
          INNER JOIN roles r ON r.id = ra.role_id
          WHERE ra.account_id = ?
            AND ra.is_active = 1
        `
      )
      .get(account.id);
    assert.deepEqual(roleAssignment, { role_key: 'student' });

    const notificationAttempt = context.db
      .prepare('SELECT channel, status FROM notification_attempts WHERE account_id = ?')
      .get(account.id);
    assert.deepEqual(notificationAttempt, { channel: 'email', status: 'sent' });

    const newUserAgent = request.agent(context.app);
    const loginResponse = await newUserAgent
      .post('/login')
      .type('form')
      .send({ identifier: 'integration.user@example.com', password: VALID_PASSWORD });
    assert.equal(loginResponse.status, 302);
    assert.equal(loginResponse.headers.location, '/account/security/password-change?required=1');
  } finally {
    context.cleanup();
  }
});

test('admin account creation preserves non-sensitive values across validation failures and succeeds after correction', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    const studentRoleId = getRoleId(context, 'student');
    await loginAsAdmin(agent);

    const invalidResponse = await agent
      .post('/admin/users')
      .type('form')
      .send({
        email: 'not-an-email',
        password: 'short',
        roleId: String(studentRoleId)
      });
    assert.equal(invalidResponse.status, 400);
    assert.match(invalidResponse.text, /Please correct the highlighted fields\./);
    assert.match(invalidResponse.text, /Enter a valid email address\./);
    assert.match(invalidResponse.text, /Password does not meet the policy requirements\./);
    assert.match(invalidResponse.text, /value=['"]not-an-email['"]/);
    assert.match(
      invalidResponse.text,
      new RegExp(`<option value='${studentRoleId}' selected>Student</option>`)
    );
    assert.doesNotMatch(invalidResponse.text, /value='short'/);

    const correctedResponse = await agent
      .post('/admin/users')
      .type('form')
      .send({
        email: 'corrected.integration@example.com',
        password: VALID_PASSWORD,
        roleId: String(studentRoleId)
      });
    assert.equal(correctedResponse.status, 201);
    assert.match(correctedResponse.text, /User created successfully\./);
    assert.deepEqual(
      context.db
        .prepare('SELECT email FROM accounts WHERE lower(email) = lower(?)')
        .get('corrected.integration@example.com'),
      { email: 'corrected.integration@example.com' }
    );
  } finally {
    context.cleanup();
  }
});

test('admin account creation blocks disallowed roles and duplicate normalized emails until corrected', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    const studentRoleId = getRoleId(context, 'student');
    await loginAsAdmin(agent);

    context.db.prepare('UPDATE roles SET is_assignable = 0 WHERE id = ?').run(studentRoleId);
    const invalidRoleResponse = await agent
      .post('/admin/users')
      .type('form')
      .send({
        email: 'role.blocked@example.com',
        password: VALID_PASSWORD,
        roleId: String(studentRoleId)
      });
    assert.equal(invalidRoleResponse.status, 400);
    assert.match(invalidRoleResponse.text, /Selected role is no longer available\. Choose another role\./);
    assert.equal(
      context.db
        .prepare('SELECT COUNT(*) AS count FROM accounts WHERE lower(email) = lower(?)')
        .get('role.blocked@example.com').count,
      0
    );

    context.db.prepare('UPDATE roles SET is_assignable = 1 WHERE id = ?').run(studentRoleId);
    const duplicateResponse = await agent
      .post('/admin/users')
      .type('form')
      .send({
        email: ' USERA@EXAMPLE.COM ',
        password: VALID_PASSWORD,
        roleId: String(studentRoleId)
      });
    assert.equal(duplicateResponse.status, 409);
    assert.match(duplicateResponse.text, /An account with that email already exists\./);

    const correctedResponse = await agent
      .post('/admin/users')
      .type('form')
      .send({
        email: 'role-and-duplicate-fixed@example.com',
        password: VALID_PASSWORD,
        roleId: String(studentRoleId)
      });
    assert.equal(correctedResponse.status, 201);
    assert.deepEqual(
      context.db
        .prepare('SELECT email FROM accounts WHERE lower(email) = lower(?)')
        .get('role-and-duplicate-fixed@example.com'),
      { email: 'role-and-duplicate-fixed@example.com' }
    );
  } finally {
    context.cleanup();
  }
});

test('admin account creation rolls back simulated failures and preserves successful accounts when notification delivery fails', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    const studentRoleId = getRoleId(context, 'student');
    await loginAsAdmin(agent);

    context.accountCreationTestState.createFailureIdentifiers.push('rollback.user@example.com');
    const failureResponse = await agent
      .post('/admin/users')
      .type('form')
      .send({
        email: 'rollback.user@example.com',
        password: VALID_PASSWORD,
        roleId: String(studentRoleId)
      });
    assert.equal(failureResponse.status, 500);
    assert.match(failureResponse.text, /We could not create the account\. Please retry later\./);
    assert.equal(
      context.db
        .prepare('SELECT COUNT(*) AS count FROM accounts WHERE lower(email) = lower(?)')
        .get('rollback.user@example.com').count,
      0
    );

    context.resetAccountCreationTestState();
    context.accountCreationTestState.notificationFailureIdentifiers.push('warning.user@example.com');
    const warningResponse = await agent
      .post('/admin/users')
      .type('form')
      .send({
        email: 'warning.user@example.com',
        password: VALID_PASSWORD,
        roleId: String(studentRoleId)
      });
    assert.equal(warningResponse.status, 201);
    assert.match(warningResponse.text, /User created successfully, but notification delivery failed\./);
    assert.doesNotMatch(warningResponse.text, /Resend/i);
    assert.doesNotMatch(warningResponse.text, /Copy/i);

    const warningAccount = context.db
      .prepare('SELECT id, email FROM accounts WHERE lower(email) = lower(?)')
      .get('warning.user@example.com');
    assert.deepEqual(warningAccount, {
      email: 'warning.user@example.com',
      id: warningAccount.id
    });
    const warningAttempt = context.db
      .prepare('SELECT status FROM notification_attempts WHERE account_id = ?')
      .get(warningAccount.id);
    assert.deepEqual(warningAttempt, { status: 'failed' });
  } finally {
    context.cleanup();
  }
});
