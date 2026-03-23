const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { createAuthController } = require('../../src/controllers/auth-controller');
const { closeAll, getDb } = require('../../src/db/connection');
const { applySchema } = require('../../src/db/migrations/apply-schema');
const { seedLoginFixtures } = require('../../src/db/migrations/seed-login-fixtures');
const { createRequireAuth, sanitizeReturnTo } = require('../../src/middleware/require-auth');
const { createCourseModel } = require('../../src/models/course-model');
const { createDashboardLoadModel } = require('../../src/models/dashboard-load-model');
const { createLoginAttemptModel } = require('../../src/models/login-attempt-model');
const loginOutcomes = require('../../src/services/login-outcomes');

function buildTempDb() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc03-auth-model-'));
  const dbPath = path.join(tempDir, 'sis.db');
  applySchema(dbPath);
  seedLoginFixtures(dbPath);
  return { db: getDb(dbPath), tempDir };
}

test('requireAuth sanitizes invalid returnTo values and covers JSON, redirect, and next branches', () => {
  assert.equal(sanitizeReturnTo(undefined), '/dashboard');
  assert.equal(sanitizeReturnTo('https://example.com/dashboard'), '/dashboard');
  assert.equal(sanitizeReturnTo('//example.com/dashboard'), '/dashboard');
  assert.equal(sanitizeReturnTo('/dashboard#security-center'), '/dashboard#security-center');

  const jsonMiddleware = createRequireAuth({
    returnTo: '//malicious.example',
    sessionModel: {
      findActiveSession() {
        return null;
      }
    }
  });

  let nextCalled = false;
  let payload = null;
  let statusCode = null;
  jsonMiddleware(
    {
      headers: { accept: 'application/json' },
      sessionID: 'revoked-session'
    },
    {
      status(code) {
        statusCode = code;
        return {
          json(body) {
            payload = body;
            return body;
          }
        };
      }
    },
    () => {
      nextCalled = true;
    }
  );

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 401);
  assert.deepEqual(payload, {
    loginUrl: '/login',
    returnTo: '/dashboard',
    status: 'auth_error'
  });

  let redirectPath = '';
  createRequireAuth({
    sessionModel: {
      findActiveSession() {
        return null;
      }
    }
  })(
    {
      session: { accountId: 7 },
      sessionID: 'stale-session'
    },
    {
      redirect(pathname) {
        redirectPath = pathname;
        return pathname;
      }
    },
    () => {
      throw new Error('next should not be reached for stale sessions');
    }
  );
  assert.equal(redirectPath, '/login?returnTo=%2Fdashboard');

  let nextReached = false;
  createRequireAuth({
    sessionModel: {
      findActiveSession() {
        return { account_id: 7 };
      }
    }
  })(
    {
      session: { accountId: 7 },
      sessionID: 'active-session'
    },
    {},
    () => {
      nextReached = true;
    }
  );
  assert.equal(nextReached, true);
});

test('auth controller sanitizes unsafe returnTo values for rendering, validation, and successful redirects', async () => {
  const controller = createAuthController({
    authService: {
      async authenticate() {
        return {
          account: { id: 1, username: 'userA' },
          outcome: loginOutcomes.SUCCESS
        };
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });

  let renderedHtml = '';
  controller.getLoginPage(
    {
      query: { returnTo: 'https://example.com/dashboard' }
    },
    {
      status(statusCode) {
        assert.equal(statusCode, 200);
        return this;
      },
      send(body) {
        renderedHtml = body;
        return body;
      }
    }
  );
  assert.match(renderedHtml, /name="returnTo" value="\/dashboard"/);

  let validationHtml = '';
  await controller.postLogin(
    {
      body: {
        identifier: 'userA@example.com',
        password: '',
        returnTo: '//example.com/dashboard'
      },
      get() {
        return 'auth-model-edges';
      },
      ip: '127.0.0.1',
      sessionID: 'session-validation'
    },
    {
      status(statusCode) {
        assert.equal(statusCode, 400);
        return this;
      },
      send(body) {
        validationHtml = body;
        return body;
      }
    },
    (error) => {
      throw error;
    }
  );
  assert.match(validationHtml, /Both username\/email and password are required\./);
  assert.match(validationHtml, /name="returnTo" value="\/dashboard"/);

  let redirectPath = '';
  await controller.postLogin(
    {
      body: {
        identifier: 'userA@example.com',
        password: 'CorrectPass!234',
        returnTo: '//example.com/dashboard'
      },
      get() {
        return 'auth-model-edges';
      },
      ip: '127.0.0.1',
      session: {
        save(callback) {
          callback();
        }
      },
      sessionID: 'session-1'
    },
    {
      redirect(pathname) {
        redirectPath = pathname;
        return pathname;
      }
    },
    (error) => {
      throw error;
    }
  );

  assert.equal(redirectPath, '/dashboard');
});

test('course and login-attempt models expose retrieval helpers for seeded data and recorded attempts', () => {
  const { db, tempDir } = buildTempDb();
  const courseModel = createCourseModel(db);
  const loginAttemptModel = createLoginAttemptModel(db);
  const accountId = db.prepare('SELECT id FROM accounts WHERE email = ?').get('userA@example.com').id;

  const courses = courseModel.listCoursesForAccount(accountId);
  assert.equal(courses.length, 2);
  assert.equal(courses[0].course_code, 'CMPUT301');

  loginAttemptModel.recordAttempt({
    accountId,
    attemptedAt: '2026-03-07T12:00:00.000Z',
    identifier: 'userA@example.com',
    outcome: 'invalid_credentials',
    sourceIp: '127.0.0.1',
    userAgent: 'unit-test'
  });
  loginAttemptModel.recordAttempt({
    accountId,
    attemptedAt: '2026-03-07T12:05:00.000Z',
    identifier: 'userA@example.com',
    outcome: 'success',
    sourceIp: '127.0.0.1',
    userAgent: 'unit-test'
  });

  const attempts = loginAttemptModel.listAttemptsForAccount(accountId);
  assert.equal(attempts.length >= 2, true);
  assert.equal(
    loginAttemptModel.countOutcomeForAccountSince(accountId, 'invalid_credentials', '2026-03-07T11:59:00.000Z') >= 1,
    true
  );
  assert.equal(
    loginAttemptModel.countOutcomeForAccountSince(accountId, 'success', '2026-03-07T12:01:00.000Z') >= 1,
    true
  );

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});

test('dashboard load model defaults missing durations to zero and supports implicit percentile lookups', () => {
  const { db, tempDir } = buildTempDb();
  const loadModel = createDashboardLoadModel(db);
  const accountId = db.prepare('SELECT id FROM accounts WHERE email = ?').get('userA@example.com').id;

  loadModel.recordEvent({
    accountId,
    attemptedSections: 1,
    failedSections: 0,
    occurredAt: '2026-03-07T12:40:00.000Z',
    outcome: 'success',
    requestType: 'retry',
    successfulSections: 1
  });

  const events = loadModel.listEventsForAccount(accountId);
  const retryEvent = events.find((event) => event.request_type === 'retry');
  assert.equal(retryEvent.duration_ms, 0);

  const summary = loadModel.getPerformanceSummary('retry');
  assert.equal(summary.percentile, 95);
  assert.equal(summary.sampleSize >= 1, true);
  assert.notEqual(summary.valueMs, null);

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});

test('auth controller uses the session returnTo value when request inputs omit it', async () => {
  const controller = createAuthController({
    authService: {
      async authenticate() {
        return {
          account: { id: 7, username: 'userA' },
          outcome: loginOutcomes.SUCCESS
        };
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });

  let redirectPath = '';
  await controller.postLogin(
    {
      body: {
        identifier: 'userA@example.com',
        password: 'CorrectPass!234'
      },
      get() {
        return 'auth-model-edges';
      },
      ip: '127.0.0.1',
      session: {
        returnTo: '/dashboard#security-center',
        save(callback) {
          callback();
        }
      },
      sessionID: 'session-return-to'
    },
    {
      redirect(pathname) {
        redirectPath = pathname;
        return pathname;
      }
    },
    (error) => {
      throw error;
    }
  );

  assert.equal(redirectPath, '/dashboard#security-center');
});

test('auth controller falls back to an empty user-agent header when none is provided', async () => {
  let capturedUserAgent = null;
  const controller = createAuthController({
    authService: {
      async authenticate(details) {
        capturedUserAgent = details.userAgent;
        return {
          account: { id: 1, username: 'userA' },
          outcome: loginOutcomes.SUCCESS
        };
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });

  let redirectPath = '';
  await controller.postLogin(
    {
      body: {
        identifier: 'userA@example.com',
        password: 'CorrectPass!234'
      },
      get() {
        return '';
      },
      ip: '127.0.0.1',
      session: {
        save(callback) {
          callback();
        }
      },
      sessionID: 'session-user-agent'
    },
    {
      redirect(pathname) {
        redirectPath = pathname;
        return pathname;
      }
    },
    (error) => {
      throw error;
    }
  );

  assert.equal(capturedUserAgent, '');
  assert.equal(redirectPath, '/dashboard');
});

test('auth controller preserves session returnTo on the login page when no account is authenticated yet', () => {
  const controller = createAuthController({
    authService: {
      async authenticate() {
        throw new Error('authenticate should not be called while rendering the login page');
      }
    },
    now: () => new Date('2026-03-07T12:00:00.000Z')
  });

  const session = { returnTo: '/dashboard#financial-summary' };
  let renderedHtml = '';
  controller.getLoginPage(
    {
      session
    },
    {
      status(statusCode) {
        assert.equal(statusCode, 200);
        return this;
      },
      send(body) {
        renderedHtml = body;
        return body;
      }
    }
  );

  assert.equal(session.returnTo, '/dashboard#financial-summary');
  assert.match(renderedHtml, /name="returnTo" value="\/dashboard#financial-summary"/);
});
