# Phase 0 Research: Dashboard Data Display

## Decision 1: MVC Web Delivery Approach

- Decision: Implement as server-rendered MVC web flow using JavaScript controllers/routes, model-layer SQLite access, and HTML/CSS view templates.
- Rationale: Satisfies constitution stack constraints directly while keeping access control and partial-data rendering logic centralized in controllers.
- Alternatives considered:
  - SPA frontend + JSON API: rejected because it adds unnecessary complexity for one in-scope page.
  - Non-MVC page script: rejected because constitution mandates MVC boundaries.

## Decision 2: Data Source and Persistence Boundaries

- Decision: Use SQLite as the single system database for account data, course data, role-policy mappings, and per-request retrieval outcome logs.
- Rationale: Constitution requires SQLite and persistent account/course storage; storing retrieval outcomes in SQLite satisfies FR-010 operational reporting.
- Alternatives considered:
  - In-memory retrieval logging: rejected because FR-010 requires durable reporting data.
  - Separate reporting database: rejected because it violates mandated SQLite-only system DB.

## Decision 3: Retrieval Outcome Classification

- Decision: Classify each course-list request as `complete`, `partial`, or `none` based on whether all, some, or none of required data elements are available after authorization checks.
- Rationale: Directly fulfills FR-010 and aligns with FR-006/FR-008/FR-011 result states.
- Alternatives considered:
  - Binary success/failure only: rejected because it cannot represent partial availability.
  - Per-field-only status without summary: rejected because FR-010 requires per-request summary reporting.

## Decision 4: Partial and Unavailable UI Behavior

- Decision: Render available data rows and annotate each missing data element with a visible unavailable indicator; if all required sources fail, render no data rows and a clear "data unavailable" message.
- Rationale: Matches FR-006, FR-007, FR-008, and FR-011 and mirrors established acceptance patterns in `UC-08-AS` and `UC-20-AS`.
- Alternatives considered:
  - Hide missing elements silently: rejected because users cannot distinguish missing from empty.
  - Block page on any missing field: rejected because FR-006 requires partial rendering.

## Decision 5: Access Control Enforcement Point

- Decision: Enforce existing role/permission policy in controller/service layer before model data is transformed for the view; suppress restricted elements entirely.
- Rationale: Meets FR-004/FR-005/FR-013 and keeps policy checks reusable.
- Alternatives considered:
  - View-only filtering: rejected because sensitive data might already be loaded into render context.
  - New role definitions: rejected by FR-013.

## Decision 6: Performance and Test Strategy

- Decision: Add integration coverage for p95 <= 5s response target and state-specific rendering (complete/partial/none), plus authorization-denied and logging checks.
- Rationale: Aligns with SC-005 and acceptance criteria while validating controller-model-view interactions.
- Alternatives considered:
  - Unit-only testing: rejected because it cannot verify end-to-end route/render behavior.
  - Manual validation only: rejected because it is not sufficient for repeatable acceptance evidence.

## Clarifications Resolved

All Technical Context unknowns are resolved:
- Language/version finalized: HTML5, CSS3, JavaScript ES2022.
- Dependencies finalized: Express + SQLite driver + template engine.
- Storage finalized: SQLite tables for accounts, courses, permissions, and retrieval outcomes.
- Testing finalized: unit + integration + contract checks for course-list flow.
- Platform finalized: Linux-hosted web app, modern browsers.
- Performance/constraints/scope finalized from spec and constitution.
