# UC-25 Acceptance Test Suite — Enroll in All Courses

## Coverage Map
- Main Success Scenario
- Extensions 4a, 4b, 4c
- Extension 4d (explicit all-or-nothing atomic rollback)
- Extension 5a (system error)
- Success and Failed End Conditions

## AT-UC25-01 — Successful batch enrollment
Preconditions: Authenticated; eligible; enrollment open
Steps:
1. Select valid schedule.
2. Choose Enroll All.
Expected Results:
- All enrollable sections added.
- Summary of enrollments displayed.

## AT-UC25-02 — Section full
Steps:
1. Attempt enrollment where one section is full.
Expected Results:
- Remaining sections enrolled per policy.
- Capacity failure reported.

## AT-UC25-03 — Real-time conflict
Steps:
1. Induce time conflict at enrollment time.
Expected Results:
- Conflicting enrollment blocked.
- Consistent state preserved.

## AT-UC25-04 — Holds or prerequisites failure
Steps:
1. Attempt enrollment with hold or unmet prerequisite.
Expected Results:
- Affected enrollments rejected.
- Reasons displayed.

## AT-UC25-05 — System error during enrollment
Steps:
1. Simulate system error mid-transaction.
Expected Results:
- Partial work rolled back where required.
- System state consistent.

## AT-UC25-06 — All-or-nothing atomic rollback when one section fails
Preconditions: Authenticated; eligible; enrollment open; atomic enrollment policy enabled
Steps:
1. Select a schedule where at least one section will fail validation at enrollment time (for example, unmet prerequisite, active hold, or section becomes full).
2. Choose Enroll All.
Expected Results:
- System detects the failing section before committing any enrollments, or rolls back all tentative enrollments.
- No sections are enrolled (no partial enrollment occurs).
- System reports that the batch enrollment was cancelled due to atomic policy and identifies the failing section and reason.
- Student enrollment state remains unchanged from before the request.
