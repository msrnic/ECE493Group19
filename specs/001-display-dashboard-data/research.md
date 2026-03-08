# Phase 0 Research: 001-display-dashboard-data

## Decision 1: MVC implementation approach
- Decision: Use Express route handlers as controllers, SQLite-backed model modules for data access, and server-rendered HTML views enhanced by page-level JavaScript.
- Rationale: Keeps strict MVC boundaries required by the constitution while staying inside the mandated HTML/CSS/JavaScript + SQLite stack.
- Alternatives considered: SPA-style frontend with API-only backend (rejected because it adds complexity for this read-focused feature); monolithic route+SQL files (rejected due to weak MVC separation).

## Decision 2: Role and field-level authorization model
- Decision: Enforce two authorization layers: page-level access check before query execution, and field-level visibility filtering before rendering response models.
- Rationale: Matches FR-004/FR-004a/FR-007 and supports cases where authorized actors on the same page have different visible fields.
- Alternatives considered: Page-level access only (rejected because it cannot satisfy role-based field visibility); UI-only field hiding (rejected due to data-leak risk).

## Decision 3: Partial-data and no-data behavior contract
- Decision: Standardize a display payload with `availableItems`, `missingItems`, and `status` values (`complete`, `partial`, `none`) so views can consistently render full, partial, and dedicated no-data states.
- Rationale: Directly covers FR-005/FR-006/FR-011 and acceptance flows for extension 2a across all in-scope use cases.
- Alternatives considered: Hard-coded messaging per page (rejected because it duplicates logic and increases inconsistency risk); fail-fast on any missing field (rejected because it violates requirement to still display available data).

## Decision 4: SQLite schema boundaries
- Decision: Persist account, role assignment, course, enrollment/teaching assignment, and dashboard data-item metadata in SQLite with explicit foreign keys.
- Rationale: Satisfies constitutional requirement for persistent account/course storage and enables deterministic authorization + data retrieval joins.
- Alternatives considered: In-memory mock data (rejected because persistence is mandatory); separate non-SQLite store for role rules (rejected by stack constraints).

## Decision 5: Testing and traceability strategy
- Decision: Map automated tests and manual acceptance evidence directly to `UC-06/20/21/33/36` acceptance artifacts and maintain a traceability matrix in test metadata.
- Rationale: Meets FR-008 and constitution principle I while ensuring each story can be validated independently.
- Alternatives considered: Generic endpoint-only tests without UC mapping (rejected because it breaks required traceability); manual-only verification (rejected due to regression risk).

## Decision 6: Style guide enforcement
- Decision: Add linting/formatting checks and code review checklist entries tied to the two Google style guides for HTML/CSS and JavaScript.
- Rationale: Constitution principle V mandates style-guide compliance for implementation.
- Alternatives considered: Ad hoc reviewer judgment only (rejected due to inconsistent enforcement).
