function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function minutesToTimeLabel(minutes) {
  const totalMinutes = Number(minutes || 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function createClassSearchService(options) {
  function shouldFailSearch(student) {
    const failures = new Set(
      (options.classSearchTestState?.failureIdentifiers || []).map(normalizeIdentifier)
    );

    return failures.has(normalizeIdentifier(student.email)) ||
      failures.has(normalizeIdentifier(student.studentId));
  }

  function mapOffering(offering, now) {
    const updatedAt = new Date(offering.updatedAt);
    const freshnessSeconds = Math.max(0, Math.round((now.getTime() - updatedAt.getTime()) / 1000));
    const isCurrent = freshnessSeconds <= 60;

    return {
      ...offering,
      instructorName: 'Instructor unavailable',
      isCurrent,
      lastUpdatedLabel: offering.updatedAt,
      meetingTimeLabel: `${offering.meetingDays} ${minutesToTimeLabel(offering.startMinute)}`,
      staleLabel: isCurrent ? null : `Stale availability snapshot from ${offering.updatedAt}`
    };
  }

  return {
    getOfferingDetails(student, offeringId) {
      if (shouldFailSearch(student)) {
        return {
          message: 'Class details cannot be loaded right now. Please retry.',
          status: 'error'
        };
      }

      const offering = options.classOfferingModel.findAvailableOfferingById(offeringId);
      if (!offering) {
        return {
          message: 'Class offering was not found.',
          status: 'not_found'
        };
      }

      return {
        offering: mapOffering(offering, options.now()),
        status: 'success'
      };
    },

    getSearchPageData(student, rawFilters = {}) {
      const termOptions = options.classOfferingModel.listAvailableTerms();
      const filters = {
        courseNumber: String(rawFilters.courseNumber || '').trim(),
        queryText: String(rawFilters.q || '').trim(),
        subjectCode: String(rawFilters.subject || '').trim().toUpperCase(),
        termCode: String(rawFilters.term || '').trim() || termOptions[0] || ''
      };
      const hasSearchInput = Boolean(filters.queryText || filters.subjectCode || filters.courseNumber);

      if (!hasSearchInput) {
        return {
          filters,
          results: [],
          state: 'idle',
          termOptions
        };
      }

      if (shouldFailSearch(student)) {
        return {
          filters,
          results: [],
          state: 'error',
          statusMessage: 'Class search cannot be completed right now. Please retry.',
          termOptions
        };
      }

      const results = options.classOfferingModel
        .searchAvailableOfferings(filters)
        .map((offering) => mapOffering(offering, options.now()));

      return {
        filters,
        results,
        state: results.length > 0 ? 'results' : 'empty',
        termOptions
      };
    }
  };
}

module.exports = { createClassSearchService };
