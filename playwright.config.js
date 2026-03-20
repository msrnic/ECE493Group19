const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:3111'
  },
  webServer: {
    command: 'node tests/e2e/start-server.js',
    port: 3111,
    reuseExistingServer: false
  }
});
