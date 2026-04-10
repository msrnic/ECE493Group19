const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');

function renderRosterRows(roster, fieldErrors = {}) {
  return roster
    .map(
      (entry) => `
        <tr>
          <td>${escapeHtml(entry.studentId)}</td>
          <td>${escapeHtml(entry.studentName)}</td>
          <td>
            <input class="profile-input${fieldErrors[entry.studentAccountId] ? ' profile-input-error' : ''}" name="grade_${entry.studentAccountId}" value="${escapeHtml(entry.finalGrade || '')}">
            ${fieldErrors[entry.studentAccountId] ? `<p class="profile-field-error">${escapeHtml(fieldErrors[entry.studentAccountId])}</p>` : ''}
          </td>
        </tr>
      `
    )
    .join('');
}

function renderSummaryDistribution(distribution) {
  const grades = Object.keys(distribution).sort();
  if (grades.length === 0) {
    return '<li>No submitted grades yet.</li>';
  }

  return grades
    .map((grade) => `<li>${escapeHtml(grade)}: ${escapeHtml(String(distribution[grade]))}</li>`)
    .join('');
}

function createGradebookController(services) {
  function getActor(req) {
    return req.session?.accountId ? services.accountModel.findById(req.session.accountId) : null;
  }

  function renderEntryPage(res, details) {
    const html = renderHtml(path.resolve(__dirname, '../views/grade-entry.html'), {
      deadline_text: details.deadlineText,
      offering_heading: details.offeringHeading,
      offering_status: details.offeringStatus,
      roster_rows_html: details.rosterRowsHtml,
      status_banner_html: details.statusBannerHtml,
      summary_link: details.summaryLink
    });

    return res.status(details.statusCode).send(html);
  }

  function renderSummaryPage(res, details) {
    const html = renderHtml(path.resolve(__dirname, '../views/grade-summary.html'), {
      distribution_items_html: details.distributionItemsHtml,
      incomplete_message_html: details.incompleteMessageHtml,
      offering_heading: details.offeringHeading,
      offering_status: details.offeringStatus,
      status_banner_html: details.statusBannerHtml
    });

    return res.status(details.statusCode).send(html);
  }

  function createStatusBanner(message, variant = 'info') {
    if (!message) {
      return '';
    }

    const variantClass = variant === 'error' ? ' profile-status--error' : variant === 'success' ? ' profile-status--success' : '';
    return `<p class="status-chip profile-status${variantClass}">${escapeHtml(message)}</p>`;
  }

  function collectGrades(body) {
    const grades = {};

    for (const [key, value] of Object.entries(body || {})) {
      if (!key.startsWith('grade_')) {
        continue;
      }

      grades[key.slice('grade_'.length)] = value;
    }

    return grades;
  }

  return {
    exportSummary(req, res) {
      const result = services.gradebookService.exportSummaryCsv(
        req.session?.accountId,
        Number(req.params.offeringId)
      );
      if (result.statusCode !== 200) {
        return res.status(result.statusCode).send(result.message);
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.status(200).send(result.csv);
    },

    getGradeEntryPage(req, res) {
      const actor = getActor(req);
      if (!actor) {
        return res.redirect('/login?returnTo=%2Fgrades%2Fofferings%2F1');
      }

      const result = services.gradebookService.getGradeEntryPage(actor.id, Number(req.params.offeringId));
      if (result.statusCode !== 200) {
        return renderEntryPage(res, {
          deadlineText: '',
          offeringHeading: 'Final Grade Entry',
          offeringStatus: 'Unavailable',
          rosterRowsHtml: '',
          statusBannerHtml: createStatusBanner(result.message, 'error'),
          statusCode: result.statusCode,
          summaryLink: '/grades/summary'
        });
      }

      return renderEntryPage(res, {
        deadlineText: `Submission deadline: ${result.offering.submissionDeadlineAt}`,
        offeringHeading: `${result.offering.courseCode} ${result.offering.title}`,
        offeringStatus: result.offering.submissionStatus,
        rosterRowsHtml: renderRosterRows(result.roster),
        statusBannerHtml: '',
        statusCode: 200,
        summaryLink: `/grades/summary?offeringId=${result.offering.id}`
      });
    },

    getSummaryPage(req, res) {
      const actor = getActor(req);
      if (!actor) {
        return res.redirect('/login?returnTo=%2Fgrades%2Fsummary');
      }

      const offeringId = Number(req.query.offeringId || req.params.offeringId || 1);
      const result = services.gradebookService.getSummary(actor.id, offeringId);
      if (result.statusCode !== 200) {
        return renderSummaryPage(res, {
          distributionItemsHtml: '',
          incompleteMessageHtml: '',
          offeringHeading: 'Grade Submission Summary',
          offeringStatus: 'Unavailable',
          statusBannerHtml: createStatusBanner(result.message, 'error'),
          statusCode: result.statusCode
        });
      }

      return renderSummaryPage(res, {
        distributionItemsHtml: renderSummaryDistribution(result.distribution),
        incompleteMessageHtml: result.incompleteMessage
          ? `<p class="help-text">${escapeHtml(result.incompleteMessage)}</p>`
          : '',
        offeringHeading: `${result.offering.courseCode} ${result.offering.title}`,
        offeringStatus: result.offering.submissionStatus,
        statusBannerHtml: createStatusBanner('Submitted grade summary loaded successfully.', 'success'),
        statusCode: 200
      });
    },

    getSummaryStatus(req, res) {
      const result = services.gradebookService.getSummary(
        req.session?.accountId,
        Number(req.query.offeringId || req.params.offeringId)
      );
      if (result.statusCode !== 200) {
        return res.status(result.statusCode).json({
          message: result.message,
          state: result.state || 'denied'
        });
      }

      return res.status(200).json({
        distribution: result.distribution,
        incompleteMessage: result.incompleteMessage,
        state: result.state,
        submittedCount: result.submittedCount,
        totalStudents: result.totalStudents
      });
    },

    postGrades(req, res) {
      const actor = getActor(req);
      if (!actor) {
        return res.redirect('/login?returnTo=%2Fgrades%2Fofferings%2F1');
      }

      const offeringId = Number(req.params.offeringId);
      const result = services.gradebookService.saveGrades(
        actor.id,
        offeringId,
        collectGrades(req.body),
        req.body.intent === 'submit' ? 'submit' : 'draft'
      );
      if (result.statusCode !== 200) {
        const page = services.gradebookService.getGradeEntryPage(actor.id, offeringId);
        return renderEntryPage(res, {
          deadlineText: page.offering ? `Submission deadline: ${page.offering.submissionDeadlineAt}` : '',
          offeringHeading: page.offering
            ? `${page.offering.courseCode} ${page.offering.title}`
            : 'Final Grade Entry',
          offeringStatus: page.offering?.submissionStatus || 'Unavailable',
          rosterRowsHtml: page.roster ? renderRosterRows(page.roster, result.fieldErrors) : '',
          statusBannerHtml: createStatusBanner(result.message, 'error'),
          statusCode: result.statusCode,
          summaryLink: `/grades/summary?offeringId=${offeringId}`
        });
      }

      return renderEntryPage(res, {
        deadlineText: `Submission deadline: ${result.offering.submissionDeadlineAt}`,
        offeringHeading: `${result.offering.courseCode} ${result.offering.title}`,
        offeringStatus: result.offering.submissionStatus,
        rosterRowsHtml: renderRosterRows(result.roster),
        statusBannerHtml: createStatusBanner(result.message, 'success'),
        statusCode: 200,
        summaryLink: `/grades/summary?offeringId=${result.offering.id}`
      });
    }
  };
}

module.exports = { createGradebookController };
