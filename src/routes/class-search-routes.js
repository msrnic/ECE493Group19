const express = require('express');

const { createClassSearchController } = require('../controllers/class-search-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createClassSearchRoutes(services) {
  const router = express.Router();
  const controller = createClassSearchController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/classes/search',
    sessionModel: services.sessionModel
  });

  router.get('/classes/search', requireAuth, controller.getSearchPage);
  router.get('/classes/:offeringId', requireAuth, controller.getClassDetail);

  return router;
}

module.exports = { createClassSearchRoutes };
