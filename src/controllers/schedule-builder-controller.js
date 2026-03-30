const path = require('path');

const { escapeHtml, renderHtml } = require('../views/render');

function createStatusBanner(message, variant = 'info') {
  if (!message) {
    return '';
  }

  const variantClass = variant === 'success'
    ? ' schedule-builder-status--success'
    : variant === 'warning'
      ? ' schedule-builder-status--warning'
      : variant === 'error'
        ? ' schedule-builder-status--error'
        : '';

  return `<p class='status-chip schedule-builder-status${variantClass}'>${escapeHtml(message)}</p>`;
}

function createFieldErrorHtml(message) {
  if (!message) {
    return '';
  }

  return `<p class='schedule-builder-field-error'>${escapeHtml(message)}</p>`;
}

function renderPriorityOptions(selectedValue) {
  return [1, 2, 3, 4, 5]
    .map((value) => `<option value='${value}'${String(selectedValue) === String(value) ? ' selected' : ''}>${value}</option>`)
    .join('');
}

function renderTermOptions(terms, selectedTermCode) {
  return terms
    .map((term) => (
      `<option value='${escapeHtml(term.termCode)}'${term.termCode === selectedTermCode ? ' selected' : ''}>${escapeHtml(term.displayName)}${term.isAvailable ? '' : ' (Unavailable)'}</option>`
    ))
    .join('');
}

function renderCourseSelection(courses, selectedCodes) {
  const selected = new Set(selectedCodes);

  return courses.map((course) => {
    const professorSummary = [...new Set(course.groups.map((group) => group.professorName))].join(', ');
    const bundleCount = course.groups.length;
    return `
      <label class='schedule-builder-course-option'>
        <input
          type='checkbox'
          name='selectedCourseCodes'
          value='${escapeHtml(course.courseCode)}'
          ${selected.has(course.courseCode) ? 'checked' : ''}
        >
        <span>
          <strong>${escapeHtml(course.courseCode)}</strong> ${escapeHtml(course.title)}
          <small>${bundleCount} compatible bundle(s) | ${escapeHtml(professorSummary || 'Professor TBA')}</small>
        </span>
      </label>
    `;
  }).join('');
}

function renderSavedSetOptions(savedSets, selectedSavedSetId) {
  const selectedValue = String(selectedSavedSetId);
  const options = savedSets.map((savedSet) => (
    `<option value='${savedSet.id}' data-version='${savedSet.version}'${String(savedSet.id) === selectedValue ? ' selected' : ''}>${escapeHtml(savedSet.displayName)}</option>`
  ));

  return [`<option value=''>Select a saved preset</option>`, ...options].join('');
}

function renderSavedSetSummary(savedSets) {
  if (!savedSets.length) {
    return '<p class=\'help-text\'>No saved presets yet for this term.</p>';
  }

  return `<ul class='schedule-builder-preset-list'>${savedSets
    .map((savedSet) => `<li><strong>${escapeHtml(savedSet.displayName)}</strong> <span>Updated ${escapeHtml(savedSet.updatedAt)}</span></li>`)
    .join('')}</ul>`;
}

function renderCourseSummary(option) {
  const coursesHtml = option.courseSummaries.map((courseSummary) => `
    <article class='schedule-builder-result-course${courseSummary.isFull ? ' is-full' : ''}'>
      <header>
        <h4>${escapeHtml(courseSummary.courseCode)} ${escapeHtml(courseSummary.title)}</h4>
        <p>${escapeHtml(courseSummary.optionCode)} | ${escapeHtml(courseSummary.professorName)}${courseSummary.isFull ? ' | Full' : ''}</p>
      </header>
      <ul class='course-list'>
        ${courseSummary.meetings.map((meeting) => `<li>${escapeHtml(meeting.componentType)} ${escapeHtml(meeting.sectionCode)}: ${escapeHtml(meeting.daysText)} ${escapeHtml(meeting.timeText)}</li>`).join('')}
      </ul>
    </article>
  `).join('');

  const sharedComponentsHtml = option.sharedComponents.length
    ? `
      <div class='schedule-builder-shared-components'>
        <h4>Shared Components</h4>
        <ul class='course-list'>
          ${option.sharedComponents.map((shared) => `<li>${escapeHtml(shared.sectionCode)} for ${escapeHtml(shared.courseCodes.join(', '))}: ${escapeHtml(shared.daysText)} ${escapeHtml(shared.timeText)}</li>`).join('')}
        </ul>
      </div>
    `
    : '';
  const violationHtml = option.violations.length
    ? `
      <div class='schedule-builder-violations'>
        <h4>Visible Conflicts And Violations</h4>
        <ul class='course-list'>
          ${option.violations.map((violation) => `<li>${escapeHtml(violation)}</li>`).join('')}
        </ul>
      </div>
    `
    : `<p class='help-text schedule-builder-clean-note'>No conflicts or priority violations were detected for this option.</p>`;

  return `
    <section class='schedule-builder-result-card${option.totalViolations ? ' is-warning' : ' is-clean'}' data-option-index='${option.rank - 1}'${option.rank === 1 ? '' : ' hidden'}>
      <div class='schedule-builder-result-header'>
        <div>
          <p class='eyebrow'>Schedule ${option.rank}</p>
          <h3>${escapeHtml(option.summaryLabel)}</h3>
        </div>
        <span class='dashboard-pill${option.totalViolations ? '' : ' dashboard-pill--ok'}'>${option.totalViolations ? `${option.totalViolations} issue(s)` : 'Conflict free'}</span>
      </div>
      <div class='schedule-builder-result-grid'>
        ${coursesHtml}
      </div>
      ${sharedComponentsHtml}
      ${violationHtml}
    </section>
  `;
}

function renderResults(results) {
  if (!results) {
    return `
      <section class='schedule-builder-panel'>
        <h2>Generated Schedules</h2>
        <p class='help-text'>Select courses, adjust priorities, and generate up to 10 ranked schedule options.</p>
      </section>
    `;
  }

  const noticesHtml = results.notices.length
    ? `<ul class='course-list schedule-builder-notice-list'>${results.notices.map((notice) => `<li>${escapeHtml(notice)}</li>`).join('')}</ul>`
    : '';

  const cardsHtml = results.schedules.map(renderCourseSummary).join('');
  const navigationHtml = results.schedules.length > 1
    ? `
      <div class='schedule-builder-carousel-nav'>
        <button id='schedule-builder-prev' class='secondary-button' type='button'>&larr; Previous</button>
        <p id='schedule-builder-position' class='help-text'>Showing schedule 1 of ${results.schedules.length}</p>
        <button id='schedule-builder-next' class='secondary-button' type='button'>Next &rarr;</button>
      </div>
    `
    : '';

  return `
    <section class='schedule-builder-panel schedule-builder-results-panel'>
      <h2>Generated Schedules</h2>
      ${createStatusBanner(results.bannerMessage, results.bannerVariant)}
      ${noticesHtml}
      ${navigationHtml}
      ${cardsHtml || '<p class=\'help-text\'>No schedules are available for the current request.</p>'}
    </section>
  `;
}

function renderForm(page) {
  const confirmConstraintButton = page.pendingAction === 'confirm-constraint-save'
    ? `<button class='secondary-button' type='submit' name='intent' value='confirm-save-constraints'>Confirm Save Anyway</button>`
    : '';
  const confirmPresetButton = page.pendingAction === 'confirm-preset-overwrite'
    ? `<button class='secondary-button' type='submit' name='intent' value='confirm-save-preset'>Confirm Overwrite</button>`
    : '';

  return `
    <form class='schedule-builder-form' method='post' action='/schedule-builder'>
      <section class='schedule-builder-panel'>
        <div class='schedule-builder-grid'>
          <label>
            Planning Term
            <select name='termCode'>${renderTermOptions(page.terms, page.formValues.termCode)}</select>
          </label>
          <label>
            Requested Results
            <input type='text' name='requestedResultCount' value='${escapeHtml(page.formValues.requestedResultCount)}' inputmode='numeric'>
            ${createFieldErrorHtml(page.fieldErrors.requestedResultCount)}
          </label>
        </div>
      </section>

      <section class='schedule-builder-panel'>
        <div class='schedule-builder-section-header'>
          <div>
            <h2>Course Selection</h2>
            <p class='help-text'>Select one or more courses. Possible time conflicts are highlighted before generation, but you can still continue.</p>
          </div>
        </div>
        <div id='schedule-builder-selection-warning' class='status-chip schedule-builder-inline-warning' hidden></div>
        ${createFieldErrorHtml(page.fieldErrors.selectedCourseCodes)}
        <div class='schedule-builder-course-list'>
          ${renderCourseSelection(page.availableCourses, page.formValues.selectedCourseCodes)}
        </div>
      </section>

      <section class='schedule-builder-panel'>
        <div class='schedule-builder-section-header'>
          <div>
            <h2>Constraints And Priorities</h2>
            <p class='help-text'>Priority 1 is highest. Best-effort schedules still appear when lower-ranked options violate your restrictions.</p>
          </div>
        </div>
        <div class='schedule-builder-grid'>
          <label>
            No Classes Before
            <input type='time' name='earliestStart' value='${escapeHtml(page.formValues.earliestStart)}'>
            ${createFieldErrorHtml(page.fieldErrors.earliestStart)}
          </label>
          <label>
            Earliest-Start Priority
            <select name='earliestStartPriority'>${renderPriorityOptions(page.formValues.earliestStartPriority)}</select>
            ${createFieldErrorHtml(page.fieldErrors.earliestStartPriority)}
          </label>
          <label>
            Blocked Day
            <select name='blockedDay'>
              <option value=''>Choose a day</option>
              <option value='Any'${page.formValues.blockedDay === 'Any' ? ' selected' : ''}>Any weekday</option>
              <option value='Mon'${page.formValues.blockedDay === 'Mon' ? ' selected' : ''}>Monday</option>
              <option value='Tue'${page.formValues.blockedDay === 'Tue' ? ' selected' : ''}>Tuesday</option>
              <option value='Wed'${page.formValues.blockedDay === 'Wed' ? ' selected' : ''}>Wednesday</option>
              <option value='Thu'${page.formValues.blockedDay === 'Thu' ? ' selected' : ''}>Thursday</option>
              <option value='Fri'${page.formValues.blockedDay === 'Fri' ? ' selected' : ''}>Friday</option>
            </select>
            ${createFieldErrorHtml(page.fieldErrors.blockedDay)}
          </label>
          <label>
            Blocked Start
            <input type='time' name='blockedStart' value='${escapeHtml(page.formValues.blockedStart)}'>
            ${createFieldErrorHtml(page.fieldErrors.blockedStart)}
          </label>
          <label>
            Blocked End
            <input type='time' name='blockedEnd' value='${escapeHtml(page.formValues.blockedEnd)}'>
            ${createFieldErrorHtml(page.fieldErrors.blockedEnd)}
          </label>
          <label>
            Blocked-Time Priority
            <select name='blockedPriority'>${renderPriorityOptions(page.formValues.blockedPriority)}</select>
            ${createFieldErrorHtml(page.fieldErrors.blockedPriority)}
          </label>
          <label>
            Professor Whitelist
            <input type='text' name='professorWhitelist' value='${escapeHtml(page.formValues.professorWhitelist)}' placeholder='Prof. Baker, Prof. Evans'>
          </label>
          <label>
            Whitelist Priority
            <select name='professorWhitelistPriority'>${renderPriorityOptions(page.formValues.professorWhitelistPriority)}</select>
            ${createFieldErrorHtml(page.fieldErrors.professorWhitelistPriority)}
          </label>
          <label>
            Professor Blacklist
            <input type='text' name='professorBlacklist' value='${escapeHtml(page.formValues.professorBlacklist)}' placeholder='Prof. Chen'>
          </label>
          <label>
            Blacklist Priority
            <select name='professorBlacklistPriority'>${renderPriorityOptions(page.formValues.professorBlacklistPriority)}</select>
            ${createFieldErrorHtml(page.fieldErrors.professorBlacklistPriority)}
          </label>
        </div>
        <div class='action-row schedule-builder-action-row'>
          <button type='submit' name='intent' value='save-constraints'>Save Constraints</button>
          ${confirmConstraintButton}
          <button class='secondary-button' type='submit' name='intent' value='generate'>Generate Schedules</button>
        </div>
      </section>

      <section class='schedule-builder-panel'>
        <div class='schedule-builder-section-header'>
          <div>
            <h2>Saved Presets</h2>
            <p class='help-text'>Persist your current restrictions with a name, then reload or rename them later.</p>
          </div>
        </div>
        <div class='schedule-builder-grid'>
          <label>
            New Preset Name
            <input type='text' name='presetName' value='${escapeHtml(page.formValues.presetName)}' maxlength='50'>
            ${createFieldErrorHtml(page.fieldErrors.presetName)}
          </label>
          <label>
            Saved Presets
            <select id='selected-saved-set' name='selectedSavedSetId'>${renderSavedSetOptions(page.savedSets, page.formValues.selectedSavedSetId)}</select>
          </label>
          <label>
            Rename Selected Preset
            <input type='text' name='renamePresetName' value='${escapeHtml(page.formValues.renamePresetName)}' maxlength='50'>
            ${createFieldErrorHtml(page.fieldErrors.renamePresetName)}
          </label>
        </div>
        <input id='selected-saved-set-version' type='hidden' name='selectedSavedSetVersion' value='${escapeHtml(page.formValues.selectedSavedSetVersion)}'>
        <div class='action-row schedule-builder-action-row'>
          <button type='submit' name='intent' value='save-preset'>Save Current Preset</button>
          ${confirmPresetButton}
          <button class='secondary-button' type='submit' name='intent' value='load-preset'>Load Selected Preset</button>
          <button class='secondary-button' type='submit' name='intent' value='rename-preset'>Rename Selected Preset</button>
          <button class='secondary-button' type='submit' name='intent' value='delete-preset'>Delete Selected Preset</button>
        </div>
        ${renderSavedSetSummary(page.savedSets)}
      </section>
    </form>
  `;
}

function serializeForScriptTag(payload) {
  return JSON.stringify(payload).replaceAll('<', '\\u003c');
}

function renderScheduleBuilderPage(res, page) {
  const html = renderHtml(path.resolve(__dirname, '../views/schedule-builder.html'), {
    builder_form_html: renderForm(page),
    results_html: renderResults(page.results),
    schedule_builder_state_json: serializeForScriptTag({
      savedSetVersions: Object.fromEntries(page.savedSets.map((savedSet) => [String(savedSet.id), savedSet.version])),
      scheduleCount: page.results?.schedules?.length || 0,
      selectionMetadata: page.selectionMetadata
    }),
    status_banner_html: createStatusBanner(page.flashMessage, page.flashVariant)
  });

  return res.status(200).send(html);
}

function createScheduleBuilderController(services) {
  function redirectMissingAccount(res) {
    return res.redirect('/login?returnTo=%2Fschedule-builder');
  }

  function renderForbidden(res) {
    return res.status(403).send('Schedule Builder is available to student accounts only.');
  }

  return {
    getPage(req, res) {
      const response = services.scheduleBuilderService.getPage(req.session.accountId, req.query);
      if (response.accessStatus === 'missing') {
        return redirectMissingAccount(res);
      }
      if (response.accessStatus === 'forbidden') {
        return renderForbidden(res);
      }

      return renderScheduleBuilderPage(res, response.page);
    },
    postAction(req, res) {
      const response = services.scheduleBuilderService.postAction(req.session.accountId, req.body);
      if (response.accessStatus === 'missing') {
        return redirectMissingAccount(res);
      }
      if (response.accessStatus === 'forbidden') {
        return renderForbidden(res);
      }

      return renderScheduleBuilderPage(res, response.page);
    }
  };
}

module.exports = {
  __private: {
    createStatusBanner,
    renderCourseSelection,
    renderCourseSummary,
    renderForm,
    renderResults,
    renderSavedSetOptions,
    renderTermOptions,
    serializeForScriptTag
  },
  createScheduleBuilderController
};
