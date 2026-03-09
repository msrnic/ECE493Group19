# Phase 0 Research: 001-force-withdrawal

## Decision 1: Backend stack and MVC composition
- Decision: Use Node.js 20 + Express 4 backend controllers/services/models with vanilla HTML/CSS/JavaScript views.
- Rationale: Satisfies constitution stack constraints while providing explicit MVC boundaries and simple server-side routing.
- Alternatives considered: Client-heavy SPA with API-only backend (rejected for unnecessary complexity for admin workflow); non-JS backend (rejected by constitution).

## Decision 2: SQLite transaction boundary for forced withdrawal
- Decision: Execute enrollment removal, schedule update, transcript update, and fee ledger update in one SQLite transaction (`BEGIN IMMEDIATE ... COMMIT`), rollback on any failure.
- Rationale: Guarantees FR-014 consistency and prevents partial update states.
- Alternatives considered: Eventual consistency across separate writes (rejected because rollback and consistency guarantees would weaken).

## Decision 3: Concurrency and idempotency enforcement
- Decision: Enforce first-wins behavior by updating only active enrollment rows (`status='ENROLLED'`) and using uniqueness constraints so only one successful state transition to withdrawn can occur.
- Rationale: Meets FR-020/FR-021 without race-dependent duplicate outcomes.
- Alternatives considered: In-memory lock only (rejected; not durable across process restart); coarse global lock (rejected; harms concurrency).

## Decision 4: Required-reason confirmation UX
- Decision: Confirmation view requires non-empty reason field with server-side validation; client-side validation mirrors server rules.
- Rationale: Meets clarified requirement that reason is always required and keeps behavior deterministic.
- Alternatives considered: Optional reason or warning-only validation (rejected by clarified requirement).

## Decision 5: Audit failure handling
- Decision: If main transactional updates succeed but audit write fails, mark forced-withdrawal action as `PENDING_AUDIT` in SQLite retry queue and return success with pending-audit flag.
- Rationale: Meets FR-018 and FR-019 while preserving completed withdrawal outcome.
- Alternatives considered: Fail entire withdrawal when audit fails (rejected by clarification); ignore audit failure (rejected due to auditability gap).

## Decision 6: API contract pattern
- Decision: Define REST endpoints for implications preview, confirmation submission, action status, and pending-audit listing.
- Rationale: Matches user actions cleanly and supports deterministic integration/contract testing.
- Alternatives considered: GraphQL mutation/query set (rejected to reduce implementation overhead for this scope).

## Decision 7: Style guide compliance enforcement
- Decision: Apply Google HTML/CSS and JavaScript style guide checks during implementation reviews and lint/test workflow.
- Rationale: Constitution requires explicit compliance strategy.
- Alternatives considered: Ad-hoc formatting without checks (rejected; inconsistent and hard to enforce).

## Decision 8: Scope traceability artifacts
- Decision: Map this feature to `Use Cases/UC-38.md` and `Acceptance Tests/UC-38-AS.md` only, and keep those files unchanged.
- Rationale: Meets constitution traceability and protected-artifact constraints.
- Alternatives considered: Editing use case or acceptance documents in-plan (rejected; requires explicit user authorization).
