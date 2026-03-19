# Tasks: Time Limit for Dropping from a Class (UC-15)

**Input**: Design documents from `/specs/015-drop-time-limit/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Include unit and integration tests for before-deadline allow,
after-deadline block, and deadline retrieval/evaluation failure safety.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize deadline policy modules and traceability scaffolding.

- [ ] T001 Create MVC files in src/controllers/deadline-controller.js, src/models/deadline-rule-model.js, src/services/deadline-policy-service.js, and src/routes/deadline-routes.js
- [ ] T002 Create deadline UI templates in src/views/deadlines/add-drop-deadlines.html and src/views/deadlines/drop-eligibility-panel.html
- [ ] T003 [P] Create frontend assets in public/css/deadlines.css and public/js/deadlines.js
- [ ] T004 [P] Create test placeholders in tests/unit/deadline-policy-service.test.js and tests/integration/deadline-policy.integration.test.js
- [ ] T005 Add UC-15 traceability references in specs/015-drop-time-limit/quickstart.md and specs/015-drop-time-limit/plan.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build core deadline data and evaluation infrastructure.

- [ ] T006 Create SQLite migration for drop deadline rules and evaluation audit in src/models/migrations/015_drop_deadline_rules.sql
- [ ] T007 [P] Implement deadline rule retrieval model in src/models/deadline-rule-model.js
- [ ] T008 [P] Implement deadline evaluation audit model in src/models/deadline-evaluation-model.js
- [ ] T009 Implement canonical-timezone deadline evaluator in src/services/deadline-policy-service.js
- [ ] T010 Implement validator for term/deadline request inputs in src/controllers/deadline-validator.js
- [ ] T011 Wire GET /api/deadlines/drop and POST /api/deadlines/drop/evaluate in src/routes/deadline-routes.js
- [ ] T012 Add style and protected-file compliance notes in specs/015-drop-time-limit/checklists/requirements.md

**Checkpoint**: Foundation complete; user stories can proceed.

---

## Phase 3: User Story 1 - View Deadline and Drop Before Cutoff (Priority: P1) 🎯 MVP

**Goal**: Student can see deadline status and proceed with drop before cutoff.

**Independent Test**: Execute `AT-UC15-01` from `Acceptance Tests/UC-15-AS.md`.

### Tests for User Story 1

- [ ] T013 [P] [US1] Add unit tests for before-deadline allow decision in tests/unit/deadline-policy-service.test.js
- [ ] T014 [P] [US1] Add integration test for before-deadline display and allow flow in tests/integration/deadline-policy.integration.test.js

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implement deadline retrieval and status response in src/services/deadline-policy-service.js
- [ ] T016 [US1] Implement controller endpoint for deadline display in src/controllers/deadline-controller.js
- [ ] T017 [US1] Implement deadline display UI in src/views/deadlines/add-drop-deadlines.html
- [ ] T018 [US1] Implement client-side load/render behavior for deadline status in public/js/deadlines.js
- [ ] T019 [US1] Add styling for deadline status panel and allowed indicators in public/css/deadlines.css

**Checkpoint**: User Story 1 independently functional and testable.

---

## Phase 4: User Story 2 - Block Drop After Cutoff (Priority: P2)

**Goal**: Student is prevented from dropping class after deadline with policy
explanation.

**Independent Test**: Execute `AT-UC15-02` from `Acceptance Tests/UC-15-AS.md`.

### Tests for User Story 2

- [ ] T020 [P] [US2] Add unit tests for at/after-deadline blocked decisions in tests/unit/deadline-policy-service.test.js
- [ ] T021 [P] [US2] Add integration test for blocked drop attempts after deadline in tests/integration/deadline-policy.integration.test.js

### Implementation for User Story 2

- [ ] T022 [US2] Implement strict no-grace cutoff logic in src/services/deadline-policy-service.js
- [ ] T023 [US2] Implement blocked decision response with rationale in src/controllers/deadline-controller.js
- [ ] T024 [US2] Update drop-eligibility panel to show passed deadline and block reason in src/views/deadlines/drop-eligibility-panel.html
- [ ] T025 [US2] Implement client-side block messaging and disabled action states in public/js/deadlines.js

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Handle Deadline Retrieval/Evaluation Errors (Priority: P3)

**Goal**: Student receives cannot-confirm-deadline messaging and no state change
occurs when deadline cannot be evaluated.

**Independent Test**: Execute `AT-UC15-03` from `Acceptance Tests/UC-15-AS.md`.

### Tests for User Story 3

- [ ] T026 [P] [US3] Add unit tests for retrieval/evaluation error outcomes in tests/unit/deadline-policy-service.test.js
- [ ] T027 [P] [US3] Add integration test for blocked action on deadline errors in tests/integration/deadline-policy.integration.test.js

### Implementation for User Story 3

- [ ] T028 [US3] Implement error handling and cannot-confirm-deadline response in src/services/deadline-policy-service.js
- [ ] T029 [US3] Implement controller error branch that blocks drop progression in src/controllers/deadline-controller.js
- [ ] T030 [US3] Implement deadline error state UI in src/views/deadlines/drop-eligibility-panel.html
- [ ] T031 [US3] Implement client-side retry guidance and blocked action state in public/js/deadlines.js
- [ ] T032 [US3] Ensure evaluation error results are audited without mutating enrollment state in src/models/deadline-evaluation-model.js

**Checkpoint**: All user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final policy consistency and compliance validation.

- [ ] T033 [P] Validate contract alignment with specs/015-drop-time-limit/contracts/deadline-policy-api.yaml and src/routes/deadline-routes.js
- [ ] T034 Document acceptance evidence for AT-UC15-01/02/03 in specs/015-drop-time-limit/quickstart.md
- [ ] T035 [P] Verify style-guide compliance for modified HTML/CSS/JS files in src/views/deadlines/add-drop-deadlines.html, public/css/deadlines.css, and public/js/deadlines.js
- [ ] T036 Confirm protected files remain unchanged by checking Use Cases/UC-15.md and Acceptance Tests/UC-15-AS.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 -> no dependencies.
- Phase 2 -> depends on Phase 1 and blocks all user stories.
- Phase 3 (US1) -> depends on Phase 2.
- Phase 4 (US2) -> depends on Phase 2 and shared eligibility pipeline.
- Phase 5 (US3) -> depends on Phase 2 and shared eligibility pipeline.
- Phase 6 -> depends on completed user stories.

### User Story Dependencies

- US1 is MVP and should be delivered first.
- US2 depends on baseline eligibility display from US1 but remains independently testable.
- US3 depends on baseline eligibility pipeline from US1 but remains independently testable.

### Parallel Opportunities

- T003 and T004 can run in parallel after T001-T002.
- T007 and T008 can run in parallel after T006.
- T013 and T014 can run in parallel.
- T020 and T021 can run in parallel.
- T026 and T027 can run in parallel.
- T033 and T035 can run in parallel in polish phase.

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate `AT-UC15-01`.

### Incremental Delivery

1. Add US2 and validate `AT-UC15-02`.
2. Add US3 and validate `AT-UC15-03`.
3. Complete polish tasks and compliance checks.
