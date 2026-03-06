# UC-31 Acceptance Test Suite — Show Violated Constraints

## Coverage Map
- Main Success Scenario
- Extension 2a: No violations
- Extension 4a: Incomplete evaluation
- Extension 5a: System error

## AT-UC31-01 — Display violated constraints
Preconditions: Authenticated student; best-effort schedule generated
Steps:
1. Select best-effort schedule.
2. Request constraint details.
Expected Results:
- System lists violated constraints.
- Each violation includes explanation and severity.

## AT-UC31-02 — No constraints violated
Steps:
1. Select schedule with all constraints satisfied.
Expected Results:
- System indicates no constraints were violated.

## AT-UC31-03 — Incomplete evaluation due to missing data
Steps:
1. Simulate missing timetable data.
2. Request violation details.
Expected Results:
- System flags evaluation as incomplete.
- Unknown portions clearly identified.

## AT-UC31-04 — System error during evaluation
Steps:
1. Simulate evaluation service failure.
Expected Results:
- Failure message displayed.
- No partial or misleading violation list shown.