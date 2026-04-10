const express = require('express');

const { createCourseCapacityController } = require('../controllers/course-capacity-controller');
const { createRequireAuth } = require('../middleware/require-auth');

function createCourseCapacityRoutes(services) {
  const router = express.Router();
  const controller = createCourseCapacityController(services);
  const requireAuth = createRequireAuth({
    returnTo: '/admin/offerings',
    sessionModel: services.sessionModel
  });

  router.get('/admin/course-offerings/:offeringId/capacity', requireAuth, controller.getCapacityPage);
  router.post('/admin/course-offerings/:offeringId/capacity', requireAuth, controller.postCapacityUpdate);
  router.get('/api/admin/course-offerings/:offeringId/capacity', requireAuth, controller.getCapacityPage);
  router.post('/api/admin/course-offerings/:offeringId/capacity', requireAuth, controller.postCapacityUpdate);

  return router;
}

module.exports = { createCourseCapacityRoutes };
