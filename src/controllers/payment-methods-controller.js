const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');
const {
  BANK_ACCOUNT_NAME_LIMIT,
  validateBankAccountSubmission
} = require('./validators/bank-account-validator');
const {
  CARD_HOLDER_NAME_LIMIT,
  validateCreditCardSubmission
} = require('./validators/credit-card-validator');

function createStatusBanner(message, variant = 'info') {
  if (!message) {
    return '';
  }

  const variantClass = `profile-status${variant === 'success' ? ' profile-status--success' : ''}${variant === 'error' ? ' profile-status--error' : ''}`;
  return `<p class='status-chip ${variantClass}'>${escapeHtml(message)}</p>`;
}

function createFieldErrorHtml(errorMessage) {
  return errorMessage ? `<p class='profile-field-error'>${escapeHtml(errorMessage)}</p>` : '';
}

function createInputClass(errorMessage) {
  return errorMessage ? 'profile-input-error' : '';
}

function buildPaymentMethodsSummary(methods) {
  if (methods.length === 0) {
    return 'No payment methods are stored yet. Add a bank account or credit card to make fee payments available from your account.';
  }

  return 'Review your saved payment methods and use active entries for future fee payments.';
}

function renderPaymentMethodCards(methods) {
  if (methods.length === 0) {
    return `
      <section class='profile-section'>
        <h2>No payment methods yet</h2>
        <p class='help-text'>You have not stored any bank accounts or credit cards for fee payments.</p>
      </section>
    `;
  }

  return methods
    .map((method) => {
      const metadata =
        method.methodType === 'credit_card'
          ? `${method.displayLabel} exp ${String(method.expiryMonth).padStart(2, '0')}/${method.expiryYear}`
          : method.accountIdentifierMasked;

      return `
        <section class='profile-section'>
          <h2>${escapeHtml(method.methodType === 'credit_card' ? 'Credit Card' : 'Bank Account')}</h2>
          <p class='help-text'>${escapeHtml(metadata || method.displayLabel)}</p>
          <p class='help-text'>Available for fee payments</p>
        </section>
      `;
    })
    .join('');
}

function createPaymentMethodsController(services) {
  function getAccount(req) {
    return services.accountModel.findById(req.session.accountId);
  }

  function getActiveStudent(req) {
    if (!req.session?.accountId) {
      return null;
    }

    return services.studentAccountModel.findActiveByAccountId(req.session.accountId);
  }

  function renderForbidden(res) {
    const html = renderHtml(path.resolve(__dirname, '../views/payment-methods.html'), {
      methods_html:
        "<section class='profile-section'><h2>Payment methods unavailable</h2><p class='help-text'>Only active student accounts may manage payment methods.</p></section>",
      status_banner_html: createStatusBanner(
        'Only active student accounts may manage payment methods.',
        'error'
      ),
      summary_text: 'Payment methods are unavailable for this account.'
    });

    return res.status(403).send(html);
  }

  function renderListPage(res, student, overrides = {}) {
    const methods = overrides.methods || services.paymentMethodModel.listByAccountId(student.accountId);
    const html = renderHtml(path.resolve(__dirname, '../views/payment-methods.html'), {
      methods_html: renderPaymentMethodCards(methods),
      status_banner_html: createStatusBanner(overrides.message, overrides.variant),
      summary_text: overrides.summaryText || buildPaymentMethodsSummary(methods)
    });

    return res.status(overrides.statusCode || 200).send(html);
  }

  function renderBankPage(res, overrides = {}) {
    const html = renderHtml(path.resolve(__dirname, '../views/add-bank-account.html'), {
      account_identifier: overrides.values?.accountIdentifier || '',
      account_identifier_error_html: createFieldErrorHtml(
        overrides.fieldErrors?.accountIdentifier
      ),
      account_identifier_input_class: createInputClass(overrides.fieldErrors?.accountIdentifier),
      bank_holder_name: overrides.values?.bankHolderName || '',
      bank_holder_name_error_html: createFieldErrorHtml(overrides.fieldErrors?.bankHolderName),
      bank_holder_name_input_class: createInputClass(overrides.fieldErrors?.bankHolderName),
      bank_holder_name_limit: String(BANK_ACCOUNT_NAME_LIMIT),
      return_path: '/account/payment-methods?cancelled=1',
      routing_identifier: overrides.values?.routingIdentifier || '',
      routing_identifier_error_html: createFieldErrorHtml(
        overrides.fieldErrors?.routingIdentifier
      ),
      routing_identifier_input_class: createInputClass(overrides.fieldErrors?.routingIdentifier),
      status_banner_html: createStatusBanner(overrides.message, overrides.variant)
    });

    return res.status(overrides.statusCode || 200).send(html);
  }

  function renderCreditCardPage(res, overrides = {}) {
    const html = renderHtml(path.resolve(__dirname, '../views/add-credit-card.html'), {
      card_holder_name: overrides.values?.cardHolderName || '',
      card_holder_name_error_html: createFieldErrorHtml(overrides.fieldErrors?.cardHolderName),
      card_holder_name_input_class: createInputClass(overrides.fieldErrors?.cardHolderName),
      card_holder_name_limit: String(CARD_HOLDER_NAME_LIMIT),
      card_number: overrides.values?.cardNumber || '',
      card_number_error_html: createFieldErrorHtml(overrides.fieldErrors?.cardNumber),
      card_number_input_class: createInputClass(overrides.fieldErrors?.cardNumber),
      expiry_month: overrides.values?.expiryMonth || '',
      expiry_month_error_html: createFieldErrorHtml(overrides.fieldErrors?.expiryMonth),
      expiry_month_input_class: createInputClass(overrides.fieldErrors?.expiryMonth),
      expiry_year: overrides.values?.expiryYear || '',
      expiry_year_error_html: createFieldErrorHtml(overrides.fieldErrors?.expiryYear),
      expiry_year_input_class: createInputClass(overrides.fieldErrors?.expiryYear),
      return_path: '/account/payment-methods?cancelled=1',
      status_banner_html: createStatusBanner(overrides.message, overrides.variant)
    });

    return res.status(overrides.statusCode || 200).send(html);
  }

  return {
    getAddBankAccountPage(req, res) {
      const account = getAccount(req);
      if (!account) {
        return res.redirect('/login?returnTo=%2Faccount%2Fpayment-methods%2Fbank-accounts%2Fnew');
      }

      const student = getActiveStudent(req);
      if (!student) {
        return renderForbidden(res);
      }

      return renderBankPage(res);
    },

    getAddCreditCardPage(req, res) {
      const account = getAccount(req);
      if (!account) {
        return res.redirect('/login?returnTo=%2Faccount%2Fpayment-methods%2Fcredit-cards%2Fnew');
      }

      const student = getActiveStudent(req);
      if (!student) {
        return renderForbidden(res);
      }

      return renderCreditCardPage(res);
    },

    getPaymentMethodsPage(req, res) {
      const account = getAccount(req);
      if (!account) {
        return res.redirect('/login?returnTo=%2Faccount%2Fpayment-methods');
      }

      const student = getActiveStudent(req);
      if (!student) {
        return renderForbidden(res);
      }

      const message =
        req.query.cancelled === '1' ? 'Payment method entry cancelled. No changes were saved.' : '';
      return renderListPage(res, student, { message, variant: 'info' });
    },

    postAddBankAccount(req, res) {
      const account = getAccount(req);
      if (!account) {
        return res.redirect('/login?returnTo=%2Faccount%2Fpayment-methods%2Fbank-accounts%2Fnew');
      }

      const student = getActiveStudent(req);
      if (!student) {
        return renderForbidden(res);
      }

      const validation = validateBankAccountSubmission(req.body);
      if (!validation.isValid) {
        return renderBankPage(res, {
          fieldErrors: validation.fieldErrors,
          message: 'Please correct the highlighted banking details.',
          statusCode: 400,
          values: validation.values,
          variant: 'error'
        });
      }

      const networkResult = services.bankingNetworkService.validateBankAccount(validation.values, student);
      if (networkResult.status === 'network_rejected') {
        return renderBankPage(res, {
          fieldErrors: { accountIdentifier: networkResult.reason },
          message: 'The bank account could not be accepted. Review the highlighted details.',
          statusCode: 400,
          values: validation.values,
          variant: 'error'
        });
      }

      const result = services.paymentMethodModel.createBankAccountPaymentMethod(
        student.accountId,
        validation.values,
        { now: () => services.now().toISOString() }
      );

      if (result.status === 'duplicate') {
        return renderBankPage(res, {
          fieldErrors: result.fieldErrors,
          message: 'This bank account is already stored for fee payments.',
          statusCode: 400,
          values: validation.values,
          variant: 'error'
        });
      }

      return renderListPage(res, student, {
        message: `Bank account saved. ${result.paymentMethod.accountIdentifierMasked} is now available for fee payments.`,
        methods: services.paymentMethodModel.listByAccountId(student.accountId),
        variant: 'success'
      });
    },

    postAddCreditCard(req, res) {
      const account = getAccount(req);
      if (!account) {
        return res.redirect('/login?returnTo=%2Faccount%2Fpayment-methods%2Fcredit-cards%2Fnew');
      }

      const student = getActiveStudent(req);
      if (!student) {
        return renderForbidden(res);
      }

      const validation = validateCreditCardSubmission(req.body);
      if (!validation.isValid) {
        return renderCreditCardPage(res, {
          fieldErrors: validation.fieldErrors,
          message: 'Please correct the highlighted credit card details.',
          statusCode: 400,
          values: validation.values,
          variant: 'error'
        });
      }

      const tokenization = services.paymentTokenizationService.tokenize(validation.values);
      if (tokenization.status === 'rejected') {
        return renderCreditCardPage(res, {
          fieldErrors: { cardNumber: tokenization.message },
          message: tokenization.message,
          statusCode: 400,
          values: validation.values,
          variant: 'error'
        });
      }

      if (tokenization.status === 'unavailable') {
        return renderCreditCardPage(res, {
          fieldErrors: {},
          message: tokenization.message,
          statusCode: 503,
          values: validation.values,
          variant: 'error'
        });
      }

      const result = services.paymentMethodModel.createCreditCardPaymentMethod(
        student.accountId,
        tokenization,
        { now: () => services.now().toISOString() }
      );

      if (result.status === 'duplicate') {
        return renderCreditCardPage(res, {
          fieldErrors: result.fieldErrors,
          message: 'This credit card is already stored for future fee payments.',
          statusCode: 400,
          values: validation.values,
          variant: 'error'
        });
      }

      return renderListPage(res, student, {
        message: `${tokenization.cardBrand} ending ${tokenization.cardLast4} was saved for future fee payments.`,
        methods: services.paymentMethodModel.listByAccountId(student.accountId),
        variant: 'success'
      });
    }
  };
}

module.exports = { createPaymentMethodsController };
