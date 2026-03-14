# Tasks: Withdraw from a Class (UC-14)

**Input**: Design documents from `/specs/014-withdraw-class/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Include unit and integration tests for successful withdrawal, cancel
flow, and failure-state consistency aligned to UC-14-AS.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize withdrawal modules, templates, and traceability.

- [ ] T001 Create MVC files in src/controllers/withdrawal-controller.js, src/models/withdrawal-model.js, src/services/withdrawal-service.js, and src/routes/withdrawal-routes.js
- [ ] T002 Create schedule and confirmation views in src/views/schedule/current-schedule.html and src/views/schedule/withdraw-confirmation.html
- [ ] T003 [P] Create frontend assets in public/css/withdrawal.css and public/js/withdrawal.js
- [ ] T004 [P] Create unit/integration test placeholders in tests/unit/withdrawal-service.test.js and tests/integration/withdrawal.integration.test.js
- [ ] T005 Add UC-14 traceability references in specs/014-withdraw-class/quickstart.md and specs/014-withdraw-class/plan.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared state-management and validation infrastructure.

- [ ] T006 Create SQLite migration for withdrawal records and indexes in src/models/migrations/014_withdrawals.sql
- [ ] T007 [P] Implement enrollment lookup and state transition helpers in src/models/enrollment-model.js
- [ ] T008 [P] Implement idempotent withdrawal persistence logic in src/models/withdrawal-model.js
- [ ] T009 Implement implication-summary retrieval and validation in src/services/withdrawal-service.js
- [ ] T010 Implement confirmation request validator in src/controllers/withdrawal-validator.js
- [ ] T011 Wire POST /api/schedule/:offeringId/withdraw route in src/routes/withdrawal-routes.js
- [ ] T012 Add style and protected-file compliance notes in specs/014-withdraw-class/checklists/requirements.md

**Checkpoint**: Foundation complete; user stories can proceed.

---

## Phase 3: User Story 1 - Confirm and Complete Withdrawal (Priority: P1) 🎯 MVP

**Goal**: Student can review implications, confirm withdrawal, and see class
removed from schedule.

**Independent Test**: Execute `AT-UC14-01` from `Acceptance Tests/UC-14-AS.md`.

### Tests for User Story 1

- [ ] T013 [P] [US1] Add unit tests for successful confirmation-to-withdrawal path in tests/unit/withdrawal-service.test.js
- [ ] T014 [P] [US1] Add integration test for successful withdrawal and schedule update in tests/integration/withdrawal.integration.test.js

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implement implication-summary load and render in src/controllers/withdrawal-controller.js and src/views/schedule/withdraw-confirmation.html
- [ ] T016 [US1] Implement confirmed withdrawal transaction in src/services/withdrawal-service.js
- [ ] T017 [US1] Implement withdrawal record insert and enrollment status update in src/models/withdrawal-model.js and src/models/enrollment-model.js
- [ ] T018 [US1] Implement confirmation submission flow and success state in public/js/withdrawal.js
- [ ] T019 [US1] Update schedule view to remove withdrawn class after success in src/views/schedule/current-schedule.html
- [ ] T020 [US1] Add confirmation/success styling in public/css/withdrawal.css

**Checkpoint**: User Story 1 independently functional and testable.

---

## Phase 4: User Story 2 - Cancel Withdrawal Safely (Priority: P2)

**Goal**: Student can cancel withdrawal after reviewing implications with no
state mutation.

**Independent Test**: Execute `AT-UC14-02` from `Acceptance Tests/UC-14-AS.md`.

### Tests for User Story 2

- [ ] T021 [P] [US2] Add integration test for cancel path with unchanged enrollment in tests/integration/withdrawal.integration.test.js
- [ ] T022 [P] [US2] Add unit test ensuring cancel path does not call write operations in tests/unit/withdrawal-controller.test.js

### Implementation for User Story 2

- [ ] T023 [US2] Implement cancel action routing back to schedule in src/controllers/withdrawal-controller.js and src/routes/withdrawal-routes.js
- [ ] T024 [US2] Implement cancel-state UI behavior in public/js/withdrawal.js
- [ ] T025 [US2] Add cancel flow content and affordances in src/views/schedule/withdraw-confirmation.html

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Handle Withdrawal Processing Failure (Priority: P3)

**Goal**: Student sees clear failure message and schedule remains unchanged when
withdrawal cannot be processed.

**Independent Test**: Execute `AT-UC14-03` from `Acceptance Tests/UC-14-AS.md`.

### Tests for User Story 3

- [ ] T026 [P] [US3] Add unit tests for processing-failure and concurrent-change handling in tests/unit/withdrawal-service.test.js
- [ ] T027 [P] [US3] Add integration test for failed withdrawal with unchanged schedule in tests/integration/withdrawal.integration.test.js

### Implementation for User Story 3

- [ ] T028 [US3] Implement failure mapping and safe messaging in src/services/withdrawal-service.js
- [ ] T029 [US3] Implement enrollment re-validation before commit in src/controllers/withdrawal-controller.js
- [ ] T030 [US3] Implement already-removed/unavailable conflict response in src/routes/withdrawal-routes.js
- [ ] T031 [US3] Add failure and conflict UI states in src/views/schedule/withdraw-confirmation.html and public/js/withdrawal.js
- [ ] T032 [US3] Ensure idempotency handling for repeated confirm submits in src/models/withdrawal-model.js

**Checkpoint**: All user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final compliance and traceability validation.

- [ ] T033 [P] Validate contract alignment with specs/014-withdraw-class/contracts/withdrawal-api.yaml and src/routes/withdrawal-routes.js
- [ ] T034 Document acceptance evidence for AT-UC14-01/02/03 in specs/014-withdraw-class/quickstart.md
- [ ] T035 [P] Verify style-guide compliance for modified HTML/CSS/JS files in src/views/schedule/current-schedule.html, public/css/withdrawal.css, and public/js/withdrawal.js
- [ ] T036 Confirm protected files remain unchanged by checking Use Cases/UC-14.md and Acceptance Tests/UC-14-AS.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 -> no dependencies.
- Phase 2 -> depends on Phase 1 and blocks all user stories.
- Phase 3 (US1) -> depends on Phase 2.
- Phase 4 (US2) -> depends on Phase 2 and shared US1 confirmation flow.
- Phase 5 (US3) -> depends on Phase 2 and shared confirmation pipeline.
- Phase 6 -> depends on completed user stories.

### User Story Dependencies

- US1 is MVP and should be delivered first.
- US2 depends on base confirmation workflow from US1 but remains independently testable.
- US3 depends on base confirmation workflow from US1 but remains independently testable.

### Parallel Opportunities

- T003 and T004 can run in parallel after T001-T002.
- T007 and T008 can run in parallel after T006.
- T013 and T014 can run in parallel.
- T021 and T022 can run in parallel.
- T026 and T027 can run in parallel.
- T033 and T035 can run in parallel in polish phase.

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate `AT-UC14-01`.

### Incremental Delivery

1. Add US2 and validate `AT-UC14-02`.
2. Add US3 and validate `AT-UC14-03`.
3. Complete polish tasks and compliance checks.
