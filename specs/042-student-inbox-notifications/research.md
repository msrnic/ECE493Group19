# Phase 0 Research: Student Inbox Notifications

## Decision 1: Implement as server-rendered MVC web flow with JSON endpoints for async actions

- Decision: Use server-side MVC with HTML views for compose/summary screens and JavaScript-driven calls to JSON endpoints for send validation and retry.
- Rationale: Matches constitution-required HTML/CSS/JavaScript stack, keeps MVC boundaries explicit, and supports both synchronous page loads and async delivery status updates.
- Alternatives considered:
  - SPA frontend + API-only backend: rejected as unnecessary complexity for a focused admin workflow.
  - Pure server round-trip forms only: rejected because retry/status interactions are cleaner with async endpoint calls.

## Decision 2: Use SQLite via a synchronous Node driver (`better-sqlite3`) with transactional send processing

- Decision: Use SQLite as the single source of truth, accessed through model-layer repositories and wrapped in explicit transactions for send initiation.
- Rationale: Constitution mandates SQLite; transactional writes ensure send request creation and initial delivery-attempt rows are atomic.
- Alternatives considered:
  - Sequelize/ORM abstraction: rejected to avoid unnecessary abstraction for a small bounded schema.
  - Async sqlite wrapper only: rejected because deterministic transaction boundaries are simpler with synchronous DB calls in short-lived controller actions.

## Decision 3: Validation and authorization are blocking pre-send gates (all-or-nothing)

- Decision: Resolve recipients, deduplicate, re-check authorization for each resolved student, and block send if any resolved recipient is unauthorized or invalid.
- Rationale: Directly implements FR-004 and FR-006 plus clarified all-or-nothing behavior.
- Alternatives considered:
  - Partial send to authorized subset: rejected because spec clarification requires complete block on mixed authorization.
  - Cache authorization at selection time: rejected because permission must be revalidated at send time.

## Decision 4: Message length constraints are configuration-driven

- Decision: Enforce subject/body required checks plus max lengths from configuration constants loaded by the validation service (with seeded defaults in SQLite-backed settings).
- Rationale: Spec requires max lengths but identifies policy as institution-defined; configuration avoids hardcoding policy in controllers.
- Alternatives considered:
  - Hard-coded limits in UI and backend: rejected due to policy-change risk.
  - UI-only validation: rejected because backend must enforce constraints authoritatively.

## Decision 5: Per-recipient delivery status with retry-expiry computed from original send timestamp

- Decision: Store each delivery attempt row with status (`pending|sent|failed`), failure reason, and timestamps; expose retry only when at least one failed attempt exists and `now <= sent_at + 24h`.
- Rationale: Satisfies FR-008 through FR-011 and allows precise partial-success reporting without duplicate resend to successful recipients.
- Alternatives considered:
  - Aggregate-only status storage: rejected because retry requires recipient-level failure tracking.
  - Creating a brand-new send request on retry: rejected because traceability is cleaner when retries stay linked to original send request.

## Decision 6: One-year log retention handled by scheduled cleanup in application layer

- Decision: Add a maintenance job that deletes/archives delivery-attempt records older than 1 year according to policy.
- Rationale: Meets FR-008 retention requirement while keeping SQLite footprint bounded.
- Alternatives considered:
  - No cleanup (indefinite growth): rejected due to unbounded storage.
  - Manual DB cleanup scripts only: rejected because retention must be systematically enforced.

## Decision 7: Testing strategy aligned to acceptance artifacts and style-guide compliance

- Decision: Use unit tests for validation/resolution services, integration tests for controller + SQLite flows, contract tests for notification endpoints, and Playwright scenario tests mirroring UC-42-AS.
- Rationale: Provides traceable coverage from FR/UC requirements to executable checks and supports constitution quality gates.
- Alternatives considered:
  - UI-only test coverage: rejected because business logic/authorization needs lower-level verification.
  - Unit-only tests: rejected because delivery/retry correctness depends on integrated DB + controller behavior.
