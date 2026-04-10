const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');

function renderOfferingLinks(offerings, selectedOfferingId) {
  if (offerings.length === 0) {
    return '<li>No assigned course offerings.</li>';
  }

  return offerings.map((offering) => `<li><a class="login-button-link secondary-link" href="/teaching/rosters?offeringId=${escapeHtml(
    String(offering.id)
  )}">${escapeHtml(offering.courseCode)} ${escapeHtml(offering.title)} (${escapeHtml(offering.offeringCode)})${
    offering.id === selectedOfferingId ? ' [Selected]' : ''
  }</a></li>`).join('');
}

function renderProgramOptions(programOptions, selectedProgram) {
  return ['<option value="">All programs</option>']
    .concat(
      programOptions.map((program) => `<option value="${escapeHtml(program)}"${program === selectedProgram ? ' selected' : ''}>${escapeHtml(program)}</option>`)
    )
    .join('');
}

function renderSortOptions(selectedSort) {
  return [
    { value: 'name', label: 'Student Name' },
    { value: 'student_id', label: 'Student ID' }
  ].map((option) => `<option value="${option.value}"${option.value === selectedSort ? ' selected' : ''}>${option.label}</option>`).join('');
}

function renderRosterRows(roster) {
  return roster.map((student) => `
    <tr>
      <td>${escapeHtml(student.fullName)}</td>
      <td>${escapeHtml(student.studentId)}</td>
      <td>${escapeHtml(student.programName)}</td>
    </tr>
  `).join('');
}

function createCourseRosterController(services) {
  function getActiveProfessor(req) {
    if (!req.session?.accountId) {
      return null;
    }

    const account = services.accountModel.findById(req.session.accountId);
    if (!account || account.role !== 'professor' || account.status !== 'active') {
      return null;
    }

    return account;
  }

  function renderPage(res, actor, pageState) {
    const bodyHtml = pageState.state === 'ready'
      ? `<section class="dashboard-section-card"><div class="dashboard-section-header"><h2>${escapeHtml(pageState.selectedOffering.courseCode)} ${escapeHtml(pageState.selectedOffering.title)} (${escapeHtml(pageState.selectedOffering.offeringCode)})</h2><span class="dashboard-pill dashboard-pill--ok">Roster</span></div><form class="profile-section" method="get" action="/teaching/rosters"><input type="hidden" name="offeringId" value="${escapeHtml(String(pageState.selectedOffering.id))}"><label for="program">Program</label><select id="program" name="program">${renderProgramOptions(pageState.programOptions, pageState.filters.program)}</select><label for="sort">Sort by</label><select id="sort" name="sort">${renderSortOptions(pageState.filters.sort)}</select><div class="action-row profile-actions"><button type="submit">Apply</button><a class="login-button-link secondary-link" href="/teaching/rosters?offeringId=${escapeHtml(String(pageState.selectedOffering.id))}">Clear filter</a></div></form><table class="course-list"><thead><tr><th>Name</th><th>Student ID</th><th>Program</th></tr></thead><tbody>${renderRosterRows(pageState.roster)}</tbody></table></section>`
      : pageState.state === 'empty_roster'
        ? `<section class="dashboard-section-card dashboard-section-card--message"><h2>${escapeHtml(pageState.selectedOffering.courseCode)} ${escapeHtml(pageState.selectedOffering.title)} (${escapeHtml(pageState.selectedOffering.offeringCode)})</h2><p class="help-text">No students are currently enrolled in this offering.</p></section>`
        : `<section class="dashboard-section-card dashboard-section-card--message"><h2>${escapeHtml(
            pageState.state === 'forbidden'
              ? 'Access denied'
              : pageState.state === 'error'
                ? 'Roster unavailable'
                : pageState.state === 'not_found'
                  ? 'Offering not found'
                  : 'No course offerings'
          )}</h2><p class="help-text">${escapeHtml(
            pageState.message || 'Select one of your course offerings to view its roster.'
          )}</p></section>`;

    const html = renderHtml(path.resolve(__dirname, '../views/course-roster.html'), {
      body_html: bodyHtml,
      offering_links_html: renderOfferingLinks(pageState.assignedOfferings || [], pageState.selectedOffering?.id),
      signed_in_as: actor?.username || 'professor',
      status_message: pageState.state === 'ready'
        ? 'Roster loaded successfully.'
        : pageState.message || 'Select one of your assigned offerings to view the roster.'
    });

    const statusCode = pageState.state === 'forbidden'
      ? 403
      : pageState.state === 'error'
        ? 503
        : pageState.state === 'not_found'
          ? 404
          : 200;
    return res.status(statusCode).send(html);
  }

  return {
    getRosterPage(req, res) {
      const actor = getActiveProfessor(req);
      if (!actor) {
        return res.status(403).send('Access denied.');
      }

      return renderPage(res, actor, services.courseRosterService.getRosterPage(actor, req.query || {}));
    }
  };
}

module.exports = { createCourseRosterController };
