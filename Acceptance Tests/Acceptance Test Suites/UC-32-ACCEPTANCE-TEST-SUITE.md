# UC-32 Acceptance Test Suite — View Enrolled Students

## Coverage Map
- Main Success Scenario
- Extension 2a: Empty roster
- Extension 3a: Unauthorized access
- Extension 5a: System error
- Filtering and sorting behavior (roster view)

## AT-UC32-01 — View enrolled students
Preconditions: Authenticated professor; assigned to offering; system online
Steps:
1. Log in as professor.
2. Navigate to My Course Offerings.
3. Select offering.
Expected Results:
- System displays accurate roster including name, ID, and program.

## AT-UC32-02 — Empty roster
Steps:
1. Select offering with no enrolled students.
Expected Results:
- System displays empty-state message.

## AT-UC32-03 — Unauthorized access attempt
Steps:
1. Attempt to access offering not assigned to professor.
Expected Results:
- Access denied.
- Authorization error displayed.

## AT-UC32-04 — System error retrieving roster
Steps:
1. Simulate data retrieval failure.
Expected Results:
- Failure message displayed.
- No partial roster shown.

## AT-UC32-05 — Filter and sort roster view
Preconditions: Authenticated professor; assigned to offering; offering has multiple enrolled students across different programs; system online
Steps:
1. Log in as professor.
2. Navigate to My Course Offerings.
3. Select offering.
4. Apply a filter on the roster (e.g., Program = "Software Engineering").
5. Verify the roster list updates to show only students matching the filter.
6. Change sorting on the roster (e.g., sort by Student Name ascending).
7. Verify the displayed roster order updates correctly according to the selected sort.
8. Clear the filter.
Expected Results:
- After filtering, only students matching the selected filter criteria are displayed.
- After sorting, the currently displayed roster is ordered correctly (e.g., alphabetical by name when Name ascending is selected).
- Clearing the filter restores the full roster for the offering.
- Filtering/sorting does not bypass authorization; the roster is only visible for offerings the professor is assigned to.
