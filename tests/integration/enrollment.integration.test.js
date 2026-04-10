const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function createAuthenticatedClient(app, identifier, password = USER_PASSWORD) {
  const loginResponse = await request(app)
    .post('/login')
    .type('form')
    .send({ identifier, password })
    .expect(302);
  const cookies = loginResponse.headers['set-cookie'] || [];

  function withCookies(testRequest) {
    return cookies.length ? testRequest.set('Cookie', cookies) : testRequest;
  }

  return {
    get(pathname) {
      return withCookies(request(app).get(pathname));
    },
    post(pathname) {
      return withCookies(request(app).post(pathname));
    }
  };
}

function getConflictEnrollmentIds(db) {
  return {
    accountId: db.prepare('SELECT id FROM accounts WHERE email = ?').get('conflict.student@example.com').id,
    offeringId: db.prepare('SELECT id FROM class_offerings WHERE offering_code = ?').get('O_CONFLICT').id
  };
}

function getOfferingId(db, offeringCode) {
  return db.prepare('SELECT id FROM class_offerings WHERE offering_code = ?').get(offeringCode).id;
}

test('enrollment page renders offerings and schedule for authenticated students', async () => {
  const context = createTestContext();
  const client = await createAuthenticatedClient(context.app, 'userA@example.com');

  const response = await client.get('/enrollment');

  assert.equal(response.status, 200);
  assert.match(response.text, /Class Enrollment/);
  assert.match(response.text, /O_OPEN/);
  assert.match(response.text, /Current Schedule/);

  context.cleanup();
});

test('enrollment page displays read-only capacity and remaining seats for current student courses', async () => {
  const context = createTestContext();
  const client = await createAuthenticatedClient(context.app, 'conflict.student@example.com');

  const before = context.db.prepare('SELECT COUNT(*) AS count FROM class_enrollments').get().count;
  const response = await client.get('/enrollment');

  assert.equal(response.status, 200);
  assert.match(response.text, /ECE320 Embedded Systems \(O_CONFLICT\)/);
  assert.match(response.text, /Capacity: 20/);
  assert.match(response.text, /Remaining seats: 6/);
  assert.equal(context.db.prepare('SELECT COUNT(*) AS count FROM class_enrollments').get().count, before);

  context.cleanup();
});

test('enrollment page marks missing capacity data while still showing available seat information', async () => {
  const context = createTestContext({
    enrollmentTestState: { capacityUnavailableIdentifiers: ['conflict.student@example.com'] }
  });
  const client = await createAuthenticatedClient(context.app, 'conflict.student@example.com');

  const response = await client.get('/enrollment');

  assert.equal(response.status, 200);
  assert.match(response.text, /Capacity unavailable/);
  assert.match(response.text, /Remaining seats: 6/);

  context.cleanup();
});

test('eligible student enrolls successfully and schedule updates', async () => {
  const context = createTestContext();
  const client = await createAuthenticatedClient(context.app, 'userA@example.com');

  const response = await client.post('/enrollment').type('form').send({ offeringId: '1' });

  assert.equal(response.status, 200);
  assert.match(response.text, /enrolled successfully/);
  assert.match(response.text, /Fee assessment change: \$450\.00/);
  assert.equal(
    context.db.prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = 1 AND offering_id = 1').get().count,
    1
  );

  context.cleanup();
});

test('enrollment blocks prerequisites, full classes, holds, duplicate/conflict, and missing offerings', async () => {
  const prereqContext = createTestContext();
  const prereqClient = await createAuthenticatedClient(prereqContext.app, 'prereq.student@example.com');
  const prereq = await prereqClient.post('/enrollment').type('form').send({ offeringId: '1' });
  assert.equal(prereq.status, 409);
  assert.match(prereq.text, /Unmet prerequisite: CMPUT301/);
  prereqContext.cleanup();

  const fullContext = createTestContext();
  const fullClient = await createAuthenticatedClient(fullContext.app, 'userA@example.com');
  const full = await fullClient.post('/enrollment').type('form').send({ offeringId: '2' });
  assert.equal(full.status, 409);
  assert.match(full.text, /0 seats remaining/);
  fullContext.cleanup();

  const holdContext = createTestContext();
  const holdClient = await createAuthenticatedClient(holdContext.app, 'hold.student@example.com');
  const hold = await holdClient.post('/enrollment').type('form').send({ offeringId: '1' });
  assert.equal(hold.status, 409);
  assert.match(hold.text, /Outstanding fees must be cleared before enrolling in new classes\./);
  holdContext.cleanup();

  const conflictContext = createTestContext();
  const conflictClient = await createAuthenticatedClient(conflictContext.app, 'conflict.student@example.com');
  const conflict = await conflictClient.post('/enrollment').type('form').send({ offeringId: '3' });
  assert.equal(conflict.status, 409);
  assert.match(conflict.text, /already enrolled|Schedule conflict/);
  conflictContext.cleanup();

  const missingContext = createTestContext();
  const missingClient = await createAuthenticatedClient(missingContext.app, 'userA@example.com');
  const missing = await missingClient.post('/enrollment').type('form').send({ offeringId: '999' });
  assert.equal(missing.status, 404);
  missingContext.cleanup();
});

test('enrollment error leaves schedule unchanged and professor access redirects through auth flow', async () => {
  const context = createTestContext({
    enrollmentTestState: { failureIdentifiers: ['outage.user@example.com'] }
  });
  const client = await createAuthenticatedClient(context.app, 'outage.user@example.com');

  const before = context.db.prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = 8').get().count;
  const failure = await client.post('/enrollment').type('form').send({ offeringId: '4' });

  assert.equal(failure.status, 500);
  assert.match(failure.text, /Please retry/);
  assert.equal(
    context.db.prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = 8').get().count,
    before
  );

  const professorClient = await createAuthenticatedClient(context.app, 'professor@example.com');
  const professorPage = await professorClient.get('/enrollment');
  assert.equal(professorPage.status, 302);

  context.cleanup();
});

test('student can review withdrawal implications and confirm withdrawal from current schedule', async () => {
  const context = createTestContext();
  const client = await createAuthenticatedClient(context.app, 'conflict.student@example.com');
  const { accountId, offeringId } = getConflictEnrollmentIds(context.db);

  const preview = await client.get(`/enrollment/withdraw/${offeringId}`);

  assert.equal(preview.status, 200);
  assert.match(preview.text, /Confirm Withdrawal/);
  assert.match(preview.text, /A W notation will appear on your transcript/);
  assert.match(preview.text, /\$410\.00/);

  const response = await client.post(`/enrollment/withdraw/${offeringId}`).type('form').send({ action: 'confirm' });

  assert.equal(response.status, 200);
  assert.match(response.text, /withdrawn successfully/);
  assert.doesNotMatch(response.text, /ECE320 Embedded Systems \(O_CONFLICT\)/);
  assert.equal(
    context.db
      .prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = ? AND offering_id = ?')
      .get(accountId, offeringId).count,
    0
  );
  assert.equal(
    context.db
      .prepare('SELECT COUNT(*) AS count FROM withdrawal_records WHERE account_id = ? AND offering_id = ?')
      .get(accountId, offeringId).count,
    1
  );

  context.cleanup();
});

test('student can cancel withdrawal and system failure leaves enrollment unchanged', async () => {
  const cancelContext = createTestContext();
  const cancelClient = await createAuthenticatedClient(cancelContext.app, 'conflict.student@example.com');
  const cancelIds = getConflictEnrollmentIds(cancelContext.db);

  const cancel = await cancelClient
    .post(`/enrollment/withdraw/${cancelIds.offeringId}`)
    .type('form')
    .send({ action: 'cancel' });
  assert.equal(cancel.status, 200);
  assert.match(cancel.text, /Withdrawal was canceled/);
  assert.match(cancel.text, /ECE320 Embedded Systems \(O_CONFLICT\)/);
  assert.equal(
    cancelContext.db
      .prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = ? AND offering_id = ?')
      .get(cancelIds.accountId, cancelIds.offeringId).count,
    1
  );
  assert.equal(
    cancelContext.db
      .prepare('SELECT COUNT(*) AS count FROM withdrawal_records WHERE account_id = ? AND offering_id = ?')
      .get(cancelIds.accountId, cancelIds.offeringId).count,
    0
  );
  cancelContext.cleanup();

  const failureContext = createTestContext({
    enrollmentTestState: { withdrawalFailureIdentifiers: ['conflict.student@example.com'] }
  });
  const failureClient = await createAuthenticatedClient(failureContext.app, 'conflict.student@example.com');
  const failureIds = getConflictEnrollmentIds(failureContext.db);

  const failure = await failureClient
    .post(`/enrollment/withdraw/${failureIds.offeringId}`)
    .type('form')
    .send({ action: 'confirm' });
  assert.equal(failure.status, 500);
  assert.match(failure.text, /Withdrawal could not be completed right now\. Please retry\./);
  assert.equal(
    failureContext.db
      .prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = ? AND offering_id = ?')
      .get(failureIds.accountId, failureIds.offeringId).count,
    1
  );
  assert.equal(
    failureContext.db
      .prepare('SELECT COUNT(*) AS count FROM withdrawal_records WHERE account_id = ? AND offering_id = ?')
      .get(failureIds.accountId, failureIds.offeringId).count,
    0
  );

  failureContext.cleanup();
});

test('class removal applies drop before the deadline and withdrawal after the deadline', async () => {
  const dropContext = createTestContext();
  const dropClient = await createAuthenticatedClient(dropContext.app, 'conflict.student@example.com');
  const dropIds = getConflictEnrollmentIds(dropContext.db);

  const preview = await dropClient.get(`/enrollment/remove/${dropIds.offeringId}`);
  assert.equal(preview.status, 200);
  assert.match(preview.text, /Classification: Drop/);
  assert.match(preview.text, /Drop policy applies/);

  const result = await dropClient.post(`/enrollment/remove/${dropIds.offeringId}`).type('form').send({ action: 'confirm' });
  assert.equal(result.status, 200);
  assert.match(result.text, /was removed successfully/);
  assert.match(result.text, /Classification: Drop/);
  assert.equal(
    dropContext.db
      .prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = ? AND offering_id = ?')
      .get(dropIds.accountId, dropIds.offeringId).count,
    0
  );
  assert.equal(
    dropContext.db
      .prepare('SELECT COUNT(*) AS count FROM drop_records WHERE account_id = ? AND offering_id = ?')
      .get(dropIds.accountId, dropIds.offeringId).count,
    1
  );
  dropContext.cleanup();

  const withdrawalContext = createTestContext({
    now: new Date('2026-09-16T00:00:00.000Z')
  });
  const withdrawalClient = await createAuthenticatedClient(withdrawalContext.app, 'conflict.student@example.com');
  const withdrawalIds = getConflictEnrollmentIds(withdrawalContext.db);

  const withdrawalPreview = await withdrawalClient.get(`/enrollment/remove/${withdrawalIds.offeringId}`);
  assert.equal(withdrawalPreview.status, 200);
  assert.match(withdrawalPreview.text, /Classification: Withdrawal/);

  const withdrawalResult = await withdrawalClient
    .post(`/enrollment/remove/${withdrawalIds.offeringId}`)
    .type('form')
    .send({ action: 'confirm' });
  assert.equal(withdrawalResult.status, 200);
  assert.match(withdrawalResult.text, /Classification: Withdrawal/);
  assert.equal(
    withdrawalContext.db
      .prepare('SELECT COUNT(*) AS count FROM withdrawal_records WHERE account_id = ? AND offering_id = ?')
      .get(withdrawalIds.accountId, withdrawalIds.offeringId).count,
    1
  );
  withdrawalContext.cleanup();
});

test('class removal blocks when policy cannot be determined and preserves schedule on update failure', async () => {
  const blockedContext = createTestContext({
    deadlineTestState: { failureIdentifiers: ['conflict.student@example.com'] }
  });
  const blockedClient = await createAuthenticatedClient(blockedContext.app, 'conflict.student@example.com');
  const blockedIds = getConflictEnrollmentIds(blockedContext.db);

  const blockedPreview = await blockedClient.get(`/enrollment/remove/${blockedIds.offeringId}`);
  assert.equal(blockedPreview.status, 409);
  assert.match(blockedPreview.text, /Please retry later/);
  assert.equal(
    blockedContext.db
      .prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = ? AND offering_id = ?')
      .get(blockedIds.accountId, blockedIds.offeringId).count,
    1
  );
  blockedContext.cleanup();

  const failedContext = createTestContext({
    enrollmentTestState: { removalFailureIdentifiers: ['conflict.student@example.com'] }
  });
  const failedClient = await createAuthenticatedClient(failedContext.app, 'conflict.student@example.com');
  const failedIds = getConflictEnrollmentIds(failedContext.db);

  const failedResult = await failedClient
    .post(`/enrollment/remove/${failedIds.offeringId}`)
    .type('form')
    .send({ action: 'confirm' });
  assert.equal(failedResult.status, 500);
  assert.match(failedResult.text, /could not be completed/);
  assert.equal(
    failedContext.db
      .prepare('SELECT COUNT(*) AS count FROM class_enrollments WHERE account_id = ? AND offering_id = ?')
      .get(failedIds.accountId, failedIds.offeringId).count,
    1
  );
  assert.equal(
    failedContext.db
      .prepare('SELECT COUNT(*) AS count FROM drop_records WHERE account_id = ? AND offering_id = ?')
      .get(failedIds.accountId, failedIds.offeringId).count,
    0
  );
  assert.equal(
    failedContext.db
      .prepare('SELECT COUNT(*) AS count FROM withdrawal_records WHERE account_id = ? AND offering_id = ?')
      .get(failedIds.accountId, failedIds.offeringId).count,
    0
  );
  failedContext.cleanup();
});

test('student can join a waitlist for a full section and see current waitlist status', async () => {
  const context = createTestContext();
  const client = await createAuthenticatedClient(context.app, 'userA@example.com');
  const offeringId = getOfferingId(context.db, 'O_FULL');
  const accountId = context.db.prepare('SELECT id FROM accounts WHERE email = ?').get('userA@example.com').id;

  const preview = await client.get(`/enrollment/waitlist/${offeringId}`);
  assert.equal(preview.status, 200);
  assert.match(preview.text, /Join Waitlist/);
  assert.match(preview.text, /0 seats remaining/);

  const result = await client.post(`/enrollment/waitlist/${offeringId}`).type('form').send({ action: 'confirm' });
  assert.equal(result.status, 200);
  assert.match(result.text, /waitlisted successfully/);
  assert.match(result.text, /Waitlist position: 2/);
  assert.equal(
    context.db.prepare('SELECT COUNT(*) AS count FROM waitlist_entries WHERE account_id = ? AND offering_id = ?').get(accountId, offeringId).count,
    1
  );
  context.cleanup();
});

test('waitlist blocks unavailable, duplicate, ineligible, and failure cases without creating partial entries', async () => {
  const unavailableContext = createTestContext();
  const unavailableClient = await createAuthenticatedClient(unavailableContext.app, 'userA@example.com');
  const unavailableId = getOfferingId(unavailableContext.db, 'O_NOWL');
  const unavailable = await unavailableClient.get(`/enrollment/waitlist/${unavailableId}`);
  assert.equal(unavailable.status, 409);
  assert.match(unavailable.text, /Waitlist unavailable/);
  assert.match(unavailable.text, /O_ALT_OPEN/);
  unavailableContext.cleanup();

  const duplicateContext = createTestContext();
  const duplicateClient = await createAuthenticatedClient(duplicateContext.app, 'conflict.student@example.com');
  const duplicateId = getOfferingId(duplicateContext.db, 'O_FULL');
  const duplicate = await duplicateClient.post(`/enrollment/waitlist/${duplicateId}`).type('form').send({ action: 'confirm' });
  assert.equal(duplicate.status, 409);
  assert.match(duplicate.text, /already waitlisted/i);
  duplicateContext.cleanup();

  const holdContext = createTestContext();
  const holdClient = await createAuthenticatedClient(holdContext.app, 'hold.student@example.com');
  const holdId = getOfferingId(holdContext.db, 'O_FULL');
  const hold = await holdClient.post(`/enrollment/waitlist/${holdId}`).type('form').send({ action: 'confirm' });
  assert.equal(hold.status, 409);
  assert.match(hold.text, /Resolve the registration hold before retrying/);
  holdContext.cleanup();

  const failureContext = createTestContext({
    enrollmentTestState: { waitlistFailureIdentifiers: ['outage.user@example.com'] }
  });
  const failureClient = await createAuthenticatedClient(failureContext.app, 'outage.user@example.com');
  const failureId = getOfferingId(failureContext.db, 'O_FULL');
  const outageAccountId = failureContext.db.prepare('SELECT id FROM accounts WHERE email = ?').get('outage.user@example.com').id;
  const failure = await failureClient.post(`/enrollment/waitlist/${failureId}`).type('form').send({ action: 'confirm' });
  assert.equal(failure.status, 500);
  assert.match(failure.text, /No waitlist entry was created/);
  assert.equal(
    failureContext.db.prepare('SELECT COUNT(*) AS count FROM waitlist_entries WHERE account_id = ? AND offering_id = ?').get(outageAccountId, failureId).count,
    0
  );
  failureContext.cleanup();
});
