const express = require('express');
const path = require('path');

const { createSessionMiddleware } = require('./middleware/session-middleware');
const { createAuthRoutes } = require('./routes/auth-routes');
const { createDashboardRoutes } = require('./routes/dashboard-routes');
const { createAccountModel } = require('./models/account-model');
const { createCourseModel } = require('./models/course-model');
const { createDashboardLoadModel } = require('./models/dashboard-load-model');
const { createDashboardSectionModel } = require('./models/dashboard-section-model');
const { createDashboardSectionStateModel } = require('./models/dashboard-section-state-model');
const { createLoginAttemptModel } = require('./models/login-attempt-model');
const { createModuleModel } = require('./models/module-model');
const { createNotificationModel } = require('./models/notification-model');
const { createPasswordChangeAttemptModel } = require('./models/password-change-attempt-model');
const { createResetTokenModel } = require('./models/reset-token-model');
const { createRoleModel } = require('./models/role-model');
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
    unavailableIdentifiers = [],
    dashboardTestState = { roleFailureIdentifiers: [], unavailableSectionsByIdentifier: {} }
  } = options;

  if (!db) {
    throw new Error('createApp requires a database connection.');
  }

  const accountModel = createAccountModel(db);
  const courseModel = createCourseModel(db);
  const dashboardLoadModel = createDashboardLoadModel(db);
  const dashboardSectionModel = createDashboardSectionModel(db);
  const dashboardSectionStateModel = createDashboardSectionStateModel(db);
  const loginAttemptModel = createLoginAttemptModel(db);
  const moduleModel = createModuleModel(db);
  const notificationModel = createNotificationModel(db);
  const passwordChangeAttemptModel = createPasswordChangeAttemptModel(db);
  const resetTokenModel = createResetTokenModel(db);
  const roleModel = createRoleModel(db);
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
    dashboardLoadModel,
    dashboardSectionModel,
    dashboardSectionStateModel,
    dashboardTestState,
    lockoutService,
    moduleModel,
    notificationModel,
    notificationService,
    now,
    passwordChangeAttemptModel,
    passwordChangeService,
    passwordPolicyService,
    resetFixtures,
    resetTokenModel,
    roleModel,
    sessionModel,
    sessionSecurityService,
    verificationCooldownModel
  };

  app.use(createAuthRoutes(app.locals.services));
  app.use(createDashboardRoutes(app.locals.services));

  return app;
}

module.exports = { createApp };
