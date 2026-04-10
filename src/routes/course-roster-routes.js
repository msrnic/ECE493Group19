const express = require('express');

const { createCourseRosterController } = require('../controllers/course-roster-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createCourseRosterRoutes(services) {
  const router = express.Router();
  const controller = createCourseRosterController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/teaching/rosters',
    sessionModel: services.sessionModel
  });

  router.get('/teaching/rosters', requireAuth, controller.getRosterPage);

  return router;
}

module.exports = { createCourseRosterRoutes };
