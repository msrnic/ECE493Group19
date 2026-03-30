# Quickstart: UC-27 Set Constraint Priorities

## Goal

Implement and verify the term-scoped constraint priority editor so students can save numeric priorities, receive clear invalid-value feedback, rely on consistent tie-breaking, and preserve prior saved priorities when saves fail.

## Prerequisites

- Work on branch `027-branch-constraint-priorities`.
- Preserve the protected scope artifacts:
  - `Use Cases/UC-27.md`
  - `Acceptance Tests/UC-27-AS.md`
- Follow the required stack and architecture:
  - HTML/CSS/JavaScript
  - SQLite
  - MVC separation

## Implementation Outline

1. Add backend model support for a term-scoped `PrioritySet` and child `ConstraintPrioritySetting` records.
2. Add controller logic for loading existing constraint priorities, validating submitted values, saving full replacement sets, and preserving the previous set on failure.
3. Add frontend views for editing 1-to-5 priorities, presenting invalid-value messages, explaining the tie-breaking rule, and reporting save outcomes.
4. Ensure schedule ranking reads the latest saved priority set and applies displayed constraint order when priorities tie.

## Verification Checklist

1. Run `npm test && npm run lint`.
2. Verify valid save flow:
   - Open a term with existing constraints.
   - Assign valid priorities from 1 to 5.
   - Save and confirm later schedule ranking reads the saved priorities.
3. Verify invalid-priority flow:
   - Enter an out-of-range or missing value.
   - Confirm the save is rejected and the prior saved set remains active.
4. Verify equal-priority flow:
   - Assign the same priority value to multiple constraints.
   - Confirm ranking uses displayed constraint order consistently.
5. Verify save-failure recovery:
   - Simulate a persistence failure after a valid submission.
   - Confirm the previous saved priorities remain active.

## Review Focus

- MVC ownership is explicit and not mixed across view, controller, and persistence concerns.
- SQLite remains the only persistent storage.
- Tie-breaking behavior is documented consistently across spec, contract, and implementation.
- HTML/CSS and JavaScript changes comply with the project style guides.
