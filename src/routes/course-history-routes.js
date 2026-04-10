const express = require('express');

const { createCourseHistoryController } = require('../controllers/course-history-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createCourseHistoryRoutes(services) {
  const router = express.Router();
  const controller = createCourseHistoryController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/academic/course-history',
    sessionModel: services.sessionModel
  });

  router.get('/academic/course-history', requireAuth, controller.getCourseHistoryPage);
  router.get('/students/:studentId/course-history', requireAuth, controller.getCourseHistoryPage);
  router.get('/api/students/:studentId/course-history', requireAuth, controller.getCourseHistoryApi);

  return router;
}

module.exports = { createCourseHistoryRoutes };
