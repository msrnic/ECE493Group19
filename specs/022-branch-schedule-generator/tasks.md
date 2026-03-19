# Tasks: UC-22 Generate Possible Class Schedules

**Input**: Design documents from `/specs/022-branch-schedule-generator/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/schedule-builder-ui-contract.md`, `quickstart.md`

**Tests**: This feature requires browser acceptance validation, unit tests, and integration tests because the specification and feature request explicitly require corresponding acceptance coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the documentation and validation scaffolding needed before feature code begins.

- [ ] T001 Create the UC-22 implementation task inventory in /home/thaia/ECE493Group19/specs/022-branch-schedule-generator/tasks.md
- [ ] T002 Map UC-22 stories and acceptance references in /home/thaia/ECE493Group19/specs/022-branch-schedule-generator/quickstart.md
- [ ] T003 [P] Add the UC-22 acceptance checklist skeleton in /home/thaia/ECE493Group19/tests/acceptance/uc22-acceptance-checklist.md
- [ ] T004 [P] Add a UC-22 fixture placeholder for planning-term, feasible, infeasible, and retrieval-failure data in /home/thaia/ECE493Group19/backend/db/seeds/uc22-fixtures.sql

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish schema, MVC boundaries, shared validation, and base controller/model behavior required by all stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create the SQLite schema for planning terms, course selections, constraints, schedule options, and unschedulable notices in /home/thaia/ECE493Group19/backend/db/schema/schedule-builder.sql
- [ ] T006 [P] Implement planning-term and student lookup helpers in /home/thaia/ECE493Group19/backend/models/student-model.js
- [ ] T007 [P] Implement course-selection validation and normalization helpers in /home/thaia/ECE493Group19/backend/models/course-selection-model.js
- [ ] T008 [P] Implement timetable and catalog lookup helpers in /home/thaia/ECE493Group19/backend/models/timetable-model.js
- [ ] T009 [P] Implement shared schedule-feasibility primitives in /home/thaia/ECE493Group19/backend/models/schedule-generator-model.js
- [ ] T010 Implement request orchestration and result-state mapping in /home/thaia/ECE493Group19/backend/controllers/schedule-builder-controller.js
- [ ] T011 [P] Create the base schedule-builder form view in /home/thaia/ECE493Group19/frontend/views/schedule-builder/schedule-builder-page.html
- [ ] T012 [P] Create the shared schedule-builder client state and submission flow in /home/thaia/ECE493Group19/frontend/js/schedule-builder.js
- [ ] T013 [P] Create the shared schedule-builder layout and accessible state styles in /home/thaia/ECE493Group19/frontend/css/schedule-builder.css

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Generate Feasible Schedules (Priority: P1) 🎯 MVP

**Goal**: Allow an authenticated student to generate one or more feasible planning-only schedules for a selected term and course set.

**Independent Test**: Sign in as a student, choose an available planning term and feasible course set, generate schedules, and confirm one or more feasible schedule options appear with comparison details and no enrollment changes.

### Tests for User Story 1

- [ ] T014 [P] [US1] Add unit tests for feasible schedule rules, constraint satisfaction, and stable option ordering in /home/thaia/ECE493Group19/tests/unit/schedule-generator-model.test.js
- [ ] T015 [P] [US1] Add controller tests for valid term selection, valid course selection, and planning-only generation in /home/thaia/ECE493Group19/tests/unit/schedule-builder-controller.test.js
- [ ] T016 [P] [US1] Add SQLite-backed integration coverage for feasible schedule generation in /home/thaia/ECE493Group19/tests/integration/schedule-builder-flow.test.js
- [ ] T017 [P] [US1] Add acceptance checks for AT-UC22-01 feasible schedule generation in /home/thaia/ECE493Group19/tests/acceptance/uc22-acceptance-checklist.md

### Implementation for User Story 1

- [ ] T018 [P] [US1] Extend course-selection persistence for selected courses and supported constraints in /home/thaia/ECE493Group19/backend/models/course-selection-model.js
- [ ] T019 [P] [US1] Implement feasible schedule generation, non-overlap validation, and stable ordering in /home/thaia/ECE493Group19/backend/models/schedule-generator-model.js
- [ ] T020 [US1] Implement the authenticated feasible-generation flow in /home/thaia/ECE493Group19/backend/controllers/schedule-builder-controller.js
- [ ] T021 [P] [US1] Build the feasible schedule results view with course identifier, selected section, meeting days, and meeting times in /home/thaia/ECE493Group19/frontend/views/schedule-builder/schedule-options.html
- [ ] T022 [P] [US1] Render feasible result submission, keyboard flow, and planning-only messaging in /home/thaia/ECE493Group19/frontend/js/schedule-builder.js
- [ ] T023 [US1] Add feasible schedule comparison styling and accessible result-state presentation in /home/thaia/ECE493Group19/frontend/css/schedule-builder.css
- [ ] T024 [US1] Verify UC-22 traceability and planning-only behavior references in /home/thaia/ECE493Group19/specs/022-branch-schedule-generator/quickstart.md

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Continue When Some Selected Courses Cannot Be Scheduled (Priority: P2)

**Goal**: Let students continue planning with the remaining schedulable courses when some selected courses have no available sections.

**Independent Test**: Submit a mixed course set with at least one unschedulable course and at least one schedulable course, confirm the unschedulable course is identified, continue, and verify feasible schedules for remaining courses only.

### Tests for User Story 2

- [ ] T025 [P] [US2] Add unit tests for unschedulable-course detection and continuation eligibility in /home/thaia/ECE493Group19/tests/unit/schedule-generator-model.test.js
- [ ] T026 [P] [US2] Add controller tests for partial-continuation state transitions in /home/thaia/ECE493Group19/tests/unit/schedule-builder-controller.test.js
- [ ] T027 [P] [US2] Add SQLite-backed integration coverage for partial continuation with remaining schedulable courses in /home/thaia/ECE493Group19/tests/integration/schedule-builder-flow.test.js
- [ ] T028 [P] [US2] Add acceptance checks for AT-UC22-02 unschedulable-course continuation in /home/thaia/ECE493Group19/tests/acceptance/uc22-acceptance-checklist.md

### Implementation for User Story 2

- [ ] T029 [P] [US2] Persist and retrieve unschedulable-course notices in /home/thaia/ECE493Group19/backend/models/course-selection-model.js
- [ ] T030 [P] [US2] Implement unschedulable-course detection and continuation output in /home/thaia/ECE493Group19/backend/models/schedule-generator-model.js
- [ ] T031 [US2] Map partial-continuation result handling and continuation actions in /home/thaia/ECE493Group19/backend/controllers/schedule-builder-controller.js
- [ ] T032 [P] [US2] Build the no-results and continuation messaging view for unschedulable-course notices in /home/thaia/ECE493Group19/frontend/views/schedule-builder/schedule-no-results.html
- [ ] T033 [P] [US2] Implement client-side continuation affordance and state messaging in /home/thaia/ECE493Group19/frontend/js/schedule-builder.js
- [ ] T034 [US2] Add partial-continuation and unschedulable-course presentation styles in /home/thaia/ECE493Group19/frontend/css/schedule-builder.css
- [ ] T035 [US2] Update validation steps for partial continuation in /home/thaia/ECE493Group19/specs/022-branch-schedule-generator/quickstart.md

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Explain Why No Schedules Can Be Generated (Priority: P3)

**Goal**: Give students distinct guidance for no-feasible-schedule, retrieval-failure, and invalid-input outcomes.

**Independent Test**: Exercise an infeasible course-and-constraint combination, a retrieval-failure case, and an invalid-input case; confirm each produces the correct distinct outcome without showing invalid schedules as complete.

### Tests for User Story 3

- [ ] T036 [P] [US3] Add unit tests for no-feasible-schedule, retrieval-failure, and invalid-input result mapping in /home/thaia/ECE493Group19/tests/unit/schedule-generator-model.test.js
- [ ] T037 [P] [US3] Add controller tests for dependency-unavailable and retry-eligible failure handling in /home/thaia/ECE493Group19/tests/unit/schedule-builder-controller.test.js
- [ ] T038 [P] [US3] Add SQLite-backed integration coverage for infeasible, retrieval-failure, and invalid-input outcomes in /home/thaia/ECE493Group19/tests/integration/schedule-builder-flow.test.js
- [ ] T039 [P] [US3] Add acceptance checks for AT-UC22-03 and AT-UC22-04 in /home/thaia/ECE493Group19/tests/acceptance/uc22-acceptance-checklist.md

### Implementation for User Story 3

- [ ] T040 [P] [US3] Implement no-feasible-schedule, dependency-unavailable, and retry-ready failure logic in /home/thaia/ECE493Group19/backend/models/schedule-generator-model.js
- [ ] T041 [US3] Implement invalid-input, no-feasible-schedule, and retrieval-failure controller responses in /home/thaia/ECE493Group19/backend/controllers/schedule-builder-controller.js
- [ ] T042 [P] [US3] Build the retrieval-failure and invalid-input views in /home/thaia/ECE493Group19/frontend/views/schedule-builder/schedule-error.html
- [ ] T043 [P] [US3] Build the invalid-input correction view in /home/thaia/ECE493Group19/frontend/views/schedule-builder/schedule-invalid-input.html
- [ ] T044 [P] [US3] Implement client-side handling for no-feasible, retrieval-failure, retry, and invalid-input states in /home/thaia/ECE493Group19/frontend/js/schedule-builder.js
- [ ] T045 [US3] Add distinct error, correction, and guidance styling in /home/thaia/ECE493Group19/frontend/css/schedule-builder.css
- [ ] T046 [US3] Update validation steps for infeasible, retrieval-failure, and invalid-input outcomes in /home/thaia/ECE493Group19/specs/022-branch-schedule-generator/quickstart.md

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete cross-story validation, performance checks, style compliance, and final documentation updates.

- [ ] T047 [P] Seed feasible, partial, infeasible, and retrieval-failure fixture coverage in /home/thaia/ECE493Group19/backend/db/seeds/uc22-fixtures.sql
- [ ] T048 [P] Verify keyboard navigation and assistive-text coverage across all schedule-builder views in /home/thaia/ECE493Group19/tests/acceptance/uc22-acceptance-checklist.md
- [ ] T049 [P] Add privacy validation steps covering selected courses, constraints, and generated results in /home/thaia/ECE493Group19/tests/acceptance/uc22-acceptance-checklist.md
- [ ] T050 [P] Add performance validation steps for the 10-second first-result target in /home/thaia/ECE493Group19/tests/acceptance/uc22-acceptance-checklist.md
- [ ] T051 Run style-guide compliance review for modified HTML/CSS/JS files in /home/thaia/ECE493Group19/specs/022-branch-schedule-generator/quickstart.md
- [ ] T052 Run end-to-end quickstart validation for UC-22 in /home/thaia/ECE493Group19/specs/022-branch-schedule-generator/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies; can start immediately.
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3: User Story 1**: Depends on Phase 2 and delivers the MVP.
- **Phase 4: User Story 2**: Depends on Phase 2 and integrates with the schedule-generation core from US1.
- **Phase 5: User Story 3**: Depends on Phase 2 and extends the same controller/model flow with distinct failure outcomes.
- **Phase 6: Polish**: Depends on the completion of the desired user stories.

### User Story Dependencies

- **US1 (P1)**: Can start immediately after Phase 2.
- **US2 (P2)**: Can start after Phase 2 but depends on the shared generation primitives created for US1.
- **US3 (P3)**: Can start after Phase 2 but depends on the shared generation and result-state framework used by US1 and US2.

### Within Each User Story

- Write tests first and confirm they fail before implementation.
- Update models before controller orchestration that depends on them.
- Complete controller state mapping before wiring final frontend state presentation.
- Finish story-specific quickstart and acceptance references before closing the story.

### Parallel Opportunities

- `T003` and `T004` can run in parallel.
- `T006`, `T007`, `T008`, `T009`, `T011`, `T012`, and `T013` can run in parallel after `T005`.
- `T014`, `T015`, `T016`, and `T017` can run in parallel for US1.
- `T018`, `T019`, and `T021` can run in parallel for US1 after the foundational phase.
- `T025`, `T026`, `T027`, and `T028` can run in parallel for US2.
- `T029`, `T030`, `T032`, and `T033` can run in parallel for US2 after the foundational phase.
- `T036`, `T037`, `T038`, and `T039` can run in parallel for US3.
- `T040`, `T042`, `T043`, and `T044` can run in parallel for US3 after the foundational phase.
- `T047`, `T048`, `T049`, and `T050` can run in parallel in the polish phase.

---

## Parallel Example: User Story 1

```bash
Task: "Add unit tests for feasible schedule rules, constraint satisfaction, and stable option ordering in tests/unit/schedule-generator-model.test.js"
Task: "Add controller tests for valid term selection, valid course selection, and planning-only generation in tests/unit/schedule-builder-controller.test.js"
Task: "Add SQLite-backed integration coverage for feasible schedule generation in tests/integration/schedule-builder-flow.test.js"
Task: "Add acceptance checks for AT-UC22-01 feasible schedule generation in tests/acceptance/uc22-acceptance-checklist.md"
```

```bash
Task: "Extend course-selection persistence for selected courses and supported constraints in backend/models/course-selection-model.js"
Task: "Implement feasible schedule generation, non-overlap validation, and stable ordering in backend/models/schedule-generator-model.js"
Task: "Build the feasible schedule results view with course identifier, selected section, meeting days, and meeting times in frontend/views/schedule-builder/schedule-options.html"
```

---

## Parallel Example: User Story 2

```bash
Task: "Add unit tests for unschedulable-course detection and continuation eligibility in tests/unit/schedule-generator-model.test.js"
Task: "Add controller tests for partial-continuation state transitions in tests/unit/schedule-builder-controller.test.js"
Task: "Add SQLite-backed integration coverage for partial continuation with remaining schedulable courses in tests/integration/schedule-builder-flow.test.js"
Task: "Add acceptance checks for AT-UC22-02 unschedulable-course continuation in tests/acceptance/uc22-acceptance-checklist.md"
```

---

## Parallel Example: User Story 3

```bash
Task: "Add unit tests for no-feasible-schedule, retrieval-failure, and invalid-input result mapping in tests/unit/schedule-generator-model.test.js"
Task: "Add controller tests for dependency-unavailable and retry-eligible failure handling in tests/unit/schedule-builder-controller.test.js"
Task: "Add SQLite-backed integration coverage for infeasible, retrieval-failure, and invalid-input outcomes in tests/integration/schedule-builder-flow.test.js"
Task: "Add acceptance checks for AT-UC22-03 and AT-UC22-04 in tests/acceptance/uc22-acceptance-checklist.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate feasible schedule generation independently before expanding to later states.

### Incremental Delivery

1. Finish Setup and Foundational phases.
2. Deliver US1 and validate feasible schedule generation.
3. Deliver US2 and validate partial continuation without regressing US1.
4. Deliver US3 and validate infeasible, retrieval-failure, and invalid-input outcomes.
5. Finish cross-cutting accessibility, privacy, performance, and style checks.

### Parallel Team Strategy

1. One developer owns schema and shared model/controller groundwork in Phase 2.
2. After Phase 2, one developer can focus on US1 schedule generation, another on US2 continuation behavior, and another on US3 failure-state handling.
3. Reserve the polish phase for shared validation, fixture hardening, and acceptance evidence.

---

## Notes

- `[P]` tasks modify different files and can be split across contributors.
- Story labels map directly to the P1/P2/P3 user stories in `spec.md`.
- Acceptance coverage is included because the feature request explicitly requires corresponding acceptance tests.
- Each user story is intended to be independently testable before moving to the next priority.
