const express = require('express');

const { createPaymentMethodsController } = require('../controllers/payment-methods-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createPaymentMethodsRoutes(services) {
  const router = express.Router();
  const controller = createPaymentMethodsController(services);
  const requireListAuth = createRequireAuth({
    returnTo: '/account/payment-methods',
    sessionModel: services.sessionModel
  });
  const requireAddAuth = createRequireAuth({
    returnTo: '/account/payment-methods/bank-accounts/new',
    sessionModel: services.sessionModel
  });

  router.get('/account/payment-methods', requireListAuth, controller.getPaymentMethodsPage);
  router.get(
    '/account/payment-methods/bank-accounts/new',
    requireAddAuth,
    controller.getAddBankAccountPage
  );
  router.get(
    '/account/payment-methods/credit-cards/new',
    requireAddAuth,
    controller.getAddCreditCardPage
  );
  router.post(
    '/account/payment-methods/bank-accounts',
    requireAddAuth,
    controller.postAddBankAccount
  );
  router.post(
    '/account/payment-methods/credit-cards',
    requireAddAuth,
    controller.postAddCreditCard
  );

  return router;
}

module.exports = { createPaymentMethodsRoutes };
