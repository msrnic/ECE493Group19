# Quickstart: UC-26 Create Custom Scheduling Constraints

## Goal

Implement and verify the custom scheduling constraints flow so students can save, confirm conflicting, delete, and recover from failed saves for term-specific schedule preferences.

## Prerequisites

- Work on branch `026-branch-scheduling-constraints`.
- Preserve the protected scope artifacts:
  - `Use Cases/UC-26.md`
  - `Acceptance Tests/UC-26-AS.md`
- Follow the required stack and architecture:
  - HTML/CSS/JavaScript
  - SQLite
  - MVC separation

## Implementation Outline

1. Add backend model support for a term-scoped student `ConstraintSet` and child `SchedulingConstraint` records.
2. Add controller logic for loading existing constraints, validating submissions, handling warning confirmation, deleting a constraint, and preserving prior saved state on persistence failure.
3. Add frontend views for the constraints editor, field-level validation messages, conflict warning confirmation, save success, and save failure states.
4. Ensure schedule-generation reads only the latest saved active constraints for the selected student and term.

## Verification Checklist

1. Run `npm test && npm run lint`.
2. Verify valid save flow:
   - Add blocked time, earliest-start, and professor preference entries.
   - Save and confirm the set is available for later schedule generation.
3. Verify invalid save flow:
   - Enter malformed time data.
   - Confirm the save is rejected and the edits remain visible for correction.
4. Verify conflict warning flow:
   - Submit a logically conflicting set.
   - Confirm the system warns first and saves only after explicit confirmation.
5. Verify delete flow:
   - Remove an existing saved constraint.
   - Confirm it disappears from the saved set and is no longer applied later.
6. Verify save-failure recovery:
   - Simulate a persistence failure after a valid submission.
   - Confirm the previous saved set remains active.

## Review Focus

- MVC ownership is explicit and not mixed across view, controller, and persistence concerns.
- SQLite remains the only persistent storage.
- Error and warning messages match the UI contract and spec wording closely enough for acceptance testing.
- HTML/CSS and JavaScript changes comply with the project style guides.
