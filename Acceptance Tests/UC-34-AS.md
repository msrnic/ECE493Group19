# UC-34 Acceptance Test Suite — Enter Final Grades

## Coverage Map
- Main Success Scenario
- Extension 3a: Invalid grade value
- Extension 4a: Save failure
- Draft vs submitted behavior

## AT-UC34-01 — Enter and save valid grades
Preconditions: Authenticated professor; assigned to offering
Steps:
1. Open grade entry page.
2. Enter valid grade values.
3. Save as draft or submitted.
Expected Results:
- Grades validated and stored.
- Confirmation message displayed.

## AT-UC34-02 — Invalid grade value
Steps:
1. Enter invalid grade format.
2. Attempt to save.
Expected Results:
- System highlights invalid entries.
- Submission prevented for invalid grades.

## AT-UC34-03 — Draft versus submitted state handling
Steps:
1. Save grades as draft.
2. Verify draft status.
3. Submit grades.
Expected Results:
- System updates status from draft to submitted.
- Records reflect final state.

## AT-UC34-04 — Save failure
Steps:
1. Simulate persistence error.
2. Attempt to save grades.
Expected Results:
- System informs professor of failure.
- No grades are recorded.
- System state remains consistent.