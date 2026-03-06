# UC-26 Acceptance Test Suite — Create Custom Scheduling Constraints

## Coverage Map
- Main Success Scenario
- Extension 4a: Invalid definition
- Extension 4b: Conflicting constraints
- Extension 4c: Delete existing constraint
- Extension 5a: Save failure

## AT-UC26-01 — Create valid constraints
Steps:
1. Define valid constraint.
2. Save.
Expected Results:
- Constraint stored and available for generation.

## AT-UC26-02 — Invalid constraint definition
Steps:
1. Enter malformed time range.
2. Save.
Expected Results:
- Validation error shown.
- Constraint not saved.

## AT-UC26-03 — Conflicting constraints
Steps:
1. Define logically conflicting constraints.
Expected Results:
- Warning displayed.
- Revision allowed per policy.

## AT-UC26-04 — System save failure
Steps:
1. Simulate persistence error.
Expected Results:
- Failure reported.
- No constraints stored.

## AT-UC26-05 — Delete an existing constraint
Preconditions: At least one constraint exists and is saved
Steps:
1. Open the Constraints Editor.
2. Select an existing constraint.
3. Select Delete.
4. Confirm deletion if prompted.
Expected Results:
- The constraint is removed from storage.
- The deleted constraint no longer appears in the constraint list.
- Subsequent schedule generation does not apply the deleted constraint.
