# Tasks: UC-25 Enroll in All Courses from a Chosen Schedule Option

**Input**: Design documents from `/specs/025-branch-enroll-all/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, `contracts/enroll-all-ui-contract.md`, quickstart.md

**Tests**: Acceptance, integration, and unit tests are included because the feature request explicitly requires corresponding acceptance-test coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (for example, `US1`, `US2`, `US3`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the UC-25 implementation skeleton and traceability scaffolding

- [ ] T001 Create the UC-25 MVC directory skeleton under `/home/thaia/ECE493Group19/app`, `/home/thaia/ECE493Group19/public`, `/home/thaia/ECE493Group19/database`, and `/home/thaia/ECE493Group19/tests` from `/home/thaia/ECE493Group19/specs/025-branch-enroll-all/plan.md`
- [ ] T002 Add UC-25 traceability notes for implementation and acceptance coverage in `/home/thaia/ECE493Group19/specs/025-branch-enroll-all/quickstart.md`
- [ ] T003 [P] Create the feature stylesheet placeholder in `/home/thaia/ECE493Group19/public/css/enroll-all.css`
- [ ] T004 [P] Create the feature JavaScript placeholder in `/home/thaia/ECE493Group19/public/js/enroll-all.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared persistence, authorization, routing, and policy foundations required by all stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create SQLite migration for selected schedule options, enrollment batch requests, section outcomes, and summary records in `/home/thaia/ECE493Group19/database/migrations/025_enroll_all.sql`
- [ ] T006 [P] Add seed data for eligible students, selected schedule options, and section availability in `/home/thaia/ECE493Group19/database/seeds/025_enroll_all.sql`
- [ ] T007 [P] Implement selected schedule option persistence access in `/home/thaia/ECE493Group19/app/models/schedule-option-model.js`
- [ ] T008 [P] Implement enrollment batch and summary persistence access in `/home/thaia/ECE493Group19/app/models/enrollment-batch-model.js`
- [ ] T009 [P] Implement student eligibility, holds, and term-rule access in `/home/thaia/ECE493Group19/app/models/student-eligibility-model.js`
- [ ] T010 [P] Implement authenticated ownership checks for selected schedule options in `/home/thaia/ECE493Group19/app/controllers/enroll-all-controller.js`
- [ ] T011 [P] Implement shared enrollment-policy and rollback helpers in `/home/thaia/ECE493Group19/app/services/enroll-all-service.js`
- [ ] T012 Add the `POST /enroll-all/:scheduleOptionId` route wiring and MVC ownership comments in `/home/thaia/ECE493Group19/app/controllers/enroll-all-controller.js`
- [ ] T013 Add HTML/CSS/JS style-guide compliance notes for UC-25 files in `/home/thaia/ECE493Group19/specs/025-branch-enroll-all/plan.md`

**Checkpoint**: Foundation ready for independent story implementation

---

## Phase 3: User Story 1 - Enroll in a Selected Schedule Option (Priority: P1) 🎯 MVP

**Goal**: Let an eligible authenticated student submit Enroll All for one selected schedule option and receive a section-by-section success summary

**Independent Test**: Select a valid schedule option, submit Enroll All, and confirm all enrollable sections are added with a summary listing each section's course code, section identifier, and final outcome.

### Tests for User Story 1

- [ ] T014 [P] [US1] Add acceptance coverage for `AT-UC25-01` successful batch enrollment in `/home/thaia/ECE493Group19/tests/acceptance/uc25-enroll-all-success.test.js`
- [ ] T015 [P] [US1] Add integration coverage for successful Enroll All controller flow in `/home/thaia/ECE493Group19/tests/integration/enroll-all-controller.test.js`
- [ ] T016 [P] [US1] Add unit coverage for linked-section batch handling in `/home/thaia/ECE493Group19/tests/unit/enroll-all-service.test.js`

### Implementation for User Story 1

- [ ] T017 [P] [US1] Extend `/home/thaia/ECE493Group19/app/models/schedule-option-model.js` to load one selected schedule option with linked section selections
- [ ] T018 [P] [US1] Extend `/home/thaia/ECE493Group19/app/models/enrollment-batch-model.js` to persist successful section outcomes and batch summaries
- [ ] T019 [US1] Implement successful batch-enrollment processing for one selected schedule option in `/home/thaia/ECE493Group19/app/services/enroll-all-service.js`
- [ ] T020 [US1] Implement the `success` controller flow in `/home/thaia/ECE493Group19/app/controllers/enroll-all-controller.js`
- [ ] T021 [US1] Build the success summary view in `/home/thaia/ECE493Group19/app/views/enroll-all/enroll-all-summary.html`
- [ ] T022 [US1] Add success-summary styling and section-outcome presentation rules in `/home/thaia/ECE493Group19/public/css/enroll-all.css`
- [ ] T023 [US1] Add client-side summary behavior for selected schedule option details in `/home/thaia/ECE493Group19/public/js/enroll-all.js`

**Checkpoint**: User Story 1 is independently functional and testable

---

## Phase 4: User Story 2 - Report Section-Level Enrollment Failures Safely (Priority: P2)

**Goal**: Let the student see clear section-level failures while allowing only safe partial success under the default policy

**Independent Test**: Select a schedule option where one section is full, one conflicts in real time, or one fails due to hold or prerequisite, then confirm the system reports which sections failed, which still enrolled, and why.

### Tests for User Story 2

- [ ] T024 [P] [US2] Add acceptance coverage for `AT-UC25-02` section-full partial success in `/home/thaia/ECE493Group19/tests/acceptance/uc25-enroll-all-capacity.test.js`
- [ ] T025 [P] [US2] Add acceptance coverage for `AT-UC25-03` real-time conflict handling in `/home/thaia/ECE493Group19/tests/acceptance/uc25-enroll-all-conflict.test.js`
- [ ] T026 [P] [US2] Add acceptance coverage for `AT-UC25-04` hold and prerequisite failures in `/home/thaia/ECE493Group19/tests/acceptance/uc25-enroll-all-eligibility.test.js`
- [ ] T027 [P] [US2] Extend controller integration coverage for `partial_success` outcomes in `/home/thaia/ECE493Group19/tests/integration/enroll-all-controller.test.js`
- [ ] T028 [P] [US2] Extend unit coverage for safe partial-success decisions in `/home/thaia/ECE493Group19/tests/unit/enroll-all-service.test.js`

### Implementation for User Story 2

- [ ] T029 [US2] Extend `/home/thaia/ECE493Group19/app/services/enroll-all-service.js` to evaluate capacity, real-time conflict, hold, and prerequisite failures under the default partial-success policy
- [ ] T030 [US2] Extend `/home/thaia/ECE493Group19/app/controllers/enroll-all-controller.js` to render the `partial_success` state with per-section failure reasons
- [ ] T031 [US2] Build the partial-success summary view in `/home/thaia/ECE493Group19/app/views/enroll-all/enroll-all-partial.html`
- [ ] T032 [US2] Update `/home/thaia/ECE493Group19/public/css/enroll-all.css` for mixed enrolled/failed section presentation
- [ ] T033 [US2] Update `/home/thaia/ECE493Group19/public/js/enroll-all.js` for partial-success messaging and section-outcome display

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - Preserve Consistent State During Batch Failure (Priority: P3)

**Goal**: Keep enrollment state consistent during system failures and atomic-policy cancellation

**Independent Test**: Simulate a system error or unusable enrollment-input failure during batch enrollment and an atomic-policy batch with one failing section, then confirm the final state is failure or atomic cancellation with no hidden partial changes.

### Tests for User Story 3

- [ ] T034 [P] [US3] Add acceptance coverage for `AT-UC25-05` system-error rollback and unusable-input batch failure in `/home/thaia/ECE493Group19/tests/acceptance/uc25-enroll-all-system-error.test.js`
- [ ] T035 [P] [US3] Add acceptance coverage for `AT-UC25-06` atomic-policy cancellation in `/home/thaia/ECE493Group19/tests/acceptance/uc25-enroll-all-atomic.test.js`
- [ ] T036 [P] [US3] Extend controller integration coverage for `failure`, unusable-input failure, and `atomic_cancelled` states in `/home/thaia/ECE493Group19/tests/integration/enroll-all-controller.test.js`
- [ ] T037 [P] [US3] Extend unit coverage for rollback-required failure and atomic-cancel logic in `/home/thaia/ECE493Group19/tests/unit/enroll-all-service.test.js`

### Implementation for User Story 3

- [ ] T038 [US3] Extend `/home/thaia/ECE493Group19/app/services/enroll-all-service.js` to roll back tentative work for system-error and unusable-input failure paths
- [ ] T039 [US3] Extend `/home/thaia/ECE493Group19/app/services/enroll-all-service.js` to cancel the full batch when atomic enrollment policy is enabled and any section fails
- [ ] T040 [US3] Extend `/home/thaia/ECE493Group19/app/controllers/enroll-all-controller.js` to render `failure` and `atomic_cancelled` states with preserved-state messaging
- [ ] T041 [P] [US3] Build the shared failure view for `failure` and `atomic_cancelled` outcomes in `/home/thaia/ECE493Group19/app/views/enroll-all/enroll-all-failure.html`
- [ ] T042 [US3] Update `/home/thaia/ECE493Group19/public/css/enroll-all.css` for failure and atomic-cancel presentation
- [ ] T043 [US3] Update `/home/thaia/ECE493Group19/public/js/enroll-all.js` for failure-state and atomic-policy messaging behavior

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish traceability, accessibility, privacy, and performance validation across all stories

- [ ] T044 [P] Add accessibility checks for success, partial-success, failure, and atomic-cancel states in `/home/thaia/ECE493Group19/tests/integration/enroll-all-accessibility.test.js`
- [ ] T045 [P] Add privacy and ownership regression coverage for authenticated self-only batch enrollment in `/home/thaia/ECE493Group19/tests/integration/enroll-all-auth.test.js`
- [ ] T046 Verify HTML/CSS style-guide compliance for `/home/thaia/ECE493Group19/app/views/enroll-all/enroll-all-summary.html`, `/home/thaia/ECE493Group19/app/views/enroll-all/enroll-all-partial.html`, `/home/thaia/ECE493Group19/app/views/enroll-all/enroll-all-failure.html`, and `/home/thaia/ECE493Group19/public/css/enroll-all.css`
- [ ] T047 Verify JavaScript style-guide compliance for `/home/thaia/ECE493Group19/app/controllers/enroll-all-controller.js`, `/home/thaia/ECE493Group19/app/models/enrollment-batch-model.js`, `/home/thaia/ECE493Group19/app/models/schedule-option-model.js`, `/home/thaia/ECE493Group19/app/models/student-eligibility-model.js`, `/home/thaia/ECE493Group19/app/services/enroll-all-service.js`, and `/home/thaia/ECE493Group19/public/js/enroll-all.js`
- [ ] T048 Validate the 10-second final-summary target in `/home/thaia/ECE493Group19/tests/integration/enroll-all-performance.test.js`
- [ ] T049 Run the UC-25 quickstart validation scenarios and record outcomes in `/home/thaia/ECE493Group19/specs/025-branch-enroll-all/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all story work
- **Phase 3: US1**: Depends on Phase 2
- **Phase 4: US2**: Depends on Phase 2 and reuses the shared controller/service foundation, but remains independently testable
- **Phase 5: US3**: Depends on Phase 2 and reuses the shared controller/service foundation, but remains independently testable
- **Phase 6: Polish**: Depends on completion of the desired user stories

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no dependency on other user stories
- **US2 (P2)**: Starts after Foundational; extends the same selected-schedule enrollment flow as US1
- **US3 (P3)**: Starts after Foundational; extends the same selected-schedule enrollment flow as US1

### Within Each User Story

- Acceptance/integration/unit tests first
- Model loading and policy inputs before service logic
- Service logic before controller state selection
- Controller flow before final view, CSS, and JavaScript presentation

### Parallel Opportunities

- `T003` and `T004` can run in parallel in Setup
- `T006`, `T007`, `T008`, `T009`, `T010`, and `T011` can run in parallel in Foundational
- `T014`, `T015`, and `T016` can run in parallel for US1 test coverage
- `T017` and `T018` can run in parallel before `T019` in US1
- `T024`, `T025`, `T026`, `T027`, and `T028` can run in parallel for US2 test coverage
- `T034`, `T035`, `T036`, and `T037` can run in parallel for US3 test coverage
- `T044` and `T045` can run in parallel in Polish

---

## Parallel Example: User Story 1

```bash
Task: "Add acceptance coverage for AT-UC25-01 in tests/acceptance/uc25-enroll-all-success.test.js"
Task: "Add integration coverage for successful Enroll All flow in tests/integration/enroll-all-controller.test.js"
Task: "Add unit coverage for linked-section batch handling in tests/unit/enroll-all-service.test.js"

Task: "Extend selected schedule option loading in app/models/schedule-option-model.js"
Task: "Extend enrollment batch persistence in app/models/enrollment-batch-model.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate `AT-UC25-01` independently before moving on

### Incremental Delivery

1. Finish Setup + Foundational
2. Deliver US1 successful Enroll All flow
3. Deliver US2 section-level failure reporting under default partial-success policy
4. Deliver US3 system-failure and atomic-policy consistency handling
5. Finish accessibility, privacy, style, and performance validation

### Parallel Team Strategy

1. One developer completes the shared persistence, authorization, and route foundations
2. One developer handles the success summary flow while another prepares partial-success state behavior
3. A third developer can implement rollback and atomic-cancel state handling once the shared service foundation is stable

---

## Notes

- All tasks use exact file paths
- Story phases include explicit `[US#]` labels
- Acceptance-test coverage remains traceable to `UC-25-AS`
- Each user story is independently testable after its phase checkpoint
