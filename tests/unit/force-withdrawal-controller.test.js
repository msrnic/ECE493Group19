const test = require('node:test');
const assert = require('node:assert/strict');

const { createForceWithdrawalController } = require('../../src/controllers/force-withdrawal-controller');

function createResponse() {
  return {
    body: '',
    jsonBody: null,
    statusCode: 200,
    json(payload) {
      this.jsonBody = payload;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };
}

function createController(overrides = {}) {
  return createForceWithdrawalController({
    forceWithdrawalService: {
      getActionStatus() {
        return { actionId: 'action-1', status: 'completed', statusCode: 200 };
      },
      getFormState() {
        return {
          offerings: [{ id: 8, courseCode: 'ECE320', title: 'Embedded Systems', offeringCode: 'O_CONFLICT' }],
          statusCode: 200
        };
      },
      getImplications() {
        return {
          implications: {
            feeImpact: 'A fee adjustment of $410.00 will be applied to the student account.',
            transcriptImpact: 'A W notation will be applied to the transcript for this class.'
          },
          offering: { courseCode: 'ECE320', id: 8, offeringCode: 'O_CONFLICT', title: 'Embedded Systems' },
          status: 'ready',
          statusCode: 200,
          student: { email: 'conflict.student@example.com', studentId: 'conflictStudent' }
        };
      },
      listPendingAudit() {
        return {
          items: [{ actionId: 'action-2', retryCount: 0 }],
          statusCode: 200
        };
      },
      processWithdrawal() {
        return {
          actionId: 'action-1',
          message: 'Forced withdrawal completed successfully.',
          pendingAudit: false,
          status: 'completed',
          statusCode: 200
        };
      }
    },
    ...overrides
  });
}

test('force-withdrawal controller renders page, implications, success, cancel, and json status', () => {
  const controller = createController();

  const pageRes = createResponse();
  controller.getForceWithdrawalPage({ session: { accountId: 1 } }, pageRes);
  assert.equal(pageRes.statusCode, 200);
  assert.match(pageRes.body, /Force Withdraw Student/);
  assert.match(pageRes.body, /Pending Audit/);

  const implicationRes = createResponse();
  controller.getImplications(
    {
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      query: { offeringId: '8', reason: 'Administrative removal after enrollment review.', studentId: 'conflictStudent' },
      session: { accountId: 1 }
    },
    implicationRes
  );
  assert.equal(implicationRes.statusCode, 200);
  assert.match(implicationRes.body, /Review the withdrawal implications before confirming/);

  const successRes = createResponse();
  controller.postForceWithdrawal(
    {
      body: {
        offeringId: '8',
        reason: 'Administrative removal after enrollment review.',
        studentIdentifier: 'conflictStudent'
      },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1 }
    },
    successRes
  );
  assert.equal(successRes.statusCode, 200);
  assert.match(successRes.body, /Forced withdrawal completed successfully/);

  const cancelRes = createResponse();
  controller.postForceWithdrawal(
    {
      body: { action: 'cancel' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1 }
    },
    cancelRes
  );
  assert.equal(cancelRes.statusCode, 200);
  assert.match(cancelRes.body, /Forced withdrawal was canceled/);

  const jsonStatusRes = createResponse();
  controller.getActionStatus(
    {
      get() {
        return 'application/json';
      },
      headers: { accept: 'application/json' },
      is(type) {
        return type === 'application/json';
      },
      params: { actionId: 'action-1' },
      session: { accountId: 1 }
    },
    jsonStatusRes
  );
  assert.equal(jsonStatusRes.statusCode, 200);
  assert.equal(jsonStatusRes.jsonBody.actionId, 'action-1');
});

test('force-withdrawal controller renders validation and service errors', () => {
  const controller = createController({
    forceWithdrawalService: {
      getActionStatus() {
        return { code: 'NOT_FOUND', message: 'Forced withdrawal action was not found.', statusCode: 404 };
      },
      getFormState() {
        return { offerings: [], statusCode: 200 };
      },
      getImplications() {
        return { code: 'NOT_ENROLLED', message: 'The selected student is not currently enrolled in this offering.', statusCode: 409 };
      },
      listPendingAudit() {
        return { items: [], statusCode: 200 };
      },
      processWithdrawal() {
        return { code: 'TRANSACTION_FAILED', message: 'Forced withdrawal could not be completed right now. No withdrawal changes were saved.', statusCode: 500 };
      }
    }
  });

  const validationRes = createResponse();
  controller.postForceWithdrawal(
    {
      body: { offeringId: '', reason: '', studentIdentifier: '' },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1 }
    },
    validationRes
  );
  assert.equal(validationRes.statusCode, 400);
  assert.match(validationRes.body, /Please correct the highlighted fields/);

  const implicationRes = createResponse();
  controller.getImplications(
    {
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      query: { offeringId: '8', studentId: 'conflictStudent' },
      session: { accountId: 1 }
    },
    implicationRes
  );
  assert.equal(implicationRes.statusCode, 409);
  assert.match(implicationRes.body, /not currently enrolled/);

  const failureRes = createResponse();
  controller.postForceWithdrawal(
    {
      body: {
        offeringId: '8',
        reason: 'Administrative removal after enrollment review.',
        studentIdentifier: 'conflictStudent'
      },
      get() {
        return 'text/html';
      },
      is() {
        return false;
      },
      session: { accountId: 1 }
    },
    failureRes
  );
  assert.equal(failureRes.statusCode, 500);
  assert.match(failureRes.body, /No withdrawal changes were saved/);
});
