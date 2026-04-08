const test = require('node:test');
const assert = require('node:assert/strict');

const { createApp } = require('../../src/app');

test('createApp requires a database connection', () => {
  assert.throws(() => createApp(), /requires a database connection/);
});
