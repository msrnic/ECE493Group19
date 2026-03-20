const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

test('valid logins satisfy the SC-001 benchmark threshold', async () => {
  const context = createTestContext();
  const durations = [];

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const startedAt = performance.now();
    const response = await request(context.app)
      .post('/login')
      .type('form')
      .send({ identifier: 'userA@example.com', password: 'CorrectPass!234' });

    durations.push(performance.now() - startedAt);
    assert.equal(response.status, 302);
  }

  durations.sort((left, right) => left - right);
  const p95 = durations[Math.ceil(durations.length * 0.95) - 1];
  assert.ok(p95 < 30_000, `Expected p95 login latency below 30000ms, received ${p95}ms.`);

  context.cleanup();
});
