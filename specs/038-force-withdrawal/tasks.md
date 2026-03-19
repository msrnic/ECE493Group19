# Tasks: Administrative Forced Course Withdrawal

**Input**: Design documents from `/home/m_srnic/ece493/group_project/ECE493Group19/specs/038-force-withdrawal/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include contract, integration, and unit tests using `node --test` because testing is explicitly required in plan.md and quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline wiring for this feature

- [ ] T001 Create feature task traceability notes in `/home/m_srnic/ece493/group_project/ECE493Group19/specs/038-force-withdrawal/quickstart.md` (UC-38 and UC-38-AS mapping section)
- [ ] T002 Create backend feature route module scaffold in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/routes/forceWithdrawalRoutes.js`
- [ ] T003 [P] Create admin page asset scaffolds in `/home/m_srnic/ece493/group_project/ECE493Group19/frontend/admin/force-withdrawal.js` and `/home/m_srnic/ece493/group_project/ECE493Group19/frontend/admin/force-withdrawal.css`
- [ ] T004 [P] Create initial test file scaffolds in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/contract/forceWithdrawal.contract.test.js`, `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/integration/forceWithdrawal.integration.test.js`, and `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/unit/forceWithdrawal.service.test.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core persistence and service boundaries required before any user story work

- [ ] T005 Add force-withdrawal tables and constraints to `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/db/schema.sql`
- [ ] T006 [P] Add migration script for new force-withdrawal tables in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/db/migrations/001_force_withdrawal.sql`
- [ ] T007 [P] Implement base model for forced-withdrawal actions in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/models/forcedWithdrawalModel.js`
- [ ] T008 [P] Implement base model for audit events and pending queue in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/models/auditEventModel.js`
- [ ] T009 [P] Implement base enrollment/schedule/transcript/fee update helpers in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/models/enrollmentModel.js`, `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/models/transcriptModel.js`, and `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/models/feeLedgerModel.js`
- [ ] T010 Implement transactional force-withdrawal service skeleton (`BEGIN IMMEDIATE` + rollback contract) in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/services/forceWithdrawalService.js`
- [ ] T011 [P] Implement admin authorization guard for force-withdrawal routes in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/controllers/forceWithdrawalController.js`
- [ ] T012 Register force-withdrawal routes with application router in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/routes/forceWithdrawalRoutes.js`

**Checkpoint**: Foundation complete; all user stories can start without depending on each other

---

## Phase 3: User Story 1 - Force Withdraw an Enrolled Student (Priority: P1) 🎯 MVP

**Goal**: Let an admin preview implications and complete forced withdrawal for an enrolled student with required reason

**Independent Test**: Admin previews implications, submits valid confirmation, and sees enrollment/schedule/transcript/fee updates plus audit record and success result.

### Tests for User Story 1

- [ ] T013 [P] [US1] Add contract test for `GET /api/admin/force-withdrawals/implications` and `POST /api/admin/force-withdrawals` success responses in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/contract/forceWithdrawal.contract.test.js`
- [ ] T014 [P] [US1] Add integration happy-path test for confirmed force withdrawal in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/integration/forceWithdrawal.integration.test.js`
- [ ] T015 [P] [US1] Add unit tests for reason-required validation and successful transaction commit in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/unit/forceWithdrawal.service.test.js`

### Implementation for User Story 1

- [ ] T016 [US1] Implement implications endpoint controller (selection validation + implication payload) in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/controllers/forceWithdrawalController.js`
- [ ] T017 [US1] Implement confirm endpoint controller (reason validation + idempotency key forwarding) in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/controllers/forceWithdrawalController.js`
- [ ] T018 [US1] Implement service logic for enrolled-student withdrawal transaction in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/services/forceWithdrawalService.js`
- [ ] T019 [US1] Implement success-path audit event persistence in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/models/auditEventModel.js`
- [ ] T020 [US1] Build admin confirmation view for implications + reason input in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/views/admin-force-withdrawal.html`
- [ ] T021 [US1] Wire submit and success UI flow in `/home/m_srnic/ece493/group_project/ECE493Group19/frontend/admin/force-withdrawal.js`
- [ ] T022 [P] [US1] Add page styling for implications and confirm-state feedback in `/home/m_srnic/ece493/group_project/ECE493Group19/frontend/admin/force-withdrawal.css`

**Checkpoint**: User Story 1 is independently functional and demo-ready as MVP

---

## Phase 4: User Story 2 - Prevent Invalid Withdrawal Requests (Priority: P2)

**Goal**: Reject force-withdraw requests when student is not enrolled, without any data mutation

**Independent Test**: Attempt force withdraw for non-enrolled student and verify explanatory error with unchanged enrollment/schedule/transcript/fee records.

### Tests for User Story 2

- [ ] T023 [P] [US2] Add contract test for `POST /api/admin/force-withdrawals` 409 conflict (`NOT_ENROLLED`/`ALREADY_WITHDRAWN`) in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/contract/forceWithdrawal.contract.test.js`
- [ ] T024 [P] [US2] Add integration test verifying no record changes on not-enrolled request in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/integration/forceWithdrawal.integration.test.js`
- [ ] T025 [P] [US2] Add unit tests for enrollment pre-check rejection path in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/unit/forceWithdrawal.service.test.js`

### Implementation for User Story 2

- [ ] T026 [US2] Implement model query for current enrollment-state pre-check in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/models/enrollmentModel.js`
- [ ] T027 [US2] Implement `REJECTED_NOT_ENROLLED`/conflict result mapping in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/services/forceWithdrawalService.js`
- [ ] T028 [US2] Implement controller/API error response mapping for not-enrolled and already-withdrawn outcomes in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/controllers/forceWithdrawalController.js`
- [ ] T029 [US2] Add non-enrolled guidance messaging in `/home/m_srnic/ece493/group_project/ECE493Group19/frontend/admin/force-withdrawal.js`

**Checkpoint**: User Story 2 can be tested and shipped independently of User Story 1 code paths

---

## Phase 5: User Story 3 - Handle Cancellation and Processing Failures Safely (Priority: P3)

**Goal**: Support cancel-before-confirm, rollback on failure, and pending-audit retry visibility

**Independent Test**: Cancel before submit and simulate processing/audit failures; verify no partial data changes on rollback and pending-audit visibility when audit write fails.

### Tests for User Story 3

- [ ] T030 [P] [US3] Add contract tests for `GET /api/admin/force-withdrawals/{actionId}` and `GET /api/admin/force-withdrawals/pending-audit` in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/contract/forceWithdrawal.contract.test.js`
- [ ] T031 [P] [US3] Add integration tests for cancel flow, rollback-on-error, audit-failure-pending path, and concurrent confirm race in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/integration/forceWithdrawal.integration.test.js`
- [ ] T032 [P] [US3] Add unit tests for retry queue enqueue/backoff and first-wins idempotency behavior in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/unit/forceWithdrawal.service.test.js`

### Implementation for User Story 3

- [ ] T033 [US3] Implement cancel action handling that exits without persistence changes in `/home/m_srnic/ece493/group_project/ECE493Group19/frontend/admin/force-withdrawal.js`
- [ ] T034 [US3] Implement rollback-safe error propagation and `FAILED` action status updates in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/services/forceWithdrawalService.js`
- [ ] T035 [US3] Implement pending-audit queue writes and retry metadata persistence in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/models/auditEventModel.js`
- [ ] T036 [US3] Implement audit retry worker/service for pending queue processing in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/services/auditRetryService.js`
- [ ] T037 [US3] Implement action-status and pending-audit list controller endpoints in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/controllers/forceWithdrawalController.js`
- [ ] T038 [US3] Implement first-wins concurrency guard for duplicate confirms in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/src/services/forceWithdrawalService.js`

**Checkpoint**: User Story 3 independently validates cancellation, failure safety, and pending-audit resiliency

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening across all user stories

- [ ] T039 [P] Update feature quickstart verification steps and expected API outcomes in `/home/m_srnic/ece493/group_project/ECE493Group19/specs/038-force-withdrawal/quickstart.md`
- [ ] T040 Validate style-guide and lint compliance for modified JS/HTML/CSS files via `/home/m_srnic/ece493/group_project/ECE493Group19/package.json` scripts
- [ ] T041 Run full automated test suite (`node --test` via `npm test`) and log final status in `/home/m_srnic/ece493/group_project/ECE493Group19/specs/038-force-withdrawal/tasks.md`
- [ ] T042 Execute and record UC-38 acceptance scenarios from `/home/m_srnic/ece493/group_project/ECE493Group19/Acceptance Tests/UC-38-AS.md` in `/home/m_srnic/ece493/group_project/ECE493Group19/specs/038-force-withdrawal/quickstart.md`
- [ ] T043 Add and run integration timing assertion that confirm processing meets `<=2s` p95 target in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/integration/forceWithdrawal.integration.test.js`
- [ ] T044 Add integration test for offering status transition (`OPEN` -> `CLOSED`/`ARCHIVED`) rejection with no data mutation in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/integration/forceWithdrawal.integration.test.js`
- [ ] T045 Add contract assertions for deterministic `code`/`message` fields and success `actionId` in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/contract/forceWithdrawal.contract.test.js`
- [ ] T046 Add integration assertion that completed audit events are discoverable within 1 minute in `/home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/integration/forceWithdrawal.integration.test.js`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: no dependencies
- **Phase 2 (Foundational)**: depends on Phase 1 and blocks user-story work
- **Phase 3 (US1), Phase 4 (US2), Phase 5 (US3)**: each depends only on Phase 2 and has no dependency on other user stories
- **Phase 6 (Polish)**: depends on completion of any stories included in release scope

### User Story Dependencies

- **US1 (P1)**: starts after Phase 2 only
- **US2 (P2)**: starts after Phase 2 only; no US1 dependency
- **US3 (P3)**: starts after Phase 2 only; no US1/US2 dependency

No cross-story blocking dependencies remain in this task plan.

### Within Each User Story

- Tests are written before implementation and should fail first
- Models/helpers precede service logic
- Service logic precedes controllers/UI wiring
- Story is independently testable at its phase checkpoint

### Parallel Opportunities

- Setup: T003 and T004 can run in parallel after T002
- Foundational: T006, T007, T008, T009, and T011 can run in parallel after T005
- US1: T013, T014, and T015 can run in parallel; T022 can run in parallel with T021 after T020
- US2: T023, T024, and T025 can run in parallel
- US3: T030, T031, and T032 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "T013 [US1] Contract success-path test in backend/tests/contract/forceWithdrawal.contract.test.js"
Task: "T014 [US1] Integration happy-path test in backend/tests/integration/forceWithdrawal.integration.test.js"
Task: "T015 [US1] Unit validation/commit tests in backend/tests/unit/forceWithdrawal.service.test.js"
```

## Parallel Example: User Story 2

```bash
Task: "T023 [US2] Contract conflict test in backend/tests/contract/forceWithdrawal.contract.test.js"
Task: "T024 [US2] Integration no-mutation test in backend/tests/integration/forceWithdrawal.integration.test.js"
Task: "T025 [US2] Unit pre-check rejection test in backend/tests/unit/forceWithdrawal.service.test.js"
```

## Parallel Example: User Story 3

```bash
Task: "T030 [US3] Contract status/pending-audit tests in backend/tests/contract/forceWithdrawal.contract.test.js"
Task: "T031 [US3] Integration cancel/rollback/concurrency tests in backend/tests/integration/forceWithdrawal.integration.test.js"
Task: "T032 [US3] Unit retry/idempotency tests in backend/tests/unit/forceWithdrawal.service.test.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate US1 independently using T013-T015 and quickstart happy path
4. Demo/deploy MVP

### Incremental Delivery

1. Deliver MVP with US1
2. Add US2 and validate not-enrolled rejection independently
3. Add US3 and validate cancellation, rollback safety, pending-audit handling, and concurrency
4. Finish polish tasks, including UC-38 acceptance execution and NFR/SLA validation, before release
