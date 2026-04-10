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

test('admin can add and delete offerings while blocked deletes preserve active offerings', async () => {
  const context = createTestContext();
  try {
    const agent = request.agent(context.app);
    await loginAsAdmin(agent);

    const page = await agent.get('/admin/offerings');
    assert.equal(page.status, 200);
    assert.match(page.text, /Manage Course Offerings|Course Offerings Administration/);

    const add = await agent.post('/admin/offerings').type('form').send({
      capacity: '20',
      courseCode: 'ECE497',
      instructorAccountId: '2',
      meetingDays: 'Tue,Thu',
      scheduleEndTime: '12:00',
      scheduleStartTime: '11:00',
      sectionCode: 'Z1',
      termCode: '2026FALL',
      title: 'Systems Integration'
    });
    assert.equal(add.status, 200);
    assert.match(add.text, /Offering created successfully/);

    const created = context.db.prepare("SELECT offering_code FROM class_offerings WHERE course_code = 'ECE497'").get();
    assert.ok(created.offering_code);

    const blocked = await agent.post(`/admin/offerings/${context.db.prepare("SELECT id FROM class_offerings WHERE offering_code = 'O_ROSTER'").get().id}/delete`).type('form').send({
      confirmDelete: true
    });
    assert.equal(blocked.status, 409);
    assert.match(blocked.text, /Active enrollments prevent deletion/);

    const deleted = await agent.post(`/admin/offerings/${context.db.prepare("SELECT id FROM class_offerings WHERE offering_code = 'O_EMPTY'").get().id}/delete`).type('form').send({
      confirmDelete: true
    });
    assert.equal(deleted.status, 200);
    assert.match(deleted.text, /Offering deleted successfully/);
  } finally {
    context.cleanup();
  }
});
