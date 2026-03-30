function mapConstraintRows(setRow, constraintRows) {
  if (!setRow) {
    return {
      constraints: [],
      termId: null,
      updatedAt: null,
      version: 0
    };
  }

  return {
    constraints: constraintRows.map((row) => ({
      id: row.id,
      label: row.label,
      priorityValue: Number(row.priority_value),
      sortOrder: Number(row.sort_order),
      type: row.constraint_type,
      valueJson: row.value_json
    })),
    setId: setRow.id,
    termId: setRow.term_id,
    updatedAt: setRow.updated_at,
    version: Number(setRow.version || 0)
  };
}

function normalizeSavedSetRow(row) {
  if (!row) {
    return null;
  }

  return {
    createdAt: row.created_at,
    displayName: row.display_name,
    id: Number(row.id),
    normalizedName: row.normalized_name,
    snapshotJson: row.snapshot_json,
    termId: Number(row.term_id),
    updatedAt: row.updated_at,
    version: Number(row.version || 0)
  };
}

function hydrateCourses(rows) {
  const coursesById = new Map();

  for (const row of rows) {
    if (!coursesById.has(row.course_id)) {
      coursesById.set(row.course_id, {
        compatibilityStatus: row.compatibility_status,
        courseCode: row.course_code,
        groups: [],
        id: Number(row.course_id),
        isActive: row.course_is_active === 1,
        sharedListingGroup: row.shared_listing_group || null,
        title: row.title
      });
    }

    if (!row.option_group_id) {
      continue;
    }

    const course = coursesById.get(row.course_id);
    let group = course.groups.find((entry) => entry.id === Number(row.option_group_id));

    if (!group) {
      group = {
        id: Number(row.option_group_id),
        isActive: row.option_is_active === 1,
        meetings: [],
        optionCode: row.option_code,
        professorName: row.professor_name,
        seatsRemaining: Number(row.seats_remaining)
      };
      course.groups.push(group);
    }

    if (!row.meeting_id) {
      continue;
    }

    group.meetings.push({
      componentType: row.component_type,
      endMinute: Number(row.end_minute),
      id: Number(row.meeting_id),
      meetingDays: row.meeting_days,
      sectionCode: row.section_code,
      sharedComponentKey: row.shared_component_key || null,
      startMinute: Number(row.start_minute)
    });
  }

  return [...coursesById.values()].sort((left, right) => left.courseCode.localeCompare(right.courseCode));
}

function createScheduleBuilderModel(db) {
  const selectTerms = db.prepare(`
    SELECT id, term_code, display_name, is_available
    FROM planning_terms
    ORDER BY display_name ASC
  `);
  const selectTermByCode = db.prepare(`
    SELECT id, term_code, display_name, is_available
    FROM planning_terms
    WHERE term_code = ?
    LIMIT 1
  `);
  const selectCourseRowsByTerm = db.prepare(`
    SELECT
      c.id AS course_id,
      c.course_code,
      c.title,
      c.is_active AS course_is_active,
      c.compatibility_status,
      c.shared_listing_group,
      og.id AS option_group_id,
      og.option_code,
      og.professor_name,
      og.seats_remaining,
      og.is_active AS option_is_active,
      m.id AS meeting_id,
      m.component_type,
      m.section_code,
      m.meeting_days,
      m.start_minute,
      m.end_minute,
      m.shared_component_key
    FROM schedule_builder_courses c
    LEFT JOIN schedule_builder_option_groups og ON og.course_id = c.id
    LEFT JOIN schedule_builder_option_meetings m ON m.option_group_id = og.id
    WHERE c.term_id = ?
    ORDER BY c.course_code ASC, og.option_code ASC, m.start_minute ASC, m.section_code ASC
  `);
  const selectConstraintSet = db.prepare(`
    SELECT id, term_id, version, updated_at
    FROM schedule_constraint_sets
    WHERE account_id = ? AND term_id = ?
    LIMIT 1
  `);
  const selectConstraintsForSet = db.prepare(`
    SELECT id, constraint_type, label, value_json, priority_value, sort_order
    FROM schedule_constraints
    WHERE constraint_set_id = ?
    ORDER BY sort_order ASC, id ASC
  `);
  const insertConstraintSet = db.prepare(`
    INSERT INTO schedule_constraint_sets (account_id, term_id, version, updated_at)
    VALUES (@account_id, @term_id, @version, @updated_at)
  `);
  const updateConstraintSet = db.prepare(`
    UPDATE schedule_constraint_sets
    SET version = @version, updated_at = @updated_at
    WHERE id = @id
  `);
  const deleteConstraintsForSet = db.prepare('DELETE FROM schedule_constraints WHERE constraint_set_id = ?');
  const insertConstraint = db.prepare(`
    INSERT INTO schedule_constraints (
      constraint_set_id,
      constraint_type,
      label,
      value_json,
      priority_value,
      sort_order,
      created_at
    ) VALUES (
      @constraint_set_id,
      @constraint_type,
      @label,
      @value_json,
      @priority_value,
      @sort_order,
      @created_at
    )
  `);
  const selectSavedSets = db.prepare(`
    SELECT id, term_id, display_name, normalized_name, snapshot_json, version, created_at, updated_at
    FROM saved_constraint_sets
    WHERE account_id = ? AND term_id = ?
    ORDER BY updated_at DESC, display_name ASC
  `);
  const selectSavedSetById = db.prepare(`
    SELECT id, term_id, display_name, normalized_name, snapshot_json, version, created_at, updated_at
    FROM saved_constraint_sets
    WHERE account_id = ? AND term_id = ? AND id = ?
    LIMIT 1
  `);
  const selectSavedSetByNormalizedName = db.prepare(`
    SELECT id, term_id, display_name, normalized_name, snapshot_json, version, created_at, updated_at
    FROM saved_constraint_sets
    WHERE account_id = ? AND term_id = ? AND normalized_name = ?
    LIMIT 1
  `);
  const insertSavedSet = db.prepare(`
    INSERT INTO saved_constraint_sets (
      account_id,
      term_id,
      display_name,
      normalized_name,
      snapshot_json,
      version,
      created_at,
      updated_at
    ) VALUES (
      @account_id,
      @term_id,
      @display_name,
      @normalized_name,
      @snapshot_json,
      @version,
      @created_at,
      @updated_at
    )
  `);
  const updateSavedSet = db.prepare(`
    UPDATE saved_constraint_sets
    SET
      display_name = @display_name,
      normalized_name = @normalized_name,
      snapshot_json = @snapshot_json,
      version = @version,
      updated_at = @updated_at
    WHERE id = @id
  `);
  const renameSavedSet = db.prepare(`
    UPDATE saved_constraint_sets
    SET
      display_name = @display_name,
      normalized_name = @normalized_name,
      version = @version,
      updated_at = @updated_at
    WHERE id = @id
  `);
  const deleteSavedSet = db.prepare('DELETE FROM saved_constraint_sets WHERE id = ?');
  const insertGenerationEvent = db.prepare(`
    INSERT INTO schedule_generation_events (
      account_id,
      term_id,
      requested_result_count,
      outcome_status,
      details_json,
      created_at
    ) VALUES (
      @account_id,
      @term_id,
      @requested_result_count,
      @outcome_status,
      @details_json,
      @created_at
    )
  `);

  const saveConstraintSet = db.transaction((payload) => {
    const existingSet = selectConstraintSet.get(payload.accountId, payload.termId);
    let constraintSetId = existingSet ? Number(existingSet.id) : null;
    let nextVersion = existingSet ? Number(existingSet.version || 0) + 1 : 1;

    if (!constraintSetId) {
      const result = insertConstraintSet.run({
        account_id: payload.accountId,
        term_id: payload.termId,
        updated_at: payload.updatedAt,
        version: nextVersion
      });
      constraintSetId = Number(result.lastInsertRowid);
    } else {
      updateConstraintSet.run({
        id: constraintSetId,
        updated_at: payload.updatedAt,
        version: nextVersion
      });
    }

    deleteConstraintsForSet.run(constraintSetId);

    for (const constraint of payload.constraints) {
      insertConstraint.run({
        constraint_set_id: constraintSetId,
        constraint_type: constraint.type,
        created_at: payload.updatedAt,
        label: constraint.label,
        priority_value: constraint.priorityValue,
        sort_order: constraint.sortOrder,
        value_json: constraint.valueJson
      });
    }

    if (payload.simulateFailure) {
      throw new Error('Simulated schedule constraint save failure.');
    }

    return nextVersion;
  });

  const persistSavedSet = db.transaction((payload) => {
    if (payload.existingSet) {
      updateSavedSet.run({
        display_name: payload.displayName,
        id: payload.existingSet.id,
        normalized_name: payload.normalizedName,
        snapshot_json: payload.snapshotJson,
        updated_at: payload.updatedAt,
        version: payload.existingSet.version + 1
      });
    } else {
      insertSavedSet.run({
        account_id: payload.accountId,
        created_at: payload.updatedAt,
        display_name: payload.displayName,
        normalized_name: payload.normalizedName,
        snapshot_json: payload.snapshotJson,
        term_id: payload.termId,
        updated_at: payload.updatedAt,
        version: 1
      });
    }

    if (payload.simulateFailure) {
      throw new Error('Simulated saved constraint set persistence failure.');
    }
  });

  const persistSavedSetRename = db.transaction((payload) => {
    renameSavedSet.run({
      display_name: payload.displayName,
      id: payload.savedSet.id,
      normalized_name: payload.normalizedName,
      updated_at: payload.updatedAt,
      version: payload.savedSet.version + 1
    });

    if (payload.simulateFailure) {
      throw new Error('Simulated saved constraint set rename failure.');
    }
  });

  return {
    findSavedConstraintSetById(accountId, termId, savedSetId) {
      return normalizeSavedSetRow(selectSavedSetById.get(accountId, termId, savedSetId) || null);
    },
    findSavedConstraintSetByNormalizedName(accountId, termId, normalizedName) {
      return normalizeSavedSetRow(
        selectSavedSetByNormalizedName.get(accountId, termId, normalizedName) || null
      );
    },
    findTermByCode(termCode) {
      const row = selectTermByCode.get(termCode);
      if (!row) {
        return null;
      }

      return {
        displayName: row.display_name,
        id: Number(row.id),
        isAvailable: row.is_available === 1,
        termCode: row.term_code
      };
    },
    getActiveConstraints(accountId, termId) {
      const setRow = selectConstraintSet.get(accountId, termId);
      const constraintRows = setRow ? selectConstraintsForSet.all(setRow.id) : [];
      return mapConstraintRows(setRow, constraintRows);
    },
    listCoursesForTerm(termId) {
      return hydrateCourses(selectCourseRowsByTerm.all(termId));
    },
    listSavedConstraintSets(accountId, termId) {
      return selectSavedSets.all(accountId, termId).map((row) => normalizeSavedSetRow(row));
    },
    listTerms() {
      return selectTerms.all().map((row) => ({
        displayName: row.display_name,
        id: Number(row.id),
        isAvailable: row.is_available === 1,
        termCode: row.term_code
      }));
    },
    recordGenerationEvent(accountId, termId, payload) {
      insertGenerationEvent.run({
        account_id: accountId,
        created_at: payload.createdAt,
        details_json: payload.detailsJson,
        outcome_status: payload.outcomeStatus,
        requested_result_count: payload.requestedResultCount,
        term_id: termId || null
      });
    },
    renameSavedConstraintSet(accountId, termId, savedSetId, displayName, normalizedName, options = {}) {
      const savedSet = this.findSavedConstraintSetById(accountId, termId, savedSetId);
      if (!savedSet) {
        return null;
      }

      persistSavedSetRename({
        displayName,
        normalizedName,
        savedSet,
        simulateFailure: Boolean(options.simulateFailure),
        updatedAt: options.updatedAt
      });

      return this.findSavedConstraintSetById(accountId, termId, savedSetId);
    },
    saveActiveConstraints(accountId, termId, constraints, options = {}) {
      saveConstraintSet({
        accountId,
        constraints,
        simulateFailure: Boolean(options.simulateFailure),
        termId,
        updatedAt: options.updatedAt
      });

      return this.getActiveConstraints(accountId, termId);
    },
    saveNamedConstraintSet(accountId, termId, payload, options = {}) {
      const existingSet = payload.savedSetId
        ? this.findSavedConstraintSetById(accountId, termId, payload.savedSetId)
        : this.findSavedConstraintSetByNormalizedName(accountId, termId, payload.normalizedName);

      persistSavedSet({
        accountId,
        displayName: payload.displayName,
        existingSet,
        normalizedName: payload.normalizedName,
        simulateFailure: Boolean(options.simulateFailure),
        snapshotJson: payload.snapshotJson,
        termId,
        updatedAt: options.updatedAt
      });

      return this.findSavedConstraintSetByNormalizedName(accountId, termId, payload.normalizedName);
    },
    deleteSavedConstraintSet(accountId, termId, savedSetId) {
      const savedSet = this.findSavedConstraintSetById(accountId, termId, savedSetId);
      if (!savedSet) {
        return false;
      }

      deleteSavedSet.run(savedSet.id);
      return true;
    }
  };
}

module.exports = { createScheduleBuilderModel };
