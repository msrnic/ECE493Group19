const express = require('express');
const path = require('path');

const { createSessionMiddleware } = require('./middleware/session-middleware');
const { createAuthRoutes } = require('./routes/auth-routes');
const { createAccountModel } = require('./models/account-model');
const { createCourseModel } = require('./models/course-model');
const { createLoginAttemptModel } = require('./models/login-attempt-model');
const { createNotificationModel } = require('./models/notification-model');
const { createPasswordChangeAttemptModel } = require('./models/password-change-attempt-model');
const { createResetTokenModel } = require('./models/reset-token-model');
const { createSessionModel } = require('./models/session-model');
const { createVerificationCooldownModel } = require('./models/verification-cooldown-model');
const { createAuthAuditService } = require('./services/auth-audit-service');
const { createAuthService } = require('./services/auth-service');
const { createCooldownService } = require('./services/cooldown-service');
const { createLockoutService } = require('./services/lockout-service');
const { createNotificationService } = require('./services/notification-service');
const { createPasswordChangeService } = require('./services/password-change-service');
const { createPasswordPolicyService } = require('./services/password-policy-service');
const { createSessionSecurityService } = require('./services/session-security-service');

function createApp(options = {}) {
  const {
    db,
    now = () => new Date(),
    resetFixtures,
    sessionSecret = process.env.SESSION_SECRET || 'development-session-secret',
    simulatedPasswordChangeFailureIdentifiers = [],
    unavailableIdentifiers = []
  } = options;

  if (!db) {
    throw new Error('createApp requires a database connection.');
  }

  const accountModel = createAccountModel(db);
  const courseModel = createCourseModel(db);
  const loginAttemptModel = createLoginAttemptModel(db);
  const notificationModel = createNotificationModel(db);
  const passwordChangeAttemptModel = createPasswordChangeAttemptModel(db);
  const resetTokenModel = createResetTokenModel(db);
  const sessionModel = createSessionModel(db);
  const verificationCooldownModel = createVerificationCooldownModel(db);
  const authAuditService = createAuthAuditService(loginAttemptModel, now);
  const lockoutService = createLockoutService({ now });
  const passwordPolicyService = createPasswordPolicyService();
  const cooldownService = createCooldownService({ now, verificationCooldownModel });
  const sessionSecurityService = createSessionSecurityService({ now, sessionModel });
  const notificationService = createNotificationService({ notificationModel, now });
  const authService = createAuthService({
    accountModel,
    sessionModel,
    authAuditService,
    lockoutService,
    now,
    unavailableIdentifiers
  });
  const passwordChangeService = createPasswordChangeService({
    accountModel,
    cooldownService,
    db,
    notificationService,
    now,
    passwordChangeAttemptModel,
    passwordPolicyService,
    resetTokenModel,
    sessionSecurityService,
    simulatedFailureIdentifiers: simulatedPasswordChangeFailureIdentifiers
  });

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.resolve(__dirname, '../public')));
  app.use(createSessionMiddleware({ secret: sessionSecret }));

  app.locals.services = {
    accountModel,
    authAuditService,
    authService,
    cooldownService,
    courseModel,
    lockoutService,
    notificationModel,
    notificationService,
    now,
    passwordChangeAttemptModel,
    passwordChangeService,
    passwordPolicyService,
    resetFixtures,
    resetTokenModel,
    sessionModel,
    sessionSecurityService,
    verificationCooldownModel
  };

  app.use(createAuthRoutes(app.locals.services));

  return app;
}

module.exports = { createApp };
