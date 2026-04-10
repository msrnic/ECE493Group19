const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const ADMIN_PASSWORD = 'AdminPass!234';

async function loginAsAdmin(agent) {
  await agent.post('/login').type('form').send({
    identifier: 'admin@example.com',
    password: ADMIN_PASSWORD
  }).expect(302);
}

test('admin can open a capacity form, update capacity, and below-enrollment requests need override', async () => {
  const context = createTestContext();
  try {
    const agent = request.agent(context.app);
    await loginAsAdmin(agent);

    const conflictOfferingId = context.db.prepare("SELECT id FROM class_offerings WHERE offering_code = 'O_CONFLICT'").get().id;
    const rosterOfferingId = context.db.prepare("SELECT id FROM class_offerings WHERE offering_code = 'O_ROSTER'").get().id;

    const page = await agent.get(`/admin/course-offerings/${conflictOfferingId}/capacity`);
    assert.equal(page.status, 200);
    assert.match(page.text, /Edit Course Capacity/);
    assert.match(page.text, /Current enrollment/i);

    const updated = await agent.post(`/admin/course-offerings/${conflictOfferingId}/capacity`).type('form').send({
      proposedCapacity: '28',
      submittedVersion: '1'
    });
    assert.equal(updated.status, 200);
    assert.match(updated.text, /Course capacity updated successfully/);

    const stored = context.db.prepare('SELECT capacity, seats_remaining, version FROM class_offerings WHERE id = ?').get(conflictOfferingId);
    assert.equal(stored.capacity, 28);
    assert.equal(stored.seats_remaining, 27);
    assert.equal(stored.version, 2);

    const blocked = await agent.post(`/admin/course-offerings/${rosterOfferingId}/capacity`).type('form').send({
      proposedCapacity: '1',
      submittedVersion: '1'
    });
    assert.equal(blocked.status, 200);
    assert.match(blocked.text, /override is required/i);
  } finally {
    context.cleanup();
  }
});
