async function resetFixtures(request) {
  const response = await request.post('/__reset-e2e');
  if (response.ok() === false) {
    throw new Error('Failed to reset acceptance fixtures: ' + response.status());
  }
}

async function setDashboardFixtures(request, state) {
  const response = await request.post('/__dashboard-fixtures', {
    data: state
  });
  if (response.ok() === false) {
    throw new Error('Failed to configure dashboard fixtures: ' + response.status());
  }
}

async function setProfileFixtures(request, state) {
  const response = await request.post('/__profile-fixtures', {
    data: state
  });
  if (response.ok() === false) {
    throw new Error('Failed to configure profile fixtures: ' + response.status());
  }
}

async function setAccountCreationFixtures(request, state) {
  const response = await request.post('/__account-creation-fixtures', {
    data: state
  });
  if (response.ok() === false) {
    throw new Error('Failed to configure account-creation fixtures: ' + response.status());
  }
}

async function setScheduleBuilderFixtures(request, state) {
  const response = await request.post('/__schedule-builder-fixtures', {
    data: state
  });
  if (response.ok() === false) {
    throw new Error('Failed to configure schedule-builder fixtures: ' + response.status());
  }
}

async function setTransactionHistoryFixtures(request, state) {
  const response = await request.post('/__transaction-history-fixtures', {
    data: state
  });
  if (response.ok() === false) {
    throw new Error('Failed to configure transaction-history fixtures: ' + response.status());
  }
}

async function setInboxFixtures(request, state) {
  const response = await request.post('/__inbox-fixtures', {
    data: state
  });
  if (response.ok() === false) {
    throw new Error('Failed to configure inbox fixtures: ' + response.status());
  }
}

async function setEnrollmentFixtures(request, state) {
  const response = await request.post('/__enrollment-fixtures', {
    data: state
  });
  if (response.ok() === false) {
    throw new Error('Failed to configure enrollment fixtures: ' + response.status());
  }
}

async function setClassSearchFixtures(request, state) {
  const response = await request.post('/__class-search-fixtures', {
    data: state
  });
  if (response.ok() === false) {
    throw new Error('Failed to configure class-search fixtures: ' + response.status());
  }
}

async function setCourseRosterFixtures(request, state) {
  const response = await request.post('/__course-roster-fixtures', {
    data: state
  });
  if (response.ok() === false) {
    throw new Error('Failed to configure course-roster fixtures: ' + response.status());
  }
}

async function setDeadlineFixtures(request, state) {
  const response = await request.post('/__deadline-fixtures', {
    data: state
  });
  if (response.ok() === false) {
    throw new Error('Failed to configure deadline fixtures: ' + response.status());
  }
}

async function setForceEnrollFixtures(request, state) {
  const response = await request.post('/__force-enroll-fixtures', {
    data: state
  });
  if (response.ok() === false) {
    throw new Error('Failed to configure force-enroll fixtures: ' + response.status());
  }
}

async function setForceWithdrawalFixtures(request, state) {
  const response = await request.post('/__force-withdrawal-fixtures', {
    data: state
  });
  if (response.ok() === false) {
    throw new Error('Failed to configure force-withdrawal fixtures: ' + response.status());
  }
}

async function setOfferingAdminFixtures(request, state) {
  const response = await request.post('/__offering-admin-fixtures', {
    data: state
  });
  if (response.ok() === false) {
    throw new Error('Failed to configure offering-admin fixtures: ' + response.status());
  }
}

async function setCourseCapacityFixtures(request, state) {
  const response = await request.post('/__course-capacity-fixtures', {
    data: state
  });
  if (response.ok() === false) {
    throw new Error('Failed to configure course-capacity fixtures: ' + response.status());
  }
}

async function setAdminNotificationFixtures(request, state) {
  const response = await request.post('/__admin-notification-fixtures', {
    data: state
  });
  if (response.ok() === false) {
    throw new Error('Failed to configure admin-notification fixtures: ' + response.status());
  }
}

module.exports = {
  setAdminNotificationFixtures,
  setClassSearchFixtures,
  setCourseCapacityFixtures,
  setCourseRosterFixtures,
  setDeadlineFixtures,
  setEnrollmentFixtures,
  setForceEnrollFixtures,
  setForceWithdrawalFixtures,
  setOfferingAdminFixtures,
  setInboxFixtures,
  resetFixtures,
  setAccountCreationFixtures,
  setScheduleBuilderFixtures,
  setDashboardFixtures,
  setProfileFixtures,
  setTransactionHistoryFixtures
};
