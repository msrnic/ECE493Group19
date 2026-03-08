# Phase 0 Research — 001-update-contact-info

## Decision 1: Validation is enforced server-side with shared client hints

- Decision: Perform authoritative validation in controller/model layer on the server, while using matching client-side checks only for faster UX feedback.
- Rationale: UC-07 and FR-003/004/005/006 require reliable rejection of invalid submissions. Server-side checks prevent bypass and guarantee no invalid data reaches SQLite.
- Alternatives considered:
  - Client-side only validation: rejected because it can be bypassed and violates reliability requirements.
  - Database-only validation via CHECK constraints only: rejected because it cannot provide complete field-specific guidance needed by FR-007.

## Decision 2: Normalize then validate email/phone/address inputs

- Decision: Trim leading/trailing whitespace before validation and persistence; validate normalized values.
- Rationale: Spec edge case requires normalized evaluation and saving normalized results.
- Alternatives considered:
  - Validate raw user input: rejected because surrounding whitespace would cause avoidable errors.
  - Auto-correct too aggressively (e.g., rewriting punctuation/country code): rejected due to risk of changing user intent.

## Decision 3: Atomic SQLite transaction for all contact updates

- Decision: Save basic and emergency contact fields inside one SQLite transaction (`BEGIN IMMEDIATE ... COMMIT`), with rollback on any failure.
- Rationale: FR-006 and FR-010 require all-or-nothing semantics and no partial updates.
- Alternatives considered:
  - Multiple independent updates: rejected because partial persistence could occur.
  - Eventual consistency queue: rejected as unnecessary complexity for synchronous form save.

## Decision 4: Last-write-wins with explicit conflict notice

- Decision: Accept the submitted update as the latest state and return a success response including a conflict notice when prior data changed during edit session.
- Rationale: Clarification requires last-write-wins plus post-save notification (FR-014, FR-015).
- Alternatives considered:
  - Optimistic lock failure and forced re-edit: rejected because it conflicts with explicit clarification.
  - Silent overwrite without notice: rejected because FR-015 requires informing the user.

## Decision 5: MVC placement of responsibilities

- Decision: Keep data access and transactions in models, request orchestration and validation outcome mapping in controllers, and display/error rendering in views.
- Rationale: Constitution Principle III mandates MVC boundaries and improves testability.
- Alternatives considered:
  - Fat views with embedded save logic: rejected due to maintainability and testability risk.
  - Controllers directly executing SQL: rejected because it blurs model boundaries.

## Decision 6: Traceability source artifacts

- Decision: Use `Use Cases/UC-07.md` and `Acceptance Tests/UC-07-AS.md` as the mandatory traceability pair for this feature.
- Rationale: These documents exactly match the described flow and extension behavior.
- Alternatives considered:
  - Mapping to non-contact UCs (e.g., UC-19): rejected as non-matching scope.
