const test = require('node:test');
const assert = require('node:assert/strict');

const { createProfileController } = require('../../src/controllers/profile-controller');

function createResponse() {
  return {
    body: '',
    redirectUrl: '',
    statusCode: null,
    redirect(url) {
      this.redirectUrl = url;
      return url;
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
  return createProfileController({
    accountModel: {
      findById(id) {
        if (id === 1) {
          return { id: 1, email: 'userA@example.com', role: 'student', username: 'userA' };
        }
        if (id === 2) {
          return { id: 2, email: 'admin@example.com', role: 'admin', username: 'adminUser' };
        }
        return null;
      }
    },
    contactInfoModel: {
      getByAccountId() {
        return {
          accountId: 1,
          contactEmail: 'userA.contact@example.com',
          emergencyFullName: 'Jordan Example',
          emergencyPhoneNumber: '+1 780 555 2234',
          emergencyRelationship: 'Parent',
          phoneNumber: '+1 780 555 1234',
          updatedAt: '2026-03-07T12:00:00.000Z',
          version: 1
        };
      },
      saveByAccountId(accountId, values, options) {
        return {
          conflictDetected: false,
          contactInformation: {
            accountId,
            contactEmail: values.contactEmail,
            emergencyFullName: values.emergencyFullName,
            emergencyPhoneNumber: values.emergencyPhoneNumber,
            emergencyRelationship: values.emergencyRelationship,
            phoneNumber: values.phoneNumber,
            updatedAt: options.updatedAt,
            version: Number(options.submittedVersion || 0) + 1
          }
        };
      }
    },
    now() {
      return new Date('2026-03-07T12:00:00.000Z');
    },
    personalDetailsModel: {
      getByAccountId(accountId) {
        return {
          accountId,
          birthDate: '2001-04-15',
          countryOfOrigin: 'Canada',
          firstName: 'Alex',
          lastName: 'Example',
          updatedAt: '2026-03-07T12:00:00.000Z',
          version: 1
        };
      },
      saveByAccountId(accountId, values, options) {
        return {
          conflictDetected: false,
          personalDetails: {
            accountId,
            birthDate: values.birthDate,
            countryOfOrigin: values.countryOfOrigin,
            firstName: values.firstName,
            lastName: values.lastName,
            updatedAt: options.updatedAt,
            version: Number(options.submittedVersion || 0) + 1
          }
        };
      }
    },
    profileTestState: {
      contactSaveFailureIdentifiers: [],
      personalSaveFailureIdentifiers: []
    },
    ...overrides
  });
}

test('profile controller redirects to login when the session account cannot be found', () => {
  const controller = createController({
    accountModel: {
      findById() {
        return null;
      }
    }
  });

  const personalResponse = createResponse();
  controller.getPersonalInformationPage(
    { session: { accountId: 999 } },
    personalResponse
  );
  assert.equal(
    personalResponse.redirectUrl,
    '/login?returnTo=%2Faccount%2Fpersonal-information'
  );

  const contactResponse = createResponse();
  controller.postContactInformation(
    { body: {}, session: { accountId: 999 } },
    contactResponse
  );
  assert.equal(
    contactResponse.redirectUrl,
    '/login?returnTo=%2Faccount%2Fcontact-information'
  );

  const contactPageResponse = createResponse();
  controller.getContactInformationPage(
    { session: { accountId: 999 } },
    contactPageResponse
  );
  assert.equal(
    contactPageResponse.redirectUrl,
    '/login?returnTo=%2Faccount%2Fcontact-information'
  );

  const personalPostResponse = createResponse();
  controller.postPersonalInformation(
    { body: {}, session: { accountId: 999 } },
    personalPostResponse
  );
  assert.equal(
    personalPostResponse.redirectUrl,
    '/login?returnTo=%2Faccount%2Fpersonal-information'
  );
});

test('profile controller renders admin personal pages, validation errors, and save failures', () => {
  const getController = createController({
    personalDetailsModel: {
      getByAccountId(accountId) {
        return {
          accountId,
          birthDate: null,
          countryOfOrigin: null,
          firstName: null,
          lastName: null,
          updatedAt: null,
          version: 0
        };
      },
      saveByAccountId() {
        throw new Error('save should not run for the GET branch');
      }
    }
  });
  const getResponse = createResponse();
  getController.getPersonalInformationPage(
    { session: { accountId: 2 } },
    getResponse
  );
  assert.equal(getResponse.statusCode, 200);
  assert.match(getResponse.body, /Update Personal Information/);
  assert.match(getResponse.body, /No personal information has been saved yet\./);
  assert.match(getResponse.body, /data-return-to='\/dashboard#personal-profile'/);

  const validationController = createController();
  const validationResponse = createResponse();
  validationController.postPersonalInformation(
    {
      body: {
        birthday: 'not-a-date',
        countryOfOrigin: '',
        firstName: '',
        lastName: '',
        submittedVersion: '1'
      },
      session: { accountId: 1 }
    },
    validationResponse
  );
  assert.equal(validationResponse.statusCode, 400);
  assert.match(validationResponse.body, /Please correct the highlighted personal details\./);
  assert.match(validationResponse.body, /First name is required\./);
  assert.match(validationResponse.body, /Birthday must use the format dd\/mm\/yyyy\./);

  const failureController = createController({
    personalDetailsModel: {
      getByAccountId(accountId) {
        return {
          accountId,
          birthDate: '1979-02-20',
          countryOfOrigin: 'Canada',
          firstName: 'Taylor',
          lastName: 'Admin',
          updatedAt: '2026-03-07T12:00:00.000Z',
          version: 1
        };
      },
      saveByAccountId(accountId, values, options) {
        assert.equal(accountId, 2);
        assert.equal(values.firstName, 'Taylor');
        assert.equal(options.simulateFailure, true);
        throw new Error('boom');
      }
    },
    profileTestState: {
      contactSaveFailureIdentifiers: [],
      personalSaveFailureIdentifiers: ['adminuser']
    }
  });
  const failureResponse = createResponse();
  failureController.postPersonalInformation(
    {
      body: {
        birthday: '20/02/1979',
        countryOfOrigin: 'Canada',
        firstName: 'Taylor',
        lastName: 'Admin',
        submittedVersion: '1'
      },
      session: { accountId: 2 }
    },
    failureResponse
  );
  assert.equal(failureResponse.statusCode, 500);
  assert.match(failureResponse.body, /We could not save your personal information\. Please retry\./);
});

test('profile controller renders contact fallback state, validation errors, conflict notices, and save failures', () => {
  const getController = createController({
    contactInfoModel: {
      getByAccountId(accountId) {
        return {
          accountId,
          contactEmail: '',
          emergencyFullName: '',
          emergencyPhoneNumber: '',
          emergencyRelationship: '',
          phoneNumber: '',
          updatedAt: null,
          version: 0
        };
      },
      saveByAccountId() {
        throw new Error('save should not run for the GET branch');
      }
    }
  });
  const getResponse = createResponse();
  getController.getContactInformationPage(
    { session: { accountId: 1 } },
    getResponse
  );
  assert.equal(getResponse.statusCode, 200);
  assert.match(getResponse.body, /Update Contact Information/);
  assert.match(getResponse.body, /No contact information has been saved yet\./);
  assert.match(getResponse.body, /data-return-to='\/dashboard#security-center'/);

  const validationController = createController();
  const validationResponse = createResponse();
  validationController.postContactInformation(
    {
      body: {
        contactEmail: 'not-an-email',
        emergencyFullName: '',
        emergencyPhoneNumber: 'abc123',
        emergencyRelationship: '',
        phoneNumber: '123456',
        submittedVersion: '1'
      },
      session: { accountId: 1 }
    },
    validationResponse
  );
  assert.equal(validationResponse.statusCode, 400);
  assert.match(validationResponse.body, /Please correct the highlighted contact details\./);
  assert.match(validationResponse.body, /Enter a valid email address\./);
  assert.match(validationResponse.body, /Emergency contact relationship is required\./);

  const conflictController = createController({
    contactInfoModel: {
      getByAccountId(accountId) {
        return {
          accountId,
          contactEmail: 'old@example.com',
          emergencyFullName: 'Old Contact',
          emergencyPhoneNumber: '+1 780 555 0000',
          emergencyRelationship: 'Friend',
          phoneNumber: '+1 780 555 1111',
          updatedAt: '2026-03-07T12:00:00.000Z',
          version: 3
        };
      },
      saveByAccountId(accountId, values) {
        return {
          conflictDetected: true,
          contactInformation: {
            accountId,
            contactEmail: values.contactEmail,
            emergencyFullName: values.emergencyFullName,
            emergencyPhoneNumber: values.emergencyPhoneNumber,
            emergencyRelationship: values.emergencyRelationship,
            phoneNumber: values.phoneNumber,
            updatedAt: '2026-03-07T12:30:00.000Z',
            version: 4
          }
        };
      }
    },
    profileTestState: {
      contactSaveFailureIdentifiers: [null],
      personalSaveFailureIdentifiers: []
    }
  });
  const conflictResponse = createResponse();
  conflictController.postContactInformation(
    {
      body: {
        contactEmail: 'fresh@example.com',
        emergencyFullName: 'Jordan Example',
        emergencyPhoneNumber: '+1 780 555 2234',
        emergencyRelationship: 'Parent',
        phoneNumber: '+1 780 555 1234',
        submittedVersion: '1'
      },
      session: { accountId: 1 }
    },
    conflictResponse
  );
  assert.equal(conflictResponse.statusCode, 200);
  assert.match(
    conflictResponse.body,
    /Another update occurred while you were editing, so your changes were saved as the latest version\./
  );
  assert.match(conflictResponse.body, /fresh@example\.com/);

  const failureController = createController({
    contactInfoModel: {
      getByAccountId(accountId) {
        return {
          accountId,
          contactEmail: 'userA.contact@example.com',
          emergencyFullName: 'Jordan Example',
          emergencyPhoneNumber: '+1 780 555 2234',
          emergencyRelationship: 'Parent',
          phoneNumber: '+1 780 555 1234',
          updatedAt: '2026-03-07T12:00:00.000Z',
          version: 1
        };
      },
      saveByAccountId(accountId, values, options) {
        assert.equal(accountId, 1);
        assert.equal(values.contactEmail, 'userA.contact@example.com');
        assert.equal(options.simulateFailure, true);
        throw new Error('boom');
      }
    },
    profileTestState: {
      contactSaveFailureIdentifiers: ['usera'],
      personalSaveFailureIdentifiers: []
    }
  });
  const failureResponse = createResponse();
  failureController.postContactInformation(
    {
      body: {
        contactEmail: 'userA.contact@example.com',
        emergencyFullName: 'Jordan Example',
        emergencyPhoneNumber: '+1 780 555 2234',
        emergencyRelationship: 'Parent',
        phoneNumber: '+1 780 555 1234',
        submittedVersion: '1'
      },
      session: { accountId: 1 }
    },
    failureResponse
  );
  assert.equal(failureResponse.statusCode, 500);
  assert.match(
    failureResponse.body,
    /We could not save your contact information\. Please retry later\./
  );
});

test('profile controller succeeds when profile test state is omitted', () => {
  const controller = createController({
    profileTestState: undefined
  });

  const personalResponse = createResponse();
  controller.postPersonalInformation(
    {
      body: {
        birthday: '15/04/2001',
        countryOfOrigin: 'Canada',
        firstName: 'Alex',
        lastName: 'Example',
        submittedVersion: '1'
      },
      session: { accountId: 1 }
    },
    personalResponse
  );
  assert.equal(personalResponse.statusCode, 200);
  assert.match(personalResponse.body, /Personal information updated successfully./);

  const contactResponse = createResponse();
  controller.postContactInformation(
    {
      body: {
        contactEmail: 'userA.contact@example.com',
        emergencyFullName: 'Jordan Example',
        emergencyPhoneNumber: '+1 780 555 2234',
        emergencyRelationship: 'Parent',
        phoneNumber: '+1 780 555 1234',
        submittedVersion: '1'
      },
      session: { accountId: 1 }
    },
    contactResponse
  );
  assert.equal(contactResponse.statusCode, 200);
  assert.match(contactResponse.body, /Contact information updated successfully./);
});
