const test = require('node:test');
const assert = require('node:assert/strict');

const { createTestContext } = require('../helpers/test-context');

test('student record audit service records normal and degraded denial logs', () => {
  const context = createTestContext({
    studentRecordTestState: {
      auditFailureIdentifiersByFeature: {
        course_history: ['userA@example.com']
      }
    }
  });

  try {
    const services = context.app.locals.services;
    const userA = services.accountModel.findByIdentifier('userA@example.com');
    const admin = services.accountModel.findByIdentifier('admin@example.com');

    const degraded = services.studentRecordAuditService.recordDeniedAccess(
      'course_history',
      userA,
      admin.id,
      'Denied'
    );
    assert.equal(degraded.status, 'logged_degraded');

    const normal = services.studentRecordAuditService.recordDeniedAccess(
      'transcript',
      admin,
      userA.id,
      'Denied'
    );
    assert.equal(normal.status, 'logged');

    const courseAudits = services.studentRecordAuditModel.listByFeature('course_history');
    assert.equal(courseAudits.length, 1);
    assert.equal(courseAudits[0].degradedLogging, true);

    const transcriptAudits = services.studentRecordAuditModel.listByFeature('transcript');
    assert.equal(transcriptAudits.length, 1);
    assert.equal(transcriptAudits[0].degradedLogging, false);
  } finally {
    context.cleanup();
  }
});
