const express = require('express');

const { createOfferingAdminController } = require('../controllers/offering-admin-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createOfferingAdminRoutes(services) {
  const router = express.Router();
  const controller = createOfferingAdminController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/admin/offerings',
    sessionModel: services.sessionModel
  });

  router.get('/admin/offerings', requireAuth, controller.getOfferingPage);
  router.post('/admin/offerings', requireAuth, controller.postCreateOffering);
  router.post('/admin/offerings/:offeringId/delete', requireAuth, controller.postDeleteOffering);
  router.get('/api/offerings', requireAuth, controller.getOfferingPage);
  router.post('/api/offerings', requireAuth, controller.postCreateOffering);
  router.post('/api/offerings/:offeringId/delete', requireAuth, controller.postDeleteOffering);

  return router;
}

module.exports = { createOfferingAdminRoutes };
