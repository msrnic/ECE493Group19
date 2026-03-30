# UI Contract: Constraint Priority Editor

## Purpose

Define the user-visible interaction contract for UC-27 constraint priorities so implementation and acceptance testing share the same expected behavior.

## Actors

- **Primary actor**: Authenticated student
- **Supporting system behaviors**: Priority validation, persistence, and schedule-ranking read access

## Entry Conditions

- Student is authenticated.
- A registration term is available.
- At least one saved scheduling constraint exists for that student and term.

## UI Surfaces

### Priority Editor View

- Displays the existing constraints for the selected term.
- Displays the saved numeric priority for each eligible constraint.
- Allows editing priorities from 1 to 5, where 1 is highest.
- Displays the documented tie-breaking rule when equal priorities are allowed.
- Exposes primary actions:
  - `Save Priorities`
  - `Cancel` or return to editing

## Interaction Contract

### Save Valid Priorities

1. Student opens the priority editor for a term with existing constraints.
2. Student assigns valid numeric priorities from 1 to 5.
3. Student selects `Save Priorities`.
4. System validates the full submitted set.
5. If valid, the system saves the priority set and confirms the saved priorities will be used during later schedule ranking.

### Reject Invalid Priorities

1. Student submits one or more invalid priority values.
2. System rejects the save.
3. System identifies each invalid or incomplete assignment and explains the reason.
4. The previously saved priority set remains active.

### Handle Equal Priorities

1. Student assigns the same priority value to two or more constraints.
2. System accepts the save if all values are otherwise valid.
3. System uses displayed constraint order as the tie-breaking rule during ranking.
4. Repeated ranking with the same inputs yields the same ordering result.

### Save Failure

1. Student submits a valid priority set.
2. Persistence fails.
3. System reports the save failure.
4. The previously saved priority set remains active.

## Validation Messages

- Out-of-range values must explain that the allowed range is 1 to 5.
- Missing values must identify which constraints still need priorities.
- Unavailable or deleted referenced constraints must identify the affected priority setting and require review.

## Accessibility Expectations

- Validation, confirmation, and failure messages must be readable without technical interpretation.
- Edit, save, and review actions must remain available through keyboard interaction.

## Acceptance Mapping

- `AT-UC27-01`: Save valid priorities
- `AT-UC27-02`: Reject invalid priority values
- `AT-UC27-03`: Save failure
- `AT-UC27-04`: Equal-priority tie-breaking behavior
