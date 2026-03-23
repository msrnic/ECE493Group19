const express = require('express');

const { createRequireAuth } = require('../middleware/require-auth');
const { createAuthController } = require('../controllers/auth-controller');
const { createDashboardController } = require('../controllers/dashboard-controller');
const { createHomeController } = require('../controllers/home-controller');
const { createPasswordController } = require('../controllers/password-controller');

function createAuthRoutes(services) {
  const router = express.Router();
  const authController = createAuthController(services);
  const dashboardController = createDashboardController(services);
  const homeController = createHomeController();
  const passwordController = createPasswordController(services);
  const requireAuth = createRequireAuth({ sessionModel: services.sessionModel });

  router.get('/', homeController.getHomePage);
  router.get('/login', authController.getLoginPage);
  router.post('/login', authController.postLogin);
  router.get('/dashboard', requireAuth, dashboardController.getDashboard);
  router.post('/logout', requireAuth, authController.postLogout);
  router.get('/account/security/password-change', requireAuth, passwordController.getChangePasswordPage);
  router.post('/account/security/password-change', requireAuth, passwordController.postChangePassword);
  router.get('/auth/reset-password', passwordController.getResetPasswordPage);
  router.post('/auth/reset-password/confirm', passwordController.postResetPassword);
  router.get('/admin/users/:userId/password', requireAuth, passwordController.getAdminPasswordPage);
  router.post('/admin/users/:userId/password', requireAuth, passwordController.postAdminPasswordChange);

  if (typeof services.resetFixtures === 'function') {
    router.post('/__reset-e2e', async (req, res, next) => {
      try {
        await services.resetFixtures();
        return res.status(204).end();
      } catch (error) {
        return next(error);
      }
    });
  }

  return router;
}

module.exports = { createAuthRoutes };
