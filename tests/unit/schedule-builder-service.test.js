const test = require('node:test');
const assert = require('node:assert/strict');

const {
  __private,
  createScheduleBuilderService
} = require('../../src/services/schedule-builder-service');
const { createTestContext } = require('../helpers/test-context');

function getStudentAccount(context) {
  return context.app.locals.services.accountModel.findByIdentifier('userA@example.com');
}

test('schedule builder private helpers normalize inputs and validate constraints', () => {
  assert.equal(__private.normalizeIdentifier(undefined), '');
  assert.deepEqual(__private.toArray(['a', 'b']), ['a', 'b']);
  assert.deepEqual(__private.toArray('SCH101'), ['SCH101']);
  assert.deepEqual(__private.toArray(''), []);
  assert.equal(
    __private.matchesAccountIdentifier(
      { email: 'userA@example.com', username: 'userA' },
      ['usera']
    ),
    true
  );
  assert.equal(
    __private.matchesAccountIdentifier(
      { email: 'userA@example.com', username: 'userA' },
      undefined
    ),
    false
  );
  assert.equal(__private.parsePositiveInteger('7'), 7);
  assert.equal(__private.parsePositiveInteger('-2'), null);
  assert.equal(__private.parseTimeToMinutes('11:30'), 690);
  assert.equal(__private.parseTimeToMinutes(undefined), null);
  assert.equal(__private.parseTimeToMinutes('bad'), null);
  assert.equal(__private.parseTimeToMinutes('24:00'), null);
  assert.equal(__private.formatMinutes(0), '12:00AM');
  assert.equal(__private.formatTimeRange(540, 600), '9:00AM-10:00AM');
  assert.equal(__private.normalizeSavedSetName(undefined), '');
  assert.equal(__private.normalizeSavedSetName('  Late   Start  '), 'Late Start');
  assert.deepEqual(__private.parseProfessorList(undefined), []);
  assert.deepEqual(__private.parseProfessorList('Prof. Ada, Prof. Ada, Prof. Baker'), [
    'Prof. Ada',
    'Prof. Baker'
  ]);
  assert.deepEqual(__private.parseMeetingDays(undefined), []);
  assert.deepEqual(__private.intersectMeetingDays(['Mon', 'Wed'], ['Wed', 'Fri']), ['Wed']);
  assert.equal(__private.rangesOverlap(540, 600, 570, 630), true);
  assert.equal(__private.rangesOverlap(540, 600, 600, 660), false);
  assert.equal(__private.comparePriorityCounts([0, 1], [0, 2]), -1);
  assert.equal(__private.comparePriorityCounts([1, 0], [1, 0]), 0);

  const defaults = __private.createEmptyFormValues('2026FALL');
  assert.equal(defaults.termCode, '2026FALL');
  assert.equal(defaults.requestedResultCount, '5');

  const parsed = __private.parseConstraints({
    blockedDay: 'Any',
    blockedEnd: '16:00',
    blockedPriority: '2',
    blockedStart: '15:00',
    earliestStart: '11:00',
    earliestStartPriority: '1',
    professorBlacklist: 'Prof. Chen',
    professorBlacklistPriority: '4',
    professorWhitelist: 'Prof. Chen, Prof. Hall',
    professorWhitelistPriority: '3'
  });
  assert.equal(parsed.hasErrors, false);
  assert.equal(parsed.constraints.length, 4);
  assert.equal(parsed.warnings.length, 1);
  assert.equal(
    __private.createConstraintLabel('earliest_start', { startMinute: 660 }),
    'No classes before 11:00AM'
  );
  assert.equal(
    __private.createConstraintLabel('blocked_time', {
      day: 'Any',
      endMinute: 960,
      startMinute: 900
    }),
    'Avoid classes on weekdays 3:00PM-4:00PM'
  );
  assert.equal(
    __private.createConstraintLabel('blocked_time', {
      day: 'Tue',
      endMinute: 960,
      startMinute: 900
    }),
    'Avoid classes on Tue 3:00PM-4:00PM'
  );
  assert.equal(__private.createConstraintLabel('other', {}), 'other');

  const invalid = __private.parseConstraints({
    blockedDay: 'Bad',
    blockedEnd: '09:00',
    blockedPriority: '8',
    blockedStart: 'bad',
    earliestStart: 'bad',
    earliestStartPriority: '0',
    professorBlacklist: '',
    professorBlacklistPriority: '9',
    professorWhitelist: '',
    professorWhitelistPriority: '0'
  });
  assert.equal(invalid.hasErrors, true);
  assert.match(invalid.errors.earliestStart, /HH:MM/);
  assert.match(invalid.errors.blockedDay, /Choose a blocked-day/);
  assert.match(invalid.errors.blockedPriority, /1 to 5/);
  assert.match(invalid.errors.blockedStart, /HH:MM/);
  assert.match(invalid.errors.professorWhitelistPriority, /1 to 5/);
  assert.match(invalid.errors.professorBlacklistPriority, /1 to 5/);

  const reversedWindow = __private.parseConstraints({
    blockedDay: 'Tue',
    blockedEnd: '09:00',
    blockedPriority: '2',
    blockedStart: '10:00',
    earliestStart: '',
    earliestStartPriority: '3',
    professorBlacklist: '',
    professorBlacklistPriority: '3',
    professorWhitelist: '',
    professorWhitelistPriority: '3'
  });
  assert.match(reversedWindow.errors.blockedEnd, /later than the blocked start time/);

  const persistedValues = __private.constraintsToFormValues({
    constraints: [
      {
        priorityValue: 2,
        type: 'blocked_time',
        valueJson: JSON.stringify({ day: 'Tue', endMinute: 960, startMinute: 900 })
      },
      {
        priorityValue: 1,
        type: 'earliest_start',
        valueJson: JSON.stringify({ startMinute: 660 })
      },
      {
        priorityValue: 3,
        type: 'professor_whitelist',
        valueJson: JSON.stringify({ professors: ['Prof. Ada'] })
      },
      {
        priorityValue: 4,
        type: 'professor_blacklist',
        valueJson: 'not-json'
      },
      {
        priorityValue: 5,
        type: 'unknown',
        valueJson: JSON.stringify({})
      }
    ]
  }, '2026FALL');
  assert.equal(persistedValues.blockedDay, 'Tue');
  assert.equal(persistedValues.earliestStart, '11:00');
  assert.equal(persistedValues.professorWhitelist, 'Prof. Ada');
  assert.equal(persistedValues.professorBlacklist, '');
  const defaultsFromMissingState = __private.constraintsToFormValues(undefined, '2026FALL');
  assert.equal(defaultsFromMissingState.termCode, '2026FALL');
  const fallbackPersistedValues = __private.constraintsToFormValues({
    constraints: [
      {
        priorityValue: 0,
        type: 'earliest_start',
        valueJson: ''
      },
      {
        priorityValue: 0,
        type: 'blocked_time',
        valueJson: JSON.stringify({})
      },
      {
        priorityValue: 0,
        type: 'professor_whitelist',
        valueJson: JSON.stringify({})
      },
      {
        priorityValue: 0,
        type: 'professor_blacklist',
        valueJson: JSON.stringify({})
      }
    ]
  }, '2026FALL');
  assert.equal(fallbackPersistedValues.earliestStart, '');
  assert.equal(fallbackPersistedValues.earliestStartPriority, '3');
  assert.equal(fallbackPersistedValues.blockedDay, '');
  assert.equal(fallbackPersistedValues.blockedStart, '');
  assert.equal(fallbackPersistedValues.blockedEnd, '');
  assert.equal(fallbackPersistedValues.blockedPriority, '3');
  assert.equal(fallbackPersistedValues.professorWhitelist, '');
  assert.equal(fallbackPersistedValues.professorWhitelistPriority, '3');
  assert.equal(fallbackPersistedValues.professorBlacklist, '');
  assert.equal(fallbackPersistedValues.professorBlacklistPriority, '3');
  assert.deepEqual(
    __private.parseConstraintMap([
      { type: 'earliest_start', value: { startMinute: 660 } },
      { type: 'blocked_time', value: { day: 'Tue', startMinute: 900, endMinute: 960 } },
      { type: 'professor_whitelist', value: { professors: ['Prof. Ada'] } },
      { type: 'professor_blacklist', value: { professors: ['Prof. Chen'] } }
    ]),
    {
      blockedTime: { type: 'blocked_time', value: { day: 'Tue', startMinute: 900, endMinute: 960 } },
      earliestStart: { type: 'earliest_start', value: { startMinute: 660 } },
      professorBlacklist: { type: 'professor_blacklist', value: { professors: ['Prof. Chen'] } },
      professorWhitelist: { type: 'professor_whitelist', value: { professors: ['Prof. Ada'] } }
    }
  );
  assert.deepEqual(
    __private.buildScheduleSnapshot({
      blockedDay: 'Tue',
      blockedEnd: '16:00',
      blockedPriority: '2',
      blockedStart: '15:00',
      earliestStart: '11:00',
      earliestStartPriority: '1',
      professorBlacklist: '',
      professorBlacklistPriority: '3',
      professorWhitelist: '',
      professorWhitelistPriority: '3'
    }),
    {
      blockedDay: 'Tue',
      blockedEnd: '16:00',
      blockedPriority: '2',
      blockedStart: '15:00',
      earliestStart: '11:00',
      earliestStartPriority: '1',
      professorBlacklist: '',
      professorBlacklistPriority: '3',
      professorWhitelist: '',
      professorWhitelistPriority: '3'
    }
  );
});

test('schedule builder service handles access, constraint persistence, and preset management flows', () => {
  const context = createTestContext();
  const service = context.app.locals.services.scheduleBuilderService;
  const student = getStudentAccount(context);
  const professor = context.app.locals.services.accountModel.findByIdentifier('professor@example.com');
  const term = context.app.locals.services.scheduleBuilderModel.findTermByCode('2026FALL');

  context.db.prepare('UPDATE planning_terms SET is_available = 0').run();
  const fallbackPage = service.getPage(student.id, { term: 'missing-term' });
  assert.equal(fallbackPage.page.term.termCode, '2026FALL');
  context.db.prepare('UPDATE planning_terms SET is_available = 1').run();

  assert.equal(service.getPage(9999).accessStatus, 'missing');
  assert.equal(service.getPage(professor.id).accessStatus, 'forbidden');

  const saveInvalid = service.postAction(student.id, {
    blockedDay: 'Mon',
    blockedPriority: '9',
    blockedStart: '10:00',
    intent: 'save-constraints',
    termCode: '2026FALL'
  });
  assert.match(saveInvalid.page.flashMessage, /Fix the highlighted constraint fields/);

  const warningSave = service.postAction(student.id, {
    intent: 'save-constraints',
    professorBlacklist: 'Prof. Ada',
    professorBlacklistPriority: '3',
    professorWhitelist: 'Prof. Ada',
    professorWhitelistPriority: '2',
    termCode: '2026FALL'
  });
  assert.equal(warningSave.page.pendingAction, 'confirm-constraint-save');

  const confirmedSave = service.postAction(student.id, {
    intent: 'confirm-save-constraints',
    professorBlacklist: 'Prof. Ada',
    professorBlacklistPriority: '3',
    professorWhitelist: 'Prof. Ada',
    professorWhitelistPriority: '2',
    termCode: '2026FALL'
  });
  assert.match(confirmedSave.page.flashMessage, /Constraints and priorities saved/);

  context.scheduleBuilderTestState.constraintSaveFailureIdentifiers.push('usera');
  const failedSave = service.postAction(student.id, {
    earliestStart: '11:00',
    earliestStartPriority: '1',
    intent: 'confirm-save-constraints',
    professorBlacklist: 'Prof. Ada',
    professorBlacklistPriority: '3',
    professorWhitelist: 'Prof. Baker',
    professorWhitelistPriority: '2',
    termCode: '2026FALL'
  });
  assert.match(failedSave.page.flashMessage, /Constraint saving failed/);
  context.resetScheduleBuilderTestState();

  const clearedConstraints = service.postAction(student.id, {
    intent: 'save-constraints',
    termCode: '2026FALL'
  });
  assert.match(clearedConstraints.page.flashMessage, /Saved constraints were cleared/);

  const noConstraintPreset = service.postAction(student.id, {
    intent: 'save-preset',
    presetName: 'Late Start',
    termCode: '2026FALL'
  });
  assert.match(noConstraintPreset.page.flashMessage, /Fix the preset name or add a constraint/);

  const longPresetName = service.postAction(student.id, {
    earliestStart: '11:00',
    earliestStartPriority: '1',
    intent: 'save-preset',
    presetName: 'A'.repeat(51),
    termCode: '2026FALL'
  });
  assert.match(longPresetName.page.fieldErrors.presetName, /50 characters or fewer/);

  const invalidPresetName = service.postAction(student.id, {
    earliestStart: '11:00',
    earliestStartPriority: '1',
    intent: 'save-preset',
    presetName: 'Late@Start',
    termCode: '2026FALL'
  });
  assert.match(invalidPresetName.page.fieldErrors.presetName, /letters, numbers, spaces/);

  const savedPreset = service.postAction(student.id, {
    earliestStart: '11:00',
    earliestStartPriority: '1',
    intent: 'save-preset',
    presetName: 'Late Start',
    termCode: '2026FALL'
  });
  assert.match(savedPreset.page.flashMessage, /saved as a reusable preset/);
  assert.equal(savedPreset.page.savedSets.length, 1);

  const duplicatePreset = service.postAction(student.id, {
    earliestStart: '12:00',
    earliestStartPriority: '1',
    intent: 'save-preset',
    presetName: 'Late Start',
    termCode: '2026FALL'
  });
  assert.equal(duplicatePreset.page.pendingAction, 'confirm-preset-overwrite');

  const overwrittenPreset = service.postAction(student.id, {
    earliestStart: '12:00',
    earliestStartPriority: '1',
    intent: 'confirm-save-preset',
    presetName: 'Late Start',
    termCode: '2026FALL'
  });
  assert.match(overwrittenPreset.page.flashMessage, /overwritten/);

  context.scheduleBuilderTestState.presetSaveFailureIdentifiers.push('usera@example.com');
  const presetFailure = service.postAction(student.id, {
    earliestStart: '12:00',
    earliestStartPriority: '1',
    intent: 'confirm-save-preset',
    presetName: 'Late Start',
    termCode: '2026FALL'
  });
  assert.match(presetFailure.page.flashMessage, /Preset saving failed/);
  context.resetScheduleBuilderTestState();

  const selectedSavedSet = overwrittenPreset.page.savedSets[0];
  const missingLoadSelection = service.postAction(student.id, {
    intent: 'load-preset',
    termCode: '2026FALL'
  });
  assert.match(missingLoadSelection.page.flashMessage, /Choose a saved preset before loading it/);

  const loadedPreset = service.postAction(student.id, {
    intent: 'load-preset',
    selectedSavedSetId: String(selectedSavedSet.id),
    termCode: '2026FALL'
  });
  assert.match(loadedPreset.page.flashMessage, /was loaded/);
  assert.equal(loadedPreset.page.formValues.earliestStart, '12:00');

  const badSnapshotSetId = Number(context.db.prepare(`
    INSERT INTO saved_constraint_sets (
      account_id,
      term_id,
      display_name,
      normalized_name,
      snapshot_json,
      version,
      created_at,
      updated_at
    ) VALUES (?, ?, 'Broken Snapshot', 'broken snapshot', '{bad-json', 1, ?, ?)
  `).run(student.id, term.id, '2026-03-30T12:06:00.000Z', '2026-03-30T12:06:00.000Z').lastInsertRowid);
  const loadedBrokenSnapshot = service.postAction(student.id, {
    intent: 'load-preset',
    selectedSavedSetId: String(badSnapshotSetId),
    termCode: '2026FALL'
  });
  assert.match(loadedBrokenSnapshot.page.flashMessage, /Broken Snapshot was loaded/);
  assert.equal(loadedBrokenSnapshot.page.formValues.earliestStart, '');

  const emptySnapshotSetId = Number(context.db.prepare(`
    INSERT INTO saved_constraint_sets (
      account_id,
      term_id,
      display_name,
      normalized_name,
      snapshot_json,
      version,
      created_at,
      updated_at
    ) VALUES (?, ?, 'Empty Snapshot', 'empty snapshot', '', 1, ?, ?)
  `).run(student.id, term.id, '2026-03-30T12:06:30.000Z', '2026-03-30T12:06:30.000Z').lastInsertRowid);
  const loadedEmptySnapshot = service.postAction(student.id, {
    intent: 'load-preset',
    selectedSavedSetId: String(emptySnapshotSetId),
    termCode: '2026FALL'
  });
  assert.match(loadedEmptySnapshot.page.flashMessage, /Empty Snapshot was loaded/);
  assert.equal(loadedEmptySnapshot.page.formValues.professorWhitelist, '');

  const renameDuplicate = service.postAction(student.id, {
    intent: 'rename-preset',
    renamePresetName: ' ',
    selectedSavedSetId: String(selectedSavedSet.id),
    selectedSavedSetVersion: String(selectedSavedSet.version),
    termCode: '2026FALL'
  });
  assert.match(renameDuplicate.page.flashMessage, /Fix the preset rename details/);

  const renameWithoutSelection = service.postAction(student.id, {
    intent: 'rename-preset',
    renamePresetName: 'Late Start Updated',
    termCode: '2026FALL'
  });
  assert.match(renameWithoutSelection.page.fieldErrors.renamePresetName, /Choose a saved preset before renaming it/);

  const staleRename = service.postAction(student.id, {
    intent: 'rename-preset',
    renamePresetName: 'Late Start Updated',
    selectedSavedSetId: String(selectedSavedSet.id),
    selectedSavedSetVersion: '999',
    termCode: '2026FALL'
  });
  assert.match(staleRename.page.flashMessage, /changed in another session/);

  context.scheduleBuilderTestState.presetRenameFailureIdentifiers.push('usera');
  const renameFailure = service.postAction(student.id, {
    intent: 'rename-preset',
    renamePresetName: 'Late Start Updated',
    selectedSavedSetId: String(selectedSavedSet.id),
    selectedSavedSetVersion: String(selectedSavedSet.version),
    termCode: '2026FALL'
  });
  assert.match(renameFailure.page.flashMessage, /Preset rename failed/);
  context.resetScheduleBuilderTestState();

  const renamed = service.postAction(student.id, {
    intent: 'rename-preset',
    renamePresetName: 'Late Start Updated',
    selectedSavedSetId: String(selectedSavedSet.id),
    selectedSavedSetVersion: String(selectedSavedSet.version),
    termCode: '2026FALL'
  });
  assert.match(renamed.page.flashMessage, /renamed successfully/);

  const secondPreset = service.postAction(student.id, {
    earliestStart: '10:00',
    earliestStartPriority: '2',
    intent: 'save-preset',
    presetName: 'Early Start',
    termCode: '2026FALL'
  });
  const duplicateRename = service.postAction(student.id, {
    intent: 'rename-preset',
    renamePresetName: 'Early Start',
    selectedSavedSetId: String(renamed.page.savedSets.find((savedSet) => savedSet.displayName === 'Late Start Updated').id),
    selectedSavedSetVersion: String(renamed.page.savedSets.find((savedSet) => savedSet.displayName === 'Late Start Updated').version),
    termCode: '2026FALL'
  });
  assert.match(duplicateRename.page.flashMessage, /already uses that name/);
  assert.ok(secondPreset.page.savedSets.length >= 3);

  const deleteMissing = service.postAction(student.id, {
    intent: 'delete-preset',
    termCode: '2026FALL'
  });
  assert.match(deleteMissing.page.flashMessage, /Choose a saved preset/);

  const deleteMissingPreset = service.postAction(student.id, {
    intent: 'delete-preset',
    selectedSavedSetId: '9999',
    termCode: '2026FALL'
  });
  assert.match(deleteMissingPreset.page.flashMessage, /could not be found/);

  const deleted = service.postAction(student.id, {
    intent: 'delete-preset',
    selectedSavedSetId: String(renamed.page.savedSets[0].id),
    selectedSavedSetVersion: String(renamed.page.savedSets[0].version),
    termCode: '2026FALL'
  });
  assert.match(deleted.page.flashMessage, /Saved preset deleted/);

  const loadMissing = service.postAction(student.id, {
    intent: 'load-preset',
    selectedSavedSetId: '9999',
    termCode: '2026FALL'
  });
  assert.match(loadMissing.page.flashMessage, /could not be found/);

  const renameMissing = service.postAction(student.id, {
    intent: 'rename-preset',
    renamePresetName: 'Missing',
    selectedSavedSetId: '9999',
    termCode: '2026FALL'
  });
  assert.match(renameMissing.page.flashMessage, /could not be found/);

  const deleteStale = service.postAction(student.id, {
    earliestStart: '11:00',
    earliestStartPriority: '1',
    intent: 'save-preset',
    presetName: 'Fresh Name',
    termCode: '2026FALL'
  });
  const freshSet = deleteStale.page.savedSets[0];
  const staleDelete = service.postAction(student.id, {
    intent: 'delete-preset',
    selectedSavedSetId: String(freshSet.id),
    selectedSavedSetVersion: '999',
    termCode: '2026FALL'
  });
  assert.match(staleDelete.page.flashMessage, /changed in another session/);

  context.cleanup();
});

test('schedule builder service generates ranked, blocked, timeout, removed, and best-effort results', () => {
  const context = createTestContext();
  const service = context.app.locals.services.scheduleBuilderService;
  const student = getStudentAccount(context);

  const invalid = service.postAction(student.id, {
    intent: 'generate',
    requestedResultCount: '0',
    termCode: '2026FALL'
  });
  assert.equal(invalid.page.results.state, 'invalid-input');

  const emptySelection = service.postAction(student.id, {
    intent: 'generate',
    requestedResultCount: '2',
    termCode: '2026FALL'
  });
  assert.match(emptySelection.page.results.bannerMessage, /Select at least one course/);

  context.scheduleBuilderTestState.dataUnavailableIdentifiers.push('userA@example.com');
  const unavailable = service.postAction(student.id, {
    intent: 'generate',
    requestedResultCount: '2',
    selectedCourseCodes: ['SCH101'],
    termCode: '2026FALL'
  });
  assert.equal(unavailable.page.results.state, 'blocked');
  context.resetScheduleBuilderTestState();

  const compatibilityBlocked = service.postAction(student.id, {
    intent: 'generate',
    requestedResultCount: '2',
    selectedCourseCode: 'SCH460',
    termCode: '2026FALL'
  });
  assert.match(compatibilityBlocked.page.results.bannerMessage, /Compatibility rules are missing/);

  const removedOnly = service.postAction(student.id, {
    intent: 'generate',
    requestedResultCount: '2',
    selectedCourseCodes: ['MISSING101'],
    termCode: '2026FALL'
  });
  assert.equal(removedOnly.page.results.state, 'blocked');

  const removedWithCandidate = service.postAction(student.id, {
    intent: 'generate',
    requestedResultCount: '2',
    selectedCourseCodes: ['SCH101', 'MISSING101'],
    termCode: '2026FALL'
  });
  assert.match(removedWithCandidate.page.results.notices.join(' '), /Removed live course updates: MISSING101/);

  const noSchedulableBundles = service.postAction(student.id, {
    intent: 'generate',
    requestedResultCount: '2',
    selectedCourseCodes: ['SCH450'],
    termCode: '2026FALL'
  });
  assert.match(noSchedulableBundles.page.results.bannerMessage, /No schedulable course bundles are available/);

  const generated = service.postAction(student.id, {
    intent: 'generate',
    requestedResultCount: '12',
    selectedCourseCodes: ['SCH101', 'SCH111', 'SCH150', 'SCH303'],
    termCode: '2026FALL'
  });
  assert.equal(generated.page.results.state, 'generated');
  assert.equal(generated.page.results.schedules.length, 10);
  assert.match(generated.page.results.notices.join(' '), /capped at 10/i);

  context.db.prepare(`
    UPDATE schedule_builder_option_groups
    SET seats_remaining = 0
    WHERE option_code = 'SCH101-B'
  `).run();
  const liveNoticeGeneration = service.postAction(student.id, {
    intent: 'generate',
    requestedResultCount: '2',
    selectedCourseCodes: ['SCH101'],
    termCode: '2026FALL'
  });
  assert.match(
    liveNoticeGeneration.page.results.notices.join(' '),
    /SCH101 had full section bundles removed from the refreshed results/
  );
  context.db.prepare(`
    UPDATE schedule_builder_option_groups
    SET seats_remaining = 6
    WHERE option_code = 'SCH101-B'
  `).run();

  const bestEffort = service.postAction(student.id, {
    blockedDay: 'Any',
    blockedEnd: '16:00',
    blockedPriority: '1',
    blockedStart: '08:00',
    earliestStart: '14:00',
    earliestStartPriority: '1',
    intent: 'generate',
    requestedResultCount: '3',
    selectedCourseCodes: ['SCH101', 'SCH202'],
    termCode: '2026FALL'
  });
  assert.equal(bestEffort.page.results.state, 'generated');
  assert.equal(bestEffort.page.results.schedules.some((option) => option.totalViolations > 0), true);
  assert.match(bestEffort.page.results.notices.join(' '), /Best-effort schedules/);

  const daySpecificBlocked = service.postAction(student.id, {
    blockedDay: 'Mon',
    blockedEnd: '10:00',
    blockedPriority: '2',
    blockedStart: '09:00',
    intent: 'generate',
    requestedResultCount: '2',
    selectedCourseCodes: ['SCH101'],
    termCode: '2026FALL'
  });
  assert.equal(
    daySpecificBlocked.page.results.schedules.some((option) => option.violations.some((violation) => /blocked window on Mon/i.test(violation))),
    true
  );

  const nonOverlappingBlocked = service.postAction(student.id, {
    blockedDay: 'Mon',
    blockedEnd: '16:00',
    blockedPriority: '2',
    blockedStart: '15:00',
    intent: 'generate',
    requestedResultCount: '2',
    selectedCourseCodes: ['SCH101'],
    termCode: '2026FALL'
  });
  assert.equal(
    nonOverlappingBlocked.page.results.schedules.some((option) => option.violations.some((violation) => /blocked window/i.test(violation))),
    false
  );

  const unmatchedBlockedDay = service.postAction(student.id, {
    blockedDay: 'Fri',
    blockedEnd: '10:00',
    blockedPriority: '2',
    blockedStart: '09:00',
    intent: 'generate',
    requestedResultCount: '2',
    selectedCourseCodes: ['SCH111'],
    termCode: '2026FALL'
  });
  assert.equal(
    unmatchedBlockedDay.page.results.schedules.some((option) => option.violations.some((violation) => /blocked window/i.test(violation))),
    false
  );

  const continuation = service.postAction(student.id, {
    intent: 'generate',
    requestedResultCount: '2',
    selectedCourseCodes: ['SCH101', 'SCH404', 'SCH450'],
    termCode: '2026FALL'
  });
  assert.match(continuation.page.results.notices.join(' '), /no active bundles/);
  assert.match(continuation.page.results.notices.join(' '), /currently full/);

  const shared = service.postAction(student.id, {
    intent: 'generate',
    requestedResultCount: '2',
    selectedCourseCodes: ['XLIST410A', 'XLIST410B'],
    termCode: '2026FALL'
  });
  assert.equal(shared.page.results.schedules[0].sharedComponents.length, 1);

  const professorConstrained = service.postAction(student.id, {
    intent: 'generate',
    professorBlacklist: 'Prof. Nobody',
    professorBlacklistPriority: '4',
    professorWhitelist: 'Prof. Baker',
    professorWhitelistPriority: '2',
    requestedResultCount: '2',
    selectedCourseCodes: ['SCH101'],
    termCode: '2026FALL'
  });
  assert.equal(professorConstrained.page.results.state, 'generated');

  const blacklistedProfessor = service.postAction(student.id, {
    intent: 'generate',
    professorBlacklist: 'Prof. Ada',
    professorBlacklistPriority: '2',
    requestedResultCount: '2',
    selectedCourseCodes: ['SCH101'],
    termCode: '2026FALL'
  });
  assert.equal(
    blacklistedProfessor.page.results.schedules.some((option) => option.violations.some((violation) => /blacklisted professor Prof\. Ada/.test(violation))),
    true
  );

  context.scheduleBuilderTestState.timeoutBeforeResultsIdentifiers.push('usera');
  const timeoutBefore = service.postAction(student.id, {
    intent: 'generate',
    requestedResultCount: '2',
    selectedCourseCodes: ['SCH101', 'SCH303'],
    termCode: '2026FALL'
  });
  assert.equal(timeoutBefore.page.results.state, 'timeout-failure');
  context.resetScheduleBuilderTestState();

  context.scheduleBuilderTestState.timeoutAfterResultsIdentifiers.push('usera');
  const timeoutAfter = service.postAction(student.id, {
    intent: 'generate',
    requestedResultCount: '2',
    selectedCourseCodes: ['SCH101', 'SCH303'],
    termCode: '2026FALL'
  });
  assert.equal(timeoutAfter.page.results.state, 'partial-timeout');
  assert.equal(timeoutAfter.page.results.schedules.length, 1);
  context.resetScheduleBuilderTestState();

  context.scheduleBuilderTestState.generationFailureIdentifiers.push('usera');
  const generationFailure = service.postAction(student.id, {
    intent: 'generate',
    requestedResultCount: '2',
    selectedCourseCodes: ['SCH101', 'SCH303'],
    termCode: '2026FALL'
  });
  assert.equal(generationFailure.page.results.state, 'error');

  const eventCount = context.db.prepare('SELECT COUNT(*) AS count FROM schedule_generation_events').get().count;
  assert.ok(eventCount >= 9);

  context.cleanup();
});

test('schedule builder service can be constructed with explicit dependencies', () => {
  const context = createTestContext();
  const services = context.app.locals.services;
  const service = createScheduleBuilderService({
    accountModel: services.accountModel,
    now: services.now,
    roleModel: services.roleModel,
    scheduleBuilderModel: services.scheduleBuilderModel,
    scheduleBuilderTestState: services.scheduleBuilderTestState
  });

  const page = service.getPage(getStudentAccount(context).id, {});
  assert.equal(page.accessStatus, 'ok');
  assert.equal(page.page.term.termCode, '2026FALL');

  context.cleanup();
});

test('schedule builder service postAction returns access status for missing and non-student accounts', () => {
  const context = createTestContext();
  const service = context.app.locals.services.scheduleBuilderService;
  const professor = context.app.locals.services.accountModel.findByIdentifier('professor@example.com');

  assert.equal(service.postAction(9999, { intent: 'generate' }).accessStatus, 'missing');
  assert.equal(service.postAction(professor.id, { intent: 'generate' }).accessStatus, 'forbidden');

  context.cleanup();
});

test('schedule builder service handles null role lists and missing term catalogs in explicit dependencies', () => {
  const studentAccount = {
    email: 'student@example.com',
    id: 1,
    username: 'student'
  };
  const noRoleService = createScheduleBuilderService({
    accountModel: {
      findById(accountId) {
        return accountId === 1 ? studentAccount : null;
      }
    },
    now() {
      return new Date('2026-03-30T12:00:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return null;
      }
    },
    scheduleBuilderModel: {
      listTerms() {
        return [];
      }
    },
    scheduleBuilderTestState: {}
  });
  assert.equal(noRoleService.getPage(1).accessStatus, 'forbidden');

  const recordedEvents = [];
  const noTermService = createScheduleBuilderService({
    accountModel: {
      findById(accountId) {
        return accountId === 1 ? studentAccount : null;
      }
    },
    now() {
      return new Date('2026-03-30T12:00:00.000Z');
    },
    roleModel: {
      listActiveRolesForAccount() {
        return [{ role_key: 'student' }];
      }
    },
    scheduleBuilderModel: {
      findTermByCode() {
        return null;
      },
      listTerms() {
        return [];
      },
      listSavedConstraintSets() {
        return [];
      },
      recordGenerationEvent(accountId, termId, payload) {
        recordedEvents.push({ accountId, payload, termId });
      }
    },
    scheduleBuilderTestState: {}
  });

  const page = noTermService.getPage(1);
  assert.equal(page.accessStatus, 'ok');
  assert.equal(page.page.term, null);
  assert.equal(page.page.formValues.termCode, '');
  assert.equal(page.page.activeConstraintVersion, 0);
  assert.deepEqual(page.page.availableCourses, []);
  assert.deepEqual(page.page.savedSets, []);

  const generated = noTermService.postAction(1, {});
  assert.equal(generated.page.results.state, 'invalid-input');
  assert.equal(generated.page.term, null);
  assert.equal(recordedEvents.length, 1);
  assert.equal(recordedEvents[0].termId, null);
  assert.deepEqual(JSON.parse(recordedEvents[0].payload.detailsJson).notices, []);
});
