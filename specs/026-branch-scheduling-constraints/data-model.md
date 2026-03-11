# Data Model: UC-26 Create Custom Scheduling Constraints

## Overview

The feature manages one saved scheduling-constraint set per authenticated student and registration term. The model must support create, update, delete, validation warnings, and rollback-safe save failure behavior.

## Entities

### Student

- **Purpose**: Owns the scheduling constraint set for a term.
- **Key Fields**:
  - `student_id`: Unique student identifier.
  - `account_status`: Indicates whether the student may access scheduling features.
- **Relationships**:
  - Owns zero or more `ConstraintSet` records across terms.

### RegistrationTerm

- **Purpose**: Defines the term context in which constraints apply.
- **Key Fields**:
  - `term_id`: Unique term identifier.
  - `term_name`: Human-readable term label.
  - `term_status`: Availability status for scheduling and editing.
- **Relationships**:
  - Has zero or more `ConstraintSet` records.
  - Provides the context for valid course and instructor references.

### ConstraintSet

- **Purpose**: Represents the full saved collection of scheduling constraints for one student and one term.
- **Key Fields**:
  - `constraint_set_id`: Unique identifier for the saved set.
  - `student_id`: Owner reference.
  - `term_id`: Term reference.
  - `save_state`: Current persisted state of the set.
  - `last_confirmed_at`: Most recent time the set was successfully saved.
- **Relationships**:
  - Belongs to one `Student`.
  - Belongs to one `RegistrationTerm`.
  - Contains one or more `SchedulingConstraint` records, or zero records after all constraints are deleted.
- **Uniqueness Rules**:
  - One active saved set per student per term.

### SchedulingConstraint

- **Purpose**: Represents one student-defined scheduling rule or preference.
- **Key Fields**:
  - `constraint_id`: Unique identifier for the constraint.
  - `constraint_set_id`: Parent set reference.
  - `constraint_type`: Category such as blocked time, earliest-start preference, or professor preference.
  - `constraint_value`: User-provided value interpreted according to the type.
  - `user_intent`: Whether the constraint is a hard restriction or a preference, when applicable.
  - `status`: Current validation outcome for the entry.
- **Relationships**:
  - Belongs to one `ConstraintSet`.
  - May reference `CourseOffering` or `Instructor` context when required for validation.
- **Validation Rules**:
  - Time-based values must be complete, well-formed, and fall within the selected term context.
  - Professor preferences must match instructors available in the selected term context.
  - A constraint entry cannot be saved as valid if required fields are missing.

### ConstraintValidationResult

- **Purpose**: Captures the outcome of checking a submitted constraint set before save.
- **Key Fields**:
  - `result_id`: Unique identifier for the validation attempt.
  - `constraint_set_id`: Submitted set reference.
  - `result_type`: `valid`, `invalid`, or `warning`.
  - `message_summary`: User-facing explanation of the result.
  - `affected_constraint_ids`: List of impacted constraint entries.
- **Relationships**:
  - References one `ConstraintSet`.
  - May refer to multiple `SchedulingConstraint` records.

### CourseOffering

- **Purpose**: Supplies term-specific course context needed to validate whether constraints can be applied meaningfully.
- **Key Fields**:
  - `course_offering_id`: Unique offering identifier.
  - `term_id`: Term reference.
  - `course_code`: Course code.
  - `meeting_windows`: Offered meeting times.
- **Relationships**:
  - Belongs to one `RegistrationTerm`.
  - May be evaluated against multiple `SchedulingConstraint` records.

### Instructor

- **Purpose**: Supplies term-specific instructor context for professor preference validation.
- **Key Fields**:
  - `instructor_id`: Unique instructor identifier.
  - `display_name`: Instructor name shown to the student.
  - `term_id`: Term reference when assignment is term-specific.
- **Relationships**:
  - May be referenced by multiple `SchedulingConstraint` records.

## State Transitions

### ConstraintSet.save_state

- `saved` -> `draft`: Student opens the editor and changes one or more constraints.
- `draft` -> `invalid`: Submitted entries fail validation because of malformed or incomplete input.
- `draft` -> `warning`: Submitted entries are internally conflicting but still eligible for explicit confirmation.
- `warning` -> `saved`: Student explicitly confirms the warning set and save succeeds.
- `draft` -> `saved`: Submitted entries pass validation and save succeeds.
- `draft` -> `save_failed`: Save attempt fails after valid submission.
- `save_failed` -> `saved`: Student retries and a later save succeeds.

### SchedulingConstraint.status

- `draft`: Entry is being edited and has not yet been validated for save.
- `invalid`: Entry contains malformed or incomplete data.
- `warning`: Entry participates in a conflicting but confirmable set.
- `active`: Entry is saved and applied to later schedule generation.
- `deleted`: Entry has been removed from the saved set.

## Operational Rules

- Save failure must not overwrite the last successfully saved `ConstraintSet`.
- Deleting the final remaining `SchedulingConstraint` leaves the `ConstraintSet` valid but empty.
- Later schedule generation reads only `active` constraints from the most recent saved set for the selected student and term.
