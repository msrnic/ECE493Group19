# Quickstart: UC-25 Enroll in All Courses from a Chosen Schedule Option

## Goal

Validate that the UC-25 planning scope covers all required batch-enrollment outcomes before task generation and implementation.

## Preconditions

- An authenticated student account exists and is eligible to enroll.
- Enrollment is open for the relevant term.
- A selected schedule option exists with concrete section selections.
- Enrollment, holds, and course data are available unless a scenario explicitly simulates an outage.

## Scenario 1: Successful batch enrollment

Source: `AT-UC25-01`

1. Select a valid schedule option with enrollable sections.
2. Submit Enroll All.
3. Confirm the final state is `success`.
4. Confirm all enrollable sections are added and the summary reports the enrolled sections.

## Scenario 2: Section full under default partial-success policy

Source: `AT-UC25-02`

1. Select a schedule option where one section is full at enrollment time.
2. Submit Enroll All with atomic policy disabled.
3. Confirm the final state is `partial_success`.
4. Confirm safe sections enroll and the full section is reported with a capacity reason.

## Scenario 3: Real-time conflict or eligibility failure

Source: `AT-UC25-03`, `AT-UC25-04`

1. Select a schedule option where one section will conflict in real time or fail due to hold/prerequisite.
2. Submit Enroll All with atomic policy disabled.
3. Confirm affected sections are blocked or rejected with explicit reasons.
4. Confirm the final state remains consistent and reports all section outcomes.

## Scenario 4: System error during batch enrollment

Source: `AT-UC25-05`

1. Simulate a system error after batch processing has started.
2. Submit Enroll All.
3. Confirm the final state is `failure`.
4. Confirm partial work is rolled back where required and the student's final enrollment state is consistent.

## Scenario 5: Atomic-policy cancellation

Source: `AT-UC25-06`

1. Enable atomic enrollment policy.
2. Select a schedule option where at least one section will fail validation or enrollment.
3. Submit Enroll All.
4. Confirm the final state is `atomic_cancelled`.
5. Confirm no sections are enrolled from the batch and the student's enrollment state remains unchanged.

## Notes

- Partial success is the default behavior unless atomic enrollment policy is explicitly enabled.
- Waitlist behavior is out of scope.
- Final summaries must remain user-visible, accessible, and consistent with per-section outcomes.
