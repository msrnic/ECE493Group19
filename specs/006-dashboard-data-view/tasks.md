# Tasks: Dashboard Data View

**Input**: Design documents from `/specs/006-dashboard-data-view/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/dashboard-data-view.openapi.yaml`, `quickstart.md`

**Tests**: Included because the feature specification defines acceptance scenarios and independent test criteria per user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`) for story-phase tasks only
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project scaffolding and tooling for dashboard data view delivery.

- [ ] T001 Create Node project manifest and scripts for app/test/lint in /home/m_srnic/ece493/group_project/ECE493Group19/package.json
- [ ] T002 [P] Create server MVC scaffold notes and required module list in /home/m_srnic/ece493/group_project/ECE493Group19/server/README.md
- [ ] T003 [P] Create test suite scaffold notes for unit/integration/contract/e2e in /home/m_srnic/ece493/group_project/ECE493Group19/tests/README.md
- [ ] T004 [P] Configure ESLint and Google style rules in /home/m_srnic/ece493/group_project/ECE493Group19/.eslintrc.cjs
- [ ] T005 [P] Add Vitest configuration for model/controller tests in /home/m_srnic/ece493/group_project/ECE493Group19/vitest.config.js
- [ ] T006 [P] Add Playwright configuration for dashboard page flows in /home/m_srnic/ece493/group_project/ECE493Group19/playwright.config.js
- [ ] T007 Map in-scope traceability references (`UC-06`, `UC-20`, `UC-21`, `UC-33`, `UC-36`) in /home/m_srnic/ece493/group_project/ECE493Group19/specs/006-dashboard-data-view/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared runtime, database, and authorization foundations that all stories use.

**⚠️ CRITICAL**: Complete this phase before starting any user story.

- [ ] T008 Create SQLite schema for account/course/enrollment/dashboard_page/page_data_item/access_audit_log in /home/m_srnic/ece493/group_project/ECE493Group19/server/db/schema.sql
- [ ] T009 [P] Implement SQLite connection and prepared-statement helpers in /home/m_srnic/ece493/group_project/ECE493Group19/server/db/connection.js
- [ ] T010 [P] Seed baseline accounts, pages, courses, enrollments, and page data items in /home/m_srnic/ece493/group_project/ECE493Group19/server/db/seed.sql
- [ ] T011 [P] Define shared role/page/field authorization policy map for UC-06/20/21/33/36 in /home/m_srnic/ece493/group_project/ECE493Group19/server/config/dashboardAccessPolicy.js
- [ ] T012 [P] Implement session authentication and request actor-context middleware in /home/m_srnic/ece493/group_project/ECE493Group19/server/middleware/authContext.js
- [ ] T013 [P] Implement shared API error formatter for 401/403/404 contract responses in /home/m_srnic/ece493/group_project/ECE493Group19/server/middleware/apiErrorHandler.js
- [ ] T014 Wire Express app, session middleware, dashboard routes, and shared error middleware in /home/m_srnic/ece493/group_project/ECE493Group19/server/app.js
- [ ] T015 Create route registration for dashboard API and page-render endpoints in /home/m_srnic/ece493/group_project/ECE493Group19/server/routes/dashboardRoutes.js
- [ ] T016 [P] Implement base dashboard layout and shared page shell in /home/m_srnic/ece493/group_project/ECE493Group19/server/views/dashboard/layout.ejs
- [ ] T017 [P] Add base dashboard styling and state badge classes in /home/m_srnic/ece493/group_project/ECE493Group19/server/public/css/dashboard.css
- [ ] T018 [P] Add dashboard client bootstrap utilities for page-state rendering hooks in /home/m_srnic/ece493/group_project/ECE493Group19/server/public/js/dashboard.js

**Checkpoint**: Shared foundation complete; all user stories can now proceed independently without cross-story blockers.

---

## Phase 3: User Story 1 - View Page Information (Priority: P1) 🎯 MVP

**Goal**: Authorized actors can load in-scope dashboard pages and see permitted data in readable format.

**Independent Test**: From an authenticated session, load each in-scope page and verify expected authorized data renders correctly.

### Tests for User Story 1

- [ ] T019 [P] [US1] Add contract test for `GET /api/dashboard/pages/{pageId}` success payload shape in /home/m_srnic/ece493/group_project/ECE493Group19/tests/contract/dashboard-data-view-api.test.js
- [ ] T020 [P] [US1] Add integration test for authorized actor page data retrieval in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/dashboard-controller.test.js
- [ ] T021 [P] [US1] Add model unit test for page item retrieval by `pageId` and subject filters in /home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/models/dashboardDataModel.test.js

### Implementation for User Story 1

- [ ] T022 [P] [US1] Implement account lookup model methods used by dashboard actor context in /home/m_srnic/ece493/group_project/ECE493Group19/server/models/accountModel.js
- [ ] T023 [P] [US1] Implement course/enrollment lookup methods for history/transcript/grade pages in /home/m_srnic/ece493/group_project/ECE493Group19/server/models/courseModel.js
- [ ] T024 [US1] Implement dashboard page-data query model returning contract-aligned item objects in /home/m_srnic/ece493/group_project/ECE493Group19/server/models/dashboardDataModel.js
- [ ] T025 [US1] Implement dashboard controller `getDashboardPageData` for authorized 200 responses in /home/m_srnic/ece493/group_project/ECE493Group19/server/controllers/dashboardController.js
- [ ] T026 [US1] Implement server-render handler for in-scope page views in /home/m_srnic/ece493/group_project/ECE493Group19/server/controllers/dashboardController.js
- [ ] T027 [P] [US1] Create page template for UC-06 contact info view in /home/m_srnic/ece493/group_project/ECE493Group19/server/views/dashboard/contact-info.ejs
- [ ] T028 [P] [US1] Create page template for UC-20 course history view in /home/m_srnic/ece493/group_project/ECE493Group19/server/views/dashboard/course-history.ejs
- [ ] T029 [P] [US1] Create page template for UC-21 transcript view in /home/m_srnic/ece493/group_project/ECE493Group19/server/views/dashboard/transcript.ejs
- [ ] T030 [P] [US1] Create page template for UC-33 student basic info view in /home/m_srnic/ece493/group_project/ECE493Group19/server/views/dashboard/student-basic-info.ejs
- [ ] T031 [P] [US1] Create page template for UC-36 grade summary view in /home/m_srnic/ece493/group_project/ECE493Group19/server/views/dashboard/grade-summary.ejs

**Checkpoint**: US1 is independently functional and testable.

---

## Phase 4: User Story 2 - Handle Incomplete Data (Priority: P2)

**Goal**: Authorized actors can still use pages when data is partial or unavailable, with explicit missing/outdated indicators.

**Independent Test**: With seeded missing and stale items, verify available data renders, missing items are labeled, and full no-data state appears when applicable.

### Tests for User Story 2

- [ ] T032 [P] [US2] Add contract test coverage for `dataState=partial|none` and missing item fields in /home/m_srnic/ece493/group_project/ECE493Group19/tests/contract/dashboard-data-view-api.test.js
- [ ] T033 [P] [US2] Add integration test for partial-data rendering and non-blocking page behavior in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/dashboard-controller.test.js
- [ ] T034 [P] [US2] Add Playwright flow for no-data and may-be-outdated badges in /home/m_srnic/ece493/group_project/ECE493Group19/tests/e2e/dashboard-data-states.spec.js

### Implementation for User Story 2

- [ ] T035 [US2] Extend dashboard data model to compute `dataState` (`full|partial|none`) and missing reasons in /home/m_srnic/ece493/group_project/ECE493Group19/server/models/dashboardDataModel.js
- [ ] T036 [US2] Extend dashboard controller view-model mapping for partial/no-data/outdated item states in /home/m_srnic/ece493/group_project/ECE493Group19/server/controllers/dashboardController.js
- [ ] T037 [P] [US2] Implement shared missing-item badge partial in /home/m_srnic/ece493/group_project/ECE493Group19/server/views/shared/missing-item-badge.ejs
- [ ] T038 [P] [US2] Implement shared stale-item badge partial in /home/m_srnic/ece493/group_project/ECE493Group19/server/views/shared/stale-item-badge.ejs
- [ ] T039 [P] [US2] Implement shared no-data state partial with retry guidance in /home/m_srnic/ece493/group_project/ECE493Group19/server/views/shared/no-data-state.ejs
- [ ] T040 [US2] Update dashboard layout to render missing/no-data/outdated partials consistently for all in-scope pages in /home/m_srnic/ece493/group_project/ECE493Group19/server/views/dashboard/layout.ejs

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - Enforce Access Controls (Priority: P3)

**Goal**: Unauthorized access is denied, field-level visibility is enforced, and denied attempts are audited.

**Independent Test**: Execute authorized and unauthorized requests for the same page and confirm role-based field filtering plus deny-audit persistence.

### Tests for User Story 3

- [ ] T041 [P] [US3] Add contract test coverage for 401/403/404 error responses and reason codes in /home/m_srnic/ece493/group_project/ECE493Group19/tests/contract/dashboard-data-view-api.test.js
- [ ] T042 [P] [US3] Add integration test for role-based field filtering across actor roles in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/dashboard-controller.test.js
- [ ] T043 [P] [US3] Add model unit test for denied access audit-log insertion in /home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/models/accessAuditModel.test.js

### Implementation for User Story 3

- [ ] T044 [P] [US3] Implement access-audit model insert/query methods in /home/m_srnic/ece493/group_project/ECE493Group19/server/models/accessAuditModel.js
- [ ] T045 [US3] Implement page-level and field-level authorization service functions in /home/m_srnic/ece493/group_project/ECE493Group19/server/services/dashboardAuthorizationService.js
- [ ] T046 [US3] Integrate authorization checks and deny-audit logging into API/page handlers in /home/m_srnic/ece493/group_project/ECE493Group19/server/controllers/dashboardController.js
- [ ] T047 [US3] Implement denied-access response rendering with no restricted data leakage in /home/m_srnic/ece493/group_project/ECE493Group19/server/views/dashboard/access-denied.ejs

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, performance hardening, and documentation updates across stories.

- [ ] T048 [P] Add performance integration test validating 95% of page loads under 5s in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/dashboard-performance.test.js
- [ ] T049 [P] Add quickstart verification script for schema bootstrap, seed, and smoke checks in /home/m_srnic/ece493/group_project/ECE493Group19/scripts/validate-dashboard-feature.sh
- [ ] T050 Run full lint and automated test suites and document outcomes in /home/m_srnic/ece493/group_project/ECE493Group19/specs/006-dashboard-data-view/quickstart.md
- [ ] T051 Update feature documentation with final endpoint/role/data-state behavior notes in /home/m_srnic/ece493/group_project/ECE493Group19/specs/006-dashboard-data-view/spec.md
- [ ] T052 Execute acceptance validation for UC-06 and document evidence against UC-06-AS in /home/m_srnic/ece493/group_project/ECE493Group19/specs/006-dashboard-data-view/quickstart.md
- [ ] T053 Execute acceptance validation for UC-20 and document evidence against UC-20-AS in /home/m_srnic/ece493/group_project/ECE493Group19/specs/006-dashboard-data-view/quickstart.md
- [ ] T054 Execute acceptance validation for UC-21 and document evidence against UC-21-AS in /home/m_srnic/ece493/group_project/ECE493Group19/specs/006-dashboard-data-view/quickstart.md
- [ ] T055 Execute acceptance validation for UC-33 and document evidence against UC-33-AS in /home/m_srnic/ece493/group_project/ECE493Group19/specs/006-dashboard-data-view/quickstart.md
- [ ] T056 Execute acceptance validation for UC-36 and document evidence against UC-36-AS in /home/m_srnic/ece493/group_project/ECE493Group19/specs/006-dashboard-data-view/quickstart.md
- [ ] T057 [P] Add timed usability scenario test for SC-001 (identify information within 60 seconds) in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/dashboard-usability-metric.test.js
- [ ] T058 Analyze SC-001 timing outcomes and document pass/fail summary in /home/m_srnic/ece493/group_project/ECE493Group19/specs/006-dashboard-data-view/quickstart.md
- [ ] T059 Define SC-004 pilot protocol (sample size, role mix, survey prompt, threshold) in /home/m_srnic/ece493/group_project/ECE493Group19/specs/006-dashboard-data-view/quickstart.md
- [ ] T060 Document SC-004 pilot results and pass/fail conclusion in /home/m_srnic/ece493/group_project/ECE493Group19/specs/006-dashboard-data-view/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user stories
- **Phase 3 (US1), Phase 4 (US2), Phase 5 (US3)**: Each depends only on Phase 2; no cross-story blocking dependencies
- **Phase 6 (Polish)**: Depends on completion of any stories included in release scope

### User Story Dependency Graph

- `US1 <- Foundation`
- `US2 <- Foundation`
- `US3 <- Foundation`

No user story depends on another user story. Blocking dependencies were resolved by moving shared auth, schema, routing, and base rendering tasks into Phase 2.

### Within-Story Ordering

- Tests before implementation
- Models/services before controller wiring
- Controller wiring before final page rendering checks

## Parallel Opportunities

- **Setup**: T002, T003, T004, T005, T006 can run in parallel after T001
- **Foundational**: T009, T010, T011, T012, T013, T016, T017, T018 can run in parallel after T008
- **US1**: T019, T020, T021 in parallel; T022 and T023 in parallel; T027-T031 in parallel
- **US2**: T032, T033, T034 in parallel; T037, T038, T039 in parallel
- **US3**: T041, T042, T043 in parallel; T044 can run in parallel with T045

## Parallel Example: User Story 1

```bash
# Tests
T019 + T020 + T021

# View templates
T027 + T028 + T029 + T030 + T031
```

## Parallel Example: User Story 2

```bash
# Tests
T032 + T033 + T034

# Shared data-state partials
T037 + T038 + T039
```

## Parallel Example: User Story 3

```bash
# Tests
T041 + T042 + T043

# Authorization model/service split
T044 + T045
```

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1) only.
3. Validate US1 independent test criteria before expanding scope.

### Incremental Delivery

1. Foundation complete (Phases 1-2).
2. Deliver US1 (core page information retrieval/rendering).
3. Deliver US2 (partial/no-data/outdated states).
4. Deliver US3 (enforcement + auditing).
5. Execute Phase 6 polish checks.

### Parallel Team Strategy

1. Team completes Phase 1 and 2 together.
2. Then assign independent streams: Dev A -> US1, Dev B -> US2, Dev C -> US3.
3. Integrate and run full validation in Phase 6.

## Notes

- Task format is strict checklist syntax with ID, optional `[P]`, and required `[US#]` label for story tasks.
- All story tasks are written to be executable without additional context from other story phases.
