function defaultMessageForStatus(status) {
  switch (status) {
    case 'success':
      return 'Dashboard loaded successfully.';
    case 'partial':
      return 'Some dashboard sections are currently unavailable.';
    case 'failure':
      return 'Dashboard data is unavailable right now. Retry to load your sections again.';
    case 'empty_access':
      return 'Your account has no assigned dashboard modules. Contact an administrator.';
    case 'role_data_error':
      return 'We could not load your role assignments. Retry to continue.';
    case 'auth_error':
      return 'Your session has expired. Sign in again.';
    default:
      return 'Dashboard request processed.';
  }
}

function createDashboardResponse(details) {
  const unavailableSectionIds = details.sections
    .filter((section) => section.availabilityStatus === 'unavailable')
    .map((section) => section.sectionId);

  return {
    actorId: details.actorId,
    message: details.message || defaultMessageForStatus(details.status),
    modules: details.modules,
    retryAvailable:
      details.retryAvailable ??
      (unavailableSectionIds.length > 0 || details.status === 'role_data_error'),
    sections: details.sections,
    status: details.status,
    unavailableSectionIds
  };
}

function createAuthRedirectResponse(returnTo = '/dashboard', loginUrl = '/login') {
  return {
    loginUrl,
    returnTo,
    status: 'auth_error'
  };
}

function createErrorResponse(errorCode, message) {
  return {
    errorCode,
    message,
    status: 'error'
  };
}

module.exports = {
  createAuthRedirectResponse,
  createDashboardResponse,
  createErrorResponse,
  defaultMessageForStatus
};
