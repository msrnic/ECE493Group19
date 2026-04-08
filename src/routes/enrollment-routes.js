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

  return router;
}

module.exports = { createEnrollmentRoutes };
