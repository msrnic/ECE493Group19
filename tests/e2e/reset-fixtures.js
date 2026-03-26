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

module.exports = { resetFixtures, setDashboardFixtures, setProfileFixtures };
