const express = require('express');

const { createForceWithdrawalController } = require('../controllers/force-withdrawal-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createForceWithdrawalRoutes(services) {
  const router = express.Router();
  const controller = createForceWithdrawalController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/admin/force-withdrawals',
    sessionModel: services.sessionModel
  });

  router.get('/admin/force-withdrawals', requireAuth, controller.getForceWithdrawalPage);
  router.get('/admin/force-withdrawals/implications', requireAuth, controller.getImplications);
  router.post('/admin/force-withdrawals', requireAuth, controller.postForceWithdrawal);
  router.get('/api/admin/force-withdrawals/implications', requireAuth, controller.getImplications);
  router.post('/api/admin/force-withdrawals', requireAuth, controller.postForceWithdrawal);
  router.get('/api/admin/force-withdrawals/:actionId', requireAuth, controller.getActionStatus);

  return router;
}

module.exports = { createForceWithdrawalRoutes };
