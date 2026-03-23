const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createAuthRedirectResponse,
  createDashboardResponse,
  createErrorResponse,
  defaultMessageForStatus
} = require('../../src/controllers/dashboard-response');
const { validateRetryRequest } = require('../../src/controllers/validators/dashboard-validator');
const { calculatePercentile } = require('../../src/models/dashboard-load-model');

test('dashboard helper utilities cover validation, response messaging, and percentile branches', () => {
  assert.equal(calculatePercentile([], 95), null);
  assert.equal(calculatePercentile([10, 20, 30], 0), 10);
  assert.equal(calculatePercentile([10, 20, 30], 100), 30);
  assert.equal(calculatePercentile([10, 20, 30, 40], 50), 20);

  assert.deepEqual(validateRetryRequest(null, [1, 2]), {
    errorCode: 'invalid_retry_request',
    isValid: false,
    message: 'Provide one or more unavailable section IDs to retry.'
  });
  assert.deepEqual(validateRetryRequest({ sectionIds: [0] }, [1, 2]), {
    errorCode: 'invalid_retry_request',
    isValid: false,
    message: 'Retry section IDs must be positive integers.'
  });
  assert.deepEqual(validateRetryRequest({ sectionIds: [3] }, [1, 2]), {
    errorCode: 'retry_section_unavailable',
    isValid: false,
    message: 'Retry requests may target only sections that are currently unavailable.'
  });
  assert.deepEqual(validateRetryRequest({ sectionIds: [2, 2, '1'] }, [1, 2]), {
    isValid: true,
    sectionIds: [2, 1]
  });

  assert.equal(defaultMessageForStatus('failure'), 'Dashboard data is unavailable right now. Retry to load your sections again.');
  assert.equal(defaultMessageForStatus('empty_access'), 'Your account has no assigned dashboard modules. Contact an administrator.');
  assert.equal(defaultMessageForStatus('auth_error'), 'Your session has expired. Sign in again.');
  assert.equal(defaultMessageForStatus('mystery'), 'Dashboard request processed.');

  assert.deepEqual(createAuthRedirectResponse('/dashboard', '/login'), {
    loginUrl: '/login',
    returnTo: '/dashboard',
    status: 'auth_error'
  });
  assert.deepEqual(createErrorResponse('invalid', 'Broken'), {
    errorCode: 'invalid',
    message: 'Broken',
    status: 'error'
  });
  assert.deepEqual(
    createDashboardResponse({
      actorId: 7,
      modules: [],
      sections: [{ sectionId: 4, availabilityStatus: 'unavailable' }],
      status: 'partial'
    }),
    {
      actorId: 7,
      message: 'Some dashboard sections are currently unavailable.',
      modules: [],
      retryAvailable: true,
      sections: [{ sectionId: 4, availabilityStatus: 'unavailable' }],
      status: 'partial',
      unavailableSectionIds: [4]
    }
  );
  assert.deepEqual(
    createDashboardResponse({
      actorId: 8,
      message: 'Custom success message',
      modules: [],
      retryAvailable: false,
      sections: [],
      status: 'success'
    }),
    {
      actorId: 8,
      message: 'Custom success message',
      modules: [],
      retryAvailable: false,
      sections: [],
      status: 'success',
      unavailableSectionIds: []
    }
  );
  assert.equal(
    createDashboardResponse({ actorId: 1, modules: [], sections: [], status: 'role_data_error' }).retryAvailable,
    true
  );
});
