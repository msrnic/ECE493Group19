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
  function hasConfiguredIdentifierMatch(student, configuredIdentifiers) {
    const failures = new Set((configuredIdentifiers || []).map(normalizeIdentifier));
    return failures.has(normalizeIdentifier(student.email)) || failures.has(normalizeIdentifier(student.studentId));
  }

  function shouldFailEnrollment(student) {
    return hasConfiguredIdentifierMatch(student, options.enrollmentTestState?.failureIdentifiers || []);
  }

  function shouldFailWaitlist(student) {
    return hasConfiguredIdentifierMatch(student, options.enrollmentTestState?.waitlistFailureIdentifiers || []);
  }

  function shouldFailWithdrawal(student) {
    return hasConfiguredIdentifierMatch(
      student,
      options.enrollmentTestState?.withdrawalFailureIdentifiers || []
    );
  }

  function shouldFailRemoval(student) {
    return hasConfiguredIdentifierMatch(
      student,
      options.enrollmentTestState?.removalFailureIdentifiers || []
    );
  }

  function isCapacityUnavailable(student) {
    return hasConfiguredIdentifierMatch(
      student,
      options.enrollmentTestState?.capacityUnavailableIdentifiers || []
    );
  }

  function isRemainingSeatsUnavailable(student) {
    return hasConfiguredIdentifierMatch(
      student,
      options.enrollmentTestState?.remainingSeatsUnavailableIdentifiers || []
    );
  }

  function isWaitlistTermClosed(student) {
    return hasConfiguredIdentifierMatch(
      student,
      options.enrollmentTestState?.waitlistClosedTermIdentifiers || []
    );
  }

  function buildWithdrawalImplications(offering) {
    return {
      feeImpactSummary: `The current class charge of ${formatCurrency(offering.feeChangeCents)} remains applied after withdrawal.`,
      transcriptImpact: 'A W notation will appear on your transcript for this class.'
    };
  }

  function buildDropImplications(offering) {
    return {
      feeImpactSummary: `Drop policy applies. ${formatCurrency(offering.feeChangeCents)} will be reduced or refunded per deadline rules.`,
      transcriptImpact: 'This removal will be processed as a drop before the deadline.'
    };
  }

  function buildWaitlistAlternatives(offering) {
    return options.enrollmentModel.listWaitlistAlternatives(offering).map((alternative) => ({
      ...alternative,
      actionLabel: alternative.seatsRemaining > 0 ? 'Enroll instead' : alternative.waitlistEnabled ? 'Waitlist option available' : 'Review section'
    }));
  }

  return {
    getCourseCapacityView(student) {
      const hideCapacity = isCapacityUnavailable(student);
      const hideRemainingSeats = isRemainingSeatsUnavailable(student);

      return options.enrollmentModel.listCurrentSchedule(student.accountId).map((offering) => ({
        ...offering,
        capacity: hideCapacity ? null : offering.capacity,
        seatsRemaining: hideRemainingSeats ? null : offering.seatsRemaining
      }));
    },

    getCurrentWaitlists(student) {
      return options.enrollmentModel.listCurrentWaitlists(student.accountId);
    },

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

    evaluateWaitlist(student, offering) {
      const reasons = [];

      if (offering.seatsRemaining > 0) {
        reasons.push({
          code: 'open_seats',
          message: 'This section has seats available. Enroll directly instead of joining the waitlist.'
        });
      }

      if (!offering.waitlistEnabled) {
        reasons.push({
          code: 'waitlist_unavailable',
          message: 'Waitlist unavailable for this section. Try another section or course.'
        });
      }

      for (const hold of options.enrollmentModel.listRegistrationHolds(student.accountId)) {
        reasons.push({
          code: 'registration_hold',
          message: `${hold.reason} Resolve the registration hold before retrying.`
        });
      }

      if (isWaitlistTermClosed(student)) {
        reasons.push({
          code: 'term_closed',
          message: 'The registration term is closed for waitlisting. Wait for an open registration term before retrying.'
        });
      }

      if (options.enrollmentModel.hasEnrollment(student.accountId, offering.id)) {
        reasons.push({
          code: 'already_enrolled',
          message: 'You are already enrolled in this class offering.'
        });
      }

      if (options.enrollmentModel.hasWaitlist(student.accountId, offering.id)) {
        reasons.push({
          code: 'already_waitlisted',
          message: 'You are already waitlisted for this class offering.'
        });
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
    },

    getWaitlistPreview(student, offeringId) {
      const offering = options.enrollmentModel.findOfferingById(offeringId);
      if (!offering) {
        return {
          message: 'Class offering was not found.',
          status: 'not_found'
        };
      }

      const alternatives = buildWaitlistAlternatives(offering);
      const reasons = this.evaluateWaitlist(student, offering);
      if (reasons.length > 0) {
        return {
          alternatives,
          message: 'Waitlist request was blocked.',
          offering,
          reasons,
          status: 'blocked'
        };
      }

      return {
        offering,
        status: 'ready'
      };
    },

    joinWaitlist(student, offeringId) {
      const preview = this.getWaitlistPreview(student, offeringId);
      if (preview.status !== 'ready') {
        if (preview.status === 'blocked') {
          options.enrollmentModel.logWaitlistAttempt(
            student.accountId,
            offeringId,
            'blocked',
            preview.reasons.map((reason) => reason.code).join(','),
            options.now().toISOString()
          );
        }
        return preview;
      }

      const timestamp = options.now().toISOString();
      if (shouldFailWaitlist(student)) {
        options.enrollmentModel.logWaitlistAttempt(
          student.accountId,
          offeringId,
          'error',
          'system_error',
          timestamp
        );
        return {
          message: 'Waitlist request could not be completed right now. No waitlist entry was created.',
          offering: preview.offering,
          status: 'error'
        };
      }

      const created = options.enrollmentModel.createWaitlist(student.accountId, offeringId, {
        createdAt: timestamp,
        usesPosition: preview.offering.waitlistUsesPosition
      });

      if (!created) {
        options.enrollmentModel.logWaitlistAttempt(
          student.accountId,
          offeringId,
          'error',
          'create_failed',
          timestamp
        );
        return {
          message: 'Waitlist request could not be completed right now. No waitlist entry was created.',
          offering: preview.offering,
          status: 'error'
        };
      }

      options.enrollmentModel.logWaitlistAttempt(
        student.accountId,
        offeringId,
        'waitlisted',
        'waitlisted',
        timestamp
      );

      return {
        offering: preview.offering,
        status: 'waitlisted',
        waitlistPosition: created.waitlistPosition,
        waitlistStatus: created.waitlistStatus
      };
    },

    getWithdrawalPreview(student, offeringId) {
      const offering = options.enrollmentModel.findCurrentEnrollment(student.accountId, offeringId);
      if (!offering) {
        return {
          message: 'This class is no longer in your current schedule.',
          status: 'not_found'
        };
      }

      return {
        implications: buildWithdrawalImplications(offering),
        offering,
        status: 'ready'
      };
    },

    withdrawStudent(student, offeringId) {
      const preview = this.getWithdrawalPreview(student, offeringId);
      if (preview.status !== 'ready') {
        return preview;
      }

      if (shouldFailWithdrawal(student)) {
        return {
          message: 'Withdrawal could not be completed right now. Please retry.',
          offering: preview.offering,
          status: 'error'
        };
      }

      const createdAt = options.now().toISOString();
      const withdrawn = options.enrollmentModel.createWithdrawal(student.accountId, offeringId, {
        createdAt,
        feeImpactSummary: preview.implications.feeImpactSummary,
        transcriptImpact: preview.implications.transcriptImpact
      });

      if (!withdrawn) {
        return {
          message: 'This class is no longer in your current schedule.',
          status: 'not_found'
        };
      }

      return {
        implications: preview.implications,
        offering: preview.offering,
        status: 'withdrawn'
      };
    },

    getRemovalPreview(student, offeringId) {
      const offering = options.enrollmentModel.findCurrentEnrollment(student.accountId, offeringId);
      if (!offering) {
        return {
          message: 'This class is no longer in your current schedule.',
          status: 'not_found'
        };
      }

      const policy = options.deadlinePolicyService.classifyRemovalForOffering(student, offering);
      if (policy.state !== 'ready') {
        return {
          message: policy.message,
          status: 'blocked'
        };
      }

      const implications = policy.classification === 'drop'
        ? buildDropImplications(offering)
        : buildWithdrawalImplications(offering);

      return {
        classification: policy.classification,
        deadlineLabel: policy.deadlineLabel,
        implications,
        offering,
        status: 'ready',
        timezoneName: policy.timezoneName
      };
    },

    removeStudent(student, offeringId) {
      const preview = this.getRemovalPreview(student, offeringId);
      if (preview.status !== 'ready') {
        return preview;
      }

      if (shouldFailRemoval(student)) {
        return {
          classification: preview.classification,
          deadlineLabel: preview.deadlineLabel,
          implications: preview.implications,
          message: 'The selected class removal could not be completed. Please refresh your schedule and retry.',
          offering: preview.offering,
          status: 'error',
          timezoneName: preview.timezoneName
        };
      }

      const createdAt = options.now().toISOString();
      const success = preview.classification === 'drop'
        ? options.enrollmentModel.createDrop(student.accountId, offeringId, {
            createdAt,
            feeImpactSummary: preview.implications.feeImpactSummary
          })
        : options.enrollmentModel.createWithdrawal(student.accountId, offeringId, {
            createdAt,
            feeImpactSummary: preview.implications.feeImpactSummary,
            transcriptImpact: 'A W notation will appear on your transcript for this class.'
          });

      if (!success) {
        return {
          classification: preview.classification,
          deadlineLabel: preview.deadlineLabel,
          implications: preview.implications,
          message: 'The selected class removal could not be completed. Please refresh your schedule and retry.',
          offering: preview.offering,
          status: 'error',
          timezoneName: preview.timezoneName
        };
      }

      return {
        classification: preview.classification,
        deadlineLabel: preview.deadlineLabel,
        implications: preview.implications,
        offering: preview.offering,
        status: 'removed',
        timezoneName: preview.timezoneName
      };
    }
  };
}

module.exports = { createEnrollmentService };
