const express = require('express');

const { createTransactionHistoryController } = require('../controllers/transaction-history-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createTransactionHistoryRoutes(services) {
  const router = express.Router();
  const transactionHistoryController = createTransactionHistoryController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/transactions/history',
    sessionModel: services.sessionModel
  });

  router.get('/transactions/history', requireAuth, transactionHistoryController.getTransactionHistoryPage);
  router.get('/api/students/:studentId/financial-transactions', transactionHistoryController.getTransactionHistoryApi);

  return router;
}

module.exports = { createTransactionHistoryRoutes };
