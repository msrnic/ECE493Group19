const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_LABELS = new Set(['Any', ...DAYS]);
const SAVED_SET_NAME_PATTERN = /^[A-Za-z0-9 '\-()]+$/;

function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value == null || value === '') {
    return [];
  }

  return [value];
}

function matchesAccountIdentifier(account, configuredIdentifiers) {
  const identifiers = new Set(
    (Array.isArray(configuredIdentifiers) ? configuredIdentifiers : []).map(normalizeIdentifier)
  );

  return identifiers.has(normalizeIdentifier(account.email))
    || identifiers.has(normalizeIdentifier(account.username));
}

function parsePositiveInteger(value) {
  const normalized = String(value || '').trim();
  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  return Number(normalized);
}

function parseTimeToMinutes(value) {
  const normalized = String(value || '').trim();
  const match = /^(\d{2}):(\d{2})$/.exec(normalized);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatMinutes(minutes) {
  const hourValue = Math.floor(minutes / 60);
  const minuteValue = minutes % 60;
  const displayHour = hourValue % 12 === 0 ? 12 : hourValue % 12;
  const meridiem = hourValue >= 12 ? 'PM' : 'AM';
  return `${displayHour}:${String(minuteValue).padStart(2, '0')}${meridiem}`;
}

function formatTimeRange(startMinute, endMinute) {
  return `${formatMinutes(startMinute)}-${formatMinutes(endMinute)}`;
}

function parseProfessorList(value) {
  const seen = new Set();
  const parsed = [];

  for (const entry of String(value || '').split(',')) {
    const normalized = entry.trim();
    if (!normalized) {
      continue;
    }

    const key = normalizeIdentifier(normalized);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    parsed.push(normalized);
  }

  return parsed;
}

function createEmptyFormValues(termCode) {
  return {
    blockedDay: '',
    blockedPriority: '3',
    blockedStart: '',
    blockedEnd: '',
    earliestStart: '',
    earliestStartPriority: '3',
    presetName: '',
    professorBlacklist: '',
    professorBlacklistPriority: '3',
    professorWhitelist: '',
    professorWhitelistPriority: '3',
    renamePresetName: '',
    requestedResultCount: '5',
    selectedCourseCodes: [],
    selectedSavedSetId: '',
    selectedSavedSetVersion: '',
    termCode
  };
}

function createFieldErrors() {
  return {
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
  };
}

function normalizeSavedSetName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function validatePriority(rawValue) {
  const parsed = parsePositiveInteger(rawValue);
  if (!parsed || parsed < 1 || parsed > 5) {
    return null;
  }

  return parsed;
}

function createConstraintLabel(type, value) {
  switch (type) {
    case 'earliest_start':
      return `No classes before ${formatMinutes(value.startMinute)}`;
    case 'blocked_time':
      return `${value.day === 'Any' ? 'Avoid classes on weekdays' : `Avoid classes on ${value.day}`} ${formatTimeRange(value.startMinute, value.endMinute)}`;
    case 'professor_whitelist':
      return `Prefer only ${value.professors.join(', ')}`;
    case 'professor_blacklist':
      return `Avoid ${value.professors.join(', ')}`;
    default:
      return type;
  }
}

function serializeConstraintsForStorage(constraints) {
  return constraints.map((constraint) => ({
    label: createConstraintLabel(constraint.type, constraint.value),
    priorityValue: constraint.priorityValue,
    sortOrder: constraint.sortOrder,
    type: constraint.type,
    valueJson: JSON.stringify(constraint.value)
  }));
}

function constraintsToFormValues(persistedState, termCode) {
  const values = createEmptyFormValues(termCode);

  for (const constraint of persistedState?.constraints || []) {
    let parsedValue = {};
    try {
      parsedValue = JSON.parse(constraint.valueJson || '{}');
    } catch {
      parsedValue = {};
    }

    switch (constraint.type) {
      case 'earliest_start':
        values.earliestStart = typeof parsedValue.startMinute === 'number'
          ? `${String(Math.floor(parsedValue.startMinute / 60)).padStart(2, '0')}:${String(parsedValue.startMinute % 60).padStart(2, '0')}`
          : '';
        values.earliestStartPriority = String(constraint.priorityValue || 3);
        break;
      case 'blocked_time':
        values.blockedDay = parsedValue.day || '';
        values.blockedStart = typeof parsedValue.startMinute === 'number'
          ? `${String(Math.floor(parsedValue.startMinute / 60)).padStart(2, '0')}:${String(parsedValue.startMinute % 60).padStart(2, '0')}`
          : '';
        values.blockedEnd = typeof parsedValue.endMinute === 'number'
          ? `${String(Math.floor(parsedValue.endMinute / 60)).padStart(2, '0')}:${String(parsedValue.endMinute % 60).padStart(2, '0')}`
          : '';
        values.blockedPriority = String(constraint.priorityValue || 3);
        break;
      case 'professor_whitelist':
        values.professorWhitelist = Array.isArray(parsedValue.professors)
          ? parsedValue.professors.join(', ')
          : '';
        values.professorWhitelistPriority = String(constraint.priorityValue || 3);
        break;
      case 'professor_blacklist':
        values.professorBlacklist = Array.isArray(parsedValue.professors)
          ? parsedValue.professors.join(', ')
          : '';
        values.professorBlacklistPriority = String(constraint.priorityValue || 3);
        break;
      default:
        break;
    }
  }

  return values;
}

function buildScheduleSnapshot(values) {
  return {
    blockedDay: values.blockedDay,
    blockedEnd: values.blockedEnd,
    blockedPriority: values.blockedPriority,
    blockedStart: values.blockedStart,
    earliestStart: values.earliestStart,
    earliestStartPriority: values.earliestStartPriority,
    professorBlacklist: values.professorBlacklist,
    professorBlacklistPriority: values.professorBlacklistPriority,
    professorWhitelist: values.professorWhitelist,
    professorWhitelistPriority: values.professorWhitelistPriority
  };
}

function parseConstraints(values) {
  const errors = createFieldErrors();
  const constraints = [];
  const warnings = [];
  const earliestPriority = validatePriority(values.earliestStartPriority);
  const blockedPriority = validatePriority(values.blockedPriority);
  const whitelistPriority = validatePriority(values.professorWhitelistPriority);
  const blacklistPriority = validatePriority(values.professorBlacklistPriority);

  if (!earliestPriority) {
    errors.earliestStartPriority = 'Priority must be a number from 1 to 5.';
  }
  if (!blockedPriority) {
    errors.blockedPriority = 'Priority must be a number from 1 to 5.';
  }
  if (!whitelistPriority) {
    errors.professorWhitelistPriority = 'Priority must be a number from 1 to 5.';
  }
  if (!blacklistPriority) {
    errors.professorBlacklistPriority = 'Priority must be a number from 1 to 5.';
  }

  if (values.earliestStart) {
    const earliestStartMinute = parseTimeToMinutes(values.earliestStart);
    if (earliestStartMinute == null) {
      errors.earliestStart = 'Use HH:MM for the earliest-start restriction.';
    } else if (earliestPriority) {
      constraints.push({
        priorityValue: earliestPriority,
        sortOrder: 10,
        type: 'earliest_start',
        value: { startMinute: earliestStartMinute }
      });
    }
  }

  const blockedHasAnyValue = values.blockedDay || values.blockedStart || values.blockedEnd;
  if (blockedHasAnyValue) {
    const blockedStartMinute = parseTimeToMinutes(values.blockedStart);
    const blockedEndMinute = parseTimeToMinutes(values.blockedEnd);

    if (!DAY_LABELS.has(values.blockedDay)) {
      errors.blockedDay = 'Choose a blocked-day value before saving.';
    }
    if (blockedStartMinute == null) {
      errors.blockedStart = 'Use HH:MM for the blocked start time.';
    }
    if (blockedEndMinute == null) {
      errors.blockedEnd = 'Use HH:MM for the blocked end time.';
    }
    if (blockedStartMinute != null && blockedEndMinute != null && blockedEndMinute <= blockedStartMinute) {
      errors.blockedEnd = 'Blocked end time must be later than the blocked start time.';
    }

    if (!errors.blockedDay && !errors.blockedStart && !errors.blockedEnd && blockedPriority) {
      constraints.push({
        priorityValue: blockedPriority,
        sortOrder: 20,
        type: 'blocked_time',
        value: {
          day: values.blockedDay,
          endMinute: blockedEndMinute,
          startMinute: blockedStartMinute
        }
      });
    }
  }

  const whitelistProfessors = parseProfessorList(values.professorWhitelist);
  if (whitelistProfessors.length && whitelistPriority) {
    constraints.push({
      priorityValue: whitelistPriority,
      sortOrder: 30,
      type: 'professor_whitelist',
      value: { professors: whitelistProfessors }
    });
  }

  const blacklistProfessors = parseProfessorList(values.professorBlacklist);
  if (blacklistProfessors.length && blacklistPriority) {
    constraints.push({
      priorityValue: blacklistPriority,
      sortOrder: 40,
      type: 'professor_blacklist',
      value: { professors: blacklistProfessors }
    });
  }

  if (whitelistProfessors.length && blacklistProfessors.length) {
    const blacklist = new Set(blacklistProfessors.map((value) => normalizeIdentifier(value)));
    const overlaps = whitelistProfessors.filter((value) => blacklist.has(normalizeIdentifier(value)));
    if (overlaps.length) {
      warnings.push(`The same professor appears in both the whitelist and blacklist: ${overlaps.join(', ')}.`);
    }
  }

  const hasErrors = Object.values(errors).some(Boolean);

  return {
    constraints,
    errors,
    hasErrors,
    warnings
  };
}

function parseMeetingDays(meetingDays) {
  return String(meetingDays || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function intersectMeetingDays(leftDays, rightDays) {
  const rightSet = new Set(rightDays);
  return leftDays.filter((day) => rightSet.has(day));
}

function rangesOverlap(leftStart, leftEnd, rightStart, rightEnd) {
  return leftStart < rightEnd && rightStart < leftEnd;
}

function comparePriorityCounts(left, right) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }

  return 0;
}

function parseConstraintMap(constraints) {
  const map = {};

  for (const constraint of constraints) {
    map[
      constraint.type === 'earliest_start'
        ? 'earliestStart'
        : constraint.type === 'blocked_time'
          ? 'blockedTime'
          : constraint.type === 'professor_whitelist'
            ? 'professorWhitelist'
            : 'professorBlacklist'
    ] = constraint;
  }

  return map;
}

function createScheduleBuilderService(services) {
  function findAccount(accountId) {
    return services.accountModel.findById(accountId);
  }

  function createAccessResult(accountId) {
    const account = findAccount(accountId);
    if (!account) {
      return { status: 'missing' };
    }

    const roleKeys = new Set(
      (services.roleModel.listActiveRolesForAccount(account.id) || []).map((role) => role.role_key)
    );
    if (!roleKeys.has('student')) {
      return {
        account,
        status: 'forbidden'
      };
    }

    return {
      account,
      status: 'ok'
    };
  }

  function getDefaultTerm() {
    const terms = services.scheduleBuilderModel.listTerms();
    return terms.find((term) => term.isAvailable) || terms[0] || null;
  }

  function getRequestedTerm(termCode) {
    if (!termCode) {
      return getDefaultTerm();
    }

    return services.scheduleBuilderModel.findTermByCode(termCode) || getDefaultTerm();
  }

  function createBasePageState(account, term, overrides = {}) {
    const activeConstraintState = term
      ? services.scheduleBuilderModel.getActiveConstraints(account.id, term.id)
      : { constraints: [], version: 0 };
    const baseValues = constraintsToFormValues(activeConstraintState, term?.termCode || '');
    const formValues = {
      ...baseValues,
      ...overrides.formValues,
      selectedCourseCodes: overrides.formValues?.selectedCourseCodes || baseValues.selectedCourseCodes
    };
    const courses = term ? services.scheduleBuilderModel.listCoursesForTerm(term.id) : [];
    const savedSets = term ? services.scheduleBuilderModel.listSavedConstraintSets(account.id, term.id) : [];

    return {
      account,
      activeConstraintVersion: activeConstraintState.version || 0,
      availableCourses: courses.filter((course) => course.isActive),
      fieldErrors: createFieldErrors(),
      flashMessage: '',
      flashVariant: 'info',
      formValues,
      pendingAction: '',
      results: null,
      savedSets,
      term,
      terms: services.scheduleBuilderModel.listTerms()
    };
  }

  function createSelectionMetadata(courses) {
    return courses.map((course) => ({
      courseCode: course.courseCode,
      meetings: course.groups
        .filter((group) => group.isActive)
        .flatMap((group) => group.meetings.map((meeting) => ({
          endMinute: meeting.endMinute,
          meetingDays: meeting.meetingDays,
          startMinute: meeting.startMinute
        }))),
      title: course.title
    }));
  }

  function createSharedComponents(choiceEntries) {
    const sharedMap = new Map();

    for (const choice of choiceEntries) {
      for (const meeting of choice.group.meetings) {
        if (!meeting.sharedComponentKey) {
          continue;
        }

        if (!sharedMap.has(meeting.sharedComponentKey)) {
          sharedMap.set(meeting.sharedComponentKey, {
            componentType: meeting.componentType,
            courseCodes: [],
            daysText: parseMeetingDays(meeting.meetingDays).join(', '),
            key: meeting.sharedComponentKey,
            sectionCode: meeting.sectionCode,
            timeText: formatTimeRange(meeting.startMinute, meeting.endMinute)
          });
        }

        const entry = sharedMap.get(meeting.sharedComponentKey);
        if (!entry.courseCodes.includes(choice.course.courseCode)) {
          entry.courseCodes.push(choice.course.courseCode);
        }
      }
    }

    return [...sharedMap.values()];
  }

  function createDisplayMeetings(choice) {
    return choice.group.meetings
      .filter((meeting) => !meeting.sharedComponentKey)
      .map((meeting) => ({
        componentType: meeting.componentType,
        daysText: parseMeetingDays(meeting.meetingDays).join(', '),
        sectionCode: meeting.sectionCode,
        timeText: formatTimeRange(meeting.startMinute, meeting.endMinute)
      }));
  }

  function buildConflictViolations(uniqueMeetings) {
    const violations = [];

    for (let leftIndex = 0; leftIndex < uniqueMeetings.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < uniqueMeetings.length; rightIndex += 1) {
        const leftMeeting = uniqueMeetings[leftIndex];
        const rightMeeting = uniqueMeetings[rightIndex];
        const sharedDays = intersectMeetingDays(leftMeeting.days, rightMeeting.days);

        if (!sharedDays.length) {
          continue;
        }

        if (!rangesOverlap(
          leftMeeting.startMinute,
          leftMeeting.endMinute,
          rightMeeting.startMinute,
          rightMeeting.endMinute
        )) {
          continue;
        }

        const overlapStart = Math.max(leftMeeting.startMinute, rightMeeting.startMinute);
        const overlapEnd = Math.min(leftMeeting.endMinute, rightMeeting.endMinute);
        violations.push({
          kind: 'course_conflict',
          message: `${leftMeeting.label} overlaps with ${rightMeeting.label} on ${sharedDays.join(', ')} ${formatTimeRange(overlapStart, overlapEnd)}.`,
          priorityValue: 0
        });
      }
    }

    return violations;
  }

  function createUniqueMeetings(choiceEntries) {
    const uniqueMeetings = new Map();

    for (const choice of choiceEntries) {
      for (const meeting of choice.group.meetings) {
        const mapKey = meeting.sharedComponentKey || `${choice.course.courseCode}:${choice.group.optionCode}:${meeting.sectionCode}`;
        if (!uniqueMeetings.has(mapKey)) {
          uniqueMeetings.set(mapKey, {
            courseCodes: [choice.course.courseCode],
            days: parseMeetingDays(meeting.meetingDays),
            endMinute: meeting.endMinute,
            label: `${choice.course.courseCode} ${meeting.sectionCode}`,
            startMinute: meeting.startMinute
          });
        } else if (meeting.sharedComponentKey) {
          const entry = uniqueMeetings.get(mapKey);
          if (!entry.courseCodes.includes(choice.course.courseCode)) {
            entry.courseCodes.push(choice.course.courseCode);
          }
        }
      }
    }

    return [...uniqueMeetings.values()];
  }

  function buildConstraintViolations(choiceEntries, parsedConstraints) {
    const violations = [];
    const uniqueMeetings = createUniqueMeetings(choiceEntries);
    const conflicts = buildConflictViolations(uniqueMeetings);

    for (const conflict of conflicts) {
      violations.push(conflict);
    }

    if (parsedConstraints.earliestStart) {
      for (const choice of choiceEntries) {
        for (const meeting of choice.group.meetings) {
          if (meeting.startMinute >= parsedConstraints.earliestStart.value.startMinute) {
            continue;
          }

          violations.push({
            kind: 'earliest_start',
            message: `${choice.course.courseCode} ${meeting.sectionCode} starts before ${formatMinutes(parsedConstraints.earliestStart.value.startMinute)}.`,
            priorityValue: parsedConstraints.earliestStart.priorityValue
          });
        }
      }
    }

    if (parsedConstraints.blockedTime) {
      for (const choice of choiceEntries) {
        for (const meeting of choice.group.meetings) {
          const meetingDays = parseMeetingDays(meeting.meetingDays);
          const blockedDays = parsedConstraints.blockedTime.value.day === 'Any'
            ? meetingDays.filter((day) => DAYS.includes(day))
            : meetingDays.filter((day) => day === parsedConstraints.blockedTime.value.day);

          if (!blockedDays.length) {
            continue;
          }

          if (!rangesOverlap(
            meeting.startMinute,
            meeting.endMinute,
            parsedConstraints.blockedTime.value.startMinute,
            parsedConstraints.blockedTime.value.endMinute
          )) {
            continue;
          }

          violations.push({
            kind: 'blocked_time',
            message: `${choice.course.courseCode} ${meeting.sectionCode} overlaps the blocked window on ${blockedDays.join(', ')}.`,
            priorityValue: parsedConstraints.blockedTime.priorityValue
          });
        }
      }
    }

    if (parsedConstraints.professorWhitelist) {
      const whitelist = new Set(
        parsedConstraints.professorWhitelist.value.professors.map((value) => normalizeIdentifier(value))
      );

      for (const choice of choiceEntries) {
        if (whitelist.has(normalizeIdentifier(choice.group.professorName))) {
          continue;
        }

        violations.push({
          kind: 'professor_whitelist',
          message: `${choice.course.courseCode} uses ${choice.group.professorName}, which is not on the whitelist.`,
          priorityValue: parsedConstraints.professorWhitelist.priorityValue
        });
      }
    }

    if (parsedConstraints.professorBlacklist) {
      const blacklist = new Set(
        parsedConstraints.professorBlacklist.value.professors.map((value) => normalizeIdentifier(value))
      );

      for (const choice of choiceEntries) {
        if (!blacklist.has(normalizeIdentifier(choice.group.professorName))) {
          continue;
        }

        violations.push({
          kind: 'professor_blacklist',
          message: `${choice.course.courseCode} uses blacklisted professor ${choice.group.professorName}.`,
          priorityValue: parsedConstraints.professorBlacklist.priorityValue
        });
      }
    }

    for (const choice of choiceEntries) {
      if (choice.group.seatsRemaining > 0) {
        continue;
      }

      violations.push({
        kind: 'full_section',
        message: `${choice.course.courseCode} is currently full in ${choice.group.optionCode}.`,
        priorityValue: 0
      });
    }

    return violations;
  }

  function buildScheduleOption(choiceEntries, parsedConstraints, orderIndex) {
    const violations = buildConstraintViolations(choiceEntries, parsedConstraints);
    const priorityCounts = [1, 2, 3, 4, 5].map(
      (priorityValue) => violations.filter((violation) => violation.priorityValue === priorityValue).length
    );
    const signature = choiceEntries
      .map((choice) => `${choice.course.courseCode}:${choice.group.optionCode}`)
      .sort()
      .join('|');
    const courseSummaries = choiceEntries.map((choice) => ({
      courseCode: choice.course.courseCode,
      isFull: choice.group.seatsRemaining <= 0,
      meetings: createDisplayMeetings(choice),
      optionCode: choice.group.optionCode,
      professorName: choice.group.professorName,
      title: choice.course.title
    }));
    const conflictCount = violations.filter((violation) => violation.kind === 'course_conflict').length;
    const fullCount = violations.filter((violation) => violation.kind === 'full_section').length;

    return {
      conflictCount,
      courseSummaries,
      fullCount,
      id: signature,
      isFeasible: violations.length === 0,
      orderIndex,
      priorityCounts,
      sharedComponents: createSharedComponents(choiceEntries),
      signature,
      summaryLabel: violations.length === 0
        ? 'Meets all active restrictions.'
        : `Best effort with ${violations.length} visible issue(s).`,
      totalViolations: violations.length,
      violations: violations.map((violation) => violation.message)
    };
  }

  function compareScheduleOptions(left, right) {
    if (left.conflictCount !== right.conflictCount) {
      return left.conflictCount - right.conflictCount;
    }

    const priorityComparison = comparePriorityCounts(left.priorityCounts, right.priorityCounts);
    if (priorityComparison !== 0) {
      return priorityComparison;
    }

    return left.signature.localeCompare(right.signature);
  }

  function enumerateOptions(courses, parsedConstraints) {
    const results = [];
    const currentChoices = [];

    function visit(index) {
      if (index === courses.length) {
        results.push(buildScheduleOption(currentChoices, parsedConstraints, results.length + 1));
        return;
      }

      for (const group of courses[index].candidateGroups) {
        currentChoices.push({
          course: courses[index],
          group
        });
        visit(index + 1);
        currentChoices.pop();
      }
    }

    visit(0);
    return results.sort(compareScheduleOptions).map((option, index) => ({
      ...option,
      rank: index + 1
    }));
  }

  function createGenerationResult(account, term, formValues, availableCourses, parsedConstraints) {
    const requestedResultCount = parsePositiveInteger(formValues.requestedResultCount);
    if (!requestedResultCount || requestedResultCount < 1) {
      return {
        bannerMessage: 'Enter a positive number of requested schedules before generating results.',
        bannerVariant: 'error',
        notices: [],
        schedules: [],
        state: 'invalid-input'
      };
    }

    if (!formValues.selectedCourseCodes.length) {
      return {
        bannerMessage: 'Select at least one course before generating schedules.',
        bannerVariant: 'error',
        notices: [],
        schedules: [],
        state: 'invalid-input'
      };
    }

    if (!term || !term.isAvailable || matchesAccountIdentifier(account, services.scheduleBuilderTestState?.dataUnavailableIdentifiers)) {
      return {
        bannerMessage: 'Schedule generation is blocked until live term and timetable data are available.',
        bannerVariant: 'error',
        notices: [],
        schedules: [],
        state: 'blocked'
      };
    }

    if (matchesAccountIdentifier(account, services.scheduleBuilderTestState?.timeoutBeforeResultsIdentifiers)) {
      return {
        bannerMessage: 'Schedule generation timed out before any complete schedules were found.',
        bannerVariant: 'error',
        notices: ['Try fewer courses or request fewer schedules and then retry.'],
        schedules: [],
        state: 'timeout-failure'
      };
    }

    const uniqueSelectedCodes = [...new Set(formValues.selectedCourseCodes)];
    const coursesByCode = new Map(availableCourses.map((course) => [course.courseCode, course]));
    const removedCourses = uniqueSelectedCodes.filter((courseCode) => !coursesByCode.has(courseCode));
    const selectedCourses = uniqueSelectedCodes
      .map((courseCode) => coursesByCode.get(courseCode))
      .filter(Boolean);

    const compatibilityBlocked = selectedCourses.filter(
      (course) => course.compatibilityStatus !== 'ok'
    );
    if (compatibilityBlocked.length) {
      return {
        bannerMessage: `Compatibility rules are missing for ${compatibilityBlocked[0].courseCode}, so schedule generation is blocked for this request.`,
        bannerVariant: 'error',
        notices: [],
        schedules: [],
        state: 'blocked'
      };
    }

    if (matchesAccountIdentifier(account, services.scheduleBuilderTestState?.generationFailureIdentifiers)) {
      return {
        bannerMessage: 'Schedule generation could not complete because a live processing error occurred.',
        bannerVariant: 'error',
        notices: ['Retry after the schedule builder data recovers.'],
        schedules: [],
        state: 'error'
      };
    }

    const candidateCourses = [];
    const unschedulableCourses = [];
    const fullCourses = [];
    const liveNotices = [];

    for (const course of selectedCourses) {
      const activeGroups = course.groups.filter((group) => group.isActive);
      if (!activeGroups.length) {
        unschedulableCourses.push(course.courseCode);
        continue;
      }

      const openGroups = activeGroups.filter((group) => group.seatsRemaining > 0);
      const candidateGroups = openGroups.length ? openGroups : activeGroups;

      if (!openGroups.length) {
        fullCourses.push(course.courseCode);
      } else if (openGroups.length !== activeGroups.length) {
        liveNotices.push(`${course.courseCode} had full section bundles removed from the refreshed results.`);
      }

      candidateCourses.push({
        ...course,
        candidateGroups
      });
    }

    if (!candidateCourses.length) {
      const message = removedCourses.length
        ? `The selected course list changed live. Removed course(s): ${removedCourses.join(', ')}.`
        : 'No schedulable course bundles are available for the current selection.';
      return {
        bannerMessage: message,
        bannerVariant: 'error',
        notices: [],
        schedules: [],
        state: 'blocked'
      };
    }

    const allOptions = enumerateOptions(candidateCourses, parseConstraintMap(parsedConstraints.constraints));

    let effectiveResultCount = requestedResultCount > 10 ? 10 : requestedResultCount;
    let selectedOptions = allOptions.slice(0, Math.min(effectiveResultCount, allOptions.length));
    const notices = [];

    if (requestedResultCount > 10) {
      notices.push('Requested results were capped at 10.');
    }
    if (removedCourses.length) {
      notices.push(`Removed live course updates: ${removedCourses.join(', ')}.`);
    }
    if (unschedulableCourses.length) {
      notices.push(`Continued without courses that have no active bundles: ${unschedulableCourses.join(', ')}.`);
    }
    if (fullCourses.length) {
      notices.push(`These courses are currently full and are shown only as best-effort results: ${fullCourses.join(', ')}.`);
    }
    for (const liveNotice of liveNotices) {
      notices.push(liveNotice);
    }

    const feasibleCount = selectedOptions.filter((option) => option.isFeasible).length;
    if (selectedOptions.some((option) => !option.isFeasible)) {
      notices.push('Best-effort schedules are included after higher-ranked conflict-free results.');
    }

    if (matchesAccountIdentifier(account, services.scheduleBuilderTestState?.timeoutAfterResultsIdentifiers)) {
      selectedOptions = selectedOptions.slice(0, 1);
      notices.push('Generation stopped early, so the current result set is incomplete.');
      return {
        bannerMessage: 'Showing the best ranked schedule found before generation timed out.',
        bannerVariant: 'warning',
        feasibleCount,
        notices,
        schedules: selectedOptions,
        state: 'partial-timeout',
        totalGeneratedCount: allOptions.length
      };
    }

    if (selectedOptions.length < effectiveResultCount) {
      notices.push('Fewer schedule combinations were available than requested.');
    }

    return {
      bannerMessage: 'Schedule Builder refreshed with live timetable data.',
      bannerVariant: selectedOptions.every((option) => option.isFeasible) ? 'success' : 'warning',
      feasibleCount,
      notices,
      schedules: selectedOptions,
      state: 'generated',
      totalGeneratedCount: allOptions.length
    };
  }

  function createPageResponse(accessResult, pageState) {
    return {
      accessStatus: accessResult.status,
      page: {
        ...pageState,
        selectionMetadata: createSelectionMetadata(pageState.availableCourses)
      }
    };
  }

  function persistConstraints(account, term, parsedConstraints, pageState, shouldConfirmWarning) {
    if (parsedConstraints.hasErrors) {
      return {
        ...pageState,
        fieldErrors: parsedConstraints.errors,
        flashMessage: 'Fix the highlighted constraint fields before saving.',
        pendingAction: '',
        flashVariant: 'error'
      };
    }

    if (parsedConstraints.warnings.length && !shouldConfirmWarning) {
      return {
        ...pageState,
        flashMessage: `${parsedConstraints.warnings[0]} Select Confirm Save Anyway to keep this configuration.`,
        pendingAction: 'confirm-constraint-save',
        flashVariant: 'warning'
      };
    }

    try {
      const savedState = services.scheduleBuilderModel.saveActiveConstraints(
        account.id,
        term.id,
        serializeConstraintsForStorage(parsedConstraints.constraints),
        {
          simulateFailure: matchesAccountIdentifier(
            account,
            services.scheduleBuilderTestState?.constraintSaveFailureIdentifiers
          ),
          updatedAt: services.now().toISOString()
        }
      );

      return {
        ...pageState,
        activeConstraintVersion: savedState.version,
        flashMessage: parsedConstraints.constraints.length
          ? 'Constraints and priorities saved for future Schedule Builder sessions.'
          : 'Saved constraints were cleared for this term.',
        pendingAction: '',
        flashVariant: 'success'
      };
    } catch {
      return {
        ...pageState,
        flashMessage: 'Constraint saving failed. The previously saved constraint set is still active.',
        pendingAction: '',
        flashVariant: 'error'
      };
    }
  }

  function validateSavedSetName(name, fieldKey) {
    const errors = createFieldErrors();

    if (!name) {
      errors[fieldKey] = 'Enter a name before saving a constraint preset.';
    } else if (name.length > 50) {
      errors[fieldKey] = 'Saved-set names must be 50 characters or fewer.';
    } else if (!SAVED_SET_NAME_PATTERN.test(name)) {
      errors[fieldKey] = 'Names may use letters, numbers, spaces, hyphens, apostrophes, and parentheses only.';
    }

    return errors;
  }

  function savePreset(account, term, pageState, parsedConstraints, overwriteConfirmed) {
    const normalizedName = normalizeSavedSetName(pageState.formValues.presetName);
    const fieldErrors = validateSavedSetName(normalizedName, 'presetName');

    if (!parsedConstraints.constraints.length) {
      fieldErrors.presetName = 'Create at least one constraint before saving a preset.';
    }

    if (Object.values(fieldErrors).some(Boolean)) {
      return {
        ...pageState,
        fieldErrors,
        flashMessage: 'Fix the preset name or add a constraint before saving.',
        pendingAction: '',
        flashVariant: 'error'
      };
    }

    const duplicate = services.scheduleBuilderModel.findSavedConstraintSetByNormalizedName(
      account.id,
      term.id,
      normalizeIdentifier(normalizedName)
    );

    if (duplicate && !overwriteConfirmed) {
      return {
        ...pageState,
        flashMessage: `${duplicate.displayName} already exists. Submit again with Confirm Overwrite to replace it.`,
        pendingAction: 'confirm-preset-overwrite',
        flashVariant: 'warning'
      };
    }

    try {
      services.scheduleBuilderModel.saveNamedConstraintSet(
        account.id,
        term.id,
        {
          displayName: normalizedName,
          normalizedName: normalizeIdentifier(normalizedName),
          savedSetId: duplicate?.id || null,
          snapshotJson: JSON.stringify(buildScheduleSnapshot(pageState.formValues))
        },
        {
          simulateFailure: matchesAccountIdentifier(
            account,
            services.scheduleBuilderTestState?.presetSaveFailureIdentifiers
          ),
          updatedAt: services.now().toISOString()
        }
      );

      return {
        ...pageState,
        flashMessage: duplicate
          ? 'The saved preset was overwritten with the current constraints.'
          : 'The current constraints were saved as a reusable preset.',
        pendingAction: '',
        flashVariant: 'success',
        savedSets: services.scheduleBuilderModel.listSavedConstraintSets(account.id, term.id)
      };
    } catch {
      return {
        ...pageState,
        flashMessage: 'Preset saving failed and the saved preset list was left unchanged.',
        pendingAction: '',
        flashVariant: 'error'
      };
    }
  }

  function loadPreset(account, term, pageState) {
    const selectedId = parsePositiveInteger(pageState.formValues.selectedSavedSetId);
    if (!selectedId) {
      return {
        ...pageState,
        flashMessage: 'Choose a saved preset before loading it.',
        pendingAction: '',
        flashVariant: 'error'
      };
    }

    const savedSet = services.scheduleBuilderModel.findSavedConstraintSetById(account.id, term.id, selectedId);
    if (!savedSet) {
      return {
        ...pageState,
        flashMessage: 'The selected saved preset could not be found.',
        pendingAction: '',
        flashVariant: 'error'
      };
    }

    let snapshot = {};
    try {
      snapshot = JSON.parse(savedSet.snapshotJson || '{}');
    } catch {
      snapshot = {};
    }

      return {
        ...pageState,
        flashMessage: `${savedSet.displayName} was loaded into the current Schedule Builder form.`,
        pendingAction: '',
        flashVariant: 'success',
        formValues: {
          ...pageState.formValues,
        ...snapshot,
        selectedSavedSetId: String(savedSet.id),
        selectedSavedSetVersion: String(savedSet.version)
      }
    };
  }

  function renamePreset(account, term, pageState) {
    const selectedId = parsePositiveInteger(pageState.formValues.selectedSavedSetId);
    const selectedVersion = parsePositiveInteger(pageState.formValues.selectedSavedSetVersion);
    const normalizedName = normalizeSavedSetName(pageState.formValues.renamePresetName);
    const fieldErrors = validateSavedSetName(normalizedName, 'renamePresetName');

    if (!selectedId) {
      fieldErrors.renamePresetName = 'Choose a saved preset before renaming it.';
    }

    if (Object.values(fieldErrors).some(Boolean)) {
      return {
        ...pageState,
        fieldErrors,
        flashMessage: 'Fix the preset rename details before continuing.',
        pendingAction: '',
        flashVariant: 'error'
      };
    }

    const savedSet = services.scheduleBuilderModel.findSavedConstraintSetById(account.id, term.id, selectedId);
    if (!savedSet) {
      return {
        ...pageState,
        flashMessage: 'The selected saved preset could not be found.',
        pendingAction: '',
        flashVariant: 'error'
      };
    }
    if (selectedVersion && selectedVersion !== savedSet.version) {
      return {
        ...pageState,
        flashMessage: 'This preset changed in another session. Refresh before renaming it.',
        pendingAction: '',
        flashVariant: 'warning'
      };
    }

    const duplicate = services.scheduleBuilderModel.findSavedConstraintSetByNormalizedName(
      account.id,
      term.id,
      normalizeIdentifier(normalizedName)
    );
    if (duplicate && duplicate.id !== savedSet.id) {
      return {
        ...pageState,
        flashMessage: 'A different saved preset already uses that name.',
        pendingAction: '',
        flashVariant: 'error'
      };
    }

    try {
      const renamed = services.scheduleBuilderModel.renameSavedConstraintSet(
        account.id,
        term.id,
        savedSet.id,
        normalizedName,
        normalizeIdentifier(normalizedName),
        {
          simulateFailure: matchesAccountIdentifier(
            account,
            services.scheduleBuilderTestState?.presetRenameFailureIdentifiers
          ),
          updatedAt: services.now().toISOString()
        }
      );

      return {
        ...pageState,
        flashMessage: 'Saved preset renamed successfully.',
        pendingAction: '',
        flashVariant: 'success',
        formValues: {
          ...pageState.formValues,
          renamePresetName: '',
          selectedSavedSetId: String(renamed.id),
          selectedSavedSetVersion: String(renamed.version)
        },
        savedSets: services.scheduleBuilderModel.listSavedConstraintSets(account.id, term.id)
      };
    } catch {
      return {
        ...pageState,
        flashMessage: 'Preset rename failed and the previous saved name is still active.',
        pendingAction: '',
        flashVariant: 'error'
      };
    }
  }

  function deletePreset(account, term, pageState) {
    const selectedId = parsePositiveInteger(pageState.formValues.selectedSavedSetId);
    const selectedVersion = parsePositiveInteger(pageState.formValues.selectedSavedSetVersion);
    if (!selectedId) {
      return {
        ...pageState,
        flashMessage: 'Choose a saved preset before deleting it.',
        pendingAction: '',
        flashVariant: 'error'
      };
    }

    const savedSet = services.scheduleBuilderModel.findSavedConstraintSetById(account.id, term.id, selectedId);
    if (!savedSet) {
      return {
        ...pageState,
        flashMessage: 'The selected saved preset could not be found.',
        pendingAction: '',
        flashVariant: 'error'
      };
    }
    if (selectedVersion && selectedVersion !== savedSet.version) {
      return {
        ...pageState,
        flashMessage: 'This preset changed in another session. Refresh before deleting it.',
        pendingAction: '',
        flashVariant: 'warning'
      };
    }

    services.scheduleBuilderModel.deleteSavedConstraintSet(account.id, term.id, savedSet.id);
      return {
        ...pageState,
        flashMessage: 'Saved preset deleted.',
        pendingAction: '',
        flashVariant: 'success',
        formValues: {
        ...pageState.formValues,
        renamePresetName: '',
        selectedSavedSetId: '',
        selectedSavedSetVersion: ''
      },
      savedSets: services.scheduleBuilderModel.listSavedConstraintSets(account.id, term.id)
    };
  }

  return {
    getPage(accountId, query = {}) {
      const accessResult = createAccessResult(accountId);
      if (accessResult.status !== 'ok') {
        return { accessStatus: accessResult.status };
      }

      const term = getRequestedTerm(query.term);
      return createPageResponse(accessResult, createBasePageState(accessResult.account, term));
    },

    postAction(accountId, body = {}) {
      const accessResult = createAccessResult(accountId);
      if (accessResult.status !== 'ok') {
        return { accessStatus: accessResult.status };
      }

      const term = getRequestedTerm(body.termCode);
      const selectedCourseCodes = toArray(body.selectedCourseCodes || body.selectedCourseCode)
        .map((value) => String(value))
        .filter(Boolean);
      const formValues = {
        blockedDay: String(body.blockedDay || ''),
        blockedEnd: String(body.blockedEnd || ''),
        blockedPriority: String(body.blockedPriority || '3'),
        blockedStart: String(body.blockedStart || ''),
        earliestStart: String(body.earliestStart || ''),
        earliestStartPriority: String(body.earliestStartPriority || '3'),
        presetName: String(body.presetName || ''),
        professorBlacklist: String(body.professorBlacklist || ''),
        professorBlacklistPriority: String(body.professorBlacklistPriority || '3'),
        professorWhitelist: String(body.professorWhitelist || ''),
        professorWhitelistPriority: String(body.professorWhitelistPriority || '3'),
        renamePresetName: String(body.renamePresetName || ''),
        requestedResultCount: String(body.requestedResultCount || '5'),
        selectedCourseCodes,
        selectedSavedSetId: String(body.selectedSavedSetId || ''),
        selectedSavedSetVersion: String(body.selectedSavedSetVersion || ''),
        termCode: term?.termCode || ''
      };
      const parsedConstraints = parseConstraints(formValues);
      let pageState = createBasePageState(accessResult.account, term, { formValues });
      const intent = String(body.intent || 'generate');

      if (intent === 'save-constraints' || intent === 'confirm-save-constraints') {
        pageState = persistConstraints(
          accessResult.account,
          term,
          parsedConstraints,
          pageState,
          intent === 'confirm-save-constraints'
        );
      } else if (intent === 'save-preset' || intent === 'confirm-save-preset') {
        pageState = savePreset(
          accessResult.account,
          term,
          pageState,
          parsedConstraints,
          intent === 'confirm-save-preset'
        );
      } else if (intent === 'load-preset') {
        pageState = loadPreset(accessResult.account, term, pageState);
      } else if (intent === 'rename-preset') {
        pageState = renamePreset(accessResult.account, term, pageState);
      } else if (intent === 'delete-preset') {
        pageState = deletePreset(accessResult.account, term, pageState);
      } else {
        const results = createGenerationResult(
          accessResult.account,
          term,
          formValues,
          pageState.availableCourses,
          parsedConstraints
        );
        pageState = {
          ...pageState,
          fieldErrors: {
            ...pageState.fieldErrors,
            ...parsedConstraints.errors,
            requestedResultCount: results.state === 'invalid-input'
              && !parsePositiveInteger(formValues.requestedResultCount)
              ? 'Use a positive whole number.'
              : pageState.fieldErrors.requestedResultCount,
            selectedCourseCodes: results.state === 'invalid-input'
              && !formValues.selectedCourseCodes.length
              ? 'Choose at least one course.'
              : pageState.fieldErrors.selectedCourseCodes
          },
          results
        };

        services.scheduleBuilderModel.recordGenerationEvent(accessResult.account.id, term?.id || null, {
          createdAt: services.now().toISOString(),
          detailsJson: JSON.stringify({
            notices: results.notices,
            returnedCount: results.schedules.length,
            state: results.state
          }),
          outcomeStatus:
            results.state === 'generated'
            ? 'success'
            : results.state === 'partial-timeout'
              ? 'partial'
              : results.state === 'blocked' || results.state === 'invalid-input' || results.state === 'timeout-failure'
                ? 'blocked'
                : 'error',
          requestedResultCount: parsePositiveInteger(formValues.requestedResultCount) || null
        });
      }

      return createPageResponse(accessResult, pageState);
    }
  };
}

module.exports = {
  __private: {
    buildScheduleSnapshot,
    comparePriorityCounts,
    constraintsToFormValues,
    createConstraintLabel,
    createEmptyFormValues,
    createFieldErrors,
    formatMinutes,
    formatTimeRange,
    intersectMeetingDays,
    matchesAccountIdentifier,
    normalizeIdentifier,
    normalizeSavedSetName,
    parseConstraints,
    parseMeetingDays,
    parseProfessorList,
    parseConstraintMap,
    parseTimeToMinutes,
    parsePositiveInteger,
    rangesOverlap,
    toArray
  },
  createScheduleBuilderService
};
