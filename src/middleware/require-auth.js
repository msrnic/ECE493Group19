function createRequireAuth(options = {}) {
  function redirectToLogin(req, res) {
    if (req.session && typeof req.session.destroy === 'function') {
      return req.session.destroy(() => {
        res.redirect('/login');
      });
    }

    return res.redirect('/login');
  }

  return function requireAuth(req, res, next) {
    if (!req.session || !req.session.accountId) {
      return res.redirect('/login');
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

module.exports = { createRequireAuth };
