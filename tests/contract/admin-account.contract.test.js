const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const ADMIN_PASSWORD = 'AdminPass!234';

async function loginAs(agent, identifier, password) {
  await agent
    .post('/login')
    .type('form')
    .send({ identifier, password })
    .expect(302);
}

function assertPasswordPolicy(policy) {
  assert.equal(typeof policy.minLength, 'number');
  assert.equal(typeof policy.requiresUpper, 'boolean');
  assert.equal(typeof policy.requiresLower, 'boolean');
  assert.equal(typeof policy.requiresDigit, 'boolean');
  assert.equal(typeof policy.requiresSpecial, 'boolean');
}

test('GET /api/admin/accounts/form-metadata returns assignable roles and password policy for admins', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    await loginAs(agent, 'admin@example.com', ADMIN_PASSWORD);

    const response = await agent
      .get('/api/admin/accounts/form-metadata')
      .set('Accept', 'application/json');

    assert.equal(response.status, 200);
    assert.equal(typeof response.body.notificationsEnabled, 'boolean');
    assertPasswordPolicy(response.body.passwordPolicy);
    assert.equal(Array.isArray(response.body.roles), true);
    assert.equal(response.body.roles.length > 0, true);

    for (const role of response.body.roles) {
      assert.equal(typeof role.id, 'number');
      assert.equal(typeof role.name, 'string');
      assert.equal(role.name.length > 0, true);
    }
  } finally {
    context.cleanup();
  }
});

test('GET /api/admin/accounts/form-metadata returns a forbidden error payload for non-admin users', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    await loginAs(agent, 'userA@example.com', 'CorrectPass!234');

    const response = await agent
      .get('/api/admin/accounts/form-metadata')
      .set('Accept', 'application/json');

    assert.equal(response.status, 403);
    assert.deepEqual(response.body, {
      code: 'FORBIDDEN',
      error: 'Administrative authorization is required for this action.'
    });
  } finally {
    context.cleanup();
  }
});

test('POST /api/admin/accounts returns the documented success payload for valid input', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    await loginAs(agent, 'admin@example.com', ADMIN_PASSWORD);
    const studentRoleId = context.db.prepare('SELECT id FROM roles WHERE role_key = ?').get('student').id;

    const response = await agent.post('/api/admin/accounts').send({
      email: 'contract.success@example.com',
      password: 'ValidPass!234',
      roleId: studentRoleId
    });

    assert.equal(response.status, 201);
    assert.equal(typeof response.body.accountId, 'number');
    assert.equal(response.body.accountIdentifier, 'contract.success@example.com');
    assert.equal(response.body.assignedRole, 'Student');
    assert.equal(response.body.accountStatus, 'active');
    assert.equal(response.body.mustChangePassword, true);
    assert.equal(typeof response.body.notification.enabled, 'boolean');
    assert.match(response.body.notification.status, /^(sent|failed|skipped_disabled)$/);
  } finally {
    context.cleanup();
  }
});

test('POST /api/admin/accounts returns validation errors and preserved non-sensitive values without echoing the password', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    await loginAs(agent, 'admin@example.com', ADMIN_PASSWORD);

    const response = await agent.post('/api/admin/accounts').send({
      email: 'bad-email',
      password: 'short',
      roleId: ''
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'Validation failed');
    assert.equal(Array.isArray(response.body.errors), true);
    assert.equal(response.body.errors.length, 3);
    assert.deepEqual(
      response.body.errors.map((error) => error.field),
      ['email', 'roleId', 'password']
    );
    assert.deepEqual(response.body.preservedValues, {
      email: 'bad-email',
      roleId: ''
    });
    assert.equal(Object.prototype.hasOwnProperty.call(response.body.preservedValues, 'password'), false);
  } finally {
    context.cleanup();
  }
});

test('POST /api/admin/accounts returns conflict and server-error payloads for duplicate and failed account-creation requests', async () => {
  const context = createTestContext();

  try {
    const agent = request.agent(context.app);
    await loginAs(agent, 'admin@example.com', ADMIN_PASSWORD);
    const studentRoleId = context.db.prepare('SELECT id FROM roles WHERE role_key = ?').get('student').id;

    const duplicateResponse = await agent.post('/api/admin/accounts').send({
      email: ' USERA@EXAMPLE.COM ',
      password: 'ValidPass!234',
      roleId: studentRoleId
    });
    assert.equal(duplicateResponse.status, 409);
    assert.deepEqual(duplicateResponse.body, {
      code: 'DUPLICATE_IDENTIFIER',
      error: 'An account with that email already exists.',
      field: 'email'
    });

    context.accountCreationTestState.createFailureIdentifiers.push('contract.failure@example.com');
    const failureResponse = await agent.post('/api/admin/accounts').send({
      email: 'contract.failure@example.com',
      password: 'ValidPass!234',
      roleId: studentRoleId
    });
    assert.equal(failureResponse.status, 500);
    assert.deepEqual(failureResponse.body, {
      code: 'INTERNAL_ERROR',
      error: 'We could not create the account. Please retry later.'
    });
  } finally {
    context.cleanup();
  }
});
