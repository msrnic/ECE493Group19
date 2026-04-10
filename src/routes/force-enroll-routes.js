const express = require('express');

const { createForceEnrollController } = require('../controllers/force-enroll-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createForceEnrollRoutes(services) {
  const router = express.Router();
  const controller = createForceEnrollController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/admin/force-enroll',
    sessionModel: services.sessionModel
  });

  router.get('/admin/force-enroll', requireAuth, controller.getForceEnrollPage);
  router.post('/admin/force-enroll', requireAuth, controller.postForceEnroll);
  router.post('/admin/force-enroll/:requestId/confirm', requireAuth, controller.postConfirmForceEnroll);
  router.get('/api/force-enroll/requests/:requestId', requireAuth, controller.getRequestStatus);
  router.post('/api/force-enroll/requests', requireAuth, controller.postForceEnroll);
  router.post(
    '/api/force-enroll/requests/:requestId/confirm-over-capacity',
    requireAuth,
    controller.postConfirmForceEnroll
  );

  return router;
}

module.exports = { createForceEnrollRoutes };
