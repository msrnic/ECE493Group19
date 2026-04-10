function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function createCourseRosterService(options) {
  function shouldFailRoster(actor) {
    const failures = new Set((options.courseRosterTestState?.failureIdentifiers || []).map(normalizeIdentifier));
    return failures.has(normalizeIdentifier(actor.email)) || failures.has(normalizeIdentifier(actor.username));
  }

  function filterStudents(students, programFilter) {
    if (!programFilter) {
      return students;
    }

    return students.filter((student) => student.programName === programFilter);
  }

  function sortStudents(students, sortKey) {
    const sorted = [...students];

    if (sortKey === 'student_id') {
      sorted.sort((left, right) => left.studentId.localeCompare(right.studentId, 'en', { sensitivity: 'base' }));
      return sorted;
    }

    sorted.sort((left, right) => left.fullName.localeCompare(right.fullName, 'en', { sensitivity: 'base' }));
    return sorted;
  }

  return {
    getRosterPage(actor, rawQuery = {}) {
      const assignedOfferings = options.courseRosterModel.listAssignedOfferings(actor.id);
      const selectedOfferingId = Number(rawQuery.offeringId || assignedOfferings[0]?.id || 0);
      const programFilter = String(rawQuery.program || '').trim();
      const sort = String(rawQuery.sort || 'name').trim() === 'student_id' ? 'student_id' : 'name';

      if (!selectedOfferingId) {
        return {
          assignedOfferings,
          filters: { program: '', sort },
          state: 'empty_offerings'
        };
      }

      const assignedOffering = options.courseRosterModel.findAssignedOffering(actor.id, selectedOfferingId);
      if (!assignedOffering) {
        const knownOffering = options.courseRosterModel.findOfferingById(selectedOfferingId);
        options.courseRosterModel.logRosterView(actor.id, selectedOfferingId, 'forbidden', options.now().toISOString());
        return {
          assignedOfferings,
          filters: { program: '', sort },
          message: knownOffering
            ? 'Access denied. You can only view rosters for offerings assigned to you.'
            : 'Course offering was not found.',
          selectedOffering: knownOffering,
          state: knownOffering ? 'forbidden' : 'not_found'
        };
      }

      if (shouldFailRoster(actor)) {
        options.courseRosterModel.logRosterView(actor.id, assignedOffering.id, 'error', options.now().toISOString());
        return {
          assignedOfferings,
          filters: { program: '', sort },
          message: 'Roster information is temporarily unavailable. Please retry.',
          selectedOffering: assignedOffering,
          state: 'error'
        };
      }

      const roster = sortStudents(
        filterStudents(options.courseRosterModel.listRosterStudents(assignedOffering.id), programFilter),
        sort
      );
      const programOptions = [...new Set(options.courseRosterModel.listRosterStudents(assignedOffering.id).map((student) => student.programName))].sort();
      const outcome = roster.length > 0 ? 'success' : 'empty';
      options.courseRosterModel.logRosterView(actor.id, assignedOffering.id, outcome, options.now().toISOString());

      return {
        assignedOfferings,
        filters: { program: programFilter, sort },
        programOptions,
        roster,
        selectedOffering: assignedOffering,
        state: roster.length > 0 ? 'ready' : 'empty_roster'
      };
    }
  };
}

module.exports = { createCourseRosterService };
