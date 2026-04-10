const express = require('express');

const { createTranscriptController } = require('../controllers/transcript-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createTranscriptRoutes(services) {
  const router = express.Router();
  const controller = createTranscriptController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/academic/transcript',
    sessionModel: services.sessionModel
  });

  router.get('/academic/transcript', requireAuth, controller.getTranscriptPage);
  router.get('/students/:studentId/transcript', requireAuth, controller.getTranscriptPage);
  router.get('/api/students/:studentId/transcript', requireAuth, controller.getTranscriptApi);

  return router;
}

module.exports = { createTranscriptRoutes };
