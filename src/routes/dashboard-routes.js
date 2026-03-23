const express = require('express');

const { createDashboardController } = require('../controllers/dashboard-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createDashboardRoutes(services) {
  const router = express.Router();
  const dashboardController = createDashboardController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/dashboard',
    sessionModel: services.sessionModel
  });

  router.get('/dashboard', requireAuth, dashboardController.getDashboard);
  router.post('/dashboard/retry', requireAuth, dashboardController.postRetry);

  return router;
}

module.exports = { createDashboardRoutes };
