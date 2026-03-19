# UI Contract: UC-28 Saved Constraint Set Management

## Purpose

Define the user-facing contract for saving, overwriting, renaming, deleting, and listing named constraint sets for one authenticated student in one selected term.

## Actors

- Authenticated student
- Saved-set management controller

## Views and Actions

### Save Current Constraint Set

Input:
- Selected term
- Current constraint configuration
- Proposed saved-set name

System behavior:
- Validate the name against trimming, length, and allowed-character rules.
- Reject invalid names with plain-language correction guidance.
- Detect duplicate normalized names within the same student and term.
- If no duplicate exists, save the full current constraint set under the provided name.
- If a duplicate exists, present rename-or-overwrite choices before changing stored data.

Success result:
- Visible confirmation that the named set was saved.
- Updated saved-set list includes the saved name for the same term.

### Overwrite Existing Named Set

Precondition:
- Proposed name matches an existing saved set by normalized comparison within the same student and term.

System behavior:
- Present overwrite confirmation identifying the affected existing saved set.
- On explicit confirmation, replace the stored constraint snapshot for that normalized name with the current constraint configuration.
- Keep only one saved set for that normalized name after overwrite.

Success result:
- Visible confirmation that the existing named set was updated.
- Saved-set list continues to show a single entry for that normalized name.

### Rename Existing Named Set

Input:
- Selected saved set
- New proposed name

System behavior:
- Apply the same naming validation and duplicate comparison rules used for initial save.
- Reject invalid or conflicting rename requests.
- On success, update only the saved-set name and preserve the stored constraint snapshot.

Success result:
- Updated name appears in the saved-set list after reload.
- Old name no longer appears.

### Delete Existing Named Set

Input:
- Selected saved set
- Explicit delete confirmation

System behavior:
- Require explicit confirmation before removal.
- Remove the saved set from the student's term-scoped saved-set list.

Success result:
- Deleted name no longer appears in the saved-set list after reload.

### Failure and Refresh Handling

System behavior:
- If persistence fails, report failure and leave previously saved sets unchanged.
- If a stale session attempts to overwrite newer saved-set changes, block the action and require refresh before retry.

Failure result:
- Student sees the affected set and the next step: correct, confirm, retry, or refresh.

## Traceability

- `AT-UC28-01`: Save new constraint set
- `AT-UC28-02`: Invalid or missing name
- `AT-UC28-03`: Duplicate name
- `AT-UC28-04`: Save failure
- `AT-UC28-05`: Rename an existing constraint set
- `AT-UC28-06`: Delete an existing constraint set
