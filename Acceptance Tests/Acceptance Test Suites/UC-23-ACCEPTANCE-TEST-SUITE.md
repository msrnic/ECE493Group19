# UC-23 Acceptance Test Suite Design — Request Multiple Schedule Results

Based on:
- UC-23 Use Case specification
- UC-23 Use Case Scenarios

## 1. Scope and Purpose
This acceptance test suite validates that a student can request multiple ranked schedule results and that the system correctly handles all documented extensions and precondition failures in UC-23.

## 2. Assumptions and Definitions
- N: number of requested schedule results entered by the student.
- MAX_RESULTS: system-defined maximum number of results the UI or API will return for a single request.
- The schedule generator ranks schedules deterministically or with a documented ranking policy.
- Partial results means at least one schedule option is produced before a timeout or compute limit is reached.

## 3. Test Environment and Data Setup
### Accounts and Roles
- Student account: student_valid (authenticated, eligible)
- Student account: student_invalid_session (not authenticated)

### Term and Catalog States
- TERM_OK: available and open for schedule building
- TERM_UNAVAILABLE: not available, or catalog cannot be loaded

### Course Sets
- COURSES_MANY: course selection that yields many feasible schedules (at least MAX_RESULTS)
- COURSES_FEW: course selection that yields fewer feasible schedules (K less than N)
- COURSES_HARD: course selection that is computationally expensive and can be configured to force timeout conditions

## 4. Coverage Map
- Main Success Scenario: UC-23-S1
- Extension 2a (cap max results): UC-23-S2
- Extension 3a (invalid numeric input): UC-23-S3
- Extension 5a (fewer feasible schedules): UC-23-S4
- Extension 4a (timeout): UC-23-S5 and UC-23-S6
- Preconditions: UC-23-S7 and UC-23-S8

---

## 5. Acceptance Test Cases

### AT-UC23-01 — Generate N schedule options (Main Success)
Maps to: UC-23-S1

Preconditions: Authenticated student, TERM_OK, catalog available, COURSES_MANY loaded

Input: N equals 10 and N less than or equal to MAX_RESULTS

Steps:
1. Log in as student_valid.
2. Open Schedule Builder for TERM_OK with COURSES_MANY selected.
3. Enter N equal to 10 for Number of results.
4. Select Generate Schedules.

Expected Results:
- Request is accepted and processed.
- System returns up to N distinct schedule options.
- Results are ranked and displayed.

---

### AT-UC23-02 — Requested number exceeds system maximum (cap to MAX_RESULTS)
Maps to: UC-23-S2

Preconditions: Authenticated student, TERM_OK, catalog available, COURSES_MANY loaded

Input: N equals MAX_RESULTS plus 5

Steps:
1. Log in as student_valid.
2. Open Schedule Builder for TERM_OK with COURSES_MANY selected.
3. Enter N greater than MAX_RESULTS.
4. Select Generate Schedules.

Expected Results:
- System caps requested N to MAX_RESULTS.
- Student is informed that results are capped.
- System displays up to MAX_RESULTS schedule options.

---

### AT-UC23-03 — Invalid number of requested results (zero)
Maps to: UC-23-S3

Preconditions: Authenticated student, TERM_OK, catalog available

Input: N equals 0

Steps:
1. Log in as student_valid.
2. Open Schedule Builder.
3. Enter N equal to 0.
4. Select Generate Schedules.

Expected Results:
- Validation error indicates a positive integer is required.
- No generation request is submitted.
- Student can correct input and retry.

---

### AT-UC23-04 — Invalid number of requested results (negative)
Maps to: UC-23-S3

Preconditions: Authenticated student, TERM_OK, catalog available

Input: N equals -3

Steps:
1. Log in as student_valid.
2. Open Schedule Builder.
3. Enter N equal to -3.
4. Select Generate Schedules.

Expected Results:
- Validation error indicates a positive integer is required.
- No generation request is submitted.

---

### AT-UC23-05 — Invalid number of requested results (non-numeric)
Maps to: UC-23-S3

Preconditions: Authenticated student, TERM_OK, catalog available

Input: N equals a non-numeric string

Steps:
1. Log in as student_valid.
2. Open Schedule Builder.
3. Enter a non-numeric value for N.
4. Select Generate Schedules.

Expected Results:
- Validation error is shown.
- No generation request is submitted.

---

### AT-UC23-06 — Fewer feasible schedules exist than requested
Maps to: UC-23-S4

Preconditions: Authenticated student, TERM_OK, catalog available, COURSES_FEW loaded

Input: N equals 10 and feasible schedules K less than 10

Steps:
1. Log in as student_valid.
2. Open Schedule Builder for TERM_OK with COURSES_FEW selected.
3. Enter N equal to 10.
4. Select Generate Schedules.

Expected Results:
- System returns all feasible schedules (K).
- System informs student fewer schedules were found than requested.

---

### AT-UC23-07 — Timeout with partial results
Maps to: UC-23-S5

Preconditions: Authenticated student, TERM_OK, catalog available, COURSES_HARD configured to time out after partial results

Input: N equals 10

Steps:
1. Log in as student_valid.
2. Open Schedule Builder for TERM_OK with COURSES_HARD selected.
3. Enter N equal to 10.
4. Select Generate Schedules.
5. Induce generator timeout after at least one schedule is found.

Expected Results:
- System displays partial schedules.
- System warns results are incomplete due to timeout.

---

### AT-UC23-08 — Timeout with no results
Maps to: UC-23-S6

Preconditions: Authenticated student, TERM_OK, catalog available, COURSES_HARD configured to time out before any schedule is produced

Input: N equals 10

Steps:
1. Log in as student_valid.
2. Open Schedule Builder.
3. Enter N equal to 10.
4. Select Generate Schedules.
5. Induce generator timeout before any schedule is produced.

Expected Results:
- No schedules are displayed.
- Error indicates generation failed.
- System suggests narrowing choices and retrying.

---

### AT-UC23-09 — Preconditions not met: student not authenticated
Maps to: UC-23-S7

Preconditions: No authenticated session

Steps:
1. Attempt to open Schedule Builder while logged out.

Expected Results:
- System redirects to login.
- No schedule generation occurs before authentication.

---

### AT-UC23-10 — Preconditions not met: term unavailable or catalog data unavailable
Maps to: UC-23-S8

Preconditions: Authenticated student, TERM_UNAVAILABLE or catalog service failure

Steps:
1. Log in as student_valid.
2. Open Schedule Builder for TERM_UNAVAILABLE or simulate catalog retrieval failure.

Expected Results:
- System informs student scheduling is unavailable and offers retry or alternate term.
- No generation request is executed.

---

## 6. Exit Criteria
UC-23 acceptance is met when all test cases AT-UC23-01 through AT-UC23-10 pass in the target environment and any open issues are resolved or explicitly accepted with documented risk.

