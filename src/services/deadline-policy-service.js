function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function formatDeadline(deadlineAt, timezoneName) {
  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezoneName
  }).format(new Date(deadlineAt));
}

function createDeadlinePolicyService(options) {
  function hasConfiguredIdentifierMatch(student, configuredIdentifiers) {
    const failures = new Set((configuredIdentifiers || []).map(normalizeIdentifier));
    return failures.has(normalizeIdentifier(student.email)) || failures.has(normalizeIdentifier(student.studentId));
  }

  function shouldFailDeadline(student) {
    return hasConfiguredIdentifierMatch(student, options.deadlineTestState?.failureIdentifiers || []);
  }

  function resolveRelevantTerm(student) {
    const schedule = options.enrollmentModel.listCurrentSchedule(student.accountId);
    if (schedule.length > 0 && schedule[0].termCode) {
      return schedule[0].termCode;
    }

    return options.deadlineRuleModel.listTerms()[0] || '';
  }

  function evaluateRule(rule) {
    const deadlineTime = new Date(rule.deadlineAt).getTime();
    const currentTime = options.now().getTime();

    return {
      deadlineLabel: formatDeadline(rule.deadlineAt, rule.timezoneName),
      isAllowed: currentTime < deadlineTime,
      statusLabel: currentTime < deadlineTime ? 'Drop allowed' : 'Deadline passed'
    };
  }

  return {
    classifyRemovalForOffering(student, offering) {
      if (shouldFailDeadline(student)) {
        return {
          message: 'We cannot confirm add/drop deadline information right now. Please retry later.',
          state: 'error'
        };
      }

      const rule = options.deadlineRuleModel.findRuleByTerm(offering.termCode);
      if (!rule) {
        return {
          message: 'We cannot confirm add/drop deadline information right now. Please contact administrative staff.',
          state: 'error'
        };
      }

      const evaluation = evaluateRule(rule);
      return {
        classification: evaluation.isAllowed ? 'drop' : 'withdrawal',
        deadlineAt: rule.deadlineAt,
        deadlineLabel: evaluation.deadlineLabel,
        state: 'ready',
        timezoneName: rule.timezoneName
      };
    },

    getDropDeadlinePageData(student) {
      const termCode = resolveRelevantTerm(student);

      if (shouldFailDeadline(student)) {
        return {
          actionState: 'blocked',
          message: 'We cannot confirm add/drop deadline information right now. Please retry later.',
          state: 'error',
          termCode
        };
      }

      const rule = options.deadlineRuleModel.findRuleByTerm(termCode);
      if (!rule) {
        return {
          actionState: 'blocked',
          message: 'We cannot confirm add/drop deadline information right now. Please contact administrative staff.',
          state: 'error',
          termCode
        };
      }

      const evaluation = evaluateRule(rule);
      return {
        actionState: evaluation.isAllowed ? 'allowed' : 'blocked',
        deadlineAt: rule.deadlineAt,
        deadlineLabel: evaluation.deadlineLabel,
        message: evaluation.isAllowed
          ? 'Drop action is currently allowed before the published deadline.'
          : 'Drop action is blocked because the published deadline has passed.',
        state: evaluation.isAllowed ? 'allowed' : 'blocked',
        statusLabel: evaluation.statusLabel,
        termCode,
        timezoneName: rule.timezoneName
      };
    },

    evaluateDropAttempt(student) {
      const pageData = this.getDropDeadlinePageData(student);
      if (pageData.state === 'error') {
        return {
          ...pageData,
          attemptMessage: 'Drop action remains blocked until deadline information can be confirmed.'
        };
      }

      if (pageData.state === 'blocked') {
        return {
          ...pageData,
          attemptMessage: 'Drop action cannot proceed after the published deadline.'
        };
      }

      return {
        ...pageData,
        attemptMessage: 'Drop action may proceed before the published deadline.'
      };
    }
  };
}

module.exports = { createDeadlinePolicyService };
