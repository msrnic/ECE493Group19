const express = require('express');

const { createAdminAccountController } = require('../controllers/admin-account-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createAdminAccountRoutes(services) {
  const router = express.Router();
  const adminAccountController = createAdminAccountController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/admin/users/new',
    sessionModel: services.sessionModel
  });

  router.get('/admin/users/new', requireAuth, adminAccountController.getCreateUserPage);
  router.post('/admin/users', requireAuth, adminAccountController.postCreateUser);
  router.get('/api/admin/accounts/form-metadata', requireAuth, adminAccountController.getFormMetadata);
  router.post('/api/admin/accounts', requireAuth, adminAccountController.postCreateUser);

  return router;
}

module.exports = { createAdminAccountRoutes };
