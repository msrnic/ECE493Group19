const PERSONAL_TEXT_LIMIT = 100;
const CONTACT_EMAIL_LIMIT = 120;
const CONTACT_NAME_LIMIT = 120;
const CONTACT_PHONE_LIMIT = 30;
const CONTACT_RELATIONSHIP_LIMIT = 60;

function normalizeText(value) {
  return String(value || '').trim();
}

function parseSubmittedVersion(value) {
  const parsed = Number.parseInt(String(value || '').trim(), 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

function formatBirthdayForDisplay(isoDate) {
  const value = normalizeText(isoDate);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return value;
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
}

function createUtcDate(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day));
}

function parseBirthdayInput(value, now = new Date()) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return {
      errorMessage: 'Birthday is required.',
      isoDate: null,
      isValid: false
    };
  }

  let year = 0;
  let month = 0;
  let day = 0;
  let match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(normalized);

  if (match) {
    day = Number(match[1]);
    month = Number(match[2]);
    year = Number(match[3]);
  } else {
    match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
    if (!match) {
      return {
        errorMessage: 'Birthday must use the format dd/mm/yyyy.',
        isoDate: null,
        isValid: false
      };
    }

    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
  }

  const candidate = createUtcDate(year, month, day);
  if (
    Number.isNaN(candidate.getTime()) ||
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return {
      errorMessage: 'Birthday must be a valid calendar date.',
      isoDate: null,
      isValid: false
    };
  }

  const today = createUtcDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate());
  if (candidate.getTime() > today.getTime()) {
    return {
      errorMessage: 'Birthday cannot be in the future.',
      isoDate: null,
      isValid: false
    };
  }

  return {
    errorMessage: '',
    isoDate: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    isValid: true
  };
}

function validateMaximumLength(fieldErrors, fieldKey, value, limit, label) {
  if (normalizeText(value).length > limit) {
    fieldErrors[fieldKey] = `${label} must be ${limit} characters or fewer.`;
  }
}

function validatePersonalInformation(input, options = {}) {
  const now = options.now || new Date();
  const fieldErrors = {};
  const values = {
    birthdayInput: normalizeText(input.birthday),
    countryOfOrigin: normalizeText(input.countryOfOrigin),
    firstName: normalizeText(input.firstName),
    lastName: normalizeText(input.lastName),
    submittedVersion: parseSubmittedVersion(input.submittedVersion)
  };

  if (!values.firstName) {
    fieldErrors.firstName = 'First name is required.';
  }
  if (!values.lastName) {
    fieldErrors.lastName = 'Last name is required.';
  }
  if (!values.countryOfOrigin) {
    fieldErrors.countryOfOrigin = 'Country of origin is required.';
  }

  validateMaximumLength(fieldErrors, 'firstName', values.firstName, PERSONAL_TEXT_LIMIT, 'First name');
  validateMaximumLength(fieldErrors, 'lastName', values.lastName, PERSONAL_TEXT_LIMIT, 'Last name');
  validateMaximumLength(
    fieldErrors,
    'countryOfOrigin',
    values.countryOfOrigin,
    PERSONAL_TEXT_LIMIT,
    'Country of origin'
  );

  const birthday = parseBirthdayInput(values.birthdayInput, now);
  if (!birthday.isValid) {
    fieldErrors.birthday = birthday.errorMessage;
  }

  return {
    fieldErrors,
    isValid: Object.keys(fieldErrors).length === 0,
    values: {
      ...values,
      birthDate: birthday.isoDate
    }
  };
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  if (!/^[+\d\s().-]+$/.test(value)) {
    return false;
  }

  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function validateContactInformation(input) {
  const fieldErrors = {};
  const values = {
    contactEmail: normalizeText(input.contactEmail),
    emergencyFullName: normalizeText(input.emergencyFullName),
    emergencyPhoneNumber: normalizeText(input.emergencyPhoneNumber),
    emergencyRelationship: normalizeText(input.emergencyRelationship),
    phoneNumber: normalizeText(input.phoneNumber),
    submittedVersion: parseSubmittedVersion(input.submittedVersion)
  };

  if (!values.contactEmail) {
    fieldErrors.contactEmail = 'Contact email is required.';
  } else if (!isValidEmail(values.contactEmail)) {
    fieldErrors.contactEmail = 'Enter a valid email address.';
  }

  if (!values.phoneNumber) {
    fieldErrors.phoneNumber = 'Phone number is required.';
  } else if (!isValidPhone(values.phoneNumber)) {
    fieldErrors.phoneNumber = 'Enter a valid phone number.';
  }

  if (!values.emergencyFullName) {
    fieldErrors.emergencyFullName = 'Emergency contact name is required.';
  }
  if (!values.emergencyPhoneNumber) {
    fieldErrors.emergencyPhoneNumber = 'Emergency contact phone number is required.';
  } else if (!isValidPhone(values.emergencyPhoneNumber)) {
    fieldErrors.emergencyPhoneNumber = 'Enter a valid emergency contact phone number.';
  }
  if (!values.emergencyRelationship) {
    fieldErrors.emergencyRelationship = 'Emergency contact relationship is required.';
  }

  validateMaximumLength(
    fieldErrors,
    'contactEmail',
    values.contactEmail,
    CONTACT_EMAIL_LIMIT,
    'Contact email'
  );
  validateMaximumLength(
    fieldErrors,
    'phoneNumber',
    values.phoneNumber,
    CONTACT_PHONE_LIMIT,
    'Phone number'
  );
  validateMaximumLength(
    fieldErrors,
    'emergencyFullName',
    values.emergencyFullName,
    CONTACT_NAME_LIMIT,
    'Emergency contact name'
  );
  validateMaximumLength(
    fieldErrors,
    'emergencyPhoneNumber',
    values.emergencyPhoneNumber,
    CONTACT_PHONE_LIMIT,
    'Emergency contact phone number'
  );
  validateMaximumLength(
    fieldErrors,
    'emergencyRelationship',
    values.emergencyRelationship,
    CONTACT_RELATIONSHIP_LIMIT,
    'Emergency contact relationship'
  );

  return {
    fieldErrors,
    isValid: Object.keys(fieldErrors).length === 0,
    values
  };
}

module.exports = {
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
};
