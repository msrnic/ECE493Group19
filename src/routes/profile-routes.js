const express = require('express');

const { createRequireAuth } = require('../middleware/require-auth');
const { createProfileController } = require('../controllers/profile-controller');

function createProfileRoutes(services) {
  const router = express.Router();
  const controller = createProfileController(services);
  const requirePersonalAuth = createRequireAuth({
    returnTo: '/account/personal-information',
    sessionModel: services.sessionModel
  });
  const requireContactAuth = createRequireAuth({
    returnTo: '/account/contact-information',
    sessionModel: services.sessionModel
  });

  router.get(
    '/account/personal-information',
    requirePersonalAuth,
    controller.getPersonalInformationPage
  );
  router.post(
    '/account/personal-information',
    requirePersonalAuth,
    controller.postPersonalInformation
  );
  router.get(
    '/account/contact-information',
    requireContactAuth,
    controller.getContactInformationPage
  );
  router.post(
    '/account/contact-information',
    requireContactAuth,
    controller.postContactInformation
  );

  return router;
}

module.exports = { createProfileRoutes };
