# UI Contract: Constraints Editor

## Purpose

Define the user-visible interaction contract for UC-26 custom scheduling constraints so implementation and acceptance testing share the same expected editor behavior.

## Actors

- **Primary actor**: Authenticated student
- **Supporting system behaviors**: Constraint validation, persistence, and schedule-generation read access

## Entry Conditions

- Student is authenticated.
- A registration term is available.
- The schedule builder is open for that term.

## UI Surfaces

### Constraints Editor View

- Displays the current saved constraint set for the selected term.
- Allows adding, editing, and deleting:
  - Blocked time constraints
  - Earliest-start preferences
  - Professor preferences
- Exposes primary actions:
  - `Save Constraints`
  - `Delete Constraint`
  - `Confirm Save Anyway` when warning state exists
  - `Cancel` or return to editing

## Interaction Contract

### Save Valid Constraints

1. Student enters one or more valid constraints.
2. Student selects `Save Constraints`.
3. System validates all entries.
4. If no invalid or warning conditions exist, the system saves the submitted set and shows a success confirmation.

### Reject Invalid Constraints

1. Student submits malformed or incomplete constraints.
2. System blocks save completion.
3. System highlights each invalid entry and shows a correction message tied to that entry.
4. The editor continues showing the student’s unsaved edits for correction.

### Confirm Conflicting Constraints

1. Student submits constraints that conflict with each other but remain eligible for confirmation.
2. System shows a warning state explaining that the saved set may prevent viable schedules or contain contradictory preferences.
3. System offers two next actions:
   - Return to editing
   - Explicitly confirm saving the conflicting set
4. Save completes only if the student selects the explicit confirmation action.

### Delete Existing Constraint

1. Student selects a saved constraint.
2. Student selects `Delete Constraint`.
3. If confirmation is required, the system asks for confirmation before removal.
4. After successful deletion, the removed constraint no longer appears in the saved list and is no longer used by later schedule generation.

### Save Failure

1. Student submits a valid or confirmed-warning constraint set.
2. Persistence fails.
3. System shows a save failure message.
4. The previously saved constraint set remains the active set for later schedule generation.

## Validation Messages

- Invalid time ranges must explain that the time entry is malformed or incomplete.
- Invalid professor preferences must explain that the selected instructor is unavailable for the selected term context.
- Conflict warnings must explain that the current combination is contradictory or may prevent viable schedule generation.

## Accessibility Expectations

- Error, warning, confirmation, and success messages must be readable without technical interpretation.
- Primary actions and corrective actions must remain available through keyboard interaction.

## Acceptance Mapping

- `AT-UC26-01`: Save valid constraints
- `AT-UC26-02`: Reject invalid constraints
- `AT-UC26-03`: Confirm conflicting constraints
- `AT-UC26-04`: Save failure
- `AT-UC26-05`: Delete existing constraint
