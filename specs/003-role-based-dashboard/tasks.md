# Tasks: Role-Based Dashboard Access

**Input**: Design documents from `/specs/003-role-based-dashboard/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/dashboard-api.yaml`, `quickstart.md`

**Tests**: Include unit, contract, integration, and Playwright coverage because the feature specification and quickstart explicitly define testing scenarios and quality gates.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project scaffolding and tooling for dashboard development.

- [X] T001 Create MVC project directories for dashboard feature in app/controllers/.gitkeep
- [X] T002 Initialize Node.js dependencies and scripts for Express, better-sqlite3, express-session, Vitest, Supertest, and Playwright in package.json
- [X] T003 [P] Add baseline test runner configuration for unit/integration/contract tests in vitest.config.js
- [X] T004 [P] Add browser test configuration for dashboard flows in playwright.config.js
- [X] T005 Document UC traceability references (UC-03, UC-09, UC-02) for implementation handoff in specs/003-role-based-dashboard/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build core infrastructure required by all user stories.

**⚠️ CRITICAL**: Complete this phase before starting user stories.

- [X] T006 Implement SQLite schema for accounts, courses, roles, modules, dashboard section states, and load events in app/db/schema.sql
- [X] T007 Add initial migration script aligned with schema design in app/db/migrations/001_role_based_dashboard.sql
- [X] T008 [P] Implement shared SQLite connection/transaction helpers in app/models/db-client.js
- [X] T009 [P] Implement session login guard with `returnTo` support for dashboard routes in app/controllers/auth-controller.js
- [X] T010 [P] Register auth and dashboard route shells with middleware wiring in app/routes/dashboard-routes.js
- [X] T011 Add shared dashboard response/status mapping utility for contract-compliant payloads in app/controllers/dashboard-response.js
- [X] T012 Add centralized dashboard error/outcome logging helper used across controllers in app/models/dashboard-load-model.js
- [X] T013 Record protected-artifact non-edit check for `Use Cases/` and `Acceptance Tests/` in specs/003-role-based-dashboard/checklists/requirements.md

**Checkpoint**: Foundation ready. US1, US2, and US3 can start independently with no cross-story blockers.

---

## Phase 3: User Story 1 - Access Role-Scoped Dashboard (Priority: P1) 🎯 MVP

**Goal**: After login, show only modules/navigation permitted by active role assignments, including merged multi-role access and role-data error handling.

**Independent Test**: Log in with single-role and multi-role accounts and verify only permitted modules appear; force role retrieval failure and verify `role_data_error` view with retry.

### Tests for User Story 1

- [X] T014 [P] [US1] Add contract test for `GET /dashboard` success, empty-access, and role-data-error response shapes in tests/contract/dashboard-get.contract.test.js
- [X] T015 [P] [US1] Add integration test for login to role-scoped dashboard rendering across single-role and multi-role actors in tests/integration/dashboard-access.integration.test.js

### Implementation for User Story 1

- [X] T016 [P] [US1] Implement account and active-role lookup queries in app/models/account-model.js
- [X] T017 [P] [US1] Implement role-to-module expansion with duplicate elimination in app/models/module-model.js
- [X] T018 [P] [US1] Implement enabled dashboard section retrieval by permitted module set in app/models/dashboard-section-model.js
- [X] T019 [US1] Implement `GET /dashboard` orchestration for `success|empty_access|role_data_error` outcomes in app/controllers/dashboard-controller.js
- [X] T020 [US1] Render role-scoped navigation plus empty-access and role-data-error states in app/views/dashboard/index.ejs
- [X] T021 [US1] Add dashboard client bootstrap logic for initial state rendering in app/public/js/dashboard.js
- [X] T022 [US1] Wire `GET /dashboard` route to controller/view-model pipeline in app/routes/dashboard-routes.js
- [X] T023 [US1] Add dashboard navigation and state styling compliant with style guides in app/public/css/dashboard.css

**Checkpoint**: US1 independently functional and testable.

---

## Phase 4: User Story 2 - Handle Partial Data Availability (Priority: P2)

**Goal**: Render available sections when some fail, mark unavailable sections clearly, and support retry of only unavailable sections while preserving visible content.

**Independent Test**: Simulate mixed section success/failure and verify partial dashboard with disabled unavailable entries; retry only failed section IDs; verify session-expiry redirect and return.

### Tests for User Story 2

- [X] T024 [P] [US2] Add contract test for `POST /dashboard/retry` payload validation and partial/failure/auth-error responses in tests/contract/dashboard-retry.contract.test.js
- [X] T025 [P] [US2] Add integration test for partial dashboard load and selective retry behavior in tests/integration/dashboard-retry.integration.test.js
- [X] T026 [P] [US2] Add integration test for session-expiry redirect and return-to-dashboard flow during load/retry in tests/integration/dashboard-session-expiry.integration.test.js

### Implementation for User Story 2

- [X] T027 [P] [US2] Implement per-account dashboard section availability state persistence in app/models/dashboard-section-state-model.js
- [X] T028 [P] [US2] Implement dashboard load telemetry writes for `initial_load` and `retry` outcomes in app/models/dashboard-load-model.js
- [X] T029 [US2] Implement independent section loading and outcome classification (`success|partial|failure|auth_error`) in app/controllers/dashboard-controller.js
- [X] T030 [US2] Implement `POST /dashboard/retry` to accept only currently unavailable section IDs in app/controllers/dashboard-controller.js
- [X] T031 [US2] Render unavailable labels and disabled navigation entries for failed sections in app/views/dashboard/index.ejs
- [X] T032 [US2] Implement client-side selective retry that preserves already available DOM sections in app/public/js/dashboard.js
- [X] T033 [US2] Add auth redirect response handling with `returnTo=/dashboard` for expired sessions in app/routes/auth-routes.js
- [X] T034 [US2] Add CSS states for partial/failure/unavailable section presentation in app/public/css/dashboard.css

**Checkpoint**: US2 independently functional and testable.

---

## Phase 5: User Story 3 - Prevent Unauthorized Module Exposure (Priority: P3)

**Goal**: Guarantee restricted modules never appear in dashboard content or navigation across full, partial, retry, and empty-access states.

**Independent Test**: Run role-profile comparisons and confirm restricted modules are absent from navigation/content in all dashboard outcomes.

### Tests for User Story 3

- [X] T035 [P] [US3] Add contract test asserting restricted modules are never emitted in `GET /dashboard` payloads in tests/contract/dashboard-authorization.contract.test.js
- [X] T036 [P] [US3] Add integration test covering role changes and zero-enabled-module outcomes without unauthorized links in tests/integration/dashboard-authorization.integration.test.js
- [X] T037 [P] [US3] Add unit test for role-module authorization filtering and dedupe invariants in tests/unit/dashboard-authorization.unit.test.js

### Implementation for User Story 3

- [X] T038 [P] [US3] Implement strict permission-filter query helpers for active role/module mappings in app/models/role-model.js
- [X] T039 [P] [US3] Implement zero-enabled-module lookup path for empty-access decisions in app/models/module-model.js
- [X] T040 [US3] Enforce unauthorized-module stripping before response/view rendering in app/controllers/dashboard-controller.js
- [X] T041 [US3] Render non-functional navigation for unavailable/unauthorized states with explicit empty-access messaging in app/views/dashboard/index.ejs
- [X] T042 [US3] Add client-side guard that blocks stale unauthorized links after retries or role changes in app/public/js/dashboard.js

**Checkpoint**: US3 independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, documentation, and release readiness across all stories.

- [X] T043 [P] Add dashboard validator helpers for retry payload sanitation and error code consistency in app/controllers/validators/dashboard-validator.js
- [X] T044 [P] Add cross-story Playwright smoke scenario for login -> dashboard -> retry -> auth-return flow in tests/integration/dashboard-smoke.playwright.test.js
- [X] T045 Update quickstart with finalized runbook (`npm test && npm run lint`) and verification notes in specs/003-role-based-dashboard/quickstart.md
- [X] T046 Capture final acceptance evidence and checklist sign-off for UC-03/UC-09/UC-02 in specs/003-role-based-dashboard/checklists/requirements.md
- [X] T047 Add performance verification test for SC-001 (P95 dashboard load <= 3s) in tests/integration/dashboard-performance.integration.test.js
- [X] T048 [P] Add dashboard load timing instrumentation and percentile reporting utility in app/models/dashboard-load-model.js

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks user stories
- **Phase 3 (US1), Phase 4 (US2), Phase 5 (US3)**: Each depends only on Phase 2 and can run independently of each other
- **Phase 6 (Polish)**: Depends on completion of the user stories selected for release

### User Story Dependency Graph

- `US1 <- Foundation`
- `US2 <- Foundation`
- `US3 <- Foundation`

No user story depends on another user story. Cross-story blocking dependencies were removed by placing shared concerns in Phase 2.

### Within Each User Story

- Tests first (contract/integration/unit where listed)
- Model/query tasks before controller orchestration
- Controller logic before view/client behavior wiring
- Route/style hardening at end of story phase

### Parallel Opportunities

- Setup: T003, T004 can run in parallel after T002
- Foundation: T008, T009, T010 can run in parallel after T006/T007
- US1: T014/T015 and T016/T017/T018 can run in parallel
- US2: T024/T025/T026 and T027/T028 can run in parallel
- US3: T035/T036/T037 and T038/T039 can run in parallel
- Polish: T043 and T044 can run in parallel
- Polish: T043/T044/T048 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task T014: tests/contract/dashboard-get.contract.test.js
Task T015: tests/integration/dashboard-access.integration.test.js
Task T016: app/models/account-model.js
Task T017: app/models/module-model.js
Task T018: app/models/dashboard-section-model.js
```

## Parallel Example: User Story 2

```bash
Task T024: tests/contract/dashboard-retry.contract.test.js
Task T025: tests/integration/dashboard-retry.integration.test.js
Task T026: tests/integration/dashboard-session-expiry.integration.test.js
Task T027: app/models/dashboard-section-state-model.js
Task T028: app/models/dashboard-load-model.js
```

## Parallel Example: User Story 3

```bash
Task T035: tests/contract/dashboard-authorization.contract.test.js
Task T036: tests/integration/dashboard-authorization.integration.test.js
Task T037: tests/unit/dashboard-authorization.unit.test.js
Task T038: app/models/role-model.js
Task T039: app/models/module-model.js
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate US1 independent test criteria
4. Demo/deploy MVP

### Incremental Delivery

1. Finish Foundation once
2. Deliver US1 (core role-scoped dashboard)
3. Deliver US2 (partial availability + retry)
4. Deliver US3 (authorization hardening)
5. Finish Polish phase for release readiness

### Parallel Team Strategy

1. Team aligns on Phase 1 and Phase 2
2. Then split work by story track: US1, US2, US3 in parallel
3. Integrate after each story checkpoint with contract and integration suites

---

## Notes

- All checklist items follow `- [X] T### [P?] [US?] Description with file path`
- `[US#]` labels appear only on user story tasks
- Shared infrastructure is isolated to Phase 1-2 to avoid cross-story blockers
- Protected `Use Cases/` and `Acceptance Tests/` files remain untouched
