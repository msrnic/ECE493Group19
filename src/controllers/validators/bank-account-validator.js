const BANK_ACCOUNT_NAME_LIMIT = 80;

function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function validateBankAccountSubmission(input = {}) {
  const values = {
    accountIdentifier: normalizeDigits(input.accountIdentifier),
    bankHolderName: String(input.bankHolderName || '').trim(),
    routingIdentifier: normalizeDigits(input.routingIdentifier)
  };
  const fieldErrors = {};

  if (!values.bankHolderName) {
    fieldErrors.bankHolderName = 'Enter the account holder name.';
  } else if (values.bankHolderName.length > BANK_ACCOUNT_NAME_LIMIT) {
    fieldErrors.bankHolderName = `Account holder name must be ${BANK_ACCOUNT_NAME_LIMIT} characters or fewer.`;
  }

  if (!values.routingIdentifier) {
    fieldErrors.routingIdentifier = 'Enter the 9-digit routing number.';
  } else if (!/^\d{9}$/.test(values.routingIdentifier)) {
    fieldErrors.routingIdentifier = 'Routing number must contain exactly 9 digits.';
  }

  if (!values.accountIdentifier) {
    fieldErrors.accountIdentifier = 'Enter the bank account number.';
  } else if (!/^\d{6,17}$/.test(values.accountIdentifier)) {
    fieldErrors.accountIdentifier = 'Account number must contain between 6 and 17 digits.';
  }

  return {
    fieldErrors,
    isValid: Object.keys(fieldErrors).length === 0,
    values
  };
}

module.exports = {
  BANK_ACCOUNT_NAME_LIMIT,
  validateBankAccountSubmission
};
