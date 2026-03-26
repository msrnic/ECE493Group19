const test = require('node:test');
const assert = require('node:assert/strict');

const {
  CONTACT_EMAIL_LIMIT,
  CONTACT_NAME_LIMIT,
  CONTACT_PHONE_LIMIT,
  CONTACT_RELATIONSHIP_LIMIT,
  PERSONAL_TEXT_LIMIT,
  formatBirthdayForDisplay,
  normalizeText,
  parseBirthdayInput,
  parseSubmittedVersion,
  validateContactInformation,
  validatePersonalInformation
} = require('../../src/controllers/validators/profile-validator');

test('profile validator helper functions normalize text, versions, and birthday formatting', () => {
  assert.equal(normalizeText('  Canada  '), 'Canada');
  assert.equal(normalizeText(null), '');
  assert.equal(parseSubmittedVersion('4'), 4);
  assert.equal(parseSubmittedVersion('-1'), 0);
  assert.equal(parseSubmittedVersion('nope'), 0);
  assert.equal(formatBirthdayForDisplay('2001-04-15'), '15/04/2001');
  assert.equal(formatBirthdayForDisplay('15/04/2001'), '15/04/2001');

  assert.deepEqual(parseBirthdayInput('15/04/2001', new Date('2026-03-07T12:00:00.000Z')), {
    errorMessage: '',
    isoDate: '2001-04-15',
    isValid: true
  });
  assert.deepEqual(parseBirthdayInput('2001-04-15', new Date('2026-03-07T12:00:00.000Z')), {
    errorMessage: '',
    isoDate: '2001-04-15',
    isValid: true
  });
});

test('personal-information validation rejects missing, malformed, future, and overlong inputs', () => {
  const missing = validatePersonalInformation(
    {
      birthday: '',
      countryOfOrigin: '',
      firstName: '',
      lastName: '',
      submittedVersion: '-5'
    },
    { now: new Date('2026-03-07T12:00:00.000Z') }
  );
  assert.equal(missing.isValid, false);
  assert.deepEqual(missing.fieldErrors, {
    birthday: 'Birthday is required.',
    countryOfOrigin: 'Country of origin is required.',
    firstName: 'First name is required.',
    lastName: 'Last name is required.'
  });
  assert.equal(missing.values.submittedVersion, 0);

  const malformed = validatePersonalInformation(
    {
      birthday: '2001/04/15',
      countryOfOrigin: 'Canada',
      firstName: 'Alex',
      lastName: 'Example',
      submittedVersion: '1'
    },
    { now: new Date('2026-03-07T12:00:00.000Z') }
  );
  assert.equal(malformed.fieldErrors.birthday, 'Birthday must use the format dd/mm/yyyy.');

  const invalidCalendar = validatePersonalInformation(
    {
      birthday: '31/02/2001',
      countryOfOrigin: 'Canada',
      firstName: 'Alex',
      lastName: 'Example',
      submittedVersion: '1'
    },
    { now: new Date('2026-03-07T12:00:00.000Z') }
  );
  assert.equal(invalidCalendar.fieldErrors.birthday, 'Birthday must be a valid calendar date.');

  const future = validatePersonalInformation(
    {
      birthday: '08/03/2026',
      countryOfOrigin: 'Canada',
      firstName: 'Alex',
      lastName: 'Example',
      submittedVersion: '1'
    },
    { now: new Date('2026-03-07T12:00:00.000Z') }
  );
  assert.equal(future.fieldErrors.birthday, 'Birthday cannot be in the future.');

  const overlong = validatePersonalInformation(
    {
      birthday: '15/04/2001',
      countryOfOrigin: 'C'.repeat(PERSONAL_TEXT_LIMIT + 1),
      firstName: 'A'.repeat(PERSONAL_TEXT_LIMIT + 1),
      lastName: 'B'.repeat(PERSONAL_TEXT_LIMIT + 1),
      submittedVersion: '2'
    },
    { now: new Date('2026-03-07T12:00:00.000Z') }
  );
  assert.equal(overlong.fieldErrors.firstName, `First name must be ${PERSONAL_TEXT_LIMIT} characters or fewer.`);
  assert.equal(overlong.fieldErrors.lastName, `Last name must be ${PERSONAL_TEXT_LIMIT} characters or fewer.`);
  assert.equal(
    overlong.fieldErrors.countryOfOrigin,
    `Country of origin must be ${PERSONAL_TEXT_LIMIT} characters or fewer.`
  );

  const valid = validatePersonalInformation(
    {
      birthday: '15/04/2001',
      countryOfOrigin: 'Canada',
      firstName: 'Alex',
      lastName: 'Example',
      submittedVersion: '3'
    },
    { now: new Date('2026-03-07T12:00:00.000Z') }
  );
  assert.equal(valid.isValid, true);
  assert.deepEqual(valid.fieldErrors, {});
  assert.equal(valid.values.birthDate, '2001-04-15');

  const defaultNow = validatePersonalInformation({
    birthday: '15/04/2001',
    countryOfOrigin: 'Canada',
    firstName: 'Alex',
    lastName: 'Example'
  });
  assert.equal(defaultNow.isValid, true);
  assert.equal(defaultNow.values.submittedVersion, 0);
});

test('contact-information validation enforces required, format, digit-count, and length rules', () => {
  const missing = validateContactInformation({
    contactEmail: '',
    emergencyFullName: '',
    emergencyPhoneNumber: '',
    emergencyRelationship: '',
    phoneNumber: '',
    submittedVersion: '1'
  });
  assert.equal(missing.isValid, false);
  assert.deepEqual(missing.fieldErrors, {
    contactEmail: 'Contact email is required.',
    emergencyFullName: 'Emergency contact name is required.',
    emergencyPhoneNumber: 'Emergency contact phone number is required.',
    emergencyRelationship: 'Emergency contact relationship is required.',
    phoneNumber: 'Phone number is required.'
  });

  const invalid = validateContactInformation({
    contactEmail: 'bad-email',
    emergencyFullName: 'Jordan Example',
    emergencyPhoneNumber: 'abc1234',
    emergencyRelationship: 'Parent',
    phoneNumber: '123456',
    submittedVersion: '2'
  });
  assert.equal(invalid.fieldErrors.contactEmail, 'Enter a valid email address.');
  assert.equal(invalid.fieldErrors.phoneNumber, 'Enter a valid phone number.');
  assert.equal(
    invalid.fieldErrors.emergencyPhoneNumber,
    'Enter a valid emergency contact phone number.'
  );

  const overlong = validateContactInformation({
    contactEmail: `${'a'.repeat(CONTACT_EMAIL_LIMIT)}@example.com`,
    emergencyFullName: 'N'.repeat(CONTACT_NAME_LIMIT + 1),
    emergencyPhoneNumber: `+1 ${'2'.repeat(CONTACT_PHONE_LIMIT + 1)}`,
    emergencyRelationship: 'R'.repeat(CONTACT_RELATIONSHIP_LIMIT + 1),
    phoneNumber: `+1 ${'1'.repeat(CONTACT_PHONE_LIMIT + 1)}`,
    submittedVersion: '3'
  });
  assert.equal(
    overlong.fieldErrors.contactEmail,
    `Contact email must be ${CONTACT_EMAIL_LIMIT} characters or fewer.`
  );
  assert.equal(
    overlong.fieldErrors.phoneNumber,
    `Phone number must be ${CONTACT_PHONE_LIMIT} characters or fewer.`
  );
  assert.equal(
    overlong.fieldErrors.emergencyFullName,
    `Emergency contact name must be ${CONTACT_NAME_LIMIT} characters or fewer.`
  );
  assert.equal(
    overlong.fieldErrors.emergencyPhoneNumber,
    `Emergency contact phone number must be ${CONTACT_PHONE_LIMIT} characters or fewer.`
  );
  assert.equal(
    overlong.fieldErrors.emergencyRelationship,
    `Emergency contact relationship must be ${CONTACT_RELATIONSHIP_LIMIT} characters or fewer.`
  );

  const valid = validateContactInformation({
    contactEmail: 'userA.contact@example.com',
    emergencyFullName: 'Jordan Example',
    emergencyPhoneNumber: '+1 780 555 2234',
    emergencyRelationship: 'Parent',
    phoneNumber: '+1 780 555 1234',
    submittedVersion: '4'
  });
  assert.equal(valid.isValid, true);
  assert.deepEqual(valid.fieldErrors, {});
  assert.equal(valid.values.submittedVersion, 4);

  const defaultVersion = validateContactInformation({
    contactEmail: 'userA.contact@example.com',
    emergencyFullName: 'Jordan Example',
    emergencyPhoneNumber: '+1 780 555 2234',
    emergencyRelationship: 'Parent',
    phoneNumber: '+1 780 555 1234'
  });
  assert.equal(defaultVersion.isValid, true);
  assert.equal(defaultVersion.values.submittedVersion, 0);
});
