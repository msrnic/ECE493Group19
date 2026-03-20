const session = require('express-session');

function createSessionMiddleware(options = {}) {
  return session({
    secret: options.secret || 'development-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: 'lax'
    }
  });
}

module.exports = { createSessionMiddleware };
