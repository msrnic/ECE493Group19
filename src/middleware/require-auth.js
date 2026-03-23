const { createAuthRedirectResponse } = require('../controllers/dashboard-response');

function wantsJson(req) {
  const matchesContentType = typeof req.is === 'function' ? req.is('application/json') : false;
  const acceptHeader = typeof req.get === 'function' ? req.get('accept') : req.headers?.accept;
  return matchesContentType || String(acceptHeader || '').includes('application/json');
}

function sanitizeReturnTo(returnTo) {
  if (!returnTo || typeof returnTo !== 'string' || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
    return '/dashboard';
  }

  return returnTo;
}

function createRequireAuth(options = {}) {
  function redirectToLogin(req, res) {
    const returnTo = sanitizeReturnTo(options.returnTo || req.originalUrl || '/dashboard');
    const loginUrl = `/login?returnTo=${encodeURIComponent(returnTo)}`;

    if (req.session) {
      req.session.returnTo = returnTo;
    }

    if (wantsJson(req)) {
      return res.status(401).json(createAuthRedirectResponse(returnTo));
    }

    if (req.session && typeof req.session.destroy === 'function') {
      return req.session.destroy(() => {
        res.redirect(loginUrl);
      });
    }

    return res.redirect(loginUrl);
  }

  return function requireAuth(req, res, next) {
    if (!req.session || !req.session.accountId) {
      return redirectToLogin(req, res);
    }

    if (options.sessionModel) {
      const sessionRecord = options.sessionModel.findActiveSession(req.sessionID);
      if (!sessionRecord || sessionRecord.account_id !== req.session.accountId) {
        return redirectToLogin(req, res);
      }
    }

    return next();
  };
}

module.exports = { createRequireAuth, sanitizeReturnTo };
