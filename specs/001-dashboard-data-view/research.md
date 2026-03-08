# Phase 0 Research: 001-dashboard-data-view

## Scope

Feature scope is limited to `UC-06`, `UC-20`, `UC-21`, `UC-33`, and `UC-36` with acceptance coverage in `UC-06-AS`, `UC-20-AS`, `UC-21-AS`, `UC-33-AS`, and `UC-36-AS`.

## Research Tasks Dispatched

- Research MVC implementation approach for a JavaScript web app constrained to HTML/CSS/JavaScript + SQLite.
- Research SQLite access strategy for read-heavy dashboard retrieval with role-based field filtering.
- Research best practices for partial-data and stale-data indicators that preserve page usability.
- Research authorization-denial audit logging fields and queryability for acceptance validation.

## Findings

### 1) MVC web stack and runtime selection

- Decision: Use Node.js + Express for controllers, EJS templates for views, and model modules that encapsulate SQLite queries.
- Rationale: Keeps all logic in JavaScript while preserving explicit MVC boundaries and server-side control over authorization and field filtering.
- Alternatives considered: Pure client-side SPA with SQLite in-browser (`sql.js`) was rejected because it does not meet system-level persistent SQLite requirements for shared account/course data.

### 2) SQLite access dependency

- Decision: Use `better-sqlite3` with prepared statements in model-layer modules.
- Rationale: Synchronous prepared statements are simple and reliable for a moderate-scale, read-dominant dashboard flow and reduce SQL injection risk.
- Alternatives considered: `sqlite3` callback API was rejected due to higher controller complexity and more error-prone asynchronous flow handling for multi-step page retrieval.

### 3) Authorization and field filtering pattern

- Decision: Perform two checks in controllers/models: page-level authorization before retrieval and field-level authorization before render.
- Rationale: Prevents restricted data exposure and aligns with acceptance tests that require role-specific visibility on shared pages.
- Alternatives considered: View-only conditional hiding was rejected because restricted fields could still be fetched and accidentally exposed.

### 4) Handling missing and stale data

- Decision: Standardize each rendered item as `{ status, value, missingReason, freshnessState }` and render badges/messages for `missing` and `may_be_outdated`.
- Rationale: Supports FR-005, FR-006, FR-007, and FR-010 consistently across all in-scope pages.
- Alternatives considered: Page-level generic warning only was rejected because requirements demand explicit indication of which items are unavailable.

### 5) Denied-access audit logging

- Decision: Create SQLite table `access_audit_log` and log every deny event with `actor_id`, `page_id`, `occurred_at`, and `reason_code`.
- Rationale: Directly satisfies FR-011 and SC-005 and keeps validation queryable in local acceptance/integration testing.
- Alternatives considered: File-based logging only was rejected due to weaker structured querying and traceability against acceptance criteria.

## Clarification Resolution Summary

All technical context fields are resolved with no remaining `NEEDS CLARIFICATION` items.
