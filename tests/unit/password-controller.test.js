const test = require('node:test');
const assert = require('node:assert/strict');

const { createPasswordController } = require('../../src/controllers/password-controller');

function createResponse() {
  return {
    body: '',
    jsonBody: null,
    statusCode: null,
    json(payload) {
      this.jsonBody = payload;
      return payload;
    },
    send(payload) {
      this.body = payload;
      return payload;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };
}

function createController(overrides = {}) {
  return createPasswordController({
    accountModel: {
      findById(id) {
        if (id === 1) {
          return { id: 1, email: 'userA@example.com', role: 'student', username: 'userA' };
        }
        if (id === 2) {
          return { id: 2, email: 'admin@example.com', role: 'admin', username: 'adminUser' };
        }
        if (id === 3) {
          return { id: 3, email: 'target@example.com', role: 'student', username: 'target' };
        }
        return null;
      }
    },
    passwordChangeService: {
      adminChangePassword: async () => ({ message: 'ok', notificationQueued: true, status: 'success', statusCode: 200 }),
      changeOwnPassword: async () => ({ message: 'ok', notificationQueued: true, status: 'success', statusCode: 200 }),
      changePasswordWithResetToken: async () => ({ message: 'ok', notificationQueued: true, status: 'success', statusCode: 200 }),
      recordCancellation: () => ({ message: 'cancelled', status: 'success', statusCode: 200 })
    },
    passwordPolicyService: {
      describeFailedRules(rules) {
        return rules.map((rule) => `Rule: ${rule}`);
      }
    },
    ...overrides
  });
}

test('password controller covers JSON cooldown responses and HTML policy rendering branches', async () => {
  const controller = createController({
    passwordChangeService: {
      adminChangePassword: async () => ({ message: 'ok', notificationQueued: true, status: 'success', statusCode: 200 }),
      changeOwnPassword: async () => ({
        message: 'Too many attempts.',
        recoveryOptions: ['Wait.'],
        retryAfterSeconds: 12,
        status: 'error',
        statusCode: 429
      }),
      changePasswordWithResetToken: async () => ({
        failedRules: ['min_length'],
        message: 'Policy error.',
        status: 'error',
        statusCode: 400
      }),
      recordCancellation: () => ({ message: 'cancelled', status: 'success', statusCode: 200 })
    }
  });

  const jsonRes = createResponse();
  await controller.postChangePassword(
    {
      body: { currentPassword: 'a', newPassword: 'b' },
      get() {
        return 'application/json';
      },
      is(type) {
        return type === 'application/json';
      },
      session: { accountId: 1 },
      sessionID: 'session-1'
    },
    jsonRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(jsonRes.statusCode, 429);
  assert.equal(jsonRes.jsonBody.retryAfterSeconds, 12);
  assert.deepEqual(jsonRes.jsonBody.recoveryOptions, ['Wait.']);

  const htmlRes = createResponse();
  await controller.postResetPassword(
    {
      body: { resetToken: 'token-1', newPassword: 'bad' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      }
    },
    htmlRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(htmlRes.statusCode, 400);
  assert.match(htmlRes.body, /Rule: min_length/);
  assert.match(htmlRes.body, /token-1/);
});

test('password controller covers HTML self-service, admin rendering branches, and error forwarding', async () => {
  const controller = createController({
    passwordChangeService: {
      adminChangePassword: async ({ targetAccountId }) => {
        if (targetAccountId === 1) {
          return { message: 'Password changed for the selected account.', status: 'success', statusCode: 200 };
        }
        if (targetAccountId === 3) {
          return {
            failedRules: ['uppercase'],
            message: 'Policy error.',
            status: 'error',
            statusCode: 400
          };
        }
        return { message: 'Retry later.', status: 'error', statusCode: 500 };
      },
      changeOwnPassword: async ({ newPassword }) => {
        if (newPassword === 'bad') {
          return {
            failedRules: ['special'],
            message: 'Policy error.',
            status: 'error',
            statusCode: 400
          };
        }
        throw new Error('self-service boom');
      },
      changePasswordWithResetToken: async ({ newPassword }) => {
        if (newPassword === 'cooldown') {
          return {
            message: 'Retry later.',
            recoveryOptions: ['Request a new reset token.'],
            retryAfterSeconds: 9,
            status: 'error',
            statusCode: 429
          };
        }
        throw new Error('reset boom');
      },
      recordCancellation: () => ({ message: 'cancelled', status: 'success', statusCode: 200 })
    }
  });

  const changeRes = createResponse();
  await controller.postChangePassword(
    {
      body: { currentPassword: 'old', newPassword: 'bad' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1, accountIdentifier: 'userA' },
      sessionID: 'session-1'
    },
    changeRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(changeRes.statusCode, 400);
  assert.match(changeRes.body, /Rule: special/);

  const resetCooldownRes = createResponse();
  await controller.postResetPassword(
    {
      body: { resetToken: 'token-2', newPassword: 'cooldown' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      }
    },
    resetCooldownRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(resetCooldownRes.statusCode, 429);
  assert.match(resetCooldownRes.body, /Retry after 9 seconds/);

  const adminSuccessRes = createResponse();
  await controller.postAdminPasswordChange(
    {
      body: { newPassword: 'AdminSet!234' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      params: { userId: '1' },
      session: { accountId: 2 },
      sessionID: 'session-1'
    },
    adminSuccessRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(adminSuccessRes.statusCode, 200);
  assert.match(adminSuccessRes.body, /Target sessions were invalidated/);

  const adminPolicyRes = createResponse();
  await controller.postAdminPasswordChange(
    {
      body: { newPassword: 'bad' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      params: { userId: '3' },
      session: { accountId: 2 },
      sessionID: 'session-1'
    },
    adminPolicyRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(adminPolicyRes.statusCode, 400);
  assert.match(adminPolicyRes.body, /Rule: uppercase/);

  const deniedController = createController({
    passwordChangeService: {
      adminChangePassword: async () => ({ message: 'Denied', status: 'error', statusCode: 403 }),
      changeOwnPassword: async () => ({ message: 'ok', status: 'success', statusCode: 200 }),
      changePasswordWithResetToken: async () => ({ message: 'ok', status: 'success', statusCode: 200 }),
      recordCancellation: () => ({ message: 'cancelled', status: 'success', statusCode: 200 })
    }
  });
  const deniedRes = createResponse();
  await deniedController.postAdminPasswordChange(
    {
      body: { newPassword: 'bad' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      params: { userId: '1' },
      session: { accountId: 2 },
      sessionID: 'session-1'
    },
    deniedRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(deniedRes.statusCode, 403);
  assert.match(deniedRes.body, /Access denied/);

  const missingController = createController({
    passwordChangeService: {
      adminChangePassword: async () => ({ message: 'Missing', status: 'error', statusCode: 404 }),
      changeOwnPassword: async () => ({ message: 'ok', status: 'success', statusCode: 200 }),
      changePasswordWithResetToken: async () => ({ message: 'ok', status: 'success', statusCode: 200 }),
      recordCancellation: () => ({ message: 'cancelled', status: 'success', statusCode: 200 })
    }
  });
  const missingRes = createResponse();
  await missingController.postAdminPasswordChange(
    {
      body: { newPassword: 'bad' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      params: { userId: '1' },
      session: { accountId: 2 },
      sessionID: 'session-1'
    },
    missingRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(missingRes.statusCode, 404);
  assert.match(missingRes.body, /Account missing/);

  const adminRetryRes = createResponse();
  await controller.postAdminPasswordChange(
    {
      body: { newPassword: 'bad' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      params: { userId: '4' },
      session: { accountId: 2 },
      sessionID: 'session-1'
    },
    adminRetryRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(adminRetryRes.statusCode, 500);
  assert.match(adminRetryRes.body, /Retry later/);

  let forwardedError = null;
  await controller.postChangePassword(
    {
      body: { currentPassword: 'old', newPassword: 'boom' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1, accountIdentifier: 'userA' },
      sessionID: 'session-1'
    },
    createResponse(),
    (error) => {
      forwardedError = error;
    }
  );
  assert.match(forwardedError.message, /self-service boom/);

  forwardedError = null;
  await controller.postResetPassword(
    {
      body: { resetToken: 'token-3', newPassword: 'boom' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      }
    },
    createResponse(),
    (error) => {
      forwardedError = error;
    }
  );
  assert.match(forwardedError.message, /reset boom/);

  forwardedError = null;
  const erroringAdminController = createController({
    passwordChangeService: {
      adminChangePassword: async () => {
        throw new Error('admin boom');
      },
      changeOwnPassword: async () => ({ message: 'ok', status: 'success', statusCode: 200 }),
      changePasswordWithResetToken: async () => ({ message: 'ok', status: 'success', statusCode: 200 }),
      recordCancellation: () => ({ message: 'cancelled', status: 'success', statusCode: 200 })
    }
  });
  await erroringAdminController.postAdminPasswordChange(
    {
      body: { newPassword: 'boom' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      params: { userId: '1' },
      session: { accountId: 2 },
      sessionID: 'session-1'
    },
    createResponse(),
    (error) => {
      forwardedError = error;
    }
  );
  assert.match(forwardedError.message, /admin boom/);
});

test('password controller covers page render guards and JSON cancellation', async () => {
  const noAccountController = createController({
    accountModel: {
      findById() {
        return null;
      }
    }
  });
  const pageRes = createResponse();
  noAccountController.getChangePasswordPage(
    { session: { accountId: 999 } },
    pageRes
  );
  assert.equal(pageRes.statusCode, 200);
  assert.match(pageRes.body, /Change Password/);

  const resetPageRes = createResponse();
  noAccountController.getResetPasswordPage(
    { query: {} },
    resetPageRes
  );
  assert.equal(resetPageRes.statusCode, 200);
  assert.match(resetPageRes.body, /Reset Password/);

  const deniedRes = createResponse();
  noAccountController.getAdminPasswordPage(
    { params: { userId: '1' }, session: { accountId: 999 } },
    deniedRes
  );
  assert.equal(deniedRes.statusCode, 403);
  assert.match(deniedRes.body, /Access denied/);

  const missingTargetController = createController();
  const missingTargetRes = createResponse();
  missingTargetController.getAdminPasswordPage(
    { params: { userId: '999' }, session: { accountId: 2 } },
    missingTargetRes
  );
  assert.equal(missingTargetRes.statusCode, 404);
  assert.match(missingTargetRes.body, /Account missing/);

  const cancelRes = createResponse();
  await missingTargetController.postChangePassword(
    {
      body: { action: 'cancel' },
      get() {
        return 'application/json';
      },
      is(type) {
        return type === 'application/json';
      },
      session: { accountId: 1 },
      sessionID: 'session-1'
    },
    cancelRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(cancelRes.statusCode, 200);
  assert.equal(cancelRes.jsonBody.status, 'success');
});

test('password controller accepts JSON via Accept header and handles admin policy fallback without a target record', async () => {
  const controller = createController({
    accountModel: {
      findById(id) {
        if (id === 2) {
          return { id: 2, email: 'admin@example.com', role: 'admin', username: 'adminUser' };
        }
        return null;
      }
    },
    passwordChangeService: {
      adminChangePassword: async () => ({
        failedRules: ['uppercase'],
        message: 'Policy error.',
        status: 'error',
        statusCode: 400
      }),
      changeOwnPassword: async () => ({
        message: 'Too many attempts.',
        retryAfterSeconds: 5,
        status: 'error',
        statusCode: 429
      }),
      changePasswordWithResetToken: async () => ({ message: 'ok', status: 'success', statusCode: 200 }),
      recordCancellation: () => ({ message: 'cancelled', status: 'success', statusCode: 200 })
    },
    passwordPolicyService: {
      describeFailedRules(rules) {
        return rules.map((rule) => `Rule: ${rule}`);
      }
    }
  });

  const jsonRes = createResponse();
  await controller.postChangePassword(
    {
      body: { currentPassword: 'old', newPassword: 'new' },
      get() {
        return 'application/json';
      },
      is() {
        return false;
      },
      session: { accountId: 1 },
      sessionID: 'session-1'
    },
    jsonRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(jsonRes.statusCode, 429);
  assert.equal(jsonRes.jsonBody.retryAfterSeconds, 5);

  const adminPolicyRes = createResponse();
  await controller.postAdminPasswordChange(
    {
      body: { newPassword: 'bad' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      params: { userId: '999' },
      session: { accountId: 2 },
      sessionID: 'session-1'
    },
    adminPolicyRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(adminPolicyRes.statusCode, 400);
  assert.match(adminPolicyRes.body, /Rule: uppercase/);
});

test('password controller covers success pages, form defaults, and plain html retry branches', async () => {
  const controller = createController({
    passwordChangeService: {
      adminChangePassword: async () => ({ message: 'Retry later.', status: 'error', statusCode: 500 }),
      changeOwnPassword: async ({ newPassword }) => {
        if (newPassword === 'ok') {
          return { message: 'Password changed successfully.', status: 'success', statusCode: 200 };
        }
        return { message: 'Retry later.', status: 'error', statusCode: 500 };
      },
      changePasswordWithResetToken: async ({ newPassword }) => {
        if (newPassword === 'ok') {
          return {
            message: 'Password reset completed successfully.',
            notificationQueued: true,
            status: 'success',
            statusCode: 200
          };
        }
        return { message: 'Retry later.', status: 'error', statusCode: 500 };
      },
      recordCancellation: () => ({ message: 'cancelled', status: 'success', statusCode: 200 })
    }
  });

  const changePageRes = createResponse();
  controller.getChangePasswordPage(
    { session: { accountId: 1 } },
    changePageRes
  );
  assert.equal(changePageRes.statusCode, 200);
  assert.match(changePageRes.body, /Change Password/);

  const resetPageRes = createResponse();
  controller.getResetPasswordPage(
    { query: { token: 'seed-token' } },
    resetPageRes
  );
  assert.equal(resetPageRes.statusCode, 200);
  assert.match(resetPageRes.body, /seed-token/);

  const adminPageRes = createResponse();
  controller.getAdminPasswordPage(
    { params: { userId: '3' }, session: { accountId: 2 } },
    adminPageRes
  );
  assert.equal(adminPageRes.statusCode, 200);
  assert.match(adminPageRes.body, /target@example.com/);

  const ownSuccessRes = createResponse();
  await controller.postChangePassword(
    {
      body: { currentPassword: '', newPassword: 'ok' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1 },
      sessionID: 'session-1'
    },
    ownSuccessRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(ownSuccessRes.statusCode, 200);
  assert.match(ownSuccessRes.body, /Password updated/);
  assert.match(ownSuccessRes.body, /Return to dashboard/);

  const ownRetryRes = createResponse();
  await controller.postChangePassword(
    {
      body: { currentPassword: '', newPassword: '' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1 },
      sessionID: 'session-1'
    },
    ownRetryRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(ownRetryRes.statusCode, 500);
  assert.match(ownRetryRes.body, /Retry later/);
  assert.doesNotMatch(ownRetryRes.body, /Retry after/);

  const resetSuccessRes = createResponse();
  await controller.postResetPassword(
    {
      body: { resetToken: '', newPassword: 'ok' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      }
    },
    resetSuccessRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(resetSuccessRes.statusCode, 200);
  assert.match(resetSuccessRes.body, /Return to sign in/);

  const resetRetryRes = createResponse();
  await controller.postResetPassword(
    {
      body: { resetToken: '', newPassword: '' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      }
    },
    resetRetryRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(resetRetryRes.statusCode, 500);
  assert.match(resetRetryRes.body, /Retry later/);

  const adminJsonRes = createResponse();
  await controller.postAdminPasswordChange(
    {
      body: { newPassword: 'anything' },
      get() {
        return 'application/json';
      },
      is(type) {
        return type === 'application/json';
      },
      params: { userId: '3' },
      session: { accountId: 2 },
      sessionID: 'session-1'
    },
    adminJsonRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(adminJsonRes.statusCode, 500);
  assert.equal(adminJsonRes.jsonBody.status, 'error');
});

test('password controller covers non-admin actors and missing accept headers', async () => {
  const controller = createController();

  const deniedRes = createResponse();
  controller.getAdminPasswordPage(
    { params: { userId: '1' }, session: { accountId: 1 } },
    deniedRes
  );
  assert.equal(deniedRes.statusCode, 403);
  assert.match(deniedRes.body, /Access denied/);

  const retryRes = createResponse();
  await controller.postChangePassword(
    {
      body: {},
      get() {
        return undefined;
      },
      is() {
        return false;
      },
      session: { accountId: 1, accountIdentifier: 'userA' },
      sessionID: 'session-1'
    },
    retryRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(retryRes.statusCode, 200);
});

test('password controller covers missing admin password submissions', async () => {
  const controller = createController();
  const res = createResponse();

  await controller.postAdminPasswordChange(
    {
      body: {},
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      params: { userId: '3' },
      session: { accountId: 2 },
      sessionID: 'session-1'
    },
    res,
    (error) => {
      throw error;
    }
  );

  assert.equal(res.statusCode, 200);
  assert.match(res.body, /Password updated/);
});

test('password controller covers html cancellation, html cooldown recovery, and reset json/policy fallbacks', async () => {
  const controller = createController({
    passwordChangeService: {
      adminChangePassword: async () => ({ message: 'ok', status: 'success', statusCode: 200 }),
      changeOwnPassword: async ({ currentPassword, newPassword }) => {
        if (currentPassword === 'cancel-path') {
          return { message: 'unused', status: 'success', statusCode: 200 };
        }
        if (newPassword === 'cooldown-html') {
          return {
            message: 'Retry later.',
            recoveryOptions: ['Wait for cooldown.', 'Try again later.'],
            retryAfterSeconds: 7,
            status: 'error',
            statusCode: 429
          };
        }
        return {
          message: 'Verification failed.',
          recoveryOptions: ['Retry with your current password.'],
          status: 'error',
          statusCode: 401
        };
      },
      changePasswordWithResetToken: async ({ newPassword }) => {
        if (newPassword === 'json') {
          return { message: 'json ok', status: 'success', statusCode: 200 };
        }
        return {
          failedRules: ['history'],
          message: 'Policy error.',
          status: 'error',
          statusCode: 400
        };
      },
      recordCancellation: () => ({ message: 'cancelled', status: 'success', statusCode: 200 })
    },
    passwordPolicyService: {
      describeFailedRules(rules) {
        return rules.map((rule) => `Rule: ${rule}`);
      }
    }
  });

  const cancelHtmlRes = createResponse();
  await controller.postChangePassword(
    {
      body: { action: 'cancel' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1 },
      sessionID: 'session-1'
    },
    cancelHtmlRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(cancelHtmlRes.statusCode, 200);
  assert.match(cancelHtmlRes.body, /Password change cancelled/);

  const cooldownHtmlRes = createResponse();
  await controller.postChangePassword(
    {
      body: { currentPassword: 'old', newPassword: 'cooldown-html' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1, accountIdentifier: 'userA' },
      sessionID: 'session-1'
    },
    cooldownHtmlRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(cooldownHtmlRes.statusCode, 429);
  assert.match(cooldownHtmlRes.body, /Retry after 7 seconds/);
  assert.match(cooldownHtmlRes.body, /Wait for cooldown/);

  const resetJsonRes = createResponse();
  await controller.postResetPassword(
    {
      body: { newPassword: 'json' },
      get() {
        return 'application/json';
      },
      is(type) {
        return type === 'application/json';
      }
    },
    resetJsonRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(resetJsonRes.statusCode, 200);
  assert.equal(resetJsonRes.jsonBody.status, 'success');

  const resetPolicyNoTokenRes = createResponse();
  await controller.postResetPassword(
    {
      body: { newPassword: 'policy' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      }
    },
    resetPolicyNoTokenRes,
    (error) => {
      throw error;
    }
  );
  assert.equal(resetPolicyNoTokenRes.statusCode, 400);
  assert.match(resetPolicyNoTokenRes.body, /Rule: history/);
});
