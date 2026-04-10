function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function createError(statusCode, code, message, details = {}) {
  return { code, details, message, statusCode };
}

function minutesFromClock(value) {
  const match = String(value || '').trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function createOfferingAdminService(options) {
  function isAdminActor(actorAccountId) {
    const actor = options.accountModel.findById(actorAccountId);
    return actor && actor.role === 'admin' ? actor : null;
  }

  function shouldFail(action, marker) {
    const configured = new Set((options.offeringAdminTestState?.[`${action}FailureIdentifiers`] || []).map(normalizeIdentifier));
    return configured.has(normalizeIdentifier(marker));
  }

  function shouldFailAudit(marker) {
    const configured = new Set((options.offeringAdminTestState?.auditFailureIdentifiers || []).map(normalizeIdentifier));
    return configured.has(normalizeIdentifier(marker));
  }

  function buildOfferingCode(courseCode, termCode, sectionCode) {
    return `${String(courseCode).trim().toUpperCase()}-${String(termCode).trim().toUpperCase()}-${String(sectionCode).trim().toUpperCase()}`;
  }

  function validateCreate(input) {
    const fieldErrors = {};
    const startMinute = minutesFromClock(input.scheduleStartTime);
    const endMinute = minutesFromClock(input.scheduleEndTime);
    const capacity = Number(input.capacity);

    if (!String(input.courseCode || '').trim()) fieldErrors.courseCode = 'Course code is required.';
    if (!String(input.title || '').trim()) fieldErrors.title = 'Title is required.';
    if (!String(input.termCode || '').trim()) fieldErrors.termCode = 'Term is required.';
    if (!String(input.sectionCode || '').trim()) fieldErrors.sectionCode = 'Section is required.';
    if (!String(input.instructorAccountId || '').trim()) fieldErrors.instructorAccountId = 'Instructor is required.';
    if (!String(input.meetingDays || '').trim()) fieldErrors.meetingDays = 'Meeting days are required.';
    if (startMinute === null) fieldErrors.scheduleStartTime = 'Start time must use HH:MM format.';
    if (endMinute === null) fieldErrors.scheduleEndTime = 'End time must use HH:MM format.';
    if (startMinute !== null && endMinute !== null && startMinute >= endMinute) {
      fieldErrors.scheduleEndTime = 'End time must be after the start time.';
    }
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 999) {
      fieldErrors.capacity = 'Capacity must be between 1 and 999.';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return createError(400, 'VALIDATION_ERROR', 'Please correct the highlighted fields.', fieldErrors);
    }

    return {
      capacity,
      courseCode: String(input.courseCode).trim().toUpperCase(),
      endMinute,
      instructorAccountId: Number(input.instructorAccountId),
      meetingDays: String(input.meetingDays).trim(),
      scheduleEndTime: input.scheduleEndTime,
      scheduleStartTime: input.scheduleStartTime,
      sectionCode: String(input.sectionCode).trim().toUpperCase(),
      startMinute,
      termCode: String(input.termCode).trim().toUpperCase(),
      title: String(input.title).trim()
    };
  }

  return {
    createOffering(actorAccountId, input) {
      if (!isAdminActor(actorAccountId)) {
        return createError(403, 'FORBIDDEN', 'Administrative authorization is required for this action.');
      }

      const validated = validateCreate(input);
      if (validated.code) {
        return validated;
      }

      const duplicate = options.offeringAdminModel.findDuplicateIdentity({
        course_code: validated.courseCode,
        instructor_account_id: validated.instructorAccountId,
        section_code: validated.sectionCode,
        term_code: validated.termCode
      });
      if (duplicate) {
        return createError(409, 'DUPLICATE_OFFERING', 'An offering with the same course, term, instructor, and section already exists.');
      }

      const actorMarker = buildOfferingCode(validated.courseCode, validated.termCode, validated.sectionCode);
      if (shouldFail('create', actorMarker)) {
        return createError(500, 'TRANSACTION_FAILED', 'Offering could not be created right now. No catalog changes were saved.');
      }

      const timestamp = options.now().toISOString();
      const offeringCode = buildOfferingCode(validated.courseCode, validated.termCode, validated.sectionCode);
      const created = options.offeringAdminModel.createOffering({
        capacity: validated.capacity,
        course_code: validated.courseCode,
        created_at: timestamp,
        end_minute: validated.endMinute,
        instructor_account_id: validated.instructorAccountId,
        meeting_days: validated.meetingDays,
        offering_code: offeringCode,
        section_code: validated.sectionCode,
        seats_remaining: validated.capacity,
        start_minute: validated.startMinute,
        term_code: validated.termCode,
        title: validated.title,
        updated_at: timestamp
      });

      const logPayload = {
        action_type: 'add',
        actor_account_id: actorAccountId,
        created_at: timestamp,
        failure_reason: null,
        offering_code: created.offeringCode,
        offering_id: created.id,
        outcome: 'success',
        override_reason: null,
        override_used: 0
      };

      if (shouldFailAudit(created.offeringCode)) {
        options.offeringAdminModel.queueAuditRetry({
          attempt_count: 0,
          created_at: timestamp,
          last_error: 'Audit logging pending retry.',
          log_payload_json: JSON.stringify(logPayload),
          next_attempt_at: new Date(options.now().getTime() + 60 * 1000).toISOString(),
          updated_at: timestamp
        });
        return {
          message: 'Offering created successfully, but audit logging is pending retry.',
          offering: created,
          pendingAudit: true,
          statusCode: 201
        };
      }

      options.offeringAdminModel.logChange(logPayload);
      return {
        message: 'Offering created successfully.',
        offering: created,
        pendingAudit: false,
        statusCode: 201
      };
    },

    deleteOffering(actorAccountId, offeringId, details = {}) {
      if (!isAdminActor(actorAccountId)) {
        return createError(403, 'FORBIDDEN', 'Administrative authorization is required for this action.');
      }

      const offering = options.offeringAdminModel.findOfferingById(Number(offeringId));
      if (!offering) {
        return createError(404, 'NOT_FOUND', 'Course offering was not found.');
      }

      if (!details.confirmDelete) {
        return createError(400, 'VALIDATION_ERROR', 'Deletion must be explicitly confirmed.');
      }

      const activeEnrollments = options.offeringAdminModel.readActiveEnrollmentCount(offering.id);
      const overrideConfirmed = details.overrideConfirmed === true || details.overrideConfirmed === 'true';
      const overrideReason = String(details.overrideReason || '').trim();

      if (activeEnrollments > 0 && !overrideConfirmed) {
        return createError(409, 'ACTIVE_ENROLLMENTS', 'Active enrollments prevent deletion unless override deletion is explicitly confirmed.', {
          activeEnrollmentCount: activeEnrollments
        });
      }

      if (activeEnrollments > 0 && overrideConfirmed && overrideReason.length < 5) {
        return createError(400, 'VALIDATION_ERROR', 'Override reason is required for deletion with active enrollments.', {
          overrideReason: 'Provide an override reason with at least 5 characters.'
        });
      }

      if (shouldFail('delete', offering.offeringCode)) {
        return createError(500, 'TRANSACTION_FAILED', 'Offering could not be deleted right now. No catalog changes were saved.');
      }

      const removed = options.offeringAdminModel.deleteOffering(offering.id);
      if (!removed) {
        return createError(409, 'CONFLICT', 'Offering could not be deleted because its state changed.');
      }

      const timestamp = options.now().toISOString();
      const logPayload = {
        action_type: 'delete',
        actor_account_id: actorAccountId,
        created_at: timestamp,
        failure_reason: null,
        offering_code: offering.offeringCode,
        offering_id: null,
        outcome: 'success',
        override_reason: overrideConfirmed ? overrideReason : null,
        override_used: overrideConfirmed ? 1 : 0
      };

      if (shouldFailAudit(offering.offeringCode)) {
        options.offeringAdminModel.queueAuditRetry({
          attempt_count: 0,
          created_at: timestamp,
          last_error: 'Audit logging pending retry.',
          log_payload_json: JSON.stringify(logPayload),
          next_attempt_at: new Date(options.now().getTime() + 60 * 1000).toISOString(),
          updated_at: timestamp
        });
        return {
          message: 'Offering deleted successfully, but audit logging is pending retry.',
          pendingAudit: true,
          statusCode: 200
        };
      }

      options.offeringAdminModel.logChange(logPayload);
      return {
        message: 'Offering deleted successfully.',
        pendingAudit: false,
        statusCode: 200
      };
    },

    getFormState(actorAccountId) {
      if (!isAdminActor(actorAccountId)) {
        return {
          instructors: [],
          offerings: [],
          ...createError(403, 'FORBIDDEN', 'Administrative authorization is required for this action.')
        };
      }

      return {
        instructors: options.offeringAdminModel.listInstructorOptions(),
        offerings: options.offeringAdminModel.listOfferings(),
        statusCode: 200
      };
    }
  };
}

module.exports = { createOfferingAdminService };
