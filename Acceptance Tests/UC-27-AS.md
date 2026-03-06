# UC-27 Acceptance Test Suite — Set Constraint Priorities

## Coverage Map
- Main Success Scenario
- Extension 3a: Invalid priority
- Extension 3b: Equal-priority tie-breaking
- Extension 5a: Save failure

## AT-UC27-01 — Assign valid priorities
Steps:
1. Assign valid numeric or ordinal priorities.
2. Save.
Expected Results:
- Priorities stored.
- Used during ranking.

## AT-UC27-02 — Invalid priority value
Steps:
1. Enter out-of-range or duplicate priority.
Expected Results:
- Validation error shown.
- No changes applied.

## AT-UC27-03 — System save failure
Steps:
1. Simulate persistence error.
Expected Results:
- Failure reported.
- Prior priorities unchanged.

## AT-UC27-04 — Equal priority values and tie-breaking behavior
Preconditions: At least two constraints exist and can be assigned the same priority
Steps:
1. Assign the same priority value to two or more constraints.
2. Save.
3. Generate schedules where both constraints influence ranking.
Expected Results:
- System accepts equal priorities if allowed by policy.
- System applies the documented tie-breaking rule consistently.
- The resulting schedule ranking reflects the tie-breaking behavior and is repeatable under the same inputs (or varies only as documented).
