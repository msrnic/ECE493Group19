const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { createApp } = require('../../src/app');
const { getDb, closeAll } = require('../../src/db/connection');
const { applySchema } = require('../../src/db/migrations/apply-schema');
const { createAuthController } = require('../../src/controllers/auth-controller');
const { createDashboardController } = require('../../src/controllers/dashboard-controller');
const { createSessionMiddleware } = require('../../src/middleware/session-middleware');
const loginOutcomes = require('../../src/services/login-outcomes');

test('createApp throws without a database and uses default now/session settings when provided a db', () => {
  assert.throws(() => createApp(), /database connection/);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc02-app-'));
  const dbPath = path.join(tempDir, 'sis.db');
  applySchema(dbPath);
  const app = createApp({ db: getDb(dbPath) });

  assert.ok(app.locals.services.now() instanceof Date);
  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});

test('migration entrypoints apply schema and seed fixtures from the command line', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uc02-cli-'));
  const dbPath = path.join(tempDir, 'sis.db');
  const applyPath = path.resolve(__dirname, '../../src/db/migrations/apply-schema.js');
  const seedPath = path.resolve(__dirname, '../../src/db/migrations/seed-login-fixtures.js');

  const applyResult = spawnSync(process.execPath, [applyPath, dbPath], { encoding: 'utf8' });
  assert.equal(applyResult.status, 0);
  assert.match(applyResult.stdout, /Applied schema/);

  const seedResult = spawnSync(process.execPath, [seedPath, dbPath], { encoding: 'utf8' });
  assert.equal(seedResult.status, 0);
  assert.match(seedResult.stdout, /Seeded login fixtures/);

  const db = getDb(dbPath);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM accounts').get().count, 4);

  closeAll();
  fs.rmSync(tempDir, { force: true, recursive: true });
});

test('auth controller forwards session save failures to next', async () => {
  const controller = createAuthController({
    now: () => new Date('2026-03-07T12:00:00.000Z'),
    authService: {
      async authenticate() {
        return {
          outcome: loginOutcomes.SUCCESS,
          account: { id: 7, username: 'userA' }
        };
      }
    }
  });

  const error = new Error('session save failed');
  const req = {
    body: { identifier: 'userA@example.com', password: 'CorrectPass!234' },
    sessionID: 'session-1',
    ip: '127.0.0.1',
    get() {
      return 'unit-test';
    },
    session: {
      save(callback) {
        callback(error);
      }
    }
  };

  let forwardedError = null;
  await controller.postLogin(
    req,
    {
      redirect() {
        throw new Error('redirect should not be reached');
      },
      status() {
        throw new Error('status should not be reached');
      }
    },
    (receivedError) => {
      forwardedError = receivedError;
    }
  );

  assert.equal(forwardedError, error);
});

test('dashboard controller renders fallback text when there are no courses or session metadata', () => {
  const controller = createDashboardController({
    accountModel: {
      getDashboardAccount() {
        return { username: 'userA', courses: [] };
      }
    },
    sessionModel: {
      findActiveSession() {
        return null;
      }
    }
  });

  let responseBody = '';
  controller.getDashboard(
    { session: { accountId: 1 }, sessionID: 'missing-session' },
    {
      status(statusCode) {
        assert.equal(statusCode, 200);
        return this;
      },
      send(body) {
        responseBody = body;
        return body;
      }
    }
  );

  assert.match(responseBody, /No courses are assigned/);
  assert.match(responseBody, /Session metadata unavailable/);
});

test('session middleware supports both default and explicit secrets', () => {
  assert.equal(typeof createSessionMiddleware(), 'function');
  assert.equal(typeof createSessionMiddleware({ secret: 'override-secret' }), 'function');
});
