const express = require('express');
const path = require('path');

const { createSessionMiddleware } = require('./middleware/session-middleware');
const { createAuthRoutes } = require('./routes/auth-routes');
const { createAccountModel } = require('./models/account-model');
const { createCourseModel } = require('./models/course-model');
const { createLoginAttemptModel } = require('./models/login-attempt-model');
const { createSessionModel } = require('./models/session-model');
const { createAuthAuditService } = require('./services/auth-audit-service');
const { createLockoutService } = require('./services/lockout-service');
const { createAuthService } = require('./services/auth-service');

function createApp(options = {}) {
  const {
    db,
    now = () => new Date(),
    sessionSecret = process.env.SESSION_SECRET || 'development-session-secret',
    unavailableIdentifiers = []
  } = options;

  if (!db) {
    throw new Error('createApp requires a database connection.');
  }

  const accountModel = createAccountModel(db);
  const courseModel = createCourseModel(db);
  const loginAttemptModel = createLoginAttemptModel(db);
  const sessionModel = createSessionModel(db);
  const authAuditService = createAuthAuditService(loginAttemptModel, now);
  const lockoutService = createLockoutService({ now });
  const authService = createAuthService({
    accountModel,
    sessionModel,
    authAuditService,
    lockoutService,
    now,
    unavailableIdentifiers
  });

  const app = express();
  app.disable('x-powered-by');
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.resolve(__dirname, '../public')));
  app.use(createSessionMiddleware({ secret: sessionSecret }));

  app.locals.services = {
    accountModel,
    courseModel,
    sessionModel,
    authService,
    authAuditService,
    lockoutService,
    now
  };

  app.use(createAuthRoutes(app.locals.services));

  return app;
}

module.exports = { createApp };
