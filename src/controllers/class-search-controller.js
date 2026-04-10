const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');

function renderTermOptions(termOptions, selectedTerm) {
  return termOptions
    .map((term) => `<option value="${escapeHtml(term)}"${term === selectedTerm ? ' selected' : ''}>${escapeHtml(term)}</option>`)
    .join('');
}

function renderResults(results) {
  if (results.length === 0) {
    return '';
  }

  return results.map((result) => `
    <article class="dashboard-section-card class-search-result">
      <div class="dashboard-section-header">
        <h2>${escapeHtml(result.courseCode)} ${escapeHtml(result.title)}</h2>
        <span class="dashboard-pill${result.isCurrent ? ' dashboard-pill--ok' : ''}">${escapeHtml(result.isCurrent ? 'Current' : 'Stale')}</span>
      </div>
      <ul class="course-list">
        <li>Section: ${escapeHtml(result.offeringCode)}</li>
        <li>Term: ${escapeHtml(result.termCode)}</li>
        <li>Meeting time: ${escapeHtml(result.meetingTimeLabel)}</li>
        <li>Instructor: ${escapeHtml(result.instructorName)}</li>
        <li>Seats: ${escapeHtml(String(result.seatsRemaining))}</li>
        <li>Seat availability last updated: ${escapeHtml(result.lastUpdatedLabel)}</li>
      </ul>
      ${result.staleLabel ? `<p class="help-text">${escapeHtml(result.staleLabel)}</p>` : ''}
      <div class="action-row">
        <form method="post" action="/enrollment">
          <input type="hidden" name="offeringId" value="${escapeHtml(String(result.id))}">
          <button type="submit">Enroll</button>
        </form>
        <a class="login-button-link secondary-link" href="/classes/${escapeHtml(String(result.id))}">View class details</a>
      </div>
    </article>
  `).join('');
}

function createClassSearchController(services) {
  function getActiveStudent(req) {
    if (!req.session?.accountId) {
      return null;
    }

    return services.studentAccountModel.findActiveByAccountId(req.session.accountId);
  }

  function renderSearchPage(res, payload) {
    const html = renderHtml(path.resolve(__dirname, '../views/class-search/index.html'), {
      course_number_value: payload.filters.courseNumber || '',
      query_value: payload.filters.queryText || '',
      result_state_html:
        payload.state === 'idle'
          ? '<section class="dashboard-section-card dashboard-section-card--message"><h2>Search for available classes</h2><p class="help-text">Enter a keyword, subject, or course number to find matching classes.</p></section>'
          : payload.state === 'empty'
            ? '<section class="dashboard-section-card dashboard-section-card--message"><h2>No classes found</h2><p class="help-text">Try refining your search by subject, course number, or term.</p></section>'
            : payload.state === 'error'
              ? `<section class="dashboard-section-card dashboard-section-card--message"><h2>Search unavailable</h2><p class="help-text">${escapeHtml(payload.statusMessage)}</p></section>`
              : '',
      results_html: renderResults(payload.results),
      status_message:
        payload.state === 'results'
          ? `${payload.results.length} matching class${payload.results.length === 1 ? '' : 'es'} found.`
          : payload.state === 'error'
            ? payload.statusMessage
            : payload.state === 'empty'
              ? 'No matching classes were found.'
              : 'Search the active term for available classes.',
      subject_value: payload.filters.subjectCode || '',
      term_options_html: renderTermOptions(payload.termOptions, payload.filters.termCode)
    });

    return res.status(payload.state === 'error' ? 503 : 200).send(html);
  }

  function renderDetailPage(res, details) {
    const html = renderHtml(path.resolve(__dirname, '../views/class-search/class-detail.html'), {
      body_html: details.status === 'success'
        ? `<section class="dashboard-section-card"><div class="dashboard-section-header"><h1>${escapeHtml(details.offering.courseCode)} ${escapeHtml(details.offering.title)}</h1><span class="dashboard-pill${details.offering.isCurrent ? ' dashboard-pill--ok' : ''}">${escapeHtml(details.offering.isCurrent ? 'Current' : 'Stale')}</span></div><ul class="course-list"><li>Section: ${escapeHtml(details.offering.offeringCode)}</li><li>Term: ${escapeHtml(details.offering.termCode)}</li><li>Subject: ${escapeHtml(details.offering.subjectCode)}</li><li>Course number: ${escapeHtml(details.offering.courseNumber)}</li><li>Meeting time: ${escapeHtml(details.offering.meetingTimeLabel)}</li><li>Instructor: ${escapeHtml(details.offering.instructorName)}</li><li>Seats remaining: ${escapeHtml(String(details.offering.seatsRemaining))}</li><li>Seat availability last updated: ${escapeHtml(details.offering.lastUpdatedLabel)}</li></ul>${details.offering.staleLabel ? `<p class="help-text">${escapeHtml(details.offering.staleLabel)}</p>` : ''}<form class="profile-section" method="post" action="/enrollment"><input type="hidden" name="offeringId" value="${escapeHtml(String(details.offering.id))}"><button type="submit">Enroll in this class</button></form></section>`
        : `<section class="dashboard-section-card dashboard-section-card--message"><h1>${escapeHtml(details.status === 'not_found' ? 'Class not found' : 'Class details unavailable')}</h1><p class="help-text">${escapeHtml(details.message)}</p></section>`,
      signed_in_as: details.student.displayName,
      status_message: details.status === 'success' ? 'Class details loaded successfully.' : details.message
    });

    return res.status(details.status === 'success' ? 200 : details.status === 'not_found' ? 404 : 503).send(html);
  }

  return {
    getClassDetail(req, res) {
      const student = getActiveStudent(req);
      if (!student) {
        return res.redirect(`/login?returnTo=${encodeURIComponent(req.originalUrl || '/classes/search')}`);
      }

      const details = services.classSearchService.getOfferingDetails(student, Number(req.params.offeringId));
      return renderDetailPage(res, { ...details, student });
    },

    getSearchPage(req, res) {
      const student = getActiveStudent(req);
      if (!student) {
        return res.redirect('/login?returnTo=%2Fclasses%2Fsearch');
      }

      return renderSearchPage(res, services.classSearchService.getSearchPageData(student, req.query || {}));
    }
  };
}

module.exports = { createClassSearchController };
