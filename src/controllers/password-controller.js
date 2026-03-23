const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');

function createPasswordController(services) {
  function wantsJson(req) {
    return req.is('application/json') || String(req.get('accept') || '').includes('application/json');
  }

  function renderListItems(items) {
    return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  }

  function renderResultPage(res, result, extra = {}) {
    const continueHref = extra.continueHref ?? '/dashboard';
    const continueLabel = extra.continueLabel ?? 'Return to dashboard';
    const detailItems = renderListItems(extra.detailItems ?? []);
    const heading = extra.heading ?? 'Password updated';

    const html = renderHtml(path.resolve(__dirname, '../views/change-password-result.html'), {
      continue_href: continueHref,
      continue_label: continueLabel,
      detail_items_html: detailItems,
      outcome_heading: heading,
      outcome_message: result.message,
      status_chip: result.statusCode
    });

    return res.status(result.statusCode).send(html);
  }

  function renderChangePasswordForm(res, statusCode, viewModel = {}) {
    const {
      errorMessage = '',
      feedbackItems = [],
      formAction = '/account/security/password-change',
      helpMessage = 'Verify your current password, then choose a policy-compliant replacement.',
      titleText = 'Change Password',
      username = ''
    } = viewModel;

    const html = renderHtml(path.resolve(__dirname, '../views/change-password.html'), {
      error_message: errorMessage,
      feedback_items_html: renderListItems(feedbackItems),
      form_action: formAction,
      help_message: helpMessage,
      title_text: titleText,
      username
    });

    return res.status(statusCode).send(html);
  }

  function renderResetPasswordForm(res, statusCode, viewModel = {}) {
    const {
      errorMessage = '',
      feedbackItems = [],
      helpMessage = 'Use your reset token and a compliant new password to restore access.',
      resetToken = '',
      titleText = 'Reset Password'
    } = viewModel;

    const html = renderHtml(path.resolve(__dirname, '../views/reset-password.html'), {
      error_message: errorMessage,
      feedback_items_html: renderListItems(feedbackItems),
      help_message: helpMessage,
      reset_token: resetToken,
      title_text: titleText
    });

    return res.status(statusCode).send(html);
  }

  function renderAdminForm(res, statusCode, viewModel = {}) {
    const {
      errorMessage = '',
      feedbackItems = [],
      helpMessage = 'Administrative authorization is sufficient. No target current password or reset token is required.',
      targetEmail = '',
      targetId = '',
      titleText = 'Admin Password Reset'
    } = viewModel;

    const html = renderHtml(path.resolve(__dirname, '../views/admin-reset-password.html'), {
      error_message: errorMessage,
      feedback_items_html: renderListItems(feedbackItems),
      help_message: helpMessage,
      target_email: targetEmail,
      target_id: targetId,
      title_text: titleText
    });

    return res.status(statusCode).send(html);
  }

  function sendJson(res, result) {
    return res.status(result.statusCode).json({
      failedRules: result.failedRules || [],
      invalidatedSessionCount: result.invalidatedSessionCount || 0,
      message: result.message,
      notificationQueued: Boolean(result.notificationQueued),
      recoveryOptions: result.recoveryOptions || [],
      retryAfterSeconds: result.retryAfterSeconds,
      status: result.status
    });
  }

  function getChangePasswordPage(req, res) {
    const account = services.accountModel.findById(req.session.accountId);
    return renderChangePasswordForm(res, 200, { username: account?.username ?? '' });
  }

  async function postChangePassword(req, res, next) {
    try {
      if (req.body.action === 'cancel') {
        const result = services.passwordChangeService.recordCancellation({
          actorAccountId: req.session.accountId,
          targetAccountId: req.session.accountId,
          verificationType: 'current_password'
        });

        return wantsJson(req)
          ? sendJson(res, result)
          : renderResultPage(res, result, { heading: 'Password change cancelled' });
      }

      const result = await services.passwordChangeService.changeOwnPassword({
        accountId: req.session.accountId,
        currentPassword: req.body.currentPassword || '',
        currentSessionId: req.sessionID,
        newPassword: req.body.newPassword || ''
      });

      if (wantsJson(req)) {
        return sendJson(res, result);
      }

      if (result.status === 'success') {
        return renderResultPage(res, result, {
          detailItems: ['Other active sessions were invalidated.', 'A password-change notification was queued.']
        });
      }

      if (result.statusCode === 400) {
        return renderChangePasswordForm(res, 400, {
          errorMessage: result.message,
          feedbackItems: services.passwordPolicyService.describeFailedRules(result.failedRules),
          username: req.session.accountIdentifier
        });
      }

      return renderChangePasswordForm(res, result.statusCode, {
        errorMessage: result.retryAfterSeconds
          ? `${result.message} Retry after ${result.retryAfterSeconds} seconds.`
          : result.message,
        feedbackItems: result.recoveryOptions || [],
        username: req.session.accountIdentifier
      });
    } catch (error) {
      return next(error);
    }
  }

  function getResetPasswordPage(req, res) {
    return renderResetPasswordForm(res, 200, {
      resetToken: req.query.token || ''
    });
  }

  async function postResetPassword(req, res, next) {
    try {
      const result = await services.passwordChangeService.changePasswordWithResetToken({
        newPassword: req.body.newPassword || '',
        resetToken: req.body.resetToken || ''
      });

      if (wantsJson(req)) {
        return sendJson(res, result);
      }

      if (result.status === 'success') {
        return renderResultPage(res, result, {
          continueHref: '/login',
          continueLabel: 'Return to sign in',
          detailItems: ['The reset token was consumed.', 'A password-change notification was queued.']
        });
      }

      if (result.statusCode === 400) {
        return renderResetPasswordForm(res, 400, {
          errorMessage: result.message,
          feedbackItems: services.passwordPolicyService.describeFailedRules(result.failedRules),
          resetToken: req.body.resetToken || ''
        });
      }

      return renderResetPasswordForm(res, result.statusCode, {
        errorMessage: result.retryAfterSeconds
          ? `${result.message} Retry after ${result.retryAfterSeconds} seconds.`
          : result.message,
        feedbackItems: result.recoveryOptions || [],
        resetToken: req.body.resetToken || ''
      });
    } catch (error) {
      return next(error);
    }
  }

  function getAdminPasswordPage(req, res) {
    const actor = services.accountModel.findById(req.session.accountId);
    if (!actor || actor.role !== 'admin') {
      return renderResultPage(
        res,
        {
          message: 'Administrative authorization is required for this action.',
          status: 'error',
          statusCode: 403
        },
        { heading: 'Access denied' }
      );
    }

    const targetAccount = services.accountModel.findById(Number(req.params.userId));
    if (!targetAccount) {
      return renderResultPage(
        res,
        {
          message: 'Target account was not found.',
          status: 'error',
          statusCode: 404
        },
        { heading: 'Account missing' }
      );
    }

    return renderAdminForm(res, 200, {
      targetEmail: targetAccount.email,
      targetId: targetAccount.id
    });
  }

  async function postAdminPasswordChange(req, res, next) {
    try {
      const result = await services.passwordChangeService.adminChangePassword({
        actorAccountId: req.session.accountId,
        currentSessionId: req.sessionID,
        newPassword: req.body.newPassword || '',
        targetAccountId: Number(req.params.userId)
      });

      if (wantsJson(req)) {
        return sendJson(res, result);
      }

      if (result.status === 'success') {
        return renderResultPage(res, result, {
          detailItems: ['Target sessions were invalidated as needed.', 'A password-change notification was queued.']
        });
      }

      if (result.statusCode === 400) {
        const target = services.accountModel.findById(Number(req.params.userId));
        return renderAdminForm(res, 400, {
          errorMessage: result.message,
          feedbackItems: services.passwordPolicyService.describeFailedRules(result.failedRules),
          targetEmail: target?.email ?? '',
          targetId: req.params.userId
        });
      }

      if (result.statusCode === 403 || result.statusCode === 404) {
        return renderResultPage(res, result, {
          heading: result.statusCode === 403 ? 'Access denied' : 'Account missing'
        });
      }

      return renderAdminForm(res, result.statusCode, {
        errorMessage: result.message,
        feedbackItems: result.recoveryOptions || [],
        targetId: req.params.userId
      });
    } catch (error) {
      return next(error);
    }
  }

  return {
    getAdminPasswordPage,
    getChangePasswordPage,
    getResetPasswordPage,
    postAdminPasswordChange,
    postChangePassword,
    postResetPassword
  };
}

module.exports = { createPasswordController };
