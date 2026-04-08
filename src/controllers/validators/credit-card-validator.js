const CARD_HOLDER_NAME_LIMIT = 80;

function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function validateCreditCardSubmission(input = {}) {
  const currentDate = new Date();
  const values = {
    cardHolderName: String(input.cardHolderName || '').trim(),
    cardNumber: normalizeDigits(input.cardNumber),
    expiryMonth: String(input.expiryMonth || '').trim(),
    expiryYear: String(input.expiryYear || '').trim()
  };
  const fieldErrors = {};

  if (!values.cardHolderName) {
    fieldErrors.cardHolderName = 'Enter the name shown on the credit card.';
  } else if (values.cardHolderName.length > CARD_HOLDER_NAME_LIMIT) {
    fieldErrors.cardHolderName = `Card holder name must be ${CARD_HOLDER_NAME_LIMIT} characters or fewer.`;
  }

  if (!/^\d{13,19}$/.test(values.cardNumber)) {
    fieldErrors.cardNumber = 'Card number must contain between 13 and 19 digits.';
  }

  if (!/^\d{1,2}$/.test(values.expiryMonth)) {
    fieldErrors.expiryMonth = 'Enter a valid expiry month.';
  } else {
    const month = Number(values.expiryMonth);
    if (month < 1 || month > 12) {
      fieldErrors.expiryMonth = 'Expiry month must be between 1 and 12.';
    }
  }

  if (!/^\d{4}$/.test(values.expiryYear)) {
    fieldErrors.expiryYear = 'Enter a valid 4-digit expiry year.';
  }

  if (!fieldErrors.expiryMonth && !fieldErrors.expiryYear) {
    const month = Number(values.expiryMonth);
    const year = Number(values.expiryYear);
    const isExpired =
      year < currentDate.getUTCFullYear() ||
      (year === currentDate.getUTCFullYear() && month < currentDate.getUTCMonth() + 1);

    if (isExpired) {
      fieldErrors.expiryYear = 'This credit card is expired. Use a current card.';
    }
  }

  return {
    fieldErrors,
    isValid: Object.keys(fieldErrors).length === 0,
    values
  };
}

module.exports = {
  CARD_HOLDER_NAME_LIMIT,
  validateCreditCardSubmission
};
