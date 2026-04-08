function formatCurrency(cents) {
  return (Number(cents || 0) / 100).toLocaleString('en-US', {
    currency: 'USD',
    minimumFractionDigits: 2,
    style: 'currency'
  });
}

function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function createEnrollmentService(options) {
  function shouldFailEnrollment(student) {
    const configured = options.enrollmentTestState?.failureIdentifiers || [];
    const failures = new Set(configured.map(normalizeIdentifier));
    return failures.has(normalizeIdentifier(student.email)) || failures.has(normalizeIdentifier(student.studentId));
  }

  return {
    evaluateEnrollment(student, offering) {
      const reasons = [];
      const holds = options.enrollmentModel.listRegistrationHolds(student.accountId);
      const completedCourses = options.enrollmentModel.listCompletedCourses(student.accountId);
      const schedule = options.enrollmentModel.listCurrentSchedule(student.accountId);

      if (holds.length > 0) {
        for (const hold of holds) {
          reasons.push({
            code: 'registration_hold',
            message: hold.reason
          });
        }
      }

      if (
        offering.prerequisiteCourseCode &&
        completedCourses.has(offering.prerequisiteCourseCode) === false
      ) {
        reasons.push({
          code: 'prerequisite',
          message: `Unmet prerequisite: ${offering.prerequisiteCourseCode}`
        });
      }

      if (offering.seatsRemaining <= 0) {
        reasons.push({
          code: 'capacity',
          message: `Course is full. ${offering.seatsRemaining} seats remaining.`
        });
      }

      if (options.enrollmentModel.hasEnrollment(student.accountId, offering.id)) {
        reasons.push({
          code: 'duplicate',
          message: 'You are already enrolled in this class offering.'
        });
      }

      for (const scheduled of schedule) {
        if (options.enrollmentModel.meetingsConflict(scheduled, offering)) {
          reasons.push({
            code: 'schedule_conflict',
            message: `Schedule conflict with ${scheduled.courseCode} ${scheduled.title}.`
          });
        }
      }

      return reasons;
    },

    enrollStudent(student, offeringId) {
      const offering = options.enrollmentModel.findOfferingById(offeringId);
      if (!offering) {
        return {
          message: 'Class offering was not found.',
          status: 'not_found'
        };
      }

      const reasons = this.evaluateEnrollment(student, offering);
      const timestamp = options.now().toISOString();
      if (reasons.length > 0) {
        options.enrollmentModel.logAttempt(
          student.accountId,
          offering.id,
          'blocked',
          reasons.map((reason) => reason.code).join(','),
          timestamp
        );
        return { offering, reasons, status: 'blocked' };
      }

      if (shouldFailEnrollment(student)) {
        options.enrollmentModel.logAttempt(
          student.accountId,
          offering.id,
          'error',
          'system_error',
          timestamp
        );
        return {
          message: 'Enrollment could not be completed right now. Please retry.',
          offering,
          status: 'error'
        };
      }

      const created = options.enrollmentModel.createEnrollment(student.accountId, offering.id, timestamp);
      if (!created) {
        const capacityReason = {
          code: 'capacity',
          message: 'Course is full. 0 seats remaining.'
        };
        options.enrollmentModel.logAttempt(
          student.accountId,
          offering.id,
          'blocked',
          capacityReason.code,
          timestamp
        );
        return { offering, reasons: [capacityReason], status: 'blocked' };
      }

      options.enrollmentModel.logAttempt(
        student.accountId,
        offering.id,
        'enrolled',
        'enrolled',
        timestamp
      );

      return {
        feeAssessment: {
          amount: formatCurrency(offering.feeChangeCents),
          status: 'current'
        },
        offering,
        status: 'enrolled'
      };
    }
  };
}

module.exports = { createEnrollmentService };
