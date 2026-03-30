const test = require('node:test');
const assert = require('node:assert/strict');

const { createTestContext } = require('../helpers/test-context');

test('schedule builder model lists seeded terms and course bundles, including courses without groups', () => {
  const context = createTestContext();
  const model = context.app.locals.services.scheduleBuilderModel;

  const terms = model.listTerms();
  assert.equal(terms.length, 1);
  assert.equal(terms[0].termCode, '2026FALL');
  assert.equal(model.findTermByCode('missing-term'), null);

  const courses = model.listCoursesForTerm(terms[0].id);
  const sch101 = courses.find((course) => course.courseCode === 'SCH101');
  const sch450 = courses.find((course) => course.courseCode === 'SCH450');

  assert.equal(sch101.groups.length, 2);
  assert.equal(sch101.groups[0].meetings.length, 2);
  assert.equal(sch450.groups.length, 0);

  const termId = terms[0].id;
  const extraCourseId = Number(context.db.prepare(`
    INSERT INTO schedule_builder_courses (
      term_id,
      course_code,
      title,
      is_active,
      compatibility_status,
      shared_listing_group,
      created_at,
      updated_at
    ) VALUES (?, 'NOMEET100', 'No Meeting Course', 1, 'ok', NULL, ?, ?)
  `).run(termId, '2026-03-30T12:00:00.000Z', '2026-03-30T12:00:00.000Z').lastInsertRowid);
  context.db.prepare(`
    INSERT INTO schedule_builder_option_groups (
      course_id,
      option_code,
      professor_name,
      seats_remaining,
      is_active,
      created_at,
      updated_at
    ) VALUES (?, 'NOMEET100-A', 'Prof. Zero', 5, 1, ?, ?)
  `).run(extraCourseId, '2026-03-30T12:00:00.000Z', '2026-03-30T12:00:00.000Z');

  const refreshedCourses = model.listCoursesForTerm(termId);
  const noMeetingCourse = refreshedCourses.find((course) => course.courseCode === 'NOMEET100');
  assert.equal(noMeetingCourse.groups.length, 1);
  assert.equal(noMeetingCourse.groups[0].meetings.length, 0);

  context.cleanup();
});

test('schedule builder model saves and clears active constraints transactionally', () => {
  const context = createTestContext();
  const model = context.app.locals.services.scheduleBuilderModel;
  const term = model.findTermByCode('2026FALL');

  const initial = model.getActiveConstraints(1, term.id);
  assert.equal(initial.constraints.length, 0);
  assert.equal(initial.version, 0);

  const saved = model.saveActiveConstraints(1, term.id, [
    {
      label: 'No classes before 11:00AM',
      priorityValue: 1,
      sortOrder: 10,
      type: 'earliest_start',
      valueJson: JSON.stringify({ startMinute: 660 })
    }
  ], {
    updatedAt: '2026-03-30T12:00:00.000Z'
  });
  assert.equal(saved.constraints.length, 1);
  assert.equal(saved.version, 1);

  assert.throws(() => {
    model.saveActiveConstraints(1, term.id, [
      {
        label: 'Blocked 3PM',
        priorityValue: 2,
        sortOrder: 20,
        type: 'blocked_time',
        valueJson: JSON.stringify({ day: 'Any', endMinute: 960, startMinute: 900 })
      }
    ], {
      simulateFailure: true,
      updatedAt: '2026-03-30T12:05:00.000Z'
    });
  }, /Simulated schedule constraint save failure/);

  const afterFailure = model.getActiveConstraints(1, term.id);
  assert.equal(afterFailure.constraints.length, 1);
  assert.equal(afterFailure.constraints[0].type, 'earliest_start');

  const cleared = model.saveActiveConstraints(1, term.id, [], {
    updatedAt: '2026-03-30T12:10:00.000Z'
  });
  assert.equal(cleared.constraints.length, 0);
  assert.equal(cleared.version, 2);

  context.cleanup();
});

test('schedule builder model saves, overwrites, renames, deletes, and logs preset and generation data', () => {
  const context = createTestContext();
  const model = context.app.locals.services.scheduleBuilderModel;
  const term = model.findTermByCode('2026FALL');

  assert.equal(model.findSavedConstraintSetById(1, term.id, 9999), null);
  assert.equal(model.findSavedConstraintSetByNormalizedName(1, term.id, 'late start'), null);

  const saved = model.saveNamedConstraintSet(1, term.id, {
    displayName: 'Late Start',
    normalizedName: 'late start',
    snapshotJson: JSON.stringify({ earliestStart: '11:00', earliestStartPriority: '1' })
  }, {
    updatedAt: '2026-03-30T12:00:00.000Z'
  });
  assert.equal(saved.displayName, 'Late Start');
  assert.equal(model.listSavedConstraintSets(1, term.id).length, 1);

  const overwritten = model.saveNamedConstraintSet(1, term.id, {
    displayName: 'Late Start',
    normalizedName: 'late start',
    savedSetId: saved.id,
    snapshotJson: JSON.stringify({ earliestStart: '12:00', earliestStartPriority: '1' })
  }, {
    updatedAt: '2026-03-30T12:05:00.000Z'
  });
  assert.equal(overwritten.version, 2);
  assert.match(overwritten.snapshotJson, /12:00/);

  assert.throws(() => {
    model.saveNamedConstraintSet(1, term.id, {
      displayName: 'Late Start',
      normalizedName: 'late start',
      savedSetId: overwritten.id,
      snapshotJson: JSON.stringify({ earliestStart: '13:00' })
    }, {
      simulateFailure: true,
      updatedAt: '2026-03-30T12:06:00.000Z'
    });
  }, /Simulated saved constraint set persistence failure/);

  const renamed = model.renameSavedConstraintSet(1, term.id, overwritten.id, 'Late Start Updated', 'late start updated', {
    updatedAt: '2026-03-30T12:07:00.000Z'
  });
  assert.equal(renamed.displayName, 'Late Start Updated');

  assert.throws(() => {
    model.renameSavedConstraintSet(1, term.id, renamed.id, 'Broken Name', 'broken name', {
      simulateFailure: true,
      updatedAt: '2026-03-30T12:08:00.000Z'
    });
  }, /Simulated saved constraint set rename failure/);

  assert.equal(model.deleteSavedConstraintSet(1, term.id, 99999), false);
  assert.equal(
    model.renameSavedConstraintSet(1, term.id, 99999, 'Missing', 'missing', {
      updatedAt: '2026-03-30T12:08:00.000Z'
    }),
    null
  );
  assert.equal(model.deleteSavedConstraintSet(1, term.id, renamed.id), true);
  assert.equal(model.listSavedConstraintSets(1, term.id).length, 0);

  model.recordGenerationEvent(1, term.id, {
    createdAt: '2026-03-30T12:09:00.000Z',
    detailsJson: JSON.stringify({ returnedCount: 3, state: 'generated' }),
    outcomeStatus: 'success',
    requestedResultCount: 3
  });
  const eventCount = context.db.prepare('SELECT COUNT(*) AS count FROM schedule_generation_events').get().count;
  assert.equal(eventCount, 1);

  context.cleanup();
});

test('schedule builder model normalizes zero-version rows and null term generation events', () => {
  const context = createTestContext();
  const model = context.app.locals.services.scheduleBuilderModel;
  const term = model.findTermByCode('2026FALL');

  const savedConstraints = model.saveActiveConstraints(1, term.id, [
    {
      label: 'No classes before 11:00AM',
      priorityValue: 1,
      sortOrder: 10,
      type: 'earliest_start',
      valueJson: JSON.stringify({ startMinute: 660 })
    }
  ], {
    updatedAt: '2026-03-30T12:00:00.000Z'
  });
  context.db.prepare('UPDATE schedule_constraint_sets SET version = 0 WHERE id = ?').run(savedConstraints.setId);
  const zeroVersionConstraints = model.getActiveConstraints(1, term.id);
  assert.equal(zeroVersionConstraints.version, 0);

  const savedSet = model.saveNamedConstraintSet(1, term.id, {
    displayName: 'Zero Version',
    normalizedName: 'zero version',
    snapshotJson: JSON.stringify({ earliestStart: '11:00' })
  }, {
    updatedAt: '2026-03-30T12:05:00.000Z'
  });
  context.db.prepare('UPDATE saved_constraint_sets SET version = 0 WHERE id = ?').run(savedSet.id);
  const zeroVersionSavedSet = model.findSavedConstraintSetById(1, term.id, savedSet.id);
  assert.equal(zeroVersionSavedSet.version, 0);

  model.recordGenerationEvent(1, null, {
    createdAt: '2026-03-30T12:09:00.000Z',
    detailsJson: JSON.stringify({ returnedCount: 0, state: 'blocked' }),
    outcomeStatus: 'blocked',
    requestedResultCount: null
  });
  const nullTermEvent = context.db.prepare(`
    SELECT term_id, requested_result_count
    FROM schedule_generation_events
    ORDER BY id DESC
    LIMIT 1
  `).get();
  assert.equal(nullTermEvent.term_id, null);
  assert.equal(nullTermEvent.requested_result_count, null);

  context.cleanup();
});
