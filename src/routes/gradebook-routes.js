const express = require('express');

const { createGradebookController } = require('../controllers/gradebook-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createGradebookRoutes(services) {
  const router = express.Router();
  const controller = createGradebookController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/grades/summary',
    sessionModel: services.sessionModel
  });

  router.get('/grades/offerings/:offeringId', requireAuth, controller.getGradeEntryPage);
  router.post('/grades/offerings/:offeringId', requireAuth, controller.postGrades);
  router.get('/grades/summary', requireAuth, controller.getSummaryPage);
  router.get('/grades/offerings/:offeringId/export-summary', requireAuth, controller.exportSummary);
  router.get('/api/grades/summary', requireAuth, controller.getSummaryStatus);

  return router;
}

module.exports = { createGradebookRoutes };
