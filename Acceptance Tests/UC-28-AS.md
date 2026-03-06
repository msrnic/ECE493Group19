# UC-28 Acceptance Test Suite — Save and Name Constraint Sets

## Coverage Map
- Main Success Scenario
- Extension 3a: Invalid or missing name
- Extension 3b: Duplicate name
- Extension 3c: Rename or delete existing constraint set
- Extension 4a: Save failure

## AT-UC28-01 — Save new constraint set
Steps:
1. Configure constraints.
2. Provide valid name.
3. Save.
Expected Results:
- Set stored under provided name.

## AT-UC28-02 — Invalid or missing name
Steps:
1. Provide empty or invalid name.
Expected Results:
- Validation error.
- Set not saved.

## AT-UC28-03 — Duplicate name
Steps:
1. Provide name matching existing set.
Expected Results:
- Prompt for rename or overwrite.
- Policy enforced.

## AT-UC28-04 — Save failure
Steps:
1. Simulate persistence failure.
Expected Results:
- Failure reported.
- No new set stored.

## AT-UC28-05 — Rename an existing constraint set
Preconditions: At least one constraint set exists and is saved
Steps:
1. Open list of saved constraint sets.
2. Select an existing set.
3. Select Rename.
4. Enter a new valid name that does not conflict with an existing set name.
5. Confirm rename.
Expected Results:
- The constraint set name is updated in storage.
- The old name no longer appears in the saved set list.
- After reload, the set appears under the new name and the stored constraints are unchanged.

## AT-UC28-06 — Delete an existing constraint set
Preconditions: At least one constraint set exists and is saved
Steps:
1. Open list of saved constraint sets.
2. Select an existing set.
3. Select Delete.
4. Confirm deletion if prompted.
Expected Results:
- The constraint set is removed from storage.
- The deleted set no longer appears in the saved set list.
- After reload, the set remains deleted and cannot be applied.
