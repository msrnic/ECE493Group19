const test = require('node:test');
const assert = require('node:assert/strict');

const { createEnrollmentController } = require('../../src/controllers/enrollment-controller');

function createResponseRecorder() {
  return {
    body: '',
    redirectedTo: null,
    statusCode: 200,
    redirect(value) {
      this.redirectedTo = value;
      return this;
    },
    send(value) {
      this.body = value;
      return this;
    },
    status(value) {
      this.statusCode = value;
      return this;
    }
  };
}

function createServices(overrides = {}) {
  const baseServices = {
    enrollmentModel: {
      listCurrentSchedule() {
        return [];
      },
      listMatchingOfferings() {
        return [];
      }
    },
    enrollmentService: {
      getCourseCapacityView() {
        return [];
      },
      getCurrentWaitlists() {
        return [];
      },
      getRemovalPreview() {
        return { message: 'This class is no longer in your current schedule.', status: 'not_found' };
      },
      getWaitlistPreview() {
        return { message: 'Class offering was not found.', status: 'not_found' };
      },
      getWithdrawalPreview() {
        return { message: 'This class is no longer in your current schedule.', status: 'not_found' };
      },
      enrollStudent() {
        return { message: 'Class offering was not found.', status: 'not_found' };
      },
      joinWaitlist() {
        return { message: 'Waitlist request could not be completed right now. No waitlist entry was created.', status: 'error' };
      },
      removeStudent() {
        return { message: 'This class is no longer in your current schedule.', status: 'not_found' };
      },
      withdrawStudent() {
        return { message: 'This class is no longer in your current schedule.', status: 'not_found' };
      }
    },
    studentAccountModel: {
      findActiveByAccountId(accountId) {
        return accountId === 1 ? { accountId: 1 } : null;
      }
    }
  };

  return {
    ...baseServices,
    ...overrides,
    enrollmentModel: { ...baseServices.enrollmentModel, ...(overrides.enrollmentModel || {}) },
    enrollmentService: { ...baseServices.enrollmentService, ...(overrides.enrollmentService || {}) },
    studentAccountModel: { ...baseServices.studentAccountModel, ...(overrides.studentAccountModel || {}) }
  };
}

test('enrollment controller redirects unauthenticated requests and renders empty search results', () => {
  const controller = createEnrollmentController(createServices());

  const redirectResponse = createResponseRecorder();
  controller.postEnrollment({ body: {}, session: {} }, redirectResponse);
  assert.equal(redirectResponse.redirectedTo, '/login?returnTo=%2Fenrollment');

  const emptyResponse = createResponseRecorder();
  controller.getEnrollmentPage({ query: { q: 'missing' }, session: { accountId: 1 } }, emptyResponse);
  assert.equal(emptyResponse.statusCode, 200);
  assert.match(emptyResponse.body, /No class offerings found/);
  assert.match(emptyResponse.body, /No enrolled classes yet\./);
});

test('enrollment controller shows retry guidance when enrollment creation fails', () => {
  const controller = createEnrollmentController(createServices({
    enrollmentService: {
      getCourseCapacityView() {
        return [];
      },
      getRemovalPreview() {
        return { message: 'This class is no longer in your current schedule.', status: 'not_found' };
      },
      getWithdrawalPreview() {
        return { message: 'This class is no longer in your current schedule.', status: 'not_found' };
      },
      enrollStudent() {
        return {
          message: 'Enrollment could not be completed right now. Please retry.',
          status: 'error'
        };
      },
      removeStudent() {
        return { message: 'This class is no longer in your current schedule.', status: 'not_found' };
      },
      withdrawStudent() {
        return { message: 'This class is no longer in your current schedule.', status: 'not_found' };
      }
    }
  }));
  const response = createResponseRecorder();

  controller.postEnrollment(
    { body: { offeringId: '4' }, session: { accountId: 1 } },
    response
  );

  assert.equal(response.statusCode, 500);
  assert.match(response.body, /Enrollment could not be completed right now\. Please retry\./);
  assert.match(response.body, /No enrollment was created\. Refresh your schedule and retry\./);
});

test('enrollment controller renders waitlist preview, blocked alternatives, cancel, success, and failure states', () => {
  const controller = createEnrollmentController(createServices({
    enrollmentService: {
      enrollStudent() {
        return { message: 'Class offering was not found.', status: 'not_found' };
      },
      getCourseCapacityView() {
        return [];
      },
      getCurrentWaitlists() {
        return [{
          courseCode: 'STAT252',
          offeringCode: 'O_FULL',
          title: 'Applied Statistics',
          waitlistPosition: 1,
          waitlistStatus: 'waitlisted'
        }];
      },
      getRemovalPreview() {
        return { message: 'This class is no longer in your current schedule.', status: 'not_found' };
      },
      getWaitlistPreview(student, offeringId) {
        if (offeringId === 3) {
          return {
            alternatives: [{ courseCode: 'STAT252', offeringCode: 'O_ALT_OPEN', seatsRemaining: 8, title: 'Applied Statistics' }],
            message: 'Waitlist request was blocked.',
            offering: { courseCode: 'STAT252', id: 3, offeringCode: 'O_NOWL', seatsRemaining: 0, title: 'Applied Statistics', waitlistUsesPosition: true },
            reasons: [{ code: 'waitlist_unavailable', message: 'Waitlist unavailable for this section. Try another section or course.' }],
            status: 'blocked'
          };
        }

        return {
          offering: { courseCode: 'STAT252', id: offeringId, offeringCode: 'O_FULL', seatsRemaining: 0, title: 'Applied Statistics', waitlistUsesPosition: true },
          status: 'ready'
        };
      },
      getWithdrawalPreview() {
        return { message: 'This class is no longer in your current schedule.', status: 'not_found' };
      },
      joinWaitlist(student, offeringId) {
        if (offeringId === 4) {
          return { message: 'Waitlist request could not be completed right now. No waitlist entry was created.', status: 'error' };
        }

        return {
          offering: { courseCode: 'STAT252', id: offeringId, offeringCode: 'O_FULL', title: 'Applied Statistics' },
          status: 'waitlisted',
          waitlistPosition: 2,
          waitlistStatus: 'waitlisted'
        };
      },
      removeStudent() {
        return { message: 'This class is no longer in your current schedule.', status: 'not_found' };
      },
      withdrawStudent() {
        return { message: 'This class is no longer in your current schedule.', status: 'not_found' };
      }
    }
  }));

  const previewResponse = createResponseRecorder();
  controller.getWaitlistPage({ params: { offeringId: '2' }, session: { accountId: 1 } }, previewResponse);
  assert.equal(previewResponse.statusCode, 200);
  assert.match(previewResponse.body, /Join Waitlist/);
  assert.match(previewResponse.body, /Confirm waitlist/);

  const blockedResponse = createResponseRecorder();
  controller.getWaitlistPage({ params: { offeringId: '3' }, session: { accountId: 1 } }, blockedResponse);
  assert.equal(blockedResponse.statusCode, 409);
  assert.match(blockedResponse.body, /Waitlist unavailable/);
  assert.match(blockedResponse.body, /O_ALT_OPEN/);

  const cancelResponse = createResponseRecorder();
  controller.postWaitlist(
    { body: { action: 'cancel' }, params: { offeringId: '2' }, session: { accountId: 1 } },
    cancelResponse
  );
  assert.equal(cancelResponse.statusCode, 200);
  assert.match(cancelResponse.body, /Waitlist request was canceled/);

  const successResponse = createResponseRecorder();
  controller.postWaitlist(
    { body: { action: 'confirm' }, params: { offeringId: '2' }, session: { accountId: 1 } },
    successResponse
  );
  assert.equal(successResponse.statusCode, 200);
  assert.match(successResponse.body, /waitlisted successfully/);
  assert.match(successResponse.body, /Waitlist position: 2/);

  const failureResponse = createResponseRecorder();
  controller.postWaitlist(
    { body: { action: 'confirm' }, params: { offeringId: '4' }, session: { accountId: 1 } },
    failureResponse
  );
  assert.equal(failureResponse.statusCode, 500);
  assert.match(failureResponse.body, /No waitlist entry was created/);
});

test('enrollment controller renders withdrawal preview, cancel, success, and failure states', () => {
  const controller = createEnrollmentController(createServices({
    enrollmentService: {
      enrollStudent() {
        return { message: 'Class offering was not found.', status: 'not_found' };
      },
      getCourseCapacityView() {
        return [{
          capacity: 20,
          courseCode: 'ECE320',
          id: 3,
          offeringCode: 'O_CONFLICT',
          seatsRemaining: 6,
          title: 'Embedded Systems'
        }];
      },
      getWithdrawalPreview(student, offeringId) {
        if (offeringId === 999) {
          return { message: 'This class is no longer in your current schedule.', status: 'not_found' };
        }

        return {
          implications: {
            feeImpactSummary: 'The current class charge of $410.00 remains applied after withdrawal.',
            transcriptImpact: 'A W notation will appear on your transcript for this class.'
          },
          offering: {
            courseCode: 'ECE320',
            id: offeringId,
            offeringCode: 'O_CONFLICT',
            title: 'Embedded Systems'
          },
          status: 'ready'
        };
      },
      withdrawStudent(student, offeringId) {
        if (offeringId === 500) {
          return { message: 'Withdrawal could not be completed right now. Please retry.', status: 'error' };
        }

        return {
          implications: {
            feeImpactSummary: 'The current class charge of $410.00 remains applied after withdrawal.',
            transcriptImpact: 'A W notation will appear on your transcript for this class.'
          },
          offering: {
            courseCode: 'ECE320',
            id: offeringId,
            offeringCode: 'O_CONFLICT',
            title: 'Embedded Systems'
          },
          status: 'withdrawn'
        };
      }
    }
  }));

  const previewResponse = createResponseRecorder();
  controller.getWithdrawalPage({ params: { offeringId: '3' }, session: { accountId: 1 } }, previewResponse);
  assert.equal(previewResponse.statusCode, 200);
  assert.match(previewResponse.body, /Confirm Withdrawal/);
  assert.match(previewResponse.body, /A W notation will appear/);

  const missingPreview = createResponseRecorder();
  controller.getWithdrawalPage({ params: { offeringId: '999' }, session: { accountId: 1 } }, missingPreview);
  assert.equal(missingPreview.statusCode, 404);
  assert.match(missingPreview.body, /no longer in your current schedule/i);

  const cancelResponse = createResponseRecorder();
  controller.postWithdrawal(
    { body: { action: 'cancel' }, params: { offeringId: '3' }, session: { accountId: 1 } },
    cancelResponse
  );
  assert.equal(cancelResponse.statusCode, 200);
  assert.match(cancelResponse.body, /Withdrawal was canceled/);

  const successResponse = createResponseRecorder();
  controller.postWithdrawal(
    { body: { action: 'confirm' }, params: { offeringId: '3' }, session: { accountId: 1 } },
    successResponse
  );
  assert.equal(successResponse.statusCode, 200);
  assert.match(successResponse.body, /withdrawn successfully/);

  const failureResponse = createResponseRecorder();
  controller.postWithdrawal(
    { body: { action: 'confirm' }, params: { offeringId: '500' }, session: { accountId: 1 } },
    failureResponse
  );
  assert.equal(failureResponse.statusCode, 500);
  assert.match(failureResponse.body, /Withdrawal could not be completed right now\. Please retry\./);
});

test('enrollment controller renders removal preview, blocked policy, cancel, success, and failure states', () => {
  const controller = createEnrollmentController(createServices({
    enrollmentService: {
      enrollStudent() {
        return { message: 'Class offering was not found.', status: 'not_found' };
      },
      getCourseCapacityView() {
        return [{
          capacity: 20,
          courseCode: 'ECE320',
          id: 3,
          offeringCode: 'O_CONFLICT',
          seatsRemaining: 6,
          title: 'Embedded Systems'
        }];
      },
      getRemovalPreview(student, offeringId) {
        if (offeringId === 404) {
          return { message: 'We cannot confirm add/drop deadline information right now. Please retry later.', status: 'blocked' };
        }

        return {
          classification: offeringId === 9 ? 'withdrawal' : 'drop',
          deadlineLabel: 'Sep 15, 2026, 5:59 p.m.',
          implications: {
            feeImpactSummary: offeringId === 9
              ? 'The current class charge of $410.00 remains applied after withdrawal.'
              : 'Drop policy applies. $410.00 will be reduced or refunded per deadline rules.',
            transcriptImpact: 'This removal will be processed as a drop before the deadline.'
          },
          offering: {
            courseCode: 'ECE320',
            id: offeringId,
            offeringCode: 'O_CONFLICT',
            title: 'Embedded Systems'
          },
          status: 'ready',
          timezoneName: 'America/Edmonton'
        };
      },
      withdrawStudent() {
        return { status: 'withdrawn' };
      },
      getWithdrawalPreview() {
        return { message: 'This class is no longer in your current schedule.', status: 'not_found' };
      },
      removeStudent(student, offeringId) {
        if (offeringId === 8) {
          return { message: 'The selected class removal could not be completed. Please refresh your schedule and retry.', status: 'error' };
        }

        return {
          classification: offeringId === 9 ? 'withdrawal' : 'drop',
          implications: {
            feeImpactSummary: offeringId === 9
              ? 'The current class charge of $410.00 remains applied after withdrawal.'
              : 'Drop policy applies. $410.00 will be reduced or refunded per deadline rules.'
          },
          offering: {
            courseCode: 'ECE320',
            id: offeringId,
            offeringCode: 'O_CONFLICT',
            title: 'Embedded Systems'
          },
          status: 'removed'
        };
      }
    }
  }));

  const previewResponse = createResponseRecorder();
  controller.getRemovalPage({ params: { offeringId: '3' }, session: { accountId: 1 } }, previewResponse);
  assert.equal(previewResponse.statusCode, 200);
  assert.match(previewResponse.body, /Confirm Class Removal/);
  assert.match(previewResponse.body, /Classification: Drop/);

  const blockedResponse = createResponseRecorder();
  controller.getRemovalPage({ params: { offeringId: '404' }, session: { accountId: 1 } }, blockedResponse);
  assert.equal(blockedResponse.statusCode, 409);
  assert.match(blockedResponse.body, /cannot confirm add\/drop deadline information/i);

  const cancelResponse = createResponseRecorder();
  controller.postRemoval(
    { body: { action: 'cancel' }, params: { offeringId: '3' }, session: { accountId: 1 } },
    cancelResponse
  );
  assert.equal(cancelResponse.statusCode, 200);
  assert.match(cancelResponse.body, /Class removal was canceled/);

  const successResponse = createResponseRecorder();
  controller.postRemoval(
    { body: { action: 'confirm' }, params: { offeringId: '9' }, session: { accountId: 1 } },
    successResponse
  );
  assert.equal(successResponse.statusCode, 200);
  assert.match(successResponse.body, /was removed successfully/);
  assert.match(successResponse.body, /Classification: Withdrawal/);

  const failureResponse = createResponseRecorder();
  controller.postRemoval(
    { body: { action: 'confirm' }, params: { offeringId: '8' }, session: { accountId: 1 } },
    failureResponse
  );
  assert.equal(failureResponse.statusCode, 500);
  assert.match(failureResponse.body, /could not be completed/);
});
