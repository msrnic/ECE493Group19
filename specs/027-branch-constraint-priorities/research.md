# Phase 0 Research: UC-27 Set Constraint Priorities

## Decision 1: Use a numeric 1-to-5 priority model

- **Decision**: Use a numeric priority scale from 1 to 5, where 1 represents the highest priority.
- **Rationale**: The clarification applied to the spec resolves the UC-27 open issue about priority model. A bounded numeric scale is straightforward for students to understand and easy to validate consistently.
- **Alternatives considered**:
  - Ordinal labels only: rejected because numeric ordering is more explicit for ranking and validation.
  - Unbounded numeric weights: rejected because they increase validation and UX complexity without added UC value.

## Decision 2: Allow equal priorities and break ties by displayed constraint order

- **Decision**: Permit equal priority values and resolve ties using the order shown to the student in the priority editor.
- **Rationale**: UC-27 acceptance testing explicitly includes equal-priority behavior, and the clarified spec now defines a stable, repeatable tie-breaking rule.
- **Alternatives considered**:
  - Disallow equal priorities: rejected because it conflicts with the selected clarification and acceptance-test coverage.
  - Use a hidden or random tie-breaker: rejected because ranking behavior would be harder to explain and verify.

## Decision 3: Persist one priority set per student and term

- **Decision**: Store priority settings as one term-scoped priority set owned by one student, with child records for each prioritized constraint.
- **Rationale**: This mirrors the term-scoped constraint set model from UC-26, supports full-set replacement on valid save, and makes save-failure rollback behavior unambiguous.
- **Alternatives considered**:
  - Store each priority independently without a parent set: rejected because full replacement and rollback-safe saves become harder to guarantee.
  - Store priorities only as transient ranking input: rejected because the feature requires saved settings that persist across sessions.

## Decision 4: Validate on save and preserve prior saved priorities on failure

- **Decision**: Validate the full submitted priority set on save, reject incomplete or out-of-range values immediately, and preserve the last saved set if persistence fails.
- **Rationale**: This aligns directly with UC-27 main and failure scenarios and prevents partial or ambiguous ranking behavior.
- **Alternatives considered**:
  - Accept partial priority saves: rejected because the spec requires clear save semantics and consistent ranking behavior.
  - Delay validation until ranking starts: rejected because UC-27 requires save-time validation and correction.

## Decision 5: Use a UI interaction contract as the exposed interface

- **Decision**: Treat the student-facing priority editor as the primary interface contract for this feature.
- **Rationale**: The project is a browser-based application and the immediate behavior to specify and validate is the editor flow, not a separate public API.
- **Alternatives considered**:
  - Define a generic backend API contract first: rejected because the feature’s user-visible acceptance surface is the UI flow.
  - Skip contract documentation: rejected because tie-policy, invalid-value messaging, and save-failure behavior need explicit shared expectations.
