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
  setInboxFixtures,
  resetFixtures,
  setAccountCreationFixtures,
  setScheduleBuilderFixtures,
  setDashboardFixtures,
  setProfileFixtures,
  setTransactionHistoryFixtures
};
