const crypto = require('crypto');

function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function createFingerprint(...parts) {
  return crypto.createHash('sha256').update(parts.join(':')).digest('hex');
}

function createAccountFingerprint(routingIdentifier, accountIdentifier) {
  return createFingerprint(normalizeDigits(routingIdentifier), normalizeDigits(accountIdentifier));
}

function createCardTokenFingerprint(tokenReference) {
  return createFingerprint(String(tokenReference || '').trim());
}

function maskAccountIdentifier(value) {
  const digits = normalizeDigits(value);
  if (digits.length >= 4) {
    return `Acct ending ${digits.slice(-4)}`;
  }

  return 'Acct ending';
}

function mapPaymentMethod(row) {
  return {
    accountId: row.account_id,
    accountIdentifierMasked: row.account_identifier_masked,
    bankHolderName: row.bank_holder_name,
    cardBrand: row.card_brand,
    cardLast4: row.card_last4,
    createdAt: row.created_at,
    displayLabel: row.display_label,
    expiryMonth: row.expiry_month,
    expiryYear: row.expiry_year,
    methodType: row.method_type,
    paymentMethodId: row.id,
    status: row.status,
    tokenReference: row.token_reference,
    updatedAt: row.updated_at
  };
}

function createPaymentMethodModel(db) {
  const selectMethodsByAccount = db.prepare(`
    SELECT
      id,
      account_id,
      method_type,
      display_label,
      bank_holder_name,
      account_identifier_masked,
      card_brand,
      card_last4,
      expiry_month,
      expiry_year,
      token_reference,
      status,
      created_at,
      updated_at
    FROM payment_methods
    WHERE account_id = ?
    ORDER BY datetime(created_at) DESC, id DESC
  `);
  const selectBankDuplicate = db.prepare(`
    SELECT id
    FROM payment_methods
    WHERE account_id = ?
      AND account_identifier_fingerprint = ?
    LIMIT 1
  `);
  const selectCardDuplicate = db.prepare(`
    SELECT id
    FROM payment_methods
    WHERE account_id = ?
      AND token_fingerprint = ?
    LIMIT 1
  `);
  const insertPaymentMethod = db.prepare(`
    INSERT INTO payment_methods (
      account_id,
      method_type,
      display_label,
      bank_holder_name,
      routing_identifier,
      account_identifier_masked,
      account_identifier_fingerprint,
      card_brand,
      card_last4,
      expiry_month,
      expiry_year,
      token_reference,
      token_fingerprint,
      status,
      created_at,
      updated_at
    ) VALUES (
      @account_id,
      @method_type,
      @display_label,
      @bank_holder_name,
      @routing_identifier,
      @account_identifier_masked,
      @account_identifier_fingerprint,
      @card_brand,
      @card_last4,
      @expiry_month,
      @expiry_year,
      @token_reference,
      @token_fingerprint,
      'active',
      @created_at,
      @updated_at
    )
  `);
  const selectMethodById = db.prepare(`
    SELECT
      id,
      account_id,
      method_type,
      display_label,
      bank_holder_name,
      account_identifier_masked,
      card_brand,
      card_last4,
      expiry_month,
      expiry_year,
      token_reference,
      status,
      created_at,
      updated_at
    FROM payment_methods
    WHERE id = ?
  `);

  function getTimestamp(options) {
    if (typeof options.now === 'function') {
      return options.now();
    }

    return new Date().toISOString();
  }

  return {
    createBankAccountPaymentMethod(accountId, details, options = {}) {
      const fingerprint = createAccountFingerprint(
        details.routingIdentifier,
        details.accountIdentifier
      );

      if (selectBankDuplicate.get(accountId, fingerprint)) {
        return {
          fieldErrors: {
            accountIdentifier:
              'This bank account is already stored for fee payments on your account.'
          },
          reason: 'duplicate_payment_method',
          status: 'duplicate'
        };
      }

      const timestamp = getTimestamp(options);
      const result = insertPaymentMethod.run({
        account_id: accountId,
        account_identifier_fingerprint: fingerprint,
        account_identifier_masked: maskAccountIdentifier(details.accountIdentifier),
        bank_holder_name: String(details.bankHolderName || '').trim(),
        card_brand: null,
        card_last4: null,
        created_at: timestamp,
        display_label: 'Bank account',
        expiry_month: null,
        expiry_year: null,
        method_type: 'bank_account',
        routing_identifier: normalizeDigits(details.routingIdentifier),
        token_fingerprint: null,
        token_reference: null,
        updated_at: timestamp
      });

      return {
        paymentMethod: mapPaymentMethod(selectMethodById.get(Number(result.lastInsertRowid))),
        status: 'created'
      };
    },

    createCreditCardPaymentMethod(accountId, details, options = {}) {
      const fingerprint = createCardTokenFingerprint(details.tokenReference);

      if (selectCardDuplicate.get(accountId, fingerprint)) {
        return {
          fieldErrors: {
            cardNumber: 'This credit card is already stored for future fee payments.'
          },
          reason: 'duplicate_payment_method',
          status: 'duplicate'
        };
      }

      const timestamp = getTimestamp(options);
      const result = insertPaymentMethod.run({
        account_id: accountId,
        account_identifier_fingerprint: null,
        account_identifier_masked: null,
        bank_holder_name: null,
        card_brand: details.cardBrand,
        card_last4: details.cardLast4,
        created_at: timestamp,
        display_label: `${details.cardBrand} ending ${details.cardLast4}`,
        expiry_month: Number(details.expiryMonth),
        expiry_year: Number(details.expiryYear),
        method_type: 'credit_card',
        routing_identifier: null,
        token_fingerprint: fingerprint,
        token_reference: details.tokenReference,
        updated_at: timestamp
      });

      return {
        paymentMethod: mapPaymentMethod(selectMethodById.get(Number(result.lastInsertRowid))),
        status: 'created'
      };
    },

    listByAccountId(accountId) {
      return selectMethodsByAccount.all(accountId).map(mapPaymentMethod);
    }
  };
}

module.exports = {
  createAccountFingerprint,
  createCardTokenFingerprint,
  createPaymentMethodModel,
  maskAccountIdentifier,
  normalizeDigits
};
