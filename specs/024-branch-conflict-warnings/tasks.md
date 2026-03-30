# Tasks: UC-24 Warn About Time Conflicts in Candidate Schedules

**Input**: Design documents from `/specs/024-branch-conflict-warnings/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, `contracts/conflict-analysis-ui-contract.md`, quickstart.md

**Tests**: Acceptance and integration tests are included because the feature request explicitly requires corresponding acceptance-test coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., `US1`, `US2`, `US3`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the UC-24 implementation skeleton and traceability scaffolding

- [ ] T001 Create the UC-24 MVC directory skeleton under `app/`, `public/`, `database/`, and `tests/` based on `/home/thaia/ECE493Group19/specs/024-branch-conflict-warnings/plan.md`
- [ ] T002 Add UC-24 traceability notes for implementation and acceptance coverage in `/home/thaia/ECE493Group19/specs/024-branch-conflict-warnings/quickstart.md`
- [ ] T003 [P] Create the feature stylesheet placeholder in `/home/thaia/ECE493Group19/public/css/schedule-conflict.css`
- [ ] T004 [P] Create the feature JavaScript placeholder in `/home/thaia/ECE493Group19/public/js/schedule-conflict.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared persistence, routing, authorization, and MVC foundations required by all stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create SQLite migration for candidate schedules, meeting components, and timetable-backed conflict-analysis inputs in `/home/thaia/ECE493Group19/database/migrations/024_schedule_conflict_analysis.sql`
- [ ] T006 [P] Add seed data for authenticated student, candidate schedules, and timetable records in `/home/thaia/ECE493Group19/database/seeds/024_schedule_conflict_analysis.sql`
- [ ] T007 [P] Implement candidate schedule persistence access in `/home/thaia/ECE493Group19/app/models/candidate-schedule-model.js`
- [ ] T008 [P] Implement meeting component persistence access in `/home/thaia/ECE493Group19/app/models/meeting-component-model.js`
- [ ] T009 [P] Implement timetable availability and lookup access in `/home/thaia/ECE493Group19/app/models/timetable-model.js`
- [ ] T010 [P] Implement authenticated ownership checks for selected candidate schedules in `/home/thaia/ECE493Group19/app/controllers/schedule-conflict-controller.js`
- [ ] T011 [P] Implement shared overlap comparison helpers and time-completeness normalization in `/home/thaia/ECE493Group19/app/services/conflict-analysis-service.js`
- [ ] T012 Add the `GET /schedule-conflict/:scheduleId` route wiring and MVC ownership comments in `/home/thaia/ECE493Group19/app/controllers/schedule-conflict-controller.js`
- [ ] T013 Add HTML/CSS/JS style-guide compliance notes for UC-24 files in `/home/thaia/ECE493Group19/specs/024-branch-conflict-warnings/plan.md`

**Checkpoint**: Foundation ready for independent story implementation

---

## Phase 3: User Story 1 - Detect Conflicts in a Candidate Schedule (Priority: P1) 🎯 MVP

**Goal**: Let an authenticated student analyze one selected candidate schedule and see one warning per overlapping conflict with identifying details

**Independent Test**: Select one generated candidate schedule with overlapping sections, request conflict analysis, and confirm each overlap is reported with the conflicting course codes, section identifiers, and overlap window.

### Tests for User Story 1

- [ ] T014 [P] [US1] Add acceptance coverage for `AT-UC24-01` conflict warnings in `/home/thaia/ECE493Group19/tests/acceptance/uc24-conflicts.test.js`
- [ ] T015 [P] [US1] Add integration coverage for overlap-only conflict detection in `/home/thaia/ECE493Group19/tests/integration/schedule-conflict-controller.test.js`
- [ ] T016 [P] [US1] Add unit coverage for overlap-only conflict calculations in `/home/thaia/ECE493Group19/tests/unit/conflict-analysis-service.test.js`
- [ ] T017 [P] [US1] Add integration coverage for regenerate-then-reanalyze behavior in `/home/thaia/ECE493Group19/tests/integration/schedule-conflict-controller.test.js`

### Implementation for User Story 1

- [ ] T018 [P] [US1] Extend `/home/thaia/ECE493Group19/app/models/candidate-schedule-model.js` to load one selected candidate schedule summary for the authenticated student
- [ ] T019 [P] [US1] Extend `/home/thaia/ECE493Group19/app/models/meeting-component-model.js` to load complete meeting-time data for one selected schedule
- [ ] T020 [US1] Implement conflict-warning generation with course code, section identifier, and overlap window in `/home/thaia/ECE493Group19/app/services/conflict-analysis-service.js`
- [ ] T021 [US1] Implement the `conflicts_found` controller flow and reanalysis after regenerated schedule selection in `/home/thaia/ECE493Group19/app/controllers/schedule-conflict-controller.js`
- [ ] T022 [US1] Build the conflict-results view in `/home/thaia/ECE493Group19/app/views/schedule-conflict/schedule-conflict-result.html`
- [ ] T023 [US1] Add conflict warning styling and advisory-only presentation rules in `/home/thaia/ECE493Group19/public/css/schedule-conflict.css`
- [ ] T024 [US1] Add client-side view behavior for selected schedule summary and warning presentation in `/home/thaia/ECE493Group19/public/js/schedule-conflict.js`

**Checkpoint**: User Story 1 is independently functional and testable

---

## Phase 4: User Story 2 - Confirm When a Schedule Is Conflict-Free (Priority: P2)

**Goal**: Let the student receive an explicit conflict-free confirmation for a selected schedule with no overlaps

**Independent Test**: Select one generated conflict-free schedule, request analysis, and confirm the system explicitly reports that the schedule is conflict-free without showing false warnings.

### Tests for User Story 2

- [ ] T025 [P] [US2] Add acceptance coverage for `AT-UC24-02` conflict-free confirmation in `/home/thaia/ECE493Group19/tests/acceptance/uc24-conflict-free.test.js`
- [ ] T026 [P] [US2] Extend controller integration coverage for the `conflict_free` state in `/home/thaia/ECE493Group19/tests/integration/schedule-conflict-controller.test.js`
- [ ] T027 [P] [US2] Extend unit coverage for no-overlap and touching-but-non-overlap cases in `/home/thaia/ECE493Group19/tests/unit/conflict-analysis-service.test.js`

### Implementation for User Story 2

- [ ] T028 [US2] Extend `/home/thaia/ECE493Group19/app/services/conflict-analysis-service.js` to return a distinct `conflict_free` outcome when no overlaps are found
- [ ] T029 [US2] Extend `/home/thaia/ECE493Group19/app/controllers/schedule-conflict-controller.js` to render the `conflict_free` state for one selected schedule
- [ ] T030 [US2] Update `/home/thaia/ECE493Group19/app/views/schedule-conflict/schedule-conflict-result.html` to include the conflict-free confirmation state
- [ ] T031 [US2] Update `/home/thaia/ECE493Group19/public/css/schedule-conflict.css` for conflict-free visual treatment without implying registration changes
- [ ] T032 [US2] Update `/home/thaia/ECE493Group19/public/js/schedule-conflict.js` so conflict-free state messaging remains consistent with the selected schedule summary

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - Handle Incomplete or Unavailable Conflict Analysis (Priority: P3)

**Goal**: Give the student accurate incomplete-analysis and unavailable-analysis guidance when meeting-time data is partial or timetable data cannot be used

**Independent Test**: Use one selected schedule with unknown or partial times and one request with unavailable timetable data after schedule generation, then confirm the system returns the correct incomplete or unavailable state with retry-later guidance.

### Tests for User Story 3

- [ ] T033 [P] [US3] Add acceptance coverage for `AT-UC24-03` incomplete analysis in `/home/thaia/ECE493Group19/tests/acceptance/uc24-incomplete-analysis.test.js`
- [ ] T034 [P] [US3] Add acceptance coverage for `AT-UC24-04` unavailable timetable handling in `/home/thaia/ECE493Group19/tests/acceptance/uc24-unavailable-analysis.test.js`
- [ ] T035 [P] [US3] Extend controller integration coverage for `incomplete` and `unavailable` states in `/home/thaia/ECE493Group19/tests/integration/schedule-conflict-controller.test.js`
- [ ] T036 [P] [US3] Extend unit coverage for partial/TBA meeting times and unavailable timetable dependencies in `/home/thaia/ECE493Group19/tests/unit/conflict-analysis-service.test.js`

### Implementation for User Story 3

- [ ] T037 [US3] Extend `/home/thaia/ECE493Group19/app/services/conflict-analysis-service.js` to return `incomplete` outcomes for unknown, TBA, or partial meeting times
- [ ] T038 [US3] Extend `/home/thaia/ECE493Group19/app/services/conflict-analysis-service.js` to return `unavailable` outcomes when timetable data is missing after schedule generation or at analysis time
- [ ] T039 [US3] Extend `/home/thaia/ECE493Group19/app/controllers/schedule-conflict-controller.js` to select `incomplete` and `unavailable` view states with retry-later messaging
- [ ] T040 [P] [US3] Build the incomplete-analysis view in `/home/thaia/ECE493Group19/app/views/schedule-conflict/schedule-conflict-incomplete.html`
- [ ] T041 [P] [US3] Build the unavailable-analysis view in `/home/thaia/ECE493Group19/app/views/schedule-conflict/schedule-conflict-unavailable.html`
- [ ] T042 [US3] Update `/home/thaia/ECE493Group19/public/css/schedule-conflict.css` for incomplete and unavailable state presentation
- [ ] T043 [US3] Update `/home/thaia/ECE493Group19/public/js/schedule-conflict.js` for flagged-component and retry-guidance messaging behavior

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish traceability, accessibility, performance, and validation across all stories

- [ ] T044 [P] Add accessibility checks for warnings, confirmations, and incomplete/unavailable messages in `/home/thaia/ECE493Group19/tests/integration/schedule-conflict-accessibility.test.js`
- [ ] T045 [P] Add privacy and ownership regression coverage for authenticated self-only access in `/home/thaia/ECE493Group19/tests/integration/schedule-conflict-auth.test.js`
- [ ] T046 Verify HTML/CSS style-guide compliance for `/home/thaia/ECE493Group19/app/views/schedule-conflict/schedule-conflict-result.html`, `/home/thaia/ECE493Group19/app/views/schedule-conflict/schedule-conflict-incomplete.html`, `/home/thaia/ECE493Group19/app/views/schedule-conflict/schedule-conflict-unavailable.html`, and `/home/thaia/ECE493Group19/public/css/schedule-conflict.css`
- [ ] T047 Verify JavaScript style-guide compliance for `/home/thaia/ECE493Group19/app/controllers/schedule-conflict-controller.js`, `/home/thaia/ECE493Group19/app/models/candidate-schedule-model.js`, `/home/thaia/ECE493Group19/app/models/meeting-component-model.js`, `/home/thaia/ECE493Group19/app/models/timetable-model.js`, `/home/thaia/ECE493Group19/app/services/conflict-analysis-service.js`, and `/home/thaia/ECE493Group19/public/js/schedule-conflict.js`
- [ ] T048 Validate the 2-second result-display target in `/home/thaia/ECE493Group19/tests/integration/schedule-conflict-performance.test.js`
- [ ] T049 Run the UC-24 quickstart validation scenarios and record outcomes in `/home/thaia/ECE493Group19/specs/024-branch-conflict-warnings/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all story work
- **Phase 3: US1**: Depends on Phase 2
- **Phase 4: US2**: Depends on Phase 2 and reuses US1 foundations, but remains independently testable
- **Phase 5: US3**: Depends on Phase 2 and reuses US1 foundations, but remains independently testable
- **Phase 6: Polish**: Depends on completion of the desired user stories

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no dependency on other user stories
- **US2 (P2)**: Starts after Foundational; builds on the same controller/service flow as US1
- **US3 (P3)**: Starts after Foundational; builds on the same controller/service flow as US1

### Within Each User Story

- Acceptance/integration/unit tests first
- Model loading before service logic
- Service logic before controller state selection
- Controller flow before final view/CSS/JS presentation

### Parallel Opportunities

- `T003` and `T004` can run in parallel in Setup
- `T006`, `T007`, `T008`, `T009`, `T010`, and `T011` can run in parallel in Foundational
- `T014`, `T015`, `T016`, and `T017` can run in parallel for US1 test coverage
- `T018` and `T019` can run in parallel before `T020` in US1
- `T025`, `T026`, and `T027` can run in parallel for US2 test coverage
- `T033`, `T034`, `T035`, and `T036` can run in parallel for US3 test coverage
- `T040` and `T041` can run in parallel after `T039`
- `T044` and `T045` can run in parallel in Polish

---

## Parallel Example: User Story 1

```bash
Task: "Add acceptance coverage for AT-UC24-01 in tests/acceptance/uc24-conflicts.test.js"
Task: "Add integration coverage for overlap-only detection in tests/integration/schedule-conflict-controller.test.js"
Task: "Add unit coverage for overlap-only calculations in tests/unit/conflict-analysis-service.test.js"
Task: "Add integration coverage for regenerate-then-reanalyze behavior in tests/integration/schedule-conflict-controller.test.js"

Task: "Extend candidate schedule loading in app/models/candidate-schedule-model.js"
Task: "Extend meeting component loading in app/models/meeting-component-model.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate `AT-UC24-01` independently before moving on

### Incremental Delivery

1. Finish Setup + Foundational
2. Deliver US1 conflict warnings
3. Deliver US2 conflict-free confirmation
4. Deliver US3 incomplete/unavailable handling
5. Finish polish, accessibility, privacy, and performance validation

### Parallel Team Strategy

1. One developer completes the shared persistence and route foundations
2. One developer handles US1 result rendering while another prepares US2 confirmation behavior
3. A third developer can implement US3 state-specific views once the shared controller/service foundation is stable

---

## Notes

- All tasks use exact file paths
- Story phases include explicit `[US#]` labels
- Acceptance-test coverage remains traceable to `UC-24-AS`
- Each user story is independently testable after its phase checkpoint
