function createPasswordPolicyService() {
  const policy = Object.freeze({
    minLength: 12,
    requiresDigit: true,
    requiresLower: true,
    requiresSpecial: true,
    requiresUpper: true
  });
  const ruleMessages = {
    min_length: 'Use at least 12 characters.',
    uppercase: 'Include at least one uppercase letter.',
    lowercase: 'Include at least one lowercase letter.',
    digit: 'Include at least one number.',
    special: 'Include at least one special character.',
    trimmed: 'Remove leading or trailing spaces.',
    different_from_current: 'Choose a password different from your current password.'
  };

  function validate(newPassword, options = {}) {
    const candidate = String(newPassword || '');
    const trimmedCandidate = candidate.trim();
    const failedRules = [];

    if (trimmedCandidate !== candidate) {
      failedRules.push('trimmed');
    }

    if (candidate.length < policy.minLength) {
      failedRules.push('min_length');
    }

    if (!/[A-Z]/.test(candidate)) {
      failedRules.push('uppercase');
    }

    if (!/[a-z]/.test(candidate)) {
      failedRules.push('lowercase');
    }

    if (!/[0-9]/.test(candidate)) {
      failedRules.push('digit');
    }

    if (!/[^A-Za-z0-9]/.test(candidate)) {
      failedRules.push('special');
    }

    if (
      options.currentPassword &&
      trimmedCandidate &&
      trimmedCandidate === String(options.currentPassword).trim()
    ) {
      failedRules.push('different_from_current');
    }

    return {
      failedRules,
      isValid: failedRules.length === 0,
      message: failedRules.length
        ? 'Your new password does not satisfy the password requirements.'
        : 'Password policy satisfied.'
    };
  }

  function describeFailedRules(failedRules) {
    return failedRules.map((rule) => ruleMessages[rule] || 'Resolve the listed password issue.');
  }

  return {
    describeFailedRules,
    getPolicy() {
      return { ...policy };
    },
    validate
  };
}

module.exports = { createPasswordPolicyService };
