const express = require('express');

const { createAdminNotificationsController } = require('../controllers/admin-notifications-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createAdminNotificationsRoutes(services) {
  const router = express.Router();
  const controller = createAdminNotificationsController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/admin/notifications',
    sessionModel: services.sessionModel
  });

  router.get('/admin/notifications', requireAuth, controller.getAdminNotificationsPage);
  router.post('/admin/notifications/preview', requireAuth, controller.postPreviewRecipients);
  router.post('/admin/notifications/send', requireAuth, controller.postSendNotification);
  router.post(
    '/admin/notifications/send-requests/:sendRequestId/retry',
    requireAuth,
    controller.postRetryFailedDeliveries
  );

  router.post(
    '/api/admin/notifications/preview-recipients',
    requireAuth,
    controller.postPreviewRecipients
  );
  router.post('/api/admin/notifications/send', requireAuth, controller.postSendNotification);
  router.get(
    '/api/admin/notifications/send-requests/:sendRequestId',
    requireAuth,
    controller.getSendSummary
  );
  router.post(
    '/api/admin/notifications/send-requests/:sendRequestId/retry',
    requireAuth,
    controller.postRetryFailedDeliveries
  );

  return router;
}

module.exports = { createAdminNotificationsRoutes };
