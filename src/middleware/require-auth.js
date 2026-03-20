function createRequireAuth() {
  return function requireAuth(req, res, next) {
    if (!req.session || !req.session.accountId) {
      return res.redirect('/login');
    }

    return next();
  };
}

module.exports = { createRequireAuth };
