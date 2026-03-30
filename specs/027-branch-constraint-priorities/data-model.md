# Data Model: UC-27 Set Constraint Priorities

## Overview

The feature manages one saved constraint-priority set per authenticated student and registration term. The model must support valid save, invalid-priority rejection, equal-priority tie handling, and rollback-safe save failure behavior.

## Entities

### Student

- **Purpose**: Owns the term-scoped priority set.
- **Key Fields**:
  - `student_id`: Unique student identifier.
  - `account_status`: Indicates whether the student may use scheduling features.
- **Relationships**:
  - Owns zero or more `PrioritySet` records across terms.

### RegistrationTerm

- **Purpose**: Defines the term in which priorities apply.
- **Key Fields**:
  - `term_id`: Unique term identifier.
  - `term_name`: Human-readable term label.
  - `term_status`: Availability for scheduling and editing.
- **Relationships**:
  - Has zero or more `PrioritySet` records.
  - Provides the scope for valid constraints and ranking behavior.

### SchedulingConstraint

- **Purpose**: Represents an existing constraint that may receive a saved priority.
- **Key Fields**:
  - `constraint_id`: Unique identifier.
  - `student_id`: Owner reference.
  - `term_id`: Term reference.
  - `constraint_type`: Constraint category.
  - `constraint_status`: Availability for ranking use.
- **Relationships**:
  - May have one associated `ConstraintPrioritySetting` within a `PrioritySet` for the same student and term.

### PrioritySet

- **Purpose**: Represents the full saved collection of priority settings for one student and one term.
- **Key Fields**:
  - `priority_set_id`: Unique identifier for the saved set.
  - `student_id`: Owner reference.
  - `term_id`: Term reference.
  - `save_state`: Current persisted state of the set.
  - `last_saved_at`: Most recent successful save time.
- **Relationships**:
  - Belongs to one `Student`.
  - Belongs to one `RegistrationTerm`.
  - Contains one or more `ConstraintPrioritySetting` records when ranked constraints exist.
- **Uniqueness Rules**:
  - One active priority set per student per term.

### ConstraintPrioritySetting

- **Purpose**: Represents one saved numeric priority for one existing scheduling constraint.
- **Key Fields**:
  - `priority_setting_id`: Unique identifier.
  - `priority_set_id`: Parent set reference.
  - `constraint_id`: Referenced scheduling constraint.
  - `priority_value`: Numeric value from 1 to 5.
  - `display_order_snapshot`: Relative order used for tie-breaking.
  - `status`: Current validation or availability state.
- **Relationships**:
  - Belongs to one `PrioritySet`.
  - References one `SchedulingConstraint`.
- **Validation Rules**:
  - `priority_value` must be an integer between 1 and 5.
  - A setting cannot exist without a corresponding active constraint in the same student-term scope.

### PriorityValidationResult

- **Purpose**: Captures the outcome of validating a submitted priority set.
- **Key Fields**:
  - `result_id`: Unique identifier for the validation attempt.
  - `priority_set_id`: Submitted set reference.
  - `result_type`: `valid` or `invalid`.
  - `message_summary`: User-facing explanation of the result.
  - `affected_constraint_ids`: Referenced constraints with invalid or unavailable assignments.
- **Relationships**:
  - References one `PrioritySet`.
  - May refer to multiple `ConstraintPrioritySetting` or `SchedulingConstraint` records.

### TieBreakingRule

- **Purpose**: Defines the repeatable ranking behavior for equal priorities.
- **Key Fields**:
  - `rule_name`: Human-readable rule name.
  - `rule_basis`: The ordering basis used when priorities match.
- **Relationships**:
  - Applies to all `ConstraintPrioritySetting` records with equal `priority_value` in one `PrioritySet`.

## State Transitions

### PrioritySet.save_state

- `saved` -> `draft`: Student opens the editor and changes one or more priority values.
- `draft` -> `invalid`: Submitted values are incomplete, out of range, or tied to unavailable constraints.
- `draft` -> `saved`: Submitted values pass validation and save succeeds.
- `draft` -> `save_failed`: Save attempt fails after valid submission.
- `save_failed` -> `saved`: Student retries and a later save succeeds.

### ConstraintPrioritySetting.status

- `draft`: Value is being edited and not yet validated for save.
- `invalid`: Value is missing, out of range, or tied to an unavailable constraint.
- `active`: Value is saved and used in ranking.
- `orphaned`: Referenced constraint was deleted or became unavailable and review is required.

## Operational Rules

- A successful save replaces the previous `PrioritySet` for the same student and term.
- Save failure must not overwrite the last successfully saved `PrioritySet`.
- Equal `priority_value` entries remain valid; ranking uses `display_order_snapshot` to break ties consistently.
- If a referenced constraint becomes unavailable, the affected priority setting must be flagged for review before the updated set is relied on.
