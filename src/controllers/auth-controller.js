const path = require('path');

const loginOutcomes = require('../services/login-outcomes');
const { renderHtml } = require('../views/render');

function createAuthController(services) {
  function renderLogin(res, statusCode, viewModel = {}) {
    const html = renderHtml(path.resolve(__dirname, '../views/login.html'), {
      heading_suffix: viewModel.headingSuffix || '',
      identifier: viewModel.identifier || '',
      error_message: viewModel.errorMessage || '',
      help_message: viewModel.helpMessage || 'Enter your account credentials to continue.',
      http_status: String(statusCode)
    });

    return res.status(statusCode).send(html);
  }

  async function saveSession(req) {
    await new Promise((resolve, reject) => {
      req.session.save((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async function destroySession(req) {
    await new Promise((resolve, reject) => {
      req.session.destroy((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  return {
    getLoginPage(req, res) {
      if (req.session && req.session.accountId) {
        return res.redirect('/dashboard');
      }

      return renderLogin(res, 200);
    },

    async postLogin(req, res, next) {
      try {
        const identifier = (req.body.identifier || '').trim();
        const password = req.body.password || '';

        if (!identifier || !password) {
          return renderLogin(res, 400, {
            identifier,
            errorMessage: 'Both username/email and password are required.',
            headingSuffix: 'Fix the highlighted issue',
            helpMessage: 'Provide both fields before submitting.'
          });
        }

        const result = await services.authService.authenticate({
          expiresAt: new Date(services.now().getTime() + 60 * 60 * 1000).toISOString(),
          identifier,
          password,
          sessionId: req.sessionID,
          sourceIp: req.ip,
          userAgent: req.get('user-agent') || ''
        });

        if (result.outcome === loginOutcomes.SUCCESS) {
          req.session.accountId = result.account.id;
          req.session.accountIdentifier = result.account.username;
          await saveSession(req);
          return res.redirect('/dashboard');
        }

        if (result.outcome === loginOutcomes.INVALID_CREDENTIALS) {
          return renderLogin(res, 401, {
            identifier,
            errorMessage: 'Invalid username/email or password.',
            headingSuffix: 'Try again',
            helpMessage: 'Check your credentials and submit another login attempt.'
          });
        }

        if (result.outcome === loginOutcomes.LOCKED) {
          return renderLogin(res, 423, {
            identifier,
            errorMessage: 'Your account is temporarily locked. Try again later or contact support.',
            headingSuffix: 'Account locked',
            helpMessage: 'Wait for the lock period to expire or contact support.'
          });
        }

        if (result.outcome === loginOutcomes.DISABLED) {
          return renderLogin(res, 403, {
            identifier,
            errorMessage: 'Your account is disabled. Please contact support.',
            headingSuffix: 'Access restricted',
            helpMessage: 'Support can help restore account access.'
          });
        }

        return renderLogin(res, 503, {
          identifier,
          errorMessage: 'Login service is unavailable. Please try again shortly.',
          headingSuffix: 'Service unavailable',
          helpMessage: 'No session was created. Retry once the authentication service is healthy.'
        });
      } catch (error) {
        return next(error);
      }
    },

    async postLogout(req, res, next) {
      try {
        services.sessionModel.invalidateSession(req.sessionID, {
          reason: 'logout',
          revokedAt: services.now().toISOString()
        });
        await destroySession(req);
        res.clearCookie('connect.sid');
        return res.redirect('/login');
      } catch (error) {
        return next(error);
      }
    }
  };
}

module.exports = { createAuthController };
