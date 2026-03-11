# Quickstart: UC-23 Request Multiple Schedule Results

## Purpose

Validate the UC-23 multi-result schedule feature against the specification, acceptance suite, constitution constraints, and cross-cutting quality expectations.

## Prerequisites

- An authenticated student account and a logged-out state for precondition checks.
- Test data for a course set with at least 10 feasible schedules, a course set with fewer feasible schedules than requested, a timeout-after-partial-results case, and a timeout-before-results case.
- An available scheduling term and a separate unavailable-term or catalog-failure state.

## Validation Scenarios

### 1. Ranked Multi-Result Success

1. Sign in as a student and open the schedule builder.
2. Select an available scheduling term and a course set with at least 10 feasible schedules.
3. Enter a valid requested result count such as `10`.
4. Select `Generate Schedules`.
5. Confirm ranked schedule options are displayed up to the requested count.
6. Confirm no enrollment changes are applied.

### 2. Request Count Capped at 10

1. Sign in as a student with an eligible course set.
2. Enter a requested result count greater than `10`.
3. Select `Generate Schedules`.
4. Confirm the system informs the student the request was capped at `10`.
5. Confirm no more than `10` ranked schedule options are displayed.

### 3. Fewer Feasible Results Than Requested

1. Sign in as a student and select a course set with fewer feasible schedules than requested.
2. Enter a requested result count greater than the number of feasible schedules but no more than `10`.
3. Select `Generate Schedules`.
4. Confirm all feasible ranked schedules are displayed.
5. Confirm the student is informed that fewer schedules were available than requested.

### 4. Invalid Requested Count

1. Sign in as a student and open the schedule builder.
2. Enter `0`, a negative value, a blank value, or a non-numeric value as the requested result count.
3. Select `Generate Schedules`.
4. Confirm generation is blocked.
5. Confirm the system explains that a positive integer from `1` to `10` is required.

### 5. Timeout With Partial Results

1. Sign in as a student with a course set configured to time out after some schedules are found.
2. Enter a valid requested result count.
3. Select `Generate Schedules`.
4. Confirm partial ranked schedules are shown.
5. Confirm the system warns that the result set is incomplete and suggests retrying with narrower choices or a smaller request.

### 6. Timeout With No Results

1. Sign in as a student with a course set configured to time out before any schedule is found.
2. Enter a valid requested result count.
3. Select `Generate Schedules`.
4. Confirm no completed schedules are displayed.
5. Confirm the system reports the failure and suggests narrowing choices or the requested result count before retrying.

### 7. Blocked Preconditions

1. Attempt to open the flow while logged out and confirm authentication guidance is shown.
2. Sign in and repeat the flow with an unavailable term or catalog failure.
3. Confirm the system reports that scheduling is unavailable for that request.
4. Confirm no generation result list is shown in either blocked case.

## Quality Checks

### Accessibility

- Verify the request-count input, result list, and all outcome states support keyboard-only navigation.
- Verify state messages are available in text for assistive technologies.

### Privacy

- Verify the flow shows only the requesting student’s selected courses, requested result count, and returned ranked schedules.

### Performance

- Measure valid multi-result requests and confirm at least 95% display the first ranked schedule option within 10 seconds under normal operating conditions.

### Style Compliance

- Review modified HTML and CSS against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-html-css.md`.
- Review modified JavaScript against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-javascript.md`.
