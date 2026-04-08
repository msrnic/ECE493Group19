const path = require('path');

const { renderHtml, escapeHtml } = require('../views/render');

function renderRecordRows(records) {
  return records.map((record) => `
    <article class="dashboard-section-card transaction-record">
      <div class="dashboard-section-header">
        <h2>${escapeHtml(record.status)}</h2>
        <span class="dashboard-pill dashboard-pill--ok">${escapeHtml(record.postedAt)}</span>
      </div>
      <ul class="course-list">
        <li>Amount: ${escapeHtml(record.currency)} ${escapeHtml(record.amount.toFixed(2))}</li>
        <li>Payment method: ${escapeHtml(record.paymentMethodLabel)}${record.maskedMethodIdentifier ? ` (${escapeHtml(record.maskedMethodIdentifier)})` : ''}</li>
        <li>Reference number: ${escapeHtml(record.referenceNumber)}</li>
      </ul>
    </article>
  `).join('');
}

function createTransactionHistoryController(services) {
  function renderPage(res, details) {
    const html = renderHtml(path.resolve(__dirname, '../views/transaction-history.html'), {
      retry_href: '/transactions/history',
      signed_in_as: details.student?.displayName || 'student',
      status_class: details.statusClass,
      status_message: details.statusMessage,
      state_html: details.stateHtml || '',
      transaction_rows_html: details.transactionRowsHtml || ''
    });

    return res.status(details.statusCode).send(html);
  }

  function getActorStudent(req) {
    if (!req.session?.accountId) {
      return null;
    }

    return services.studentAccountModel.findActiveByAccountId(req.session.accountId);
  }

  function createErrorResponse(statusCode, code, message, retryable) {
    return res => res.status(statusCode).json({
      code,
      message,
      ...(retryable === undefined ? {} : { retryable })
    });
  }

  return {
    getTransactionHistoryPage(req, res) {
      const student = getActorStudent(req);
      if (!student) {
        return renderPage(res, {
          stateHtml: '<p class="help-text">Only active student accounts may view transaction history.</p>',
          statusClass: 'failure',
          statusCode: 403,
          statusMessage: 'Transaction history is unavailable for this account.',
          student: null
        });
      }

      try {
        const payload = services.paymentStatusService.createTransactionHistoryResponse(student);
        const isEmpty = payload.records.length === 0;
        return renderPage(res, {
          stateHtml: isEmpty
            ? '<section class="dashboard-section-card dashboard-section-card--message"><h2>No transactions found</h2><p class="help-text">No past tuition or fee payment records are available for this account.</p></section>'
            : '',
          statusClass: isEmpty ? 'empty_access' : 'success',
          statusCode: 200,
          statusMessage: isEmpty
            ? 'No past tuition or fee payment records are available right now.'
            : 'Transaction history loaded successfully.',
          student,
          transactionRowsHtml: isEmpty ? '' : renderRecordRows(payload.records)
        });
      } catch (error) {
        const dependencyError = services.paymentStatusService.createDependencyErrorPayload(error);
        return renderPage(res, {
          stateHtml: `<section class="dashboard-section-card dashboard-section-card--message"><h2>Unable to load transaction history</h2><p class="help-text">${escapeHtml(dependencyError.message)}</p><div class="action-row"><a class="login-button-link secondary-link" href="/transactions/history">Retry transaction history</a></div></section>`,
          statusClass: 'failure',
          statusCode: dependencyError.statusCode,
          statusMessage: dependencyError.message,
          student
        });
      }
    },

    getTransactionHistoryApi(req, res) {
      const actor = getActorStudent(req);
      if (!req.session?.accountId) {
        return createErrorResponse(401, 'auth_required', 'Sign in to view transaction history.')(res);
      }

      if (!actor) {
        return createErrorResponse(403, 'transaction_history_forbidden', 'Only active student accounts may view transaction history.')(res);
      }

      const requestedStudent = services.studentAccountModel.findByStudentId(req.params.studentId);
      if (!requestedStudent) {
        return createErrorResponse(404, 'student_not_found', 'Student account was not found.')(res);
      }

      if (requestedStudent.accountId !== actor.accountId) {
        return createErrorResponse(403, 'transaction_history_forbidden', 'You may view only your own transaction history.')(res);
      }

      try {
        return res.status(200).json(
          services.paymentStatusService.createTransactionHistoryResponse(requestedStudent)
        );
      } catch (error) {
        const dependencyError = services.paymentStatusService.createDependencyErrorPayload(error);
        return createErrorResponse(
          dependencyError.statusCode,
          dependencyError.code,
          dependencyError.message,
          dependencyError.retryable
        )(res);
      }
    }
  };
}

module.exports = { createTransactionHistoryController };
