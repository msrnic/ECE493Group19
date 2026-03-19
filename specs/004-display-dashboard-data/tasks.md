# Tasks: Dashboard Data Display

**Input**: Design documents from `/specs/004-display-dashboard-data/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include automated tests because plan.md and quickstart.md explicitly require controller/model/contract validation with acceptance-traceability.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and implementation scaffolding

- [ ] T001 Create dashboard feature route registration and module exports in server/routes/dashboard-data-routes.js
- [ ] T002 [P] Create dashboard controller skeleton with request lifecycle placeholders in server/controllers/dashboard-data-controller.js
- [ ] T003 [P] Create dashboard data model module skeleton for SQLite reads in server/models/dashboard-data-model.js
- [ ] T004 [P] Create dashboard view directory placeholders and shared partial placeholders in web/views/dashboard-data/ and web/views/shared/
- [ ] T005 [P] Create feature traceability matrix template mapping FR/UC/Acceptance IDs in tests/traceability/dashboard-data-traceability.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data and access infrastructure required before user-story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Implement SQLite schema/migration updates for Account, Course, Enrollment, TeachingAssignment, DashboardPage, DataItemDefinition, and RetrievalSnapshot in server/db/schema.sql
- [ ] T007 Implement SQLite seed data for in-scope pages, UC mappings, and role visibility metadata in server/db/seeds/dashboard-data-seed.sql
- [ ] T008 Implement reusable sqlite query helpers for dashboard data retrieval in server/db/sqlite-client.js
- [ ] T009 [P] Implement account and course model read methods required by dashboard data joins in server/models/account-model.js and server/models/course-model.js
- [ ] T010 [P] Implement page-level and field-level authorization service methods in server/services/authorization-service.js
- [ ] T011 Implement common response view-model builder for complete/partial/none states in server/controllers/dashboard-data-controller.js
- [ ] T012 Add dashboard route wiring into Express app bootstrap in server/routes/dashboard-data-routes.js

**Checkpoint**: Foundation complete; each user story can proceed without depending on another user story

---

## Phase 3: User Story 1 - View Requested Information (Priority: P1) 🎯 MVP

**Goal**: Authorized actors can open an in-scope page from the dashboard and view all available permitted information.

**Independent Test**: As an authorized actor, request each supported `pageId` and receive `200` with `status=complete` when all required data exists.

### Tests for User Story 1

- [ ] T013 [P] [US1] Add contract test for `GET /dashboard/pages/{pageId}` success payload shape in tests/contract/dashboard-data.contract.test.js
- [ ] T014 [P] [US1] Add integration test for authorized full-data render flow mapped to UC-06 and UC-33 in tests/integration/dashboard-data.us1.test.js

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implement DashboardPage and DataItemDefinition repository reads in server/models/dashboard-data-model.js
- [ ] T016 [US1] Implement controller flow for authenticate -> authorize page -> retrieve visible items -> return `status=complete` in server/controllers/dashboard-data-controller.js
- [ ] T017 [US1] Implement server-rendered dashboard page templates for contact-info and student-info in web/views/dashboard-data/contact-info.ejs and web/views/dashboard-data/student-info.ejs
- [ ] T018 [P] [US1] Implement server-rendered templates for course-history, transcript, and grade-summary in web/views/dashboard-data/course-history.ejs, web/views/dashboard-data/transcript.ejs, and web/views/dashboard-data/grade-summary.ejs
- [ ] T019 [US1] Add dashboard page presentation styles for readable data layout in web/css/dashboard-data.css
- [ ] T020 [US1] Add client-side progressive enhancement for table/list rendering states in web/js/dashboard-data.js
- [ ] T021 [US1] Update traceability entries for US1 artifacts and tests in tests/traceability/dashboard-data-traceability.md

**Checkpoint**: User Story 1 is independently testable and shippable as MVP

---

## Phase 4: User Story 2 - Handle Missing or Incomplete Data (Priority: P2)

**Goal**: Authorized actors still receive useful information with explicit missing-item indicators and no-data guidance.

**Independent Test**: For partial datasets, response returns `status=partial` with non-empty `missingItems`; for empty datasets, response returns `status=none` and no-data guidance message.

### Tests for User Story 2

- [ ] T022 [P] [US2] Add contract tests for `status=partial` and `status=none` payload requirements in tests/contract/dashboard-data.partial-none.contract.test.js
- [ ] T023 [P] [US2] Add integration tests for partial-data and no-data UI behavior mapped to UC-20 and UC-21 in tests/integration/dashboard-data.us2.test.js

### Implementation for User Story 2

- [ ] T024 [US2] Implement missing-item classification (`not_found`, `unavailable`, `restricted_by_role`, `stale`) during retrieval assembly in server/models/dashboard-data-model.js
- [ ] T025 [US2] Implement controller logic for `partial` and `none` response model generation with retry guidance message in server/controllers/dashboard-data-controller.js
- [ ] T026 [US2] Implement reusable missing-item indicator and no-data partial templates in web/views/shared/missing-items.ejs and web/views/shared/no-data-state.ejs
- [ ] T027 [US2] Integrate missing-item and no-data components into contact-info and student-info templates in web/views/dashboard-data/contact-info.ejs and web/views/dashboard-data/student-info.ejs
- [ ] T028 [US2] Add CSS states for missing-item and no-data visuals in web/css/dashboard-data.css
- [ ] T029 [US2] Add client-side behavior for retry action and missing-item interaction hints in web/js/dashboard-data.js
- [ ] T030 [US2] Update traceability entries for US2 artifacts and tests in tests/traceability/dashboard-data-traceability.md
- [ ] T031 [P] [US2] Integrate missing-item and no-data components into course-history, transcript, and grade-summary templates in web/views/dashboard-data/course-history.ejs, web/views/dashboard-data/transcript.ejs, and web/views/dashboard-data/grade-summary.ejs

**Checkpoint**: User Story 2 is independently testable without requiring User Story 3 changes

---

## Phase 5: User Story 3 - Enforce Access Controls (Priority: P3)

**Goal**: Unauthorized actors are denied access and authorized actors only see fields allowed for their role.

**Independent Test**: Unauthorized requests return `403` with no restricted values, and role-specific responses omit restricted fields while keeping permitted data visible.

### Tests for User Story 3

- [ ] T032 [P] [US3] Add contract test for `403` unauthorized response schema in tests/contract/dashboard-data.unauthorized.contract.test.js
- [ ] T033 [P] [US3] Add integration tests for page-level denial and field-level filtering mapped to UC-21 and UC-36 in tests/integration/dashboard-data.us3.test.js

### Implementation for User Story 3

- [ ] T034 [US3] Implement role-scope resolution for Enrollment/TeachingAssignment-based access checks in server/services/authorization-service.js
- [ ] T035 [US3] Implement controller unauthorized response path with zero restricted payload leakage in server/controllers/dashboard-data-controller.js
- [ ] T036 [US3] Implement field-level visibility filtering against `visible_to_roles` metadata in server/models/dashboard-data-model.js
- [ ] T037 [US3] Implement unauthorized display page and message partial in web/views/errors/forbidden.ejs and web/views/shared/authorization-message.ejs
- [ ] T038 [US3] Integrate forbidden handling route-to-view mapping in server/routes/dashboard-data-routes.js
- [ ] T039 [US3] Update traceability entries for US3 artifacts and tests in tests/traceability/dashboard-data-traceability.md
- [ ] T040 [P] [US3] Add unit tests for authorization service page-level and field-level filtering logic in tests/unit/authorization-service.test.js

**Checkpoint**: User Story 3 is independently testable with complete access-control behavior

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Feature hardening, compliance, and final validation

- [ ] T041 [P] Run JavaScript style checks and apply fixes for feature files in server/controllers/dashboard-data-controller.js, server/models/dashboard-data-model.js, server/services/authorization-service.js, server/routes/dashboard-data-routes.js, and web/js/dashboard-data.js
- [ ] T042 [P] Run HTML/CSS style checks and apply fixes for feature files in web/views/dashboard-data/contact-info.ejs, web/views/dashboard-data/student-info.ejs, web/views/dashboard-data/course-history.ejs, web/views/dashboard-data/transcript.ejs, web/views/dashboard-data/grade-summary.ejs, web/views/shared/missing-items.ejs, web/views/shared/no-data-state.ejs, web/views/shared/authorization-message.ejs, web/views/errors/forbidden.ejs, and web/css/dashboard-data.css
- [ ] T043 Execute full automated test suite for dashboard feature (unit/integration/contract) in tests/unit/dashboard-data-model.test.js, tests/unit/authorization-service.test.js, tests/integration/dashboard-data.us1.test.js, tests/integration/dashboard-data.us2.test.js, tests/integration/dashboard-data.us3.test.js, tests/contract/dashboard-data.contract.test.js, tests/contract/dashboard-data.partial-none.contract.test.js, and tests/contract/dashboard-data.unauthorized.contract.test.js
- [ ] T044 Validate quickstart functional checklist evidence and update results in specs/004-display-dashboard-data/quickstart.md
- [ ] T045 Validate no unauthorized edits to protected `Use Cases/` and `Acceptance Tests/` artifacts and document confirmation in tests/traceability/dashboard-data-traceability.md
- [ ] T046 Add response-time benchmark test for `GET /dashboard/pages/{pageId}` to verify p95 render time under 2.0 seconds in tests/integration/dashboard-data.performance.test.js
- [ ] T047 Record p95 benchmark results and verify compliance with plan performance target in tests/traceability/dashboard-data-traceability.md
- [ ] T048 [P] Add unit tests for dashboard data model retrieval and response mapping logic in tests/unit/dashboard-data-model.test.js

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup; blocks story phases until complete
- **User Stories (Phases 3-5)**: Depend only on Foundational completion
- **Polish (Phase 6)**: Depends on selected story phases being complete

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; no dependency on US2 or US3
- **US2 (P2)**: Starts after Phase 2; no dependency on US1 or US3
- **US3 (P3)**: Starts after Phase 2; no dependency on US1 or US2

### Within Each User Story

- Tests before implementation
- Model/service changes before controller finalization
- Controller behavior before view wiring completion
- Traceability update after story implementation/tests

### Blocking Dependency Resolution

- Removed cross-story implementation dependencies by assigning shared prerequisites to Phase 2.
- Kept all story-specific tasks self-contained so no user story blocks another.
- Restricted blocking behavior to a single explicit gate: Phase 2 foundational completion.

## Parallel Opportunities

- Phase 1 parallel tasks: T002, T003, T004, T005
- Phase 2 parallel tasks: T009, T010
- US1 parallel tasks: T013, T014, T015, T018
- US2 parallel tasks: T022, T023, T031
- US3 parallel tasks: T032, T033, T040
- Polish parallel tasks: T041, T042, T048

---

## Parallel Example: User Story 1

```bash
Task: "T013 [US1] Contract success payload test in tests/contract/dashboard-data.contract.test.js"
Task: "T014 [US1] Integration full-data flow test in tests/integration/dashboard-data.us1.test.js"
Task: "T015 [US1] Dashboard metadata repository reads in server/models/dashboard-data-model.js"
Task: "T018 [US1] Remaining page templates in web/views/dashboard-data/*.ejs"
```

## Parallel Example: User Story 2

```bash
Task: "T022 [US2] Contract partial/none payload tests in tests/contract/dashboard-data.partial-none.contract.test.js"
Task: "T023 [US2] Integration partial/no-data tests in tests/integration/dashboard-data.us2.test.js"
```

## Parallel Example: User Story 3

```bash
Task: "T032 [US3] Contract unauthorized schema test in tests/contract/dashboard-data.unauthorized.contract.test.js"
Task: "T033 [US3] Integration authorization tests in tests/integration/dashboard-data.us3.test.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1
2. Complete Phase 2
3. Complete Phase 3 (US1)
4. Validate US1 independently with T013-T014
5. Demo/deploy MVP behavior

### Incremental Delivery

1. Setup + Foundational baseline
2. Deliver US1 and validate independently
3. Deliver US2 and validate independently
4. Deliver US3 and validate independently
5. Run Phase 6 polish and full verification

### Parallel Team Strategy

1. Team completes Phases 1-2 together
2. After Phase 2, assign separate engineers to US1/US2/US3 in parallel
3. Merge story branches after each story passes its independent tests

---

## Notes

- All tasks use strict checklist format with task ID and concrete file paths.
- [P] markers only appear on tasks with no direct dependency on incomplete same-phase tasks.
- Story labels are applied only to user-story phases.
- Task sequence is immediately executable from top to bottom.
