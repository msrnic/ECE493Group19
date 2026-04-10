const VALID_GRADES = new Set([
  'A+',
  'A',
  'A-',
  'B+',
  'B',
  'B-',
  'C+',
  'C',
  'C-',
  'D+',
  'D',
  'F',
  'IN',
  'W'
]);

function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function formatCsvValue(value) {
  const text = String(value == null ? '' : value);
  if (/[,"\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function createGradebookService(options) {
  function getProfessor(accountId) {
    const account = options.accountModel.findById(accountId);
    return account && account.role === 'professor' ? account : null;
  }

  function shouldFailSave(professor, offeringId) {
    const configured = options.gradebookTestState?.saveFailureIdentifiers || [];
    const identifiers = new Set(configured.map(normalizeIdentifier));

    return (
      identifiers.has(normalizeIdentifier(professor.email)) ||
      identifiers.has(normalizeIdentifier(professor.username)) ||
      identifiers.has(normalizeIdentifier(offeringId))
    );
  }

  function shouldFailSummary(professor, offeringId) {
    const configured = options.gradebookTestState?.summaryFailureIdentifiers || [];
    const identifiers = new Set(configured.map(normalizeIdentifier));

    return (
      identifiers.has(normalizeIdentifier(professor.email)) ||
      identifiers.has(normalizeIdentifier(professor.username)) ||
      identifiers.has(normalizeIdentifier(offeringId))
    );
  }

  function getAuthorizedOffering(professor, offeringId, featureKey) {
    const offering = options.gradebookModel.findOfferingById(offeringId);
    if (!professor || !offering || offering.instructorAccountId !== professor.id) {
      if (professor) {
        options.gradebookAuditService.recordDenied(
          featureKey,
          professor,
          offering?.id || Number(offeringId) || null,
          'Gradebook offering is not available to this professor.'
        );
      }

      return null;
    }

    return offering;
  }

  function validateGrades(gradesByStudentId) {
    const fieldErrors = {};
    const normalized = {};

    for (const [studentId, rawValue] of Object.entries(gradesByStudentId || {})) {
      const finalGrade = String(rawValue || '').trim().toUpperCase();
      if (!finalGrade) {
        fieldErrors[studentId] = 'Enter a final grade.';
        continue;
      }

      if (!VALID_GRADES.has(finalGrade)) {
        fieldErrors[studentId] = 'Enter a valid final grade value.';
        continue;
      }

      normalized[studentId] = finalGrade;
    }

    return {
      fieldErrors,
      isValid: Object.keys(fieldErrors).length === 0,
      normalized
    };
  }

  function buildSummary(offering, roster) {
    const submittedEntries = roster.filter((entry) => entry.finalGrade);
    const distribution = {};

    for (const entry of submittedEntries) {
      distribution[entry.finalGrade] = (distribution[entry.finalGrade] || 0) + 1;
    }

    const missingEntries = roster.filter((entry) => !entry.finalGrade);
    return {
      distribution,
      incompleteMessage:
        missingEntries.length > 0
          ? `${missingEntries.length} student grade(s) are still missing from this offering.`
          : null,
      offering,
      roster,
      state:
        offering.submissionStatus === 'submitted'
          ? missingEntries.length > 0
            ? 'partial'
            : 'full'
          : missingEntries.length > 0
            ? 'partial'
            : 'full',
      submittedCount: submittedEntries.length,
      totalStudents: roster.length
    };
  }

  return {
    exportSummaryCsv(accountId, offeringId) {
      const professor = getProfessor(accountId);
      const offering = getAuthorizedOffering(professor, offeringId, 'grade_export');
      if (!offering) {
        return {
          message: 'Grade summary export was denied.',
          status: 'forbidden',
          statusCode: 403
        };
      }

      const roster = options.gradebookModel.listRosterByOffering(offering.id);
      const lines = [
        ['courseCode', 'termCode', 'studentId', 'studentName', 'finalGrade'].map(formatCsvValue).join(',')
      ];

      for (const entry of roster) {
        lines.push(
          [
            offering.courseCode,
            offering.termCode,
            entry.studentId,
            entry.studentName,
            entry.finalGrade || ''
          ]
            .map(formatCsvValue)
            .join(',')
        );
      }

      return {
        csv: lines.join('\n'),
        filename: `${offering.courseCode}-${offering.termCode}-grade-summary.csv`,
        status: 'ok',
        statusCode: 200
      };
    },

    getGradeEntryPage(accountId, offeringId) {
      const professor = getProfessor(accountId);
      if (!professor) {
        return { status: 'forbidden', statusCode: 403 };
      }

      const offering = getAuthorizedOffering(professor, offeringId, 'grade_entry');
      if (!offering) {
        return {
          message: 'You are not authorized to manage grades for this offering.',
          status: 'forbidden',
          statusCode: 403
        };
      }

      const roster = options.gradebookModel.listRosterByOffering(offering.id);
      return {
        offering,
        professor,
        roster,
        status: 'ok',
        statusCode: 200
      };
    },

    getProfessorOfferings(accountId) {
      const professor = getProfessor(accountId);
      if (!professor) {
        return [];
      }

      return options.gradebookModel.listOfferingsByInstructor(professor.id);
    },

    getSummary(accountId, offeringId) {
      const professor = getProfessor(accountId);
      if (!professor) {
        return {
          message: 'Grade submission summary is unavailable for this account.',
          status: 'forbidden',
          statusCode: 403
        };
      }

      const offering = getAuthorizedOffering(professor, offeringId, 'grade_summary');
      if (!offering) {
        return {
          message: 'You are not authorized to view this grade summary.',
          status: 'forbidden',
          statusCode: 403
        };
      }

      if (shouldFailSummary(professor, offeringId)) {
        return {
          message: 'Grade summary is temporarily unavailable. Retry later.',
          state: 'unavailable',
          status: 'unavailable',
          statusCode: 503
        };
      }

      return {
        ...buildSummary(offering, options.gradebookModel.listRosterByOffering(offering.id)),
        status: 'ok',
        statusCode: 200
      };
    },

    saveGrades(accountId, offeringId, gradesByStudentId, action) {
      const professor = getProfessor(accountId);
      if (!professor) {
        return {
          message: 'Grade entry is unavailable for this account.',
          status: 'forbidden',
          statusCode: 403
        };
      }

      const offering = getAuthorizedOffering(professor, offeringId, 'grade_entry');
      if (!offering) {
        return {
          message: 'You are not authorized to manage grades for this offering.',
          status: 'forbidden',
          statusCode: 403
        };
      }

      const validation = validateGrades(gradesByStudentId);
      if (!validation.isValid) {
        return {
          fieldErrors: validation.fieldErrors,
          message: 'Please correct the highlighted final grades.',
          status: 'validation_error',
          statusCode: 400
        };
      }

      if (
        offering.submissionStatus === 'submitted' &&
        new Date(offering.submissionDeadlineAt).getTime() < options.now().getTime()
      ) {
        return {
          message: 'The final grade submission deadline has passed. Submit a grade change request instead.',
          status: 'deadline_passed',
          statusCode: 409
        };
      }

      if (shouldFailSave(professor, offeringId)) {
        return {
          message: 'We could not save final grades right now. Please retry.',
          status: 'save_failed',
          statusCode: 500
        };
      }

      const submissionStatus = action === 'submit' ? 'submitted' : 'draft';
      options.gradebookModel.saveGrades(
        offering.id,
        validation.normalized,
        submissionStatus,
        options.now().toISOString()
      );

      return {
        message:
          submissionStatus === 'submitted'
            ? 'Final grades were submitted successfully.'
            : 'Final grades were saved as draft.',
        offering: options.gradebookModel.findOfferingById(offering.id),
        roster: options.gradebookModel.listRosterByOffering(offering.id),
        status: 'saved',
        statusCode: 200
      };
    }
  };
}

module.exports = { VALID_GRADES, createGradebookService };
