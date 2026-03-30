const test = require('node:test');
const assert = require('node:assert/strict');

const {
  __private,
  createScheduleBuilderController
} = require('../../src/controllers/schedule-builder-controller');

function createResponse() {
  return {
    body: '',
    redirectUrl: '',
    statusCode: null,
    redirect(url) {
      this.redirectUrl = url;
      return url;
    },
    send(payload) {
      this.body = payload;
      return payload;
    },
    status(code) {
      this.statusCode = code;
      return this;
    }
  };
}

function createPage() {
  return {
    account: { id: 1, username: 'userA' },
    availableCourses: [
      {
        courseCode: 'SCH101',
        groups: [{ meetings: [], professorName: 'Prof. Ada' }],
        title: 'Planning Foundations'
      }
    ],
    fieldErrors: {
      blockedDay: '',
      blockedEnd: '',
      blockedPriority: '',
      blockedStart: '',
      earliestStart: '',
      earliestStartPriority: '',
      presetName: '',
      professorBlacklistPriority: '',
      professorWhitelistPriority: '',
      renamePresetName: '',
      requestedResultCount: '',
      selectedCourseCodes: ''
    },
    flashMessage: 'Constraints saved.',
    flashVariant: 'success',
    formValues: {
      blockedDay: '',
      blockedEnd: '',
      blockedPriority: '3',
      blockedStart: '',
      earliestStart: '',
      earliestStartPriority: '3',
      presetName: '',
      professorBlacklist: '',
      professorBlacklistPriority: '3',
      professorWhitelist: '',
      professorWhitelistPriority: '3',
      renamePresetName: '',
      requestedResultCount: '2',
      selectedCourseCodes: ['SCH101'],
      selectedSavedSetId: '',
      selectedSavedSetVersion: '',
      termCode: '2026FALL'
    },
    pendingAction: '',
    results: {
      bannerMessage: 'Schedule Builder refreshed.',
      bannerVariant: 'success',
      notices: ['Requested results were capped at 10.'],
      schedules: [
        {
          courseSummaries: [
            {
              courseCode: 'SCH101',
              isFull: false,
              meetings: [
                {
                  componentType: 'lecture',
                  daysText: 'Mon, Wed',
                  sectionCode: 'LEC-A1',
                  timeText: '9:00AM-10:00AM'
                }
              ],
              optionCode: 'SCH101-A',
              professorName: 'Prof. Ada',
              title: 'Planning Foundations'
            }
          ],
          rank: 1,
          sharedComponents: [],
          summaryLabel: 'Meets all active restrictions.',
          totalViolations: 0,
          violations: []
        }
      ],
      state: 'generated'
    },
    savedSets: [],
    selectionMetadata: [{ courseCode: 'SCH101', meetings: [], title: 'Planning Foundations' }],
    term: { displayName: 'Fall 2026', id: 1, isAvailable: true, termCode: '2026FALL' },
    terms: [{ displayName: 'Fall 2026', id: 1, isAvailable: true, termCode: '2026FALL' }]
  };
}

test('schedule builder controller redirects missing accounts and blocks non-students', () => {
  const controller = createScheduleBuilderController({
    scheduleBuilderService: {
      getPage() {
        return { accessStatus: 'missing' };
      },
      postAction() {
        return { accessStatus: 'forbidden' };
      }
    }
  });

  const getResponse = createResponse();
  controller.getPage({ query: {}, session: { accountId: 99 } }, getResponse);
  assert.equal(getResponse.redirectUrl, '/login?returnTo=%2Fschedule-builder');

  const postResponse = createResponse();
  controller.postAction({ body: {}, session: { accountId: 2 } }, postResponse);
  assert.equal(postResponse.statusCode, 403);
  assert.match(postResponse.body, /student accounts only/);
});

test('schedule builder controller renders the page with form and generated result content', () => {
  const controller = createScheduleBuilderController({
    scheduleBuilderService: {
      getPage() {
        return {
          accessStatus: 'ok',
          page: createPage()
        };
      },
      postAction() {
        return {
          accessStatus: 'ok',
          page: {
            ...createPage(),
            pendingAction: 'confirm-constraint-save'
          }
        };
      }
    }
  });

  const getResponse = createResponse();
  controller.getPage({ query: {}, session: { accountId: 1 } }, getResponse);
  assert.equal(getResponse.statusCode, 200);
  assert.match(getResponse.body, /Schedule Builder/);
  assert.match(getResponse.body, /Generate Schedules/);
  assert.match(getResponse.body, /Requested results were capped at 10/);
  assert.match(getResponse.body, /Schedule Builder refreshed/);

  const postResponse = createResponse();
  controller.postAction({ body: {}, session: { accountId: 1 } }, postResponse);
  assert.equal(postResponse.statusCode, 200);
  assert.match(postResponse.body, /Confirm Save Anyway/);
});

test('schedule builder controller renders field errors, shared components, multi-result navigation, and missing-account POST redirects', () => {
  const sharedPage = {
    ...createPage(),
    flashVariant: 'error',
    fieldErrors: {
      ...createPage().fieldErrors,
      earliestStart: 'Use HH:MM.'
    },
    results: {
      bannerMessage: 'Partial results available.',
      bannerVariant: 'warning',
      notices: [],
      schedules: [
        {
          courseSummaries: createPage().results.schedules[0].courseSummaries,
          rank: 1,
          sharedComponents: [
            {
              courseCodes: ['XLIST410A', 'XLIST410B'],
              daysText: 'Fri',
              sectionCode: 'SHR-01',
              timeText: '3:00PM-4:00PM'
            }
          ],
          summaryLabel: 'Best effort with 1 visible issue(s).',
          totalViolations: 1,
          violations: ['XLIST410A SHR-01 overlaps a blocked window.']
        },
        {
          ...createPage().results.schedules[0],
          rank: 2
        }
      ],
      state: 'partial-timeout'
    },
    savedSets: [
      {
        displayName: 'Late Start',
        id: 8,
        updatedAt: '2026-03-30T12:00:00.000Z',
        version: 2
      }
    ]
  };

  const controller = createScheduleBuilderController({
    scheduleBuilderService: {
      getPage() {
        return {
          accessStatus: 'ok',
          page: sharedPage
        };
      },
      postAction() {
        return { accessStatus: 'missing' };
      }
    }
  });

  const getResponse = createResponse();
  controller.getPage({ query: {}, session: { accountId: 1 } }, getResponse);
  assert.match(getResponse.body, /Use HH:MM\./);
  assert.match(getResponse.body, /schedule-builder-status--error/);
  assert.match(getResponse.body, /Shared Components/);
  assert.match(getResponse.body, /SHR-01 for XLIST410A, XLIST410B/);
  assert.match(getResponse.body, /Showing schedule 1 of 2/);
  assert.match(getResponse.body, /Late Start/);

  const postResponse = createResponse();
  controller.postAction({ body: {}, session: { accountId: 1 } }, postResponse);
  assert.equal(postResponse.redirectUrl, '/login?returnTo=%2Fschedule-builder');
});

test('schedule builder controller renders empty-state and preset-overwrite variants', () => {
  const page = {
    ...createPage(),
    availableCourses: [
      {
        courseCode: 'SCH999',
        groups: [],
        title: 'Independent Study'
      }
    ],
    flashMessage: '',
    formValues: {
      ...createPage().formValues,
      selectedCourseCodes: [],
      selectedSavedSetId: '8'
    },
    pendingAction: 'confirm-preset-overwrite',
    results: null,
    savedSets: [
      {
        displayName: 'Late Start',
        id: 8,
        updatedAt: '2026-03-30T12:00:00.000Z',
        version: 2
      }
    ],
    term: { displayName: 'Winter 2027', id: 2, isAvailable: false, termCode: '2027WINTER' },
    terms: [{ displayName: 'Winter 2027', id: 2, isAvailable: false, termCode: '2027WINTER' }]
  };

  const controller = createScheduleBuilderController({
    scheduleBuilderService: {
      getPage() {
        return {
          accessStatus: 'ok',
          page
        };
      }
    }
  });

  const getResponse = createResponse();
  controller.getPage({ query: {}, session: { accountId: 1 } }, getResponse);
  assert.match(getResponse.body, /Professor TBA/);
  assert.match(getResponse.body, /\(Unavailable\)/);
  assert.match(getResponse.body, /No saved presets yet for this term|Late Start/);
  assert.match(getResponse.body, /Select courses, adjust priorities, and generate up to 10 ranked schedule options/);
  assert.match(getResponse.body, /Confirm Overwrite/);
  assert.doesNotMatch(getResponse.body, /schedule-builder-status--success|schedule-builder-status--warning|schedule-builder-status--error/);
  assert.match(getResponse.body, /option value='8' data-version='2' selected/);
});

test('schedule builder controller private render helpers cover schedule and day-selection variants', () => {
  assert.equal(__private.createStatusBanner('', 'error'), '');
  assert.match(__private.createStatusBanner('Broken', 'error'), /schedule-builder-status--error/);
  assert.match(
    __private.renderCourseSelection([
      { courseCode: 'SCH999', groups: [], title: 'Independent Study' }
    ], []),
    /Professor TBA/
  );

  const fullCourseHtml = __private.renderCourseSummary({
    courseSummaries: [
      {
        courseCode: 'SCH404',
        isFull: true,
        meetings: [],
        optionCode: 'SCH404-A',
        professorName: 'Prof. Full',
        title: 'Full Course'
      }
    ],
    rank: 2,
    sharedComponents: [],
    summaryLabel: 'Best effort with 1 visible issue(s).',
    totalViolations: 1,
    violations: ['SCH404 is full.']
  });
  assert.match(fullCourseHtml, /is-full/);
  assert.match(fullCourseHtml, /\| Full/);

  const emptyResultsHtml = __private.renderResults({
    bannerMessage: '',
    bannerVariant: 'info',
    notices: [],
    schedules: []
  });
  assert.match(emptyResultsHtml, /No schedules are available for the current request/);

  for (const blockedDay of ['Any', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']) {
    const rendered = __private.renderForm({
      ...createPage(),
      formValues: {
        ...createPage().formValues,
        blockedDay
      }
    });
    assert.match(rendered, new RegExp(`value='${blockedDay}' selected`));
  }

  assert.equal(
    __private.renderTermOptions([{ displayName: 'Winter 2027', isAvailable: false, termCode: '2027WINTER' }], '2027WINTER'),
    "<option value='2027WINTER' selected>Winter 2027 (Unavailable)</option>"
  );
  assert.equal(
    __private.renderSavedSetOptions([{ displayName: 'Late Start', id: 8, version: 2 }], '8'),
    "<option value=''>Select a saved preset</option><option value='8' data-version='2' selected>Late Start</option>"
  );
  assert.equal(__private.serializeForScriptTag({ html: '<div>' }), '{"html":"\\u003cdiv>"}');
});

test('schedule builder controller getPage also forbids non-student access', () => {
  const controller = createScheduleBuilderController({
    scheduleBuilderService: {
      getPage() {
        return { accessStatus: 'forbidden' };
      }
    }
  });

  const response = createResponse();
  controller.getPage({ query: {}, session: { accountId: 2 } }, response);
  assert.equal(response.statusCode, 403);
  assert.match(response.body, /student accounts only/);
});
