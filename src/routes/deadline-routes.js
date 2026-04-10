const express = require('express');

const { createDeadlineController } = require('../controllers/deadline-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createDeadlineRoutes(services) {
  const router = express.Router();
  const controller = createDeadlineController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/deadlines/drop',
    sessionModel: services.sessionModel
  });

  router.get('/deadlines/drop', requireAuth, controller.getDropDeadlinePage);
  router.post('/deadlines/drop', requireAuth, controller.postDropDeadlineEvaluation);

  return router;
}

module.exports = { createDeadlineRoutes };
