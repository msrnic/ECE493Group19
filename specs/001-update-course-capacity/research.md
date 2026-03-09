# Phase 0 Research: Update Course Capacity

## Decision 1: Backend web framework and rendering approach
- Decision: Use Node.js + Express controllers with EJS-rendered HTML views and client-side JavaScript for form behaviors.
- Rationale: Satisfies constitution-mandated HTML/CSS/JavaScript stack while keeping MVC boundaries explicit (Express controllers + model layer + view templates).
- Alternatives considered: Pure static frontend + separate API was rejected because repository currently has no frontend build pipeline and this would add unnecessary infrastructure for a single admin workflow.

## Decision 2: SQLite access strategy and atomic updates
- Decision: Use `better-sqlite3` with explicit transactions for capacity update workflow so capacity and remaining seats persist atomically.
- Rationale: Synchronous transaction support is straightforward and reliable for low-to-moderate admin write volume; atomic commits satisfy FR-007 and rollback behavior in FR-008.
- Alternatives considered: `sqlite3` async callbacks were rejected due to more complex transaction/error flow; external RDBMS rejected by constitution.

## Decision 3: Concurrency and stale submission handling
- Decision: Use optimistic concurrency with a `version` integer (or `updated_at` check) on course offering records; reject update when submitted version does not match current DB value.
- Rationale: Implements clarified requirement to reject stale submissions and force reload/resubmit without long-lived locks.
- Alternatives considered: Pessimistic locking rejected due to poor UX and lock contention risk; last-write-wins rejected because it violates stale-reject clarification.

## Decision 4: Override workflow and self-approval policy
- Decision: Implement in-feature override request + approval flow with a policy check flag (`allow_self_approval`) and required reason text; allow requester-as-approver only when policy permits.
- Rationale: Meets FR-014/FR-015 and clarification that feature owns end-to-end override process.
- Alternatives considered: External approval service rejected because spec explicitly includes override flow in this feature.

## Decision 5: Audit retention implementation
- Decision: Persist override records in SQLite with `approved_at`, `retention_until` (`approved_at + 7 years`), and immutable audit fields; enforce retention using a scheduled maintenance job that only purges records past retention.
- Rationale: Satisfies FR-016 with explicit retention metadata and deterministic purge criteria.
- Alternatives considered: No retention field rejected because compliance verification would be ambiguous; indefinite retention rejected because requirement is explicit 7-year retention.

## Decision 6: Validation and error messaging standards
- Decision: Validate capacity as positive integer server-side with express-validator, mirror constraints client-side for fast feedback, and return specific error categories (`VALIDATION_ERROR`, `STALE_SUBMISSION`, `OVERRIDE_REQUIRED`, `UPDATE_FAILED`).
- Rationale: Guarantees data integrity regardless of client behavior while improving usability and testability.
- Alternatives considered: Client-only validation rejected due to bypass risk; generic errors rejected because they reduce supportability and acceptance-test clarity.

## Decision 7: Testing strategy for acceptance alignment
- Decision: Add unit tests (validation/model rules), integration tests (full update workflow including rollback), and contract tests (endpoint request/response schema).
- Rationale: Provides direct coverage for UC-40/UC-40-AS behaviors and FR-005/006/008/013 edge outcomes.
- Alternatives considered: Manual-only testing rejected because it cannot reliably prove rollback and stale-write paths.
