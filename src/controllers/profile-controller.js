const path = require('path');

const { renderHtml, escapeHtml } = require('../views/render');
const {
  CONTACT_EMAIL_LIMIT,
  CONTACT_NAME_LIMIT,
  CONTACT_PHONE_LIMIT,
  CONTACT_RELATIONSHIP_LIMIT,
  PERSONAL_TEXT_LIMIT,
  formatBirthdayForDisplay,
  validateContactInformation,
  validatePersonalInformation
} = require('./validators/profile-validator');

function createStatusBanner(message, variant = 'info') {
  if (!message) {
    return '';
  }

  const variantClass = `profile-status${variant === 'success' ? ' profile-status--success' : ''}${variant === 'error' ? ' profile-status--error' : ''}`;

  return `<p class='status-chip ${variantClass}'>${escapeHtml(message)}</p>`;
}

function createFieldErrorHtml(errorMessage) {
  if (!errorMessage) {
    return '';
  }

  return `<p class='profile-field-error'>${escapeHtml(errorMessage)}</p>`;
}

function createInputClass(errorMessage) {
  return errorMessage ? 'profile-input-error' : '';
}

function createLastUpdatedText(value, fallbackText) {
  return value ? `Last saved at ${value}.` : fallbackText;
}

function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function createProfileController(services) {
  function buildReturnPath(account) {
    return account.role === 'admin' ? '/dashboard#personal-profile' : '/dashboard#security-center';
  }

  function shouldSimulateFailure(account, failureIdentifiers) {
    const identifiers = new Set(
      (Array.isArray(failureIdentifiers) ? failureIdentifiers : []).map(normalizeIdentifier)
    );

    return (
      identifiers.has(normalizeIdentifier(account.email)) ||
      identifiers.has(normalizeIdentifier(account.username))
    );
  }

  function renderMissingAccount(res, returnTo) {
    return res.redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  function renderPersonalInformationPage(res, pageModel) {
    const html = renderHtml(path.resolve(__dirname, '../views/personal-information.html'), {
      birthday: pageModel.values.birthday,
      birthday_error_html: createFieldErrorHtml(pageModel.fieldErrors.birthday),
      birthday_input_class: createInputClass(pageModel.fieldErrors.birthday),
      country_of_origin: pageModel.values.countryOfOrigin,
      country_of_origin_error_html: createFieldErrorHtml(pageModel.fieldErrors.countryOfOrigin),
      country_of_origin_input_class: createInputClass(pageModel.fieldErrors.countryOfOrigin),
      first_name: pageModel.values.firstName,
      first_name_error_html: createFieldErrorHtml(pageModel.fieldErrors.firstName),
      first_name_input_class: createInputClass(pageModel.fieldErrors.firstName),
      last_name: pageModel.values.lastName,
      last_name_error_html: createFieldErrorHtml(pageModel.fieldErrors.lastName),
      last_name_input_class: createInputClass(pageModel.fieldErrors.lastName),
      last_updated_text: pageModel.lastUpdatedText,
      personal_text_limit: String(PERSONAL_TEXT_LIMIT),
      return_path: pageModel.returnPath,
      status_banner_html: createStatusBanner(pageModel.message, pageModel.variant),
      submitted_version: String(pageModel.submittedVersion)
    });

    return res.status(pageModel.statusCode).send(html);
  }

  function renderContactInformationPage(res, pageModel) {
    const html = renderHtml(path.resolve(__dirname, '../views/contact-information.html'), {
      contact_email: pageModel.values.contactEmail,
      contact_email_error_html: createFieldErrorHtml(pageModel.fieldErrors.contactEmail),
      contact_email_input_class: createInputClass(pageModel.fieldErrors.contactEmail),
      contact_email_limit: String(CONTACT_EMAIL_LIMIT),
      emergency_full_name: pageModel.values.emergencyFullName,
      emergency_full_name_error_html: createFieldErrorHtml(pageModel.fieldErrors.emergencyFullName),
      emergency_full_name_input_class: createInputClass(pageModel.fieldErrors.emergencyFullName),
      emergency_name_limit: String(CONTACT_NAME_LIMIT),
      emergency_phone_number: pageModel.values.emergencyPhoneNumber,
      emergency_phone_number_error_html: createFieldErrorHtml(pageModel.fieldErrors.emergencyPhoneNumber),
      emergency_phone_number_input_class: createInputClass(pageModel.fieldErrors.emergencyPhoneNumber),
      emergency_relationship: pageModel.values.emergencyRelationship,
      emergency_relationship_error_html: createFieldErrorHtml(pageModel.fieldErrors.emergencyRelationship),
      emergency_relationship_input_class: createInputClass(pageModel.fieldErrors.emergencyRelationship),
      last_updated_text: pageModel.lastUpdatedText,
      phone_limit: String(CONTACT_PHONE_LIMIT),
      phone_number: pageModel.values.phoneNumber,
      phone_number_error_html: createFieldErrorHtml(pageModel.fieldErrors.phoneNumber),
      phone_number_input_class: createInputClass(pageModel.fieldErrors.phoneNumber),
      relationship_limit: String(CONTACT_RELATIONSHIP_LIMIT),
      return_path: pageModel.returnPath,
      status_banner_html: createStatusBanner(pageModel.message, pageModel.variant),
      submitted_version: String(pageModel.submittedVersion)
    });

    return res.status(pageModel.statusCode).send(html);
  }

  function getAccount(req) {
    return services.accountModel.findById(req.session.accountId);
  }

  function buildPersonalPageModel(account, personalDetails, overrides = {}) {
    const details = personalDetails || {};

    return {
      fieldErrors: overrides.fieldErrors || {},
      lastUpdatedText:
        overrides.lastUpdatedText ||
        createLastUpdatedText(details.updatedAt, 'No personal information has been saved yet.'),
      message: overrides.message || '',
      returnPath: overrides.returnPath || buildReturnPath(account),
      statusCode: overrides.statusCode || 200,
      submittedVersion:
        overrides.submittedVersion != null
          ? overrides.submittedVersion
          : Number(details.version || 0),
      values: {
        birthday:
          overrides.values?.birthday != null
            ? overrides.values.birthday
            : formatBirthdayForDisplay(details.birthDate || ''),
        countryOfOrigin:
          overrides.values?.countryOfOrigin != null
            ? overrides.values.countryOfOrigin
            : details.countryOfOrigin || '',
        firstName:
          overrides.values?.firstName != null ? overrides.values.firstName : details.firstName || '',
        lastName:
          overrides.values?.lastName != null ? overrides.values.lastName : details.lastName || ''
      },
      variant: overrides.variant || 'info'
    };
  }

  function buildContactPageModel(account, contactInformation, overrides = {}) {
    const details = contactInformation || {};

    return {
      fieldErrors: overrides.fieldErrors || {},
      lastUpdatedText:
        overrides.lastUpdatedText ||
        createLastUpdatedText(details.updatedAt, 'No contact information has been saved yet.'),
      message: overrides.message || '',
      returnPath: overrides.returnPath || buildReturnPath(account),
      statusCode: overrides.statusCode || 200,
      submittedVersion:
        overrides.submittedVersion != null
          ? overrides.submittedVersion
          : Number(details.version || 0),
      values: {
        contactEmail:
          overrides.values?.contactEmail != null
            ? overrides.values.contactEmail
            : details.contactEmail || '',
        emergencyFullName:
          overrides.values?.emergencyFullName != null
            ? overrides.values.emergencyFullName
            : details.emergencyFullName || '',
        emergencyPhoneNumber:
          overrides.values?.emergencyPhoneNumber != null
            ? overrides.values.emergencyPhoneNumber
            : details.emergencyPhoneNumber || '',
        emergencyRelationship:
          overrides.values?.emergencyRelationship != null
            ? overrides.values.emergencyRelationship
            : details.emergencyRelationship || '',
        phoneNumber:
          overrides.values?.phoneNumber != null
            ? overrides.values.phoneNumber
            : details.phoneNumber || ''
      },
      variant: overrides.variant || 'info'
    };
  }

  return {
    getContactInformationPage(req, res) {
      const account = getAccount(req);
      if (!account) {
        return renderMissingAccount(res, '/account/contact-information');
      }

      const contactInformation = services.contactInfoModel.getByAccountId(account.id);
      return renderContactInformationPage(res, buildContactPageModel(account, contactInformation));
    },

    getPersonalInformationPage(req, res) {
      const account = getAccount(req);
      if (!account) {
        return renderMissingAccount(res, '/account/personal-information');
      }

      const personalDetails = services.personalDetailsModel.getByAccountId(account.id);
      return renderPersonalInformationPage(res, buildPersonalPageModel(account, personalDetails));
    },

    postContactInformation(req, res) {
      const account = getAccount(req);
      if (!account) {
        return renderMissingAccount(res, '/account/contact-information');
      }

      const validation = validateContactInformation(req.body);
      if (!validation.isValid) {
        return renderContactInformationPage(
          res,
          buildContactPageModel(account, null, {
            fieldErrors: validation.fieldErrors,
            message: 'Please correct the highlighted contact details.',
            statusCode: 400,
            submittedVersion: validation.values.submittedVersion,
            values: validation.values,
            variant: 'error'
          })
        );
      }

      try {
        const result = services.contactInfoModel.saveByAccountId(account.id, validation.values, {
          simulateFailure: shouldSimulateFailure(
            account,
            services.profileTestState?.contactSaveFailureIdentifiers
          ),
          submittedVersion: validation.values.submittedVersion,
          updatedAt: services.now().toISOString()
        });
        const message = result.conflictDetected
          ? 'Contact information updated. Another update occurred while you were editing, so your changes were saved as the latest version.'
          : 'Contact information updated successfully.';

        return renderContactInformationPage(
          res,
          buildContactPageModel(account, result.contactInformation, {
            message,
            variant: 'success'
          })
        );
      } catch (error) {
        return renderContactInformationPage(
          res,
          buildContactPageModel(account, services.contactInfoModel.getByAccountId(account.id), {
            message: 'We could not save your contact information. Please retry later.',
            statusCode: 500,
            variant: 'error'
          })
        );
      }
    },

    postPersonalInformation(req, res) {
      const account = getAccount(req);
      if (!account) {
        return renderMissingAccount(res, '/account/personal-information');
      }

      const validation = validatePersonalInformation(req.body, { now: services.now() });
      if (!validation.isValid) {
        return renderPersonalInformationPage(
          res,
          buildPersonalPageModel(account, null, {
            fieldErrors: validation.fieldErrors,
            message: 'Please correct the highlighted personal details.',
            statusCode: 400,
            submittedVersion: validation.values.submittedVersion,
            values: {
              birthday: validation.values.birthdayInput,
              countryOfOrigin: validation.values.countryOfOrigin,
              firstName: validation.values.firstName,
              lastName: validation.values.lastName
            },
            variant: 'error'
          })
        );
      }

      try {
        const result = services.personalDetailsModel.saveByAccountId(account.id, validation.values, {
          simulateFailure: shouldSimulateFailure(
            account,
            services.profileTestState?.personalSaveFailureIdentifiers
          ),
          submittedVersion: validation.values.submittedVersion,
          updatedAt: services.now().toISOString()
        });

        return renderPersonalInformationPage(
          res,
          buildPersonalPageModel(account, result.personalDetails, {
            message: 'Personal information updated successfully.',
            variant: 'success'
          })
        );
      } catch (error) {
        return renderPersonalInformationPage(
          res,
          buildPersonalPageModel(account, services.personalDetailsModel.getByAccountId(account.id), {
            message: 'We could not save your personal information. Please retry.',
            statusCode: 500,
            variant: 'error'
          })
        );
      }
    }
  };
}

module.exports = { createProfileController };
