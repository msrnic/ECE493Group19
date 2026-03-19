# Phase 0 Research: Financial Information Dashboard

## Decision 1: Scope Mapping and Acceptance Traceability
- Decision: Treat `UC-09` / `UC-09-AS` as the authoritative scope and acceptance
  baseline, with `UC-02` and `UC-03` as supporting login/dashboard entry behavior.
- Rationale: The feature description and clarified behavior match `UC-09`
  exactly, including extension flows (2a, 2b). Supporting flows ensure login
  routing behavior remains consistent.
- Alternatives considered: Mapping only to `UC-03`; rejected because it does not
  explicitly capture the financial dashboard intent as directly as `UC-09`.

## Decision 2: Dashboard Degradation Strategy
- Decision: On partial data failure, render available modules and show last
  confirmed values for unavailable financial sections with a timestamp and stale
  indicator.
- Rationale: Matches clarified requirements, keeps daily student workflow usable,
  and aligns with acceptance expectations for partial dashboard behavior.
- Alternatives considered: Full-block dashboard on failure; rejected because it
  violates degraded-mode usability goals and increases operational impact.

## Decision 3: Authorization Boundary
- Decision: Enforce view-only access for students in this feature; exclude payment
  initiation and any write operations.
- Rationale: Clarification explicitly sets this boundary and reduces risk by
  enforcing least privilege for a dashboard-first feature.
- Alternatives considered: Enable payment initiation from dashboard; rejected as
  scope expansion beyond current use case and acceptance baseline.

## Decision 4: API Pattern for UI Data Retrieval
- Decision: Use REST-style read endpoints for dashboard shell, module visibility,
  and financial summary data with explicit per-section availability flags.
- Rationale: Read-oriented REST endpoints map directly to UI sections and support
  independent fallback handling for partial failures.
- Alternatives considered: Single monolithic endpoint only; rejected because
  section-level fallback and observability are weaker.

## Decision 5: Data Persistence and Snapshot Handling
- Decision: Persist account, role/module assignments, and financial summary
  snapshots in SQLite; store `last_confirmed_at` for stale-data rendering.
- Rationale: Constitution mandates SQLite and account/course persistence; snapshot
  timestamps satisfy clarified stale-data behavior.
- Alternatives considered: In-memory fallback-only data; rejected because it does
  not provide durable last-confirmed values across sessions/restarts.

## Decision 6: Validation and Test Strategy
- Decision: Validate via (a) direct traceability to `UC-09-AS` scenarios,
  (b) API contract tests for read endpoints, and (c) integration checks for
  success/minimal/partial dashboard flows.
- Rationale: Ensures feature behavior remains testable at acceptance, contract,
  and flow levels without expanding scope into implementation-unrelated areas.
- Alternatives considered: Manual-only testing; rejected because it weakens
  repeatability and regression confidence.

All previously open technical choices in the plan are resolved; no remaining
open clarification items remain for this feature.
