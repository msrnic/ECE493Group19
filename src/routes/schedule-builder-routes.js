const express = require('express');

const { createScheduleBuilderController } = require('../controllers/schedule-builder-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createScheduleBuilderRoutes(services) {
  const router = express.Router();
  const controller = createScheduleBuilderController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/schedule-builder',
    sessionModel: services.sessionModel
  });

  router.get('/schedule-builder', requireAuth, controller.getPage);
  router.post('/schedule-builder', requireAuth, controller.postAction);

  return router;
}

module.exports = { createScheduleBuilderRoutes };
