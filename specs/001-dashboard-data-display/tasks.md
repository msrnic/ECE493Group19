# Tasks: Dashboard Data Display

**Input**: Design documents from `/specs/001-dashboard-data-display/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include contract, integration, and unit tests because quickstart.md and research.md require repeatable validation before merge.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline structure for MVC + SQLite implementation.

- [ ] T001 Create Node/Express project manifest with scripts and dependencies in /home/m_srnic/ece493/group_project/ECE493Group19/package.json
- [ ] T002 Create application entrypoint and middleware bootstrap in /home/m_srnic/ece493/group_project/ECE493Group19/src/app.js
- [ ] T003 [P] Create feature route module scaffold in /home/m_srnic/ece493/group_project/ECE493Group19/src/routes/courseListRoutes.js
- [ ] T004 Add EJS view engine and static-assets configuration in /home/m_srnic/ece493/group_project/ECE493Group19/src/app.js
- [ ] T005 [P] Add traceability notes linking UC-08/UC-20 to feature requirements in /home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/traceability.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Create SQLite schema migration for accounts/courses/access_policies/data_view_requests/data_element_statuses in /home/m_srnic/ece493/group_project/ECE493Group19/db/migrations/001_dashboard_data_display.sql
- [ ] T007 [P] Implement SQLite connection and migration runner in /home/m_srnic/ece493/group_project/ECE493Group19/src/models/db.js
- [ ] T008 [P] Implement shared access policy service interface for page/field checks in /home/m_srnic/ece493/group_project/ECE493Group19/src/services/accessPolicyService.js
- [ ] T009 [P] Implement retrieval status persistence model for request/event logging in /home/m_srnic/ece493/group_project/ECE493Group19/src/models/retrievalStatusModel.js
- [ ] T010 [P] Add shared course-list layout styles and state-indicator classes in /home/m_srnic/ece493/group_project/ECE493Group19/src/public/css/course-list.css
- [ ] T011 [P] Add JavaScript style and lint configuration aligned to Google style guide in /home/m_srnic/ece493/group_project/ECE493Group19/.eslintrc.json
- [ ] T012 Configure HTML/CSS/JS quality gate commands in /home/m_srnic/ece493/group_project/ECE493Group19/package.json

**Checkpoint**: Foundation ready; all user stories can now be implemented independently.

---

## Phase 3: User Story 1 - View Course List Page (Priority: P1) 🎯 MVP

**Goal**: Authorized users can navigate from dashboard and view formatted course-list data.

**Independent Test**: Navigate to `GET /dashboard/course-list` as an authorized user with available course records and verify readable, correctly ordered output.

### Tests for User Story 1

- [ ] T013 [P] [US1] Add route contract test for authorized navigation and HTML response in /home/m_srnic/ece493/group_project/ECE493Group19/tests/contract/course-list-page.contract.test.js
- [ ] T014 [P] [US1] Add integration test for dashboard-to-course-list success flow in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/course-list-page.test.js
- [ ] T015 [P] [US1] Add model unit tests for valid displayable course retrieval in /home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/models/courseModel.test.js

### Implementation for User Story 1

- [ ] T016 [P] [US1] Implement account lookup model for authenticated context in /home/m_srnic/ece493/group_project/ECE493Group19/src/models/accountModel.js
- [ ] T017 [P] [US1] Implement course query model for latest course-list records in /home/m_srnic/ece493/group_project/ECE493Group19/src/models/courseModel.js
- [ ] T018 [US1] Implement controller happy-path flow (load account, fetch courses, render) in /home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/courseListController.js
- [ ] T019 [US1] Wire `GET /dashboard/course-list` handler to controller in /home/m_srnic/ece493/group_project/ECE493Group19/src/routes/courseListRoutes.js
- [ ] T020 [US1] Implement initial course-list template with consistent labels and ordering in /home/m_srnic/ece493/group_project/ECE493Group19/src/views/courses/course-list.ejs
- [ ] T021 [US1] Mount course-list routes from app entrypoint in /home/m_srnic/ece493/group_project/ECE493Group19/src/app.js
- [ ] T041 [US1] Execute `Acceptance Tests/UC-08-AS.md` validation scenarios and record pass/fail evidence in /home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/implementation-notes.md

**Checkpoint**: User Story 1 is functional and testable as the MVP slice.

---

## Phase 4: User Story 2 - Handle Partial Data Availability (Priority: P2)

**Goal**: Users receive available data plus explicit missing indicators when some data cannot be retrieved.

**Independent Test**: Trigger a partial data condition and verify available rows render while missing elements are visibly marked; verify full-unavailable state shows clear no-data message.

### Tests for User Story 2

- [ ] T022 [P] [US2] Add integration test for partial-data rendering with missing indicators in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/course-list-page.test.js
- [ ] T023 [P] [US2] Add integration test for full-unavailable response state (`retrievalStatus=none`) in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/course-list-page.test.js
- [ ] T024 [P] [US2] Add unit tests for retrieval-status classification logic in /home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/controllers/courseListController.test.js

### Implementation for User Story 2

- [ ] T025 [US2] Extend controller to classify `complete|partial|none` and build missing-item metadata in /home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/courseListController.js
- [ ] T026 [US2] Add data-element status write/read helpers for missing indicators in /home/m_srnic/ece493/group_project/ECE493Group19/src/models/retrievalStatusModel.js
- [ ] T027 [US2] Update course-list template to show per-item unavailable indicators and global unavailable message in /home/m_srnic/ece493/group_project/ECE493Group19/src/views/courses/course-list.ejs
- [ ] T028 [US2] Add CSS states for missing/unavailable messaging presentation in /home/m_srnic/ece493/group_project/ECE493Group19/src/public/css/course-list.css
- [ ] T029 [US2] Persist request summary fields (`retrieval_status`, `missing_item_count`) for each page load in /home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/courseListController.js

**Checkpoint**: User Stories 1 and 2 both operate independently and satisfy partial/unavailable behavior.

---

## Phase 5: User Story 3 - Enforce Data Access Rules (Priority: P2)

**Goal**: Users only see course-list content they are authorized to view, with explicit deny behavior for full page restriction.

**Independent Test**: Run requests across roles and verify restricted fields never render; fully unauthorized users receive deny message with no leaked data.

### Tests for User Story 3

- [ ] T030 [P] [US3] Add contract test for unauthorized page access response fields (`isDenied`, empty `courses`) in /home/m_srnic/ece493/group_project/ECE493Group19/tests/contract/course-list-page.contract.test.js
- [ ] T031 [P] [US3] Add integration test matrix for role-based field visibility in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/course-list-page.test.js
- [ ] T032 [P] [US3] Add unit tests for access-policy service decisions on page and field resources in /home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/services/accessPolicyService.test.js

### Implementation for User Story 3

- [ ] T033 [US3] Implement access policy lookup/query logic for `role_code + resource_key` in /home/m_srnic/ece493/group_project/ECE493Group19/src/services/accessPolicyService.js
- [ ] T034 [US3] Apply page-level and field-level authorization filtering in /home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/courseListController.js
- [ ] T035 [US3] Add unauthorized-state rendering branch and deny message handling in /home/m_srnic/ece493/group_project/ECE493Group19/src/views/courses/course-list.ejs
- [ ] T036 [US3] Log denied attempts with `denied=1` and `retrieval_status=none` in /home/m_srnic/ece493/group_project/ECE493Group19/src/models/retrievalStatusModel.js
- [ ] T042 [US3] Execute `Acceptance Tests/UC-20-AS.md` authorization-denied validation scenarios and record pass/fail evidence in /home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/implementation-notes.md

**Checkpoint**: All three user stories are independently testable and enforce access constraints correctly.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality, performance, and documentation improvements spanning all stories.

- [ ] T037 [P] Add quickstart execution command documentation in /home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/quickstart.md
- [ ] T038 Measure and assert p95 response-time target (<=5s) in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/course-list-page.test.js
- [ ] T039 [P] Add final feature implementation notes and verification evidence in /home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/implementation-notes.md
- [ ] T040 Run full quality gate command and record results in /home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/implementation-notes.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Stories (Phases 3-5)**: Each depends only on Foundational completion.
- **Polish (Phase 6)**: Depends on completion of the user stories targeted for release.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational.
- **User Story 2 (P2)**: Depends on the US1 controller baseline in `src/controllers/courseListController.js`.
- **User Story 3 (P2)**: Depends on the US1 route/controller baseline in `src/routes/courseListRoutes.js` and `src/controllers/courseListController.js`.

### Within Each User Story

- Add tests first for the story, then implement models/services/controller/view changes.
- Keep each story deployable and verifiable without requiring completion of other stories.

### Dependency Graph (Blocking Removed)

- `Phase 1 -> Phase 2 -> Phase 3 -> {Phase 4, Phase 5} -> Phase 6`
- `US2` and `US3` proceed in parallel after `US1`.

### Parallel Opportunities

- Setup: T003 and T005 can run in parallel after T001; T002 should complete before T004.
- Foundational: T007, T008, T009, T010, T011 can run in parallel after T006.
- US1: T013, T014, T015 and T016, T017 are parallelizable before controller/view wiring.
- US2: T022, T023, T024 are parallelizable.
- US3: T030, T031, T032 are parallelizable.
- Polish: T037 and T039 can run in parallel.

---

## Parallel Example: User Story 1

```bash
Task: "T013 [US1] Add route contract test in tests/contract/course-list-page.contract.test.js"
Task: "T014 [US1] Add integration success-flow test in tests/integration/course-list-page.test.js"
Task: "T015 [US1] Add course model unit tests in tests/unit/models/courseModel.test.js"
```

```bash
Task: "T016 [US1] Implement account model in src/models/accountModel.js"
Task: "T017 [US1] Implement course model in src/models/courseModel.js"
```

## Parallel Example: User Story 2

```bash
Task: "T022 [US2] Add partial-data integration test in tests/integration/course-list-page.test.js"
Task: "T023 [US2] Add unavailable-data integration test in tests/integration/course-list-page.test.js"
Task: "T024 [US2] Add controller status unit tests in tests/unit/controllers/courseListController.test.js"
```

## Parallel Example: User Story 3

```bash
Task: "T030 [US3] Add unauthorized contract test in tests/contract/course-list-page.contract.test.js"
Task: "T031 [US3] Add role-visibility integration matrix in tests/integration/course-list-page.test.js"
Task: "T032 [US3] Add access-policy service unit tests in tests/unit/services/accessPolicyService.test.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate US1 independently using T013-T015 + manual route verification.

### Incremental Delivery

1. Finish Setup + Foundational once.
2. Deliver US1 (MVP), then US2, then US3.
3. After each story, run story-scoped tests before moving forward.

### Parallel Team Strategy

1. Team finishes Phase 1 and Phase 2 together.
2. After Phase 2, separate contributors can execute US1, US2, and US3 in parallel.
3. Merge when each story passes its own independent test criteria.

---

## Notes

- Every task follows the required checklist format with ID, optional `[P]`, optional `[US#]`, and concrete file path.
- Cross-story blockers were removed by design: no story requires completion of another story.
- Phase 2 is the only intentional blocker because it provides shared infrastructure.
