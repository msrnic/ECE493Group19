const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const request = require('supertest');

const { createApp } = require('../../src/app');
const { closeAll, getDb } = require('../../src/db/connection');
const { createTestContext } = require('../helpers/test-context');

test('self-service password change succeeds, preserves the current session, invalidates other sessions, and updates login credentials', async () => {
  const context = createTestContext();
  const primaryAgent = request.agent(context.app);
  const secondaryAgent = request.agent(context.app);

  await primaryAgent
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' })
    .expect(302);

  await secondaryAgent
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' })
    .expect(302);

  const formPage = await primaryAgent.get('/account/security/password-change');
  assert.equal(formPage.status, 200);
  assert.match(formPage.text, /Change Password/);
  assert.match(formPage.text, /Use at least 12 characters/);
  assert.match(formPage.text, /NewSecure!234/);
  assert.match(formPage.text, /Re-enter your current sign-in password manually/);
  assert.match(formPage.text, /autocomplete="off"/);

  const changeResponse = await primaryAgent
    .post('/account/security/password-change')
    .type('form')
    .send({ currentPassword: 'CorrectPass!234', newPassword: 'NewSecure!234' });

  assert.equal(changeResponse.status, 200);
  assert.match(changeResponse.text, /Password changed successfully/);

  const sessionRows = context.db
    .prepare('SELECT id, revoked_at FROM user_sessions WHERE account_id = ? ORDER BY id ASC')
    .all(1);
  assert.equal(sessionRows.length, 2);
  assert.equal(sessionRows.filter((row) => row.revoked_at === null).length, 1);
  assert.equal(context.db.prepare('SELECT COUNT(*) AS count FROM notifications').get().count, 1);
  assert.equal(
    context.db.prepare("SELECT COUNT(*) AS count FROM password_change_attempts WHERE outcome = 'success'").get().count,
    1
  );

  const primaryDashboard = await primaryAgent.get('/dashboard');
  assert.equal(primaryDashboard.status, 200);

  const secondaryDashboard = await secondaryAgent.get('/dashboard');
  assert.equal(secondaryDashboard.status, 302);
  assert.equal(secondaryDashboard.headers.location, '/login');

  const oldLogin = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' });
  assert.equal(oldLogin.status, 401);

  const newLogin = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'NewSecure!234' });
  assert.equal(newLogin.status, 302);

  context.cleanup();
});

test('self-service password change persists after creating a new app against the same database', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  const dbPath = context.dbPath;
  const tempDir = path.dirname(dbPath);

  await agent
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' })
    .expect(302);

  await agent
    .post('/account/security/password-change')
    .type('form')
    .send({ currentPassword: 'CorrectPass!234', newPassword: 'PersistMe!234' })
    .expect(200);

  closeAll();

  const restartedApp = createApp({
    db: getDb(dbPath),
    sessionSecret: 'restarted-session-secret'
  });

  const restartedOldLogin = await request(restartedApp)
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' });
  assert.equal(restartedOldLogin.status, 401);

  const restartedNewLogin = await request(restartedApp)
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'PersistMe!234' });
  assert.equal(restartedNewLogin.status, 302);

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});

test('self-service password change supports JSON responses and cancellation without persisting changes', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await agent
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' })
    .expect(302);

  const cancelResponse = await agent
    .post('/account/security/password-change')
    .type('form')
    .send({ action: 'cancel' });
  assert.equal(cancelResponse.status, 200);
  assert.match(cancelResponse.text, /Password change cancelled/);

  const jsonPolicyResponse = await agent
    .post('/account/security/password-change')
    .set('Accept', 'application/json')
    .send({ currentPassword: 'CorrectPass!234', newPassword: 'bad' });
  assert.equal(jsonPolicyResponse.status, 400);
  assert.deepEqual(jsonPolicyResponse.body.failedRules, ['min_length', 'uppercase', 'digit', 'special']);

  const loginResponse = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' });
  assert.equal(loginResponse.status, 302);
  assert.equal(
    context.db.prepare("SELECT COUNT(*) AS count FROM password_change_attempts WHERE outcome = 'cancelled'").get().count,
    1
  );

  context.cleanup();
});

test('self-service password change rejects a new password that matches the current password', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);

  await agent
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' })
    .expect(302);

  const response = await agent
    .post('/account/security/password-change')
    .type('form')
    .send({ currentPassword: 'CorrectPass!234', newPassword: 'CorrectPass!234' });

  assert.equal(response.status, 400);
  assert.match(response.text, /Choose a password different from your current password/);

  const loginResponse = await request(context.app)
    .post('/login')
    .type('form')
    .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' });
  assert.equal(loginResponse.status, 302);

  context.cleanup();
});
