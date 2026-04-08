const express = require('express');

const { createInboxController } = require('../controllers/inbox-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createInboxRoutes(services) {
  const router = express.Router();
  const controller = createInboxController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/inbox',
    sessionModel: services.sessionModel
  });

  router.get('/inbox', requireAuth, controller.getInboxPage);

  return router;
}

module.exports = { createInboxRoutes };
