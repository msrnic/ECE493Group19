const test = require('node:test');
const assert = require('node:assert/strict');

const { createTestContext } = require('../helpers/test-context');

test('inbox model returns defaults for missing access state and missing send request', () => {
  const context = createTestContext();

  try {
    const { inboxModel } = context.app.locals.services;
    const professor = context.app.locals.services.accountModel.findByIdentifier('professor@example.com');

    const accessState = inboxModel.getAccessState(professor.id);
    assert.equal(accessState.accessState, 'enabled');
    assert.equal(accessState.restrictionReason, null);
    assert.equal(accessState.showStatusIndicator, true);

    const missingSendRequest = inboxModel.findSendRequestById(999999);
    assert.equal(missingSendRequest, null);

    assert.deepEqual(inboxModel.listStoredNotifications(professor.id), []);
    assert.deepEqual(inboxModel.listVisibleNotifications(professor.id), []);
  } finally {
    context.cleanup();
  }
});

test('inbox model resolves courses, groups, and individual student records', () => {
  const context = createTestContext();

  try {
    const { inboxModel } = context.app.locals.services;

    assert.equal(inboxModel.findCourseDefinition('ECE493').course_code, 'ECE493');
    assert.equal(inboxModel.findGroupDefinition('all-active-students').group_key, 'all-active-students');
    assert.equal(inboxModel.resolveStudentByStudentId('userA').studentId, 'userA');
    assert.equal(inboxModel.resolveRosterStudents('ECE493').some((student) => student.studentId === 'userA'), true);
    assert.equal(
      inboxModel.resolveGroupStudents('all-active-students').some((student) => student.studentId === 'userA'),
      true
    );
  } finally {
    context.cleanup();
  }
});
