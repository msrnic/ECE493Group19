# Research: 039-manage-course-offerings

## Decision 1: Use SQLite transactions with optimistic concurrency check for deletion confirmation

- Decision: Execute add/delete operations in a single SQLite transaction (`BEGIN IMMEDIATE ... COMMIT`) and require delete confirmation requests to include `expected_updated_at` from the pre-check; block with conflict if value changed before commit.
- Rationale: Guarantees FR-012/FR-013 atomicity, supports FR-017 late-state recheck, and prevents concurrent admin races from silently deleting modified offerings.
- Alternatives considered:
  - Pessimistic long-lived lock between pre-check and confirm: rejected due to poor UX and lock contention risk.
  - Blind delete with no version check: rejected because FR-017 conflict detection would be incomplete.

## Decision 2: Model active-enrollment blocking as policy gate with explicit override flag and reason

- Decision: For delete confirmation, treat enrollments with status in `{ENROLLED, WAITLIST_RESERVED}` as active blockers unless `override_confirmed=true` and `override_reason` is non-empty.
- Rationale: Satisfies FR-006, FR-007, FR-018, and FR-019 while keeping policy logic deterministic and auditable.
- Alternatives considered:
  - Role-limited override only: rejected because clarification states any administrator can override.
  - Always block active-enrollment deletions: rejected because FR-018 requires immediate override flow.

## Decision 3: Enforce offering validity with layered validation (request + domain + DB constraints)

- Decision: Validate at three layers: API request schema (required fields/types), domain rules (capacity range, schedule overlap for instructor), and SQLite unique index on `(course_id, term_id, instructor_id, section)`.
- Rationale: Defensive validation supports FR-003/FR-004/FR-015 and ensures consistency even if callers bypass UI-level validation.
- Alternatives considered:
  - UI-only validation: rejected as insufficient for integrity and API clients.
  - DB-only validation: rejected because field-level feedback in FR-004 requires richer errors before commit.

## Decision 4: Handle audit-write failure with durable retry queue while preserving catalog mutation

- Decision: If offering mutation commits but audit insert fails, persist a retry payload in `audit_retry_queue` within a follow-up best-effort write and raise an admin alert event; mutation result stays successful.
- Rationale: Meets FR-016 requirement to preserve catalog outcome and recover audit durability asynchronously.
- Alternatives considered:
  - Roll back catalog change when audit fails: rejected because FR-016 forbids this behavior.
  - Ignore audit failure without retry: rejected due to compliance and observability gaps.

## Decision 5: REST contract uses two-step delete (pre-check + confirm) to support explicit confirmation UX

- Decision: Provide `POST /api/offerings/{id}/deletion-check` and `POST /api/offerings/{id}/delete` endpoints; confirm endpoint requires a confirmation token plus optional override payload.
- Rationale: Cleanly models FR-009 explicit confirmation and FR-017 final recheck while keeping controller logic testable.
- Alternatives considered:
  - Single DELETE endpoint with query flags: rejected as less explicit and harder to validate confirm/recheck semantics.
  - Server-side session-only confirmation state: rejected due to weaker API portability and test complexity.

## Decision 6: Test strategy combines unit, integration, contract, and browser smoke tests

- Decision: Use Vitest for domain/service rules, Supertest for endpoint contracts and rollback/conflict behavior, and Playwright smoke tests for admin form/cancel/confirm UX.
- Rationale: Covers FR-003 through FR-019 and success criteria with minimal tooling overlap.
- Alternatives considered:
  - Unit-only tests: rejected because transaction and HTTP contract behavior would remain unverified.
  - Full E2E-only approach: rejected due to slower feedback and weaker root-cause isolation.
