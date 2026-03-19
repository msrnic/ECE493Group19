# Phase 0 Research: Force Enroll Override

## Decision 1: Web stack and runtime
- Decision: Use Node.js 20 + Express + server-rendered HTML/CSS/JavaScript.
- Rationale: Satisfies constitution stack constraints while keeping MVC boundaries straightforward for admin workflows.
- Alternatives considered: SPA framework (rejected as unnecessary complexity for this workflow); non-JS backend (rejected by constitution).

## Decision 2: SQLite driver and data access
- Decision: Use `better-sqlite3` with repository/model modules for synchronous transaction control.
- Rationale: Predictable transaction semantics and low overhead for a single-process MVC app.
- Alternatives considered: `sqlite3` async callback driver (rejected due to more complex error/transaction handling).

## Decision 3: Over-capacity confirmation flow
- Decision: Implement two-step force-enroll requests with `PENDING_CONFIRMATION` status when capacity is full; same authenticated admin must finalize.
- Rationale: Directly satisfies FR-013 and FR-018 while preventing accidental over-capacity enrollment.
- Alternatives considered: Single API call with `overCapacityConfirmed=true` (rejected because it weakens explicit second confirmation intent).

## Decision 4: Atomic consistency model
- Decision: Execute enrollment, schedule update, capacity update, and override-audit insert in one SQLite transaction (`BEGIN IMMEDIATE ... COMMIT`).
- Rationale: Meets FR-012 and UC-37 failure-condition expectations; prevents partial state.
- Alternatives considered: Best-effort sequential writes (rejected due to partial commit risk).

## Decision 5: Concurrency and duplicate protection
- Decision: Enforce unique enrollment key `(student_id, offering_id)` and re-check existence inside transaction before insert.
- Rationale: Handles near-simultaneous admin requests and satisfies FR-011.
- Alternatives considered: Application-only duplicate checks (rejected because race windows remain).

## Decision 6: Hard constraint enforcement scope
- Decision: Hard constraints include student existence/active status, offering existence, offering term validity, and student eligibility status.
- Rationale: Covers FR-004/FR-005 and UC-37 extension 3a.
- Alternatives considered: Minimal existence-only validation (rejected as insufficient per spec).

## Decision 7: Required reason format
- Decision: Require non-empty trimmed reason text (minimum 10 chars, maximum 500 chars) for every force-enroll request.
- Rationale: Satisfies FR-016/FR-017 and improves audit usefulness.
- Alternatives considered: Optional reason code only (rejected due to explicit mandatory reason requirement).

## Decision 8: Audit immutability
- Decision: Persist successful overrides in append-only `override_audit_entries` with admin, student, offering, timestamp, reason, and over-capacity flag.
- Rationale: Meets FR-009 and FR-015 with forensic traceability.
- Alternatives considered: Updating mutable audit rows (rejected; weakens audit integrity).

## Decision 9: Testing strategy
- Decision: Use integration tests for transaction behavior and Playwright acceptance tests mapped to UC-37-AS scenarios.
- Rationale: Confirms both API correctness and administrator workflow behavior.
- Alternatives considered: Unit-only tests (rejected because they cannot validate end-to-end consistency guarantees).

## Result
All technical clarifications are resolved; no `NEEDS CLARIFICATION` items remain.
