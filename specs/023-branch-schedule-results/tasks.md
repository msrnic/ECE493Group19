# Tasks: UC-23 Request Multiple Schedule Results

**Input**: Design documents from `/specs/023-branch-schedule-results/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/schedule-results-ui-contract.md`, `quickstart.md`

**Tests**: This feature requires browser acceptance validation, unit tests, and integration tests because the specification and acceptance suite explicitly define ranked-result, capped-count, timeout, and blocked-precondition behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the documentation and validation scaffolding needed before feature code begins.

- [ ] T001 Create the UC-23 implementation task inventory in /home/thaia/ECE493Group19/specs/023-branch-schedule-results/tasks.md
- [ ] T002 Map UC-23 use-case and acceptance references in /home/thaia/ECE493Group19/specs/023-branch-schedule-results/quickstart.md
- [ ] T003 [P] Add the UC-23 acceptance checklist skeleton in /home/thaia/ECE493Group19/tests/acceptance/uc23-acceptance-checklist.md
- [ ] T004 [P] Add a UC-23 fixture placeholder for ranked-success, capped-success, reduced-success, timeout, and blocked-precondition data in /home/thaia/ECE493Group19/backend/db/seeds/uc23-fixtures.sql

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish schema, MVC boundaries, shared validation, and base controller/model behavior required by all stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create the SQLite schema for schedule result requests, ranked schedule options, and generation-limit outcomes in /home/thaia/ECE493Group19/backend/db/schema/schedule-results.sql
- [ ] T006 [P] Implement authenticated student and scheduling-term lookup helpers in /home/thaia/ECE493Group19/backend/models/student-model.js
- [ ] T007 [P] Implement request-count validation and course-selection normalization helpers in /home/thaia/ECE493Group19/backend/models/course-selection-model.js
- [ ] T008 [P] Implement catalog and timetable availability helpers in /home/thaia/ECE493Group19/backend/models/timetable-model.js
- [ ] T009 [P] Implement shared ranked-schedule feasibility and ordering primitives in /home/thaia/ECE493Group19/backend/models/schedule-generator-model.js
- [ ] T010 Implement request orchestration and result-state mapping in /home/thaia/ECE493Group19/backend/controllers/schedule-results-controller.js
- [ ] T011 [P] Create the base schedule-results request form view in /home/thaia/ECE493Group19/frontend/views/schedule-results/schedule-results-page.html
- [ ] T012 [P] Create the shared schedule-results client state and submission flow in /home/thaia/ECE493Group19/frontend/js/schedule-results.js
- [ ] T013 [P] Create the shared schedule-results layout and accessible state styles in /home/thaia/ECE493Group19/frontend/css/schedule-results.css

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Request Multiple Ranked Schedules (Priority: P1) 🎯 MVP

**Goal**: Allow an authenticated student to request up to 10 ranked, distinct, planning-only schedule alternatives for a selected term and course set.

**Independent Test**: Sign in as a student, choose an available scheduling term and a course set with many feasible schedules, request a valid result count, and confirm ranked schedule options with comparison details are displayed without changing enrollment.

### Tests for User Story 1

- [ ] T014 [P] [US1] Add unit tests for distinct-result generation, deterministic ranking, and request counts from 1 to 10 in /home/thaia/ECE493Group19/tests/unit/schedule-generator-model.test.js
- [ ] T015 [P] [US1] Add controller tests for valid ranked-result requests and planning-only responses in /home/thaia/ECE493Group19/tests/unit/schedule-results-controller.test.js
- [ ] T016 [P] [US1] Add SQLite-backed integration coverage for ranked multi-result scheduling success in /home/thaia/ECE493Group19/tests/integration/schedule-results-flow.test.js
- [ ] T017 [P] [US1] Add acceptance checks for AT-UC23-01 ranked multi-result success in /home/thaia/ECE493Group19/tests/acceptance/uc23-acceptance-checklist.md

### Implementation for User Story 1

- [ ] T018 [P] [US1] Extend schedule result request persistence for validated requested counts and selected courses in /home/thaia/ECE493Group19/backend/models/course-selection-model.js
- [ ] T019 [P] [US1] Implement distinct ranked schedule generation and stable ordering in /home/thaia/ECE493Group19/backend/models/schedule-generator-model.js
- [ ] T020 [US1] Implement the authenticated ranked-result generation flow in /home/thaia/ECE493Group19/backend/controllers/schedule-results-controller.js
- [ ] T021 [P] [US1] Build the ranked schedule result list view with course identifiers, selected sections, and meeting days and times in /home/thaia/ECE493Group19/frontend/views/schedule-results/schedule-results-list.html
- [ ] T022 [P] [US1] Render requested-count submission, ranked result summaries, and planning-only messaging in /home/thaia/ECE493Group19/frontend/js/schedule-results.js
- [ ] T023 [US1] Add ranked result comparison styling and accessible result-state presentation in /home/thaia/ECE493Group19/frontend/css/schedule-results.css
- [ ] T024 [US1] Verify UC-23 traceability and ranked-success validation steps in /home/thaia/ECE493Group19/specs/023-branch-schedule-results/quickstart.md

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Handle Requested Count Limits and Reduced Results (Priority: P2)

**Goal**: Let students receive capped or reduced result sets with clear count explanations instead of ambiguous output.

**Independent Test**: Submit one request above 10 and one request with fewer feasible schedules than requested, then confirm the system caps or reduces the results correctly and explains the outcome.

### Tests for User Story 2

- [ ] T025 [P] [US2] Add unit tests for capping requests above 10 and reduced-result outcomes in /home/thaia/ECE493Group19/tests/unit/schedule-generator-model.test.js
- [ ] T026 [P] [US2] Add controller tests for capped-success and reduced-success result states in /home/thaia/ECE493Group19/tests/unit/schedule-results-controller.test.js
- [ ] T027 [P] [US2] Add SQLite-backed integration coverage for capped and reduced-result flows in /home/thaia/ECE493Group19/tests/integration/schedule-results-flow.test.js
- [ ] T028 [P] [US2] Add acceptance checks for AT-UC23-02 and AT-UC23-06 in /home/thaia/ECE493Group19/tests/acceptance/uc23-acceptance-checklist.md

### Implementation for User Story 2

- [ ] T029 [P] [US2] Persist effective result counts and generation-limit outcomes in /home/thaia/ECE493Group19/backend/models/course-selection-model.js
- [ ] T030 [P] [US2] Implement request capping and reduced-result outcome generation in /home/thaia/ECE493Group19/backend/models/schedule-generator-model.js
- [ ] T031 [US2] Map capped-success and reduced-success responses in /home/thaia/ECE493Group19/backend/controllers/schedule-results-controller.js
- [ ] T032 [P] [US2] Build the capped and reduced-result messaging view in /home/thaia/ECE493Group19/frontend/views/schedule-results/schedule-results-partial.html
- [ ] T033 [P] [US2] Implement client-side capped-count and reduced-result state messaging in /home/thaia/ECE493Group19/frontend/js/schedule-results.js
- [ ] T034 [US2] Add capped and reduced-result presentation styles in /home/thaia/ECE493Group19/frontend/css/schedule-results.css
- [ ] T035 [US2] Update validation steps for capped and reduced-result behavior in /home/thaia/ECE493Group19/specs/023-branch-schedule-results/quickstart.md

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Recover From Invalid Input or Generation Failure (Priority: P3)

**Goal**: Give students distinct recovery guidance for invalid input, timeout outcomes, unauthenticated access, and unavailable scheduling data.

**Independent Test**: Exercise invalid requested counts, timeout with and without partial results, unauthenticated access, and unavailable-data cases; confirm each state blocks or limits output correctly and presents the right recovery message.

### Tests for User Story 3

- [ ] T036 [P] [US3] Add unit tests for invalid-input, partial-timeout, timeout-failure, blocked-auth, and blocked-data-unavailable outcomes in /home/thaia/ECE493Group19/tests/unit/schedule-generator-model.test.js
- [ ] T037 [P] [US3] Add controller tests for stale-data blocking, unauthenticated blocking, and retry guidance in /home/thaia/ECE493Group19/tests/unit/schedule-results-controller.test.js
- [ ] T038 [P] [US3] Add SQLite-backed integration coverage for invalid input, timeout, and blocked-precondition flows in /home/thaia/ECE493Group19/tests/integration/schedule-results-flow.test.js
- [ ] T039 [P] [US3] Add acceptance checks for AT-UC23-03 through AT-UC23-10 in /home/thaia/ECE493Group19/tests/acceptance/uc23-acceptance-checklist.md

### Implementation for User Story 3

- [ ] T040 [P] [US3] Implement invalid-input, partial-timeout, timeout-failure, and blocked-precondition logic in /home/thaia/ECE493Group19/backend/models/schedule-generator-model.js
- [ ] T041 [US3] Implement invalid-input, timeout, unauthenticated, and unavailable-data controller responses in /home/thaia/ECE493Group19/backend/controllers/schedule-results-controller.js
- [ ] T042 [P] [US3] Build the timeout and blocked-precondition error view in /home/thaia/ECE493Group19/frontend/views/schedule-results/schedule-results-error.html
- [ ] T043 [P] [US3] Build the invalid-input correction view in /home/thaia/ECE493Group19/frontend/views/schedule-results/schedule-results-invalid-input.html
- [ ] T044 [P] [US3] Implement client-side handling for invalid-input, partial-timeout, timeout-failure, and blocked-precondition states in /home/thaia/ECE493Group19/frontend/js/schedule-results.js
- [ ] T045 [US3] Add distinct timeout, invalid-input, and blocked-precondition styling in /home/thaia/ECE493Group19/frontend/css/schedule-results.css
- [ ] T046 [US3] Update validation steps for invalid-input, timeout, and blocked-precondition outcomes in /home/thaia/ECE493Group19/specs/023-branch-schedule-results/quickstart.md

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete cross-story validation, performance checks, style compliance, and final documentation updates.

- [ ] T047 [P] Seed ranked-success, capped-success, reduced-success, partial-timeout, timeout-failure, and blocked-precondition fixture coverage in /home/thaia/ECE493Group19/backend/db/seeds/uc23-fixtures.sql
- [ ] T048 [P] Verify keyboard navigation and assistive-text coverage across all schedule-results views in /home/thaia/ECE493Group19/tests/acceptance/uc23-acceptance-checklist.md
- [ ] T049 [P] Add privacy validation steps covering requested counts, selected courses, and ranked schedules in /home/thaia/ECE493Group19/tests/acceptance/uc23-acceptance-checklist.md
- [ ] T050 [P] Add performance validation steps for the 10-second first-ranked-result target in /home/thaia/ECE493Group19/tests/acceptance/uc23-acceptance-checklist.md
- [ ] T051 Run style-guide compliance review for modified HTML/CSS/JS files in /home/thaia/ECE493Group19/specs/023-branch-schedule-results/quickstart.md
- [ ] T052 Run end-to-end quickstart validation for UC-23 in /home/thaia/ECE493Group19/specs/023-branch-schedule-results/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies; can start immediately.
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3: User Story 1**: Depends on Phase 2 and delivers the MVP.
- **Phase 4: User Story 2**: Depends on Phase 2 and extends the ranked-result core from US1 with capped and reduced-count behavior.
- **Phase 5: User Story 3**: Depends on Phase 2 and extends the same controller/model flow with invalid-input, timeout, and blocked-precondition outcomes.
- **Phase 6: Polish**: Depends on the completion of the desired user stories.

### User Story Dependencies

- **US1 (P1)**: Can start immediately after Phase 2.
- **US2 (P2)**: Can start after Phase 2 but depends on the shared ranked-generation primitives created for US1.
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
Task: "Add unit tests for distinct-result generation, deterministic ranking, and request counts from 1 to 10 in tests/unit/schedule-generator-model.test.js"
Task: "Add controller tests for valid ranked-result requests and planning-only responses in tests/unit/schedule-results-controller.test.js"
Task: "Add SQLite-backed integration coverage for ranked multi-result scheduling success in tests/integration/schedule-results-flow.test.js"
Task: "Add acceptance checks for AT-UC23-01 ranked multi-result success in tests/acceptance/uc23-acceptance-checklist.md"
```

```bash
Task: "Extend schedule result request persistence for validated requested counts and selected courses in backend/models/course-selection-model.js"
Task: "Implement distinct ranked schedule generation and stable ordering in backend/models/schedule-generator-model.js"
Task: "Build the ranked schedule result list view with course identifiers, selected sections, and meeting days and times in frontend/views/schedule-results/schedule-results-list.html"
```

---

## Parallel Example: User Story 2

```bash
Task: "Add unit tests for capping requests above 10 and reduced-result outcomes in tests/unit/schedule-generator-model.test.js"
Task: "Add controller tests for capped-success and reduced-success result states in tests/unit/schedule-results-controller.test.js"
Task: "Add SQLite-backed integration coverage for capped and reduced-result flows in tests/integration/schedule-results-flow.test.js"
Task: "Add acceptance checks for AT-UC23-02 and AT-UC23-06 in tests/acceptance/uc23-acceptance-checklist.md"
```

---

## Parallel Example: User Story 3

```bash
Task: "Add unit tests for invalid-input, partial-timeout, timeout-failure, blocked-auth, and blocked-data-unavailable outcomes in tests/unit/schedule-generator-model.test.js"
Task: "Add controller tests for stale-data blocking, unauthenticated blocking, and retry guidance in tests/unit/schedule-results-controller.test.js"
Task: "Add SQLite-backed integration coverage for invalid input, timeout, and blocked-precondition flows in tests/integration/schedule-results-flow.test.js"
Task: "Add acceptance checks for AT-UC23-03 through AT-UC23-10 in tests/acceptance/uc23-acceptance-checklist.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate ranked multi-result scheduling independently before expanding to later states.

### Incremental Delivery

1. Finish Setup and Foundational phases.
2. Deliver US1 and validate ranked multi-result scheduling.
3. Deliver US2 and validate capped and reduced-result behavior without regressing US1.
4. Deliver US3 and validate invalid-input, timeout, and blocked-precondition outcomes.
5. Finish cross-cutting accessibility, privacy, performance, and style checks.

### Parallel Team Strategy

1. One developer owns schema and shared model/controller groundwork in Phase 2.
2. After Phase 2, one developer can focus on ranked results, another on capped and reduced-count behavior, and another on timeout and blocked-precondition handling.
3. Reserve the polish phase for shared validation, fixture hardening, and acceptance evidence.

---

## Notes

- `[P]` tasks modify different files and can be split across contributors.
- Story labels map directly to the P1/P2/P3 user stories in `spec.md`.
- Acceptance coverage is included because the feature request explicitly requires corresponding acceptance tests.
- Each user story is intended to be independently testable before moving to the next priority.
