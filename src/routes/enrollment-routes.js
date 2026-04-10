const express = require('express');

const { createEnrollmentController } = require('../controllers/enrollment-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createEnrollmentRoutes(services) {
  const router = express.Router();
  const controller = createEnrollmentController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/enrollment',
    sessionModel: services.sessionModel
  });

  router.get('/enrollment', requireAuth, controller.getEnrollmentPage);
  router.post('/enrollment', requireAuth, controller.postEnrollment);
  router.get('/enrollment/waitlist/:offeringId', requireAuth, controller.getWaitlistPage);
  router.post('/enrollment/waitlist/:offeringId', requireAuth, controller.postWaitlist);
  router.get('/enrollment/remove/:offeringId', requireAuth, controller.getRemovalPage);
  router.post('/enrollment/remove/:offeringId', requireAuth, controller.postRemoval);
  router.get('/enrollment/withdraw/:offeringId', requireAuth, controller.getWithdrawalPage);
  router.post('/enrollment/withdraw/:offeringId', requireAuth, controller.postWithdrawal);

  return router;
}

module.exports = { createEnrollmentRoutes };
