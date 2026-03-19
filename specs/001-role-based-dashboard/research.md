# Research: Role-Based Dashboard Access

## Decision 1: MVC web stack with Node.js + Express + server-rendered HTML/CSS/JS
- Decision: Use a monolithic JavaScript MVC application with Express controllers, model-layer SQLite access, and HTML/CSS/JavaScript views.
- Rationale: Satisfies constitution stack constraints directly, keeps routing/session logic centralized, and supports role-based rendering with minimal framework overhead.
- Alternatives considered:
  - Client-heavy SPA + separate API: rejected because it adds deployment complexity and weakens immediate MVC traceability in this repository stage.
  - Non-JavaScript backend stack: rejected due to constitution stack violation.

## Decision 2: SQLite access via model/repository layer (`better-sqlite3`)
- Decision: Access SQLite exclusively through model files (repository-style methods) and never from controllers/views.
- Rationale: Preserves MVC boundaries, supports reliable transactions for role/module lookups, and enables straightforward unit testing.
- Alternatives considered:
  - Direct SQL in controllers: rejected due to tight coupling and weaker testability.
  - ORM abstraction: rejected for unnecessary complexity in a constrained schema.

## Decision 3: Independent section loading and retry using per-section status model
- Decision: Load dashboard sections independently and track each section as `available` or `unavailable`; retry action only re-fetches unavailable section IDs.
- Rationale: Implements FR-006, FR-016, and FR-017 while preserving already loaded content and avoiding full-page replacement.
- Alternatives considered:
  - Single aggregate dashboard query: rejected because one failure would block the entire dashboard.
  - Full-page retry only: rejected because it violates FR-016.

## Decision 4: Session-expiration handling through 401 + return path
- Decision: When session validity fails during load/retry, backend returns unauthorized response and frontend redirects to login with `returnTo=/dashboard`.
- Rationale: Aligns with FR-018 and existing login flow in UC-02 while keeping retry semantics deterministic.
- Alternatives considered:
  - Silent refresh token flow: rejected because no token-refresh architecture exists in current project scope.
  - Displaying a dashboard error without redirect: rejected because FR-018 requires redirect and post-auth return.

## Decision 5: Operational monitoring persisted in SQLite
- Decision: Record each dashboard attempt in `dashboard_load_events` with outcomes `success`, `partial`, or `failure`, plus retry metadata.
- Rationale: Satisfies FR-012 and supports measurable tracking against SC-001 and SC-004.
- Alternatives considered:
  - File-based logs only: rejected because queryable outcome analysis is harder and not aligned with required SQLite persistence strategy.
  - External telemetry service: rejected due to out-of-scope infrastructure.

## Decision 6: Use-case traceability mapping for this feature
- Decision: Map this feature to `UC-03`/`UC-03-AS` (main dashboard + partial load), `UC-09`/`UC-09-AS` (zero-module and unavailable handling), and `UC-02`/`UC-02-AS` (login/session return behavior).
- Rationale: Covers all acceptance paths introduced in spec clarifications, including re-authentication return and empty-access handling.
- Alternatives considered:
  - Mapping only UC-03: rejected because empty-access and auth-return behavior would be under-specified.
