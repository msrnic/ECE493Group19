const test = require('node:test');
const assert = require('node:assert/strict');

const { VALID_GRADES } = require('../../src/services/gradebook-service');
const { createTestContext } = require('../helpers/test-context');

test('gradebook service lists professor offerings and provides grade entry data', () => {
  const context = createTestContext();

  try {
    const services = context.app.locals.services;
    const professor = services.accountModel.findByIdentifier('professor@example.com');

    const offerings = services.gradebookService.getProfessorOfferings(professor.id);
    assert.equal(offerings.length, 1);
    assert.equal(offerings[0].courseCode, 'ECE493');

    const page = services.gradebookService.getGradeEntryPage(professor.id, offerings[0].id);
    assert.equal(page.statusCode, 200);
    assert.equal(page.roster.length, 3);
  } finally {
    context.cleanup();
  }
});

test('gradebook service validates grade values and supports draft and submitted saves before deadline', () => {
  const context = createTestContext();

  try {
    const services = context.app.locals.services;
    const professor = services.accountModel.findByIdentifier('professor@example.com');
    const offering = services.gradebookService.getProfessorOfferings(professor.id)[0];

    const invalid = services.gradebookService.saveGrades(professor.id, offering.id, { 1: 'ZZ' }, 'draft');
    assert.equal(invalid.statusCode, 400);

    const draft = services.gradebookService.saveGrades(
      professor.id,
      offering.id,
      { 1: 'A', 9: 'B+', 10: 'A-' },
      'draft'
    );
    assert.equal(draft.statusCode, 200);
    assert.match(draft.message, /draft/);
    assert.equal(draft.offering.submissionStatus, 'draft');

    const submitted = services.gradebookService.saveGrades(
      professor.id,
      offering.id,
      { 1: 'A', 9: 'B+', 10: 'A-' },
      'submit'
    );
    assert.equal(submitted.statusCode, 200);
    assert.match(submitted.message, /submitted/);
    assert.equal(submitted.offering.submissionStatus, 'submitted');

    assert.equal(VALID_GRADES.has('A-'), true);
  } finally {
    context.cleanup();
  }
});

test('gradebook service blocks after deadline, handles save/summary failures, and protects unauthorized/export access', () => {
  const context = createTestContext({
    gradebookTestState: {
      auditFailureIdentifiersByFeature: { grade_summary: ['professor@example.com'] },
      saveFailureIdentifiers: ['professor@example.com'],
      summaryFailureIdentifiers: ['professor@example.com']
    }
  });

  try {
    const services = context.app.locals.services;
    const professor = services.accountModel.findByIdentifier('professor@example.com');
    const student = services.accountModel.findByIdentifier('userA@example.com');
    const offering = services.gradebookService.getProfessorOfferings(professor.id)[0];

    const saveFailed = services.gradebookService.saveGrades(
      professor.id,
      offering.id,
      { 1: 'A', 9: 'B+', 10: 'A-' },
      'submit'
    );
    assert.equal(saveFailed.statusCode, 500);

    services.gradebookTestState.saveFailureIdentifiers = [];
    services.gradebookService.saveGrades(
      professor.id,
      offering.id,
      { 1: 'A', 9: 'B+', 10: 'A-' },
      'submit'
    );
    context.advanceTime(40 * 24 * 60 * 60 * 1000);
    const deadlinePassed = services.gradebookService.saveGrades(
      professor.id,
      offering.id,
      { 1: 'B', 9: 'B+', 10: 'A-' },
      'submit'
    );
    assert.equal(deadlinePassed.statusCode, 409);

    const summaryUnavailable = services.gradebookService.getSummary(professor.id, offering.id);
    assert.equal(summaryUnavailable.statusCode, 503);

    services.gradebookTestState.summaryFailureIdentifiers = [];
    const summary = services.gradebookService.getSummary(professor.id, offering.id);
    assert.equal(summary.statusCode, 200);
    assert.equal(summary.totalStudents, 3);

    const exportOk = services.gradebookService.exportSummaryCsv(professor.id, offering.id);
    assert.equal(exportOk.statusCode, 200);
    assert.match(exportOk.csv, /courseCode,termCode,studentId,studentName,finalGrade/);

    const forbiddenPage = services.gradebookService.getGradeEntryPage(student.id, offering.id);
    assert.equal(forbiddenPage.statusCode, 403);

    const forbiddenSummary = services.gradebookService.getSummary(professor.id, 2);
    assert.equal(forbiddenSummary.statusCode, 403);

    const forbiddenExport = services.gradebookService.exportSummaryCsv(professor.id, 2);
    assert.equal(forbiddenExport.statusCode, 403);

    const summaryAudits = services.gradebookAuditModel.listByFeature('grade_summary');
    assert.equal(summaryAudits.length >= 1, true);
    assert.equal(summaryAudits[0].degradedLogging, true);
  } finally {
    context.cleanup();
  }
});
