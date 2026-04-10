const express = require('express');
const path = require('path');

const { createSessionMiddleware } = require('./middleware/session-middleware');
const { createAuthRoutes } = require('./routes/auth-routes');
const { createAdminAccountRoutes } = require('./routes/admin-account-routes');
const { createDashboardRoutes } = require('./routes/dashboard-routes');
const { createScheduleBuilderRoutes } = require('./routes/schedule-builder-routes');
const { createAccountModel } = require('./models/account-model');
const { createCourseModel } = require('./models/course-model');
const { createCourseRosterModel } = require('./models/course-roster-model');
const { createDashboardLoadModel } = require('./models/dashboard-load-model');
const { createDashboardSectionModel } = require('./models/dashboard-section-model');
const { createDashboardSectionStateModel } = require('./models/dashboard-section-state-model');
const { createEnrollmentModel } = require('./models/enrollment-model');
const { createForceEnrollModel } = require('./models/force-enroll-model');
const { createForceWithdrawalModel } = require('./models/force-withdrawal-model');
const { createDeadlineRuleModel } = require('./models/deadline-rule-model');
const { createFinancialTransactionModel } = require('./models/financial-transaction-model');
const { createFinancialSummaryModel } = require('./models/financial-summary-model');
const { createInboxModel } = require('./models/inbox-model');
const { createContactInfoModel } = require('./models/contact-info-model');
const { createLoginAttemptModel } = require('./models/login-attempt-model');
const { createModuleModel } = require('./models/module-model');
const { createPaymentMethodModel } = require('./models/payment-method-model');
const { createNotificationModel } = require('./models/notification-model');
const { createNotificationAttemptModel } = require('./models/notification-attempt-model');
const { createPasswordChangeAttemptModel } = require('./models/password-change-attempt-model');
const { createPersonalDetailsModel } = require('./models/personal-details-model');
const { createResetTokenModel } = require('./models/reset-token-model');
const { createRoleModel } = require('./models/role-model');
const { createScheduleBuilderModel } = require('./models/schedule-builder-model');
const { createSessionModel } = require('./models/session-model');
const { createStudentAccountModel } = require('./models/student-account-model');
const { createUserAccountModel } = require('./models/user-account-model');
const { createVerificationCooldownModel } = require('./models/verification-cooldown-model');
const { createClassOfferingModel } = require('./models/class-offering-model');
const { createOfferingAdminModel } = require('./models/offering-admin-model');
const { createCourseCapacityModel } = require('./models/course-capacity-model');
const { createAccountCreationService } = require('./services/account-creation-service');
const { createAuthAuditService } = require('./services/auth-audit-service');
const { createAuthService } = require('./services/auth-service');
const { createCooldownService } = require('./services/cooldown-service');
const { createEnrollmentService } = require('./services/enrollment-service');
const { createDeadlinePolicyService } = require('./services/deadline-policy-service');
const { createForceEnrollService } = require('./services/force-enroll-service');
const { createForceWithdrawalService } = require('./services/force-withdrawal-service');
const { createLockoutService } = require('./services/lockout-service');
const { createBankingNetworkService } = require('./services/banking-network-service');
const { createAdminNotificationService } = require('./services/admin-notification-service');
const { createInboxService } = require('./services/inbox-service');
const { createNotificationService } = require('./services/notification-service');
const { createPaymentTokenizationService } = require('./services/payment-tokenization-service');
const { createPaymentStatusService } = require('./services/payment-status-service');
const { createPasswordChangeService } = require('./services/password-change-service');
const { createPasswordPolicyService } = require('./services/password-policy-service');
const { createScheduleBuilderService } = require('./services/schedule-builder-service');
const { createSessionSecurityService } = require('./services/session-security-service');
const { createClassSearchService } = require('./services/class-search-service');
const { createCourseRosterService } = require('./services/course-roster-service');
const { createOfferingAdminService } = require('./services/offering-admin-service');
const { createCourseCapacityService } = require('./services/course-capacity-service');
const { createProfileRoutes } = require('./routes/profile-routes');
const { createEnrollmentRoutes } = require('./routes/enrollment-routes');
const { createDeadlineRoutes } = require('./routes/deadline-routes');
const { createInboxRoutes } = require('./routes/inbox-routes');
const { createPaymentMethodsRoutes } = require('./routes/payment-methods-routes');
const { createTransactionHistoryRoutes } = require('./routes/transaction-history-routes');
const { createAdminNotificationsRoutes } = require('./routes/admin-notifications-routes');
const { createClassSearchRoutes } = require('./routes/class-search-routes');
const { createCourseRosterRoutes } = require('./routes/course-roster-routes');
const { createForceEnrollRoutes } = require('./routes/force-enroll-routes');
const { createForceWithdrawalRoutes } = require('./routes/force-withdrawal-routes');
const { createOfferingAdminRoutes } = require('./routes/offering-admin-routes');
const { createCourseCapacityRoutes } = require('./routes/course-capacity-routes');

function createApp(options = {}) {
  const {
    db,
    accountCreationTestState = {
      createFailureIdentifiers: [],
      notificationFailureIdentifiers: [],
      notificationsEnabled: true
    },
    now = () => new Date(),
    profileTestState = { contactSaveFailureIdentifiers: [], personalSaveFailureIdentifiers: [] },
    resetFixtures,
    scheduleBuilderTestState = {
      constraintSaveFailureIdentifiers: [],
      dataUnavailableIdentifiers: [],
      generationFailureIdentifiers: [],
      presetRenameFailureIdentifiers: [],
      presetSaveFailureIdentifiers: [],
      timeoutAfterResultsIdentifiers: [],
      timeoutBeforeResultsIdentifiers: []
    },
    enrollmentTestState = {
      capacityUnavailableIdentifiers: [],
      failureIdentifiers: [],
      removalFailureIdentifiers: [],
      remainingSeatsUnavailableIdentifiers: [],
      waitlistClosedTermIdentifiers: [],
      waitlistFailureIdentifiers: [],
      withdrawalFailureIdentifiers: []
    },
    deadlineTestState = {
      failureIdentifiers: []
    },
    classSearchTestState = { failureIdentifiers: [] },
    courseRosterTestState = { failureIdentifiers: [] },
    forceEnrollTestState = { failureIdentifiers: [] },
    forceWithdrawalTestState = { auditFailureIdentifiers: [], failureIdentifiers: [] },
    offeringAdminTestState = {
      auditFailureIdentifiers: [],
      capacityFailureIdentifiers: [],
      createFailureIdentifiers: [],
      deleteFailureIdentifiers: []
    },
    courseCapacityTestState = {
      failureIdentifiers: []
    },
    inboxTestState = { deliveryFailureIdentifiers: ['outage.user@example.com'] },
    adminNotificationTestState = { loggingFailureSubjects: [] },
    transactionHistoryTestState = { retrievalFailureIdentifiers: [] },
    sessionSecret = process.env.SESSION_SECRET || 'development-session-secret',
    simulatedPasswordChangeFailureIdentifiers = [],
    unavailableIdentifiers = [],
    dashboardTestState = { roleFailureIdentifiers: [], unavailableSectionsByIdentifier: {} }
  } = options;

  if (!db) {
    throw new Error('createApp requires a database connection.');
  }

  const accountModel = createAccountModel(db);
  const contactInfoModel = createContactInfoModel(db);
  const classOfferingModel = createClassOfferingModel(db);
  const courseModel = createCourseModel(db);
  const courseRosterModel = createCourseRosterModel(db);
  const dashboardLoadModel = createDashboardLoadModel(db);
  const dashboardSectionModel = createDashboardSectionModel(db);
  const dashboardSectionStateModel = createDashboardSectionStateModel(db);
  const deadlineRuleModel = createDeadlineRuleModel(db);
  const enrollmentModel = createEnrollmentModel(db);
  const financialTransactionModel = createFinancialTransactionModel(db);
  const financialSummaryModel = createFinancialSummaryModel(db);
  const forceEnrollModel = createForceEnrollModel(db);
  const forceWithdrawalModel = createForceWithdrawalModel(db);
  const offeringAdminModel = createOfferingAdminModel(db);
  const courseCapacityModel = createCourseCapacityModel(db);
  const inboxModel = createInboxModel(db);
  const loginAttemptModel = createLoginAttemptModel(db);
  const moduleModel = createModuleModel(db);
  const paymentMethodModel = createPaymentMethodModel(db);
  const notificationModel = createNotificationModel(db);
  const notificationAttemptModel = createNotificationAttemptModel(db);
  const passwordChangeAttemptModel = createPasswordChangeAttemptModel(db);
  const personalDetailsModel = createPersonalDetailsModel(db);
  const resetTokenModel = createResetTokenModel(db);
  const roleModel = createRoleModel(db);
  const scheduleBuilderModel = createScheduleBuilderModel(db);
  const sessionModel = createSessionModel(db);
  const studentAccountModel = createStudentAccountModel(db);
  const userAccountModel = createUserAccountModel(db);
  const verificationCooldownModel = createVerificationCooldownModel(db);
  const authAuditService = createAuthAuditService(loginAttemptModel, now);
  const bankingNetworkService = createBankingNetworkService();
  const deadlinePolicyService = createDeadlinePolicyService({
    deadlineRuleModel,
    deadlineTestState,
    enrollmentModel,
    now
  });
  const enrollmentService = createEnrollmentService({
    deadlinePolicyService,
    enrollmentModel,
    enrollmentTestState,
    now
  });
  const lockoutService = createLockoutService({ now });
  const passwordPolicyService = createPasswordPolicyService();
  const cooldownService = createCooldownService({ now, verificationCooldownModel });
  const sessionSecurityService = createSessionSecurityService({ now, sessionModel });
  const notificationService = createNotificationService({
    accountCreationTestState,
    notificationAttemptModel,
    notificationModel,
    now
  });
  const inboxService = createInboxService({
    inboxModel,
    inboxTestState,
    now,
    studentAccountModel
  });
  const adminNotificationService = createAdminNotificationService({
    accountModel,
    adminNotificationTestState,
    inboxModel,
    inboxService,
    now,
    studentAccountModel
  });
  const paymentTokenizationService = createPaymentTokenizationService();
  const paymentStatusService = createPaymentStatusService({
    financialTransactionModel,
    now,
    transactionHistoryTestState
  });
  const accountCreationService = createAccountCreationService({
    accountCreationTestState,
    accountModel,
    notificationService,
    now,
    passwordPolicyService,
    roleModel,
    userAccountModel
  });
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
  const scheduleBuilderService = createScheduleBuilderService({
    accountModel,
    now,
    roleModel,
    scheduleBuilderModel,
    scheduleBuilderTestState
  });
  const classSearchService = createClassSearchService({
    classOfferingModel,
    classSearchTestState,
    now
  });
  const courseRosterService = createCourseRosterService({
    courseRosterModel,
    courseRosterTestState,
    now
  });
  const forceEnrollService = createForceEnrollService({
    accountModel,
    enrollmentModel,
    forceEnrollModel,
    forceEnrollTestState,
    now
  });
  const forceWithdrawalService = createForceWithdrawalService({
    accountModel,
    enrollmentModel,
    forceWithdrawalModel,
    forceWithdrawalTestState,
    now
  });
  const offeringAdminService = createOfferingAdminService({
    accountModel,
    now,
    offeringAdminModel,
    offeringAdminTestState
  });
  const courseCapacityService = createCourseCapacityService({
    accountModel,
    courseCapacityModel,
    courseCapacityTestState,
    now
  });

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.resolve(__dirname, '../public')));
  app.use(createSessionMiddleware({ secret: sessionSecret }));

  app.locals.services = {
    accountCreationService,
    accountCreationTestState,
    accountModel,
    authAuditService,
    authService,
    bankingNetworkService,
    classOfferingModel,
    classSearchService,
    classSearchTestState,
    courseRosterModel,
    courseRosterService,
    courseRosterTestState,
    contactInfoModel,
    cooldownService,
    courseModel,
    courseCapacityModel,
    courseCapacityService,
    dashboardLoadModel,
    dashboardSectionModel,
    dashboardSectionStateModel,
    dashboardTestState,
    deadlinePolicyService,
    deadlineRuleModel,
    deadlineTestState,
    enrollmentModel,
    enrollmentService,
    enrollmentTestState,
    financialTransactionModel,
    financialSummaryModel,
    forceEnrollModel,
    forceEnrollService,
    forceEnrollTestState,
    forceWithdrawalModel,
    forceWithdrawalService,
    forceWithdrawalTestState,
    offeringAdminModel,
    offeringAdminService,
    offeringAdminTestState,
    courseCapacityTestState,
    adminNotificationService,
    adminNotificationTestState,
    inboxModel,
    inboxService,
    inboxTestState,
    lockoutService,
    moduleModel,
    notificationModel,
    notificationAttemptModel,
    notificationService,
    now,
    passwordChangeAttemptModel,
    passwordChangeService,
    passwordPolicyService,
    paymentMethodModel,
    paymentTokenizationService,
    paymentStatusService,
    personalDetailsModel,
    profileTestState,
    resetFixtures,
    resetTokenModel,
    roleModel,
    scheduleBuilderModel,
    scheduleBuilderService,
    scheduleBuilderTestState,
    sessionModel,
    sessionSecurityService,
    studentAccountModel,
    transactionHistoryTestState,
    userAccountModel,
    verificationCooldownModel
  };

  app.use(createAuthRoutes(app.locals.services));
  app.use(createAdminAccountRoutes(app.locals.services));
  app.use(createAdminNotificationsRoutes(app.locals.services));
  app.use(createClassSearchRoutes(app.locals.services));
  app.use(createCourseRosterRoutes(app.locals.services));
  app.use(createCourseCapacityRoutes(app.locals.services));
  app.use(createDeadlineRoutes(app.locals.services));
  app.use(createDashboardRoutes(app.locals.services));
  app.use(createEnrollmentRoutes(app.locals.services));
  app.use(createForceEnrollRoutes(app.locals.services));
  app.use(createForceWithdrawalRoutes(app.locals.services));
  app.use(createOfferingAdminRoutes(app.locals.services));
  app.use(createInboxRoutes(app.locals.services));
  app.use(createPaymentMethodsRoutes(app.locals.services));
  app.use(createProfileRoutes(app.locals.services));
  app.use(createScheduleBuilderRoutes(app.locals.services));
  app.use(createTransactionHistoryRoutes(app.locals.services));

  return app;
}

module.exports = { createApp };
