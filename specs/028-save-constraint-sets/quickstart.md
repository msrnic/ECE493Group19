# Quickstart: UC-28 Save and Name Constraint Sets

## Purpose

Provide a concise path for implementing and validating UC-28 within the project's HTML/CSS/JavaScript and SQLite MVC structure.

## Preconditions

- Work on branch `028-save-constraint-sets`.
- Keep `Use Cases/UC-28.md` and `Acceptance Tests/UC-28-AS.md` unchanged.
- Preserve MVC boundaries between backend persistence and frontend interaction handling.

## Implementation Outline

1. Add SQLite persistence for named constraint sets scoped by student and term.
2. Add backend save, overwrite, rename, delete, and stale-session handling for saved sets.
3. Add frontend saved-set list and naming flows for save, overwrite confirmation, rename, delete, and failure messaging.
4. Record traceability from FR/NFR items to acceptance evidence for UC-28.

## Validation Scenarios

### Valid Save

1. Configure constraints for one term.
2. Enter a valid saved-set name.
3. Save the set.
4. Reload the saved-set list.
5. Confirm the saved set appears under the chosen name for the same student and term.

### Invalid Name

1. Attempt to save using a blank, overlength, or invalid-character name.
2. Confirm the save is rejected.
3. Confirm the system explains the correction needed and no saved set is created.

### Duplicate Name and Overwrite

1. Save a named set.
2. Attempt to save a different current constraint configuration using the same normalized name.
3. Confirm the system requires rename or explicit overwrite confirmation.
4. Confirm that overwrite replaces the prior saved set only after confirmation.

### Rename Existing Set

1. Open the saved-set list for a term with at least one saved set.
2. Rename one saved set to a valid non-conflicting name.
3. Reload the list.
4. Confirm the new name appears and the stored constraints remain unchanged.

### Delete Existing Set

1. Open the saved-set list for a term with at least one saved set.
2. Delete one saved set and confirm the delete action.
3. Reload the list.
4. Confirm the deleted set no longer appears.

### Failure Handling

1. Simulate a persistence failure during save, overwrite, rename, or delete.
2. Confirm the system reports the failure.
3. Confirm previously saved sets remain unchanged after reload.

### Stale Session Protection

1. Open the same saved-set list in two sessions.
2. Rename or delete a set in the first session.
3. Attempt a conflicting management action from the second session.
4. Confirm the second session is blocked from silently overwriting newer data and is told to refresh.
