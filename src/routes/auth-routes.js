const express = require('express');

const { createRequireAuth } = require('../middleware/require-auth');
const { createAuthController } = require('../controllers/auth-controller');
const { createDashboardController } = require('../controllers/dashboard-controller');
const { createHomeController } = require('../controllers/home-controller');

function createAuthRoutes(services) {
  const router = express.Router();
  const authController = createAuthController(services);
  const dashboardController = createDashboardController(services);
  const homeController = createHomeController();
  const requireAuth = createRequireAuth();

  router.get('/', homeController.getHomePage);
  router.get('/login', authController.getLoginPage);
  router.post('/login', authController.postLogin);
  router.get('/dashboard', requireAuth, dashboardController.getDashboard);

  return router;
}

module.exports = { createAuthRoutes };
