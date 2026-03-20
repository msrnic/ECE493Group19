const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { getDb, closeAll } = require('../../src/db/connection');
const { applySchema } = require('../../src/db/migrations/apply-schema');
const { seedLoginFixtures } = require('../../src/db/migrations/seed-login-fixtures');
const { createAccountModel } = require('../../src/models/account-model');
const { createCourseModel } = require('../../src/models/course-model');
const { createLoginAttemptModel } = require('../../src/models/login-attempt-model');
const { createSessionModel } = require('../../src/models/session-model');
const { renderHtml } = require('../../src/views/render');

function buildDb() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc02-models-'));
  const dbPath = path.join(tempDir, 'sis.db');
  applySchema(dbPath);
  seedLoginFixtures(dbPath);
  return { db: getDb(dbPath), tempDir };
}

test('models provide account, course, attempt, and session operations', () => {
  const { db, tempDir } = buildDb();
  const accountModel = createAccountModel(db);
  const courseModel = createCourseModel(db);
  const loginAttemptModel = createLoginAttemptModel(db);
  const sessionModel = createSessionModel(db);

  const account = accountModel.findByIdentifier('userA@example.com');
  assert.equal(account.username, 'userA');
  assert.equal(accountModel.findByIdentifier('missing@example.com'), null);

  const dashboardAccount = accountModel.getDashboardAccount(account.id);
  assert.equal(dashboardAccount.courses.length, 2);
  assert.equal(courseModel.listCoursesForAccount(account.id).length, 2);

  loginAttemptModel.recordAttempt({
    accountId: account.id,
    attemptedAt: '2026-03-07T12:00:00.000Z',
    identifier: 'userA@example.com',
    outcome: 'invalid_credentials',
    sourceIp: '127.0.0.1',
    userAgent: 'unit-test'
  });

  assert.equal(loginAttemptModel.listAttemptsForAccount(account.id).length >= 1, true);
  assert.equal(
    loginAttemptModel.countOutcomeForAccountSince(
      account.id,
      'invalid_credentials',
      '2026-03-07T11:00:00.000Z'
    ) >= 1,
    true
  );

  const session = sessionModel.createSession({
    id: 'session-1',
    accountId: account.id,
    createdAt: '2026-03-07T12:00:00.000Z',
    expiresAt: '2026-03-07T13:00:00.000Z'
  });
  assert.equal(session.id, 'session-1');
  assert.equal(sessionModel.findActiveSession('session-1').account_id, account.id);

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});

test('renderHtml escapes values and leaves html fragments for course lists', () => {
  const templatePath = path.resolve(__dirname, '../../src/views/dashboard.html');
  const html = renderHtml(templatePath, {
    course_list: '<li>Safe HTML</li>',
    session_created_at: '<unsafe>',
    username: 'User <A>'
  });

  assert.match(html, /User &lt;A&gt;/);
  assert.match(html, /&lt;unsafe&gt;/);
  assert.match(html, /<li>Safe HTML<\/li>/);
});
