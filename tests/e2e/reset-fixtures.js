async function resetFixtures(request) {
  const response = await request.post('/__reset-e2e');
  if (!response.ok()) {
    throw new Error(`Failed to reset acceptance fixtures: ${response.status()}`);
  }
}

module.exports = { resetFixtures };
