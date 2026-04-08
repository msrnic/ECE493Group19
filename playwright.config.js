const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:3112'
  },
  webServer: {
    command: 'node tests/e2e/start-server.js',
    port: 3112,
    reuseExistingServer: false
  }
});
