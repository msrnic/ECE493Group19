# Phase 0 Research: UC-26 Create Custom Scheduling Constraints

## Decision 1: Persist one constraint set per student and term

- **Decision**: Store scheduling constraints as a term-scoped constraint set owned by one authenticated student, with child entries for each individual constraint.
- **Rationale**: The spec requires edit, delete, rollback-safe save behavior, and future schedule-generation reuse. A parent constraint set with child constraint entries preserves those requirements while keeping validation and replacement rules localized to one student-term pair.
- **Alternatives considered**:
  - Store each constraint independently without a parent set: rejected because save failure and replacement semantics become harder to reason about.
  - Store only a derived schedule-generation filter blob: rejected because validation, targeted deletion, and user-visible correction become less traceable.

## Decision 2: Conflicting constraints use explicit warning confirmation

- **Decision**: Treat internally conflicting constraints as a warning state that the student may either revise or explicitly confirm before save completes.
- **Rationale**: UC-26 explicitly allows warning-and-confirm behavior, and the clarified spec now requires it. This keeps preference-like conflicts user-controlled without misclassifying them as malformed input.
- **Alternatives considered**:
  - Hard-block all conflicts: rejected because it contradicts the confirmed clarification and removes useful user control.
  - Auto-resolve by fixed priority: rejected because the feature spec does not define a priority hierarchy and silent resolution would make saved behavior less transparent.

## Decision 3: Validate on save with unsaved edits preserved

- **Decision**: Perform full validation when the student submits the constraint set, return field-level errors for malformed entries, and preserve the current unsaved edits in the editor state until the student corrects or confirms them.
- **Rationale**: This directly supports FR-003, FR-004, and the acceptance scenarios for malformed input and conflict warnings. It also avoids accidental loss of user input after validation failures.
- **Alternatives considered**:
  - Validate only after schedule generation starts: rejected because the UC requires save-time validation.
  - Discard invalid edits on save failure: rejected because it would violate the requirement to preserve revisions for correction.

## Decision 4: Separate MVC ownership between constraint editing and schedule generation

- **Decision**: Keep constraint editing and persistence in a dedicated constraints controller/model flow, and expose saved constraints to schedule generation through a read-only service boundary.
- **Rationale**: The constitution requires explicit MVC ownership and SQLite-backed data boundaries. This split keeps UC-26 focused on editing behavior without coupling it tightly to schedule-generation internals.
- **Alternatives considered**:
  - Let the schedule generator own constraint persistence directly: rejected because it collapses editing and generation responsibilities into one controller path.
  - Store constraints only in frontend state until generation: rejected because saved constraints must survive later usage and save-failure recovery.

## Decision 5: Use a UI interaction contract rather than an external API contract

- **Decision**: Document the constraints editor as a UI contract covering user actions, validation outcomes, confirmation flow, deletion flow, and save-failure behavior.
- **Rationale**: The repository is a web application and the feature’s primary exposed interface is the student-facing constraints editor, not a public external API.
- **Alternatives considered**:
  - Define a generic REST contract first: rejected because the spec does not require a public API and the immediate acceptance surface is the UI flow.
  - Skip interface contracts entirely: rejected because the feature has meaningful user-facing interaction rules that benefit from an explicit contract.
