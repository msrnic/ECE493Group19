const { createCardTokenFingerprint, normalizeDigits } = require('../models/payment-method-model');

function inferCardBrand(cardNumber) {
  if (/^4/.test(cardNumber)) {
    return 'Visa';
  }

  if (/^5[1-5]/.test(cardNumber)) {
    return 'Mastercard';
  }

  return 'Credit card';
}

function createPaymentTokenizationService() {
  return {
    tokenize(details) {
      const cardNumber = normalizeDigits(details.cardNumber);

      if (cardNumber.endsWith('0002')) {
        return {
          message: 'The credit card was declined. Check the details and try again.',
          status: 'rejected'
        };
      }

      if (cardNumber.endsWith('0009')) {
        return {
          message: 'Credit card processing is temporarily unavailable. Try again later or use another payment method.',
          status: 'unavailable'
        };
      }

      return {
        cardBrand: inferCardBrand(cardNumber),
        cardLast4: cardNumber.slice(-4),
        expiryMonth: Number(details.expiryMonth),
        expiryYear: Number(details.expiryYear),
        status: 'tokenized',
        tokenReference: `tok_${createCardTokenFingerprint(
          `${cardNumber}:${details.expiryMonth}:${details.expiryYear}`
        ).slice(0, 16)}`
      };
    }
  };
}

module.exports = { createPaymentTokenizationService, inferCardBrand };
