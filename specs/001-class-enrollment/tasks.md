# Tasks: Student Course Enrollment

**Input**: Design documents from `/specs/001-class-enrollment/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Contract, integration, and e2e tests are included because validation scenarios are explicitly defined in the feature specification and quickstart.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- All task descriptions include exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project dependencies and baseline tooling for enrollment feature delivery.

- [ ] T001 Install Node.js dependencies in /home/m_srnic/ece493/group_project/ECE493Group19/package.json with `npm install`
- [ ] T002 Create SQLite schema script for enrollment domain tables in /home/m_srnic/ece493/group_project/ECE493Group19/scripts/sqlite/schema.sql
- [ ] T003 [P] Create UC-17 seed data script covering eligible, blocked, and error-path fixtures in /home/m_srnic/ece493/group_project/ECE493Group19/scripts/sqlite/seed-uc17.sql
- [ ] T004 [P] Add enrollment feature env defaults and DB path wiring in /home/m_srnic/ece493/group_project/ECE493Group19/backend/.env.example
- [ ] T005 [P] Configure JavaScript/HTML/CSS lint scripts for feature paths in /home/m_srnic/ece493/group_project/ECE493Group19/package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build core infrastructure required by all user stories.

**⚠️ CRITICAL**: No user story tasks begin until this phase is complete.

- [ ] T006 Implement SQLite connection and transaction helper (`BEGIN IMMEDIATE`/`COMMIT`/`ROLLBACK`) in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/db/sqlite.js
- [ ] T007 [P] Implement shared enrollment request validation middleware for `studentId`, `offeringId`, and `requestId` in /home/m_srnic/ece493/group_project/ECE493Group19/shared/validation/enrollmentRequest.js
- [ ] T008 [P] Implement shared enrollment data-access models (StudentAccount, RegistrationHold, ClassOffering, CompletedCourse, Enrollment, EnrollmentAttempt, FeeAssessment) in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/models/enrollmentModel.js
- [ ] T009 [P] Implement shared enrollment API route registration and controller stubs for `/api/offerings`, `/api/enrollments`, and `/api/students/:studentId/schedule` in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/routes/enrollmentRoutes.js and /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/controllers/enrollmentController.js
- [ ] T010 Implement shared enrollment service skeleton with blocking-reason enum contract in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/services/enrollmentService.js
- [ ] T011 Implement standardized API error envelope and retry-safe error mapper in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/middleware/errorHandler.js
- [ ] T012 Register enrollment routes and error middleware in server bootstrap at /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/app.js

**Checkpoint**: Foundation ready; user stories can proceed independently.

---

## Phase 3: User Story 1 - Enroll in an Eligible Class (Priority: P1) 🎯 MVP

**Goal**: Allow eligible students to enroll successfully, update schedule, and show fee-change status.

**Independent Test**: Submit enrollment for an eligible student and open class offering, then verify `201 ENROLLED`, schedule update, and fee assessment status.

### Tests for User Story 1

- [ ] T013 [P] [US1] Add contract test for `POST /api/enrollments` success response shape in /home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/contract/enrollments.success.contract.test.js
- [ ] T014 [P] [US1] Add integration test for successful enrollment transaction and persisted schedule update in /home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/integration/enrollment.success.integration.test.js
- [ ] T015 [P] [US1] Add e2e happy-path enrollment confirmation test in /home/m_srnic/ece493/group_project/ECE493Group19/frontend/tests/e2e/enrollment-success.spec.js

### Implementation for User Story 1

- [ ] T016 [P] [US1] Implement offering search query (`GET /api/offerings`) with remaining seat projection in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/controllers/offeringController.js
- [ ] T017 [US1] Implement successful enrollment transaction flow (idempotency key handling, enrollment insert, seat decrement, attempt audit) in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/services/enrollmentService.js
- [ ] T018 [US1] Implement success controller response mapping (`201 ENROLLED` + `feeAssessment`) in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/controllers/enrollmentController.js
- [ ] T019 [P] [US1] Implement schedule read endpoint (`GET /api/students/:studentId/schedule`) in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/controllers/scheduleController.js
- [ ] T020 [P] [US1] Build enrollment form and success summary EJS view in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/views/enrollment/index.ejs
- [ ] T021 [P] [US1] Implement browser enrollment submit and success rendering logic in /home/m_srnic/ece493/group_project/ECE493Group19/frontend/public/js/enrollment.js
- [ ] T022 [US1] Implement fee status display logic for `CURRENT` and `PENDING_REFRESH` in /home/m_srnic/ece493/group_project/ECE493Group19/frontend/public/js/fee-assessment.js

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Block Ineligible Enrollment Attempts (Priority: P1)

**Goal**: Prevent invalid enrollment attempts and return all blocking reasons in one response.

**Independent Test**: Attempt enrollment with prerequisite, capacity, hold, schedule conflict, duplicate, and multi-failure fixtures; verify `409 BLOCKED`, unchanged schedule, and complete blocking reason list.

### Tests for User Story 2

- [ ] T023 [P] [US2] Add contract test for `POST /api/enrollments` blocked response including `blockingReasons[]` in /home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/contract/enrollments.blocked.contract.test.js
- [ ] T024 [P] [US2] Add integration tests for prerequisite/capacity/hold/schedule-conflict/duplicate blocking outcomes in /home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/integration/enrollment.blocked.integration.test.js
- [ ] T025 [P] [US2] Add integration test asserting multiple simultaneous blocking reasons are returned together in /home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/integration/enrollment.multiple-reasons.integration.test.js
- [ ] T026 [P] [US2] Add e2e blocked-enrollment messaging test for all blocking reason types in /home/m_srnic/ece493/group_project/ECE493Group19/frontend/tests/e2e/enrollment-blocked.spec.js

### Implementation for User Story 2

- [ ] T027 [US2] Implement prerequisite, hold, schedule-conflict, capacity, and duplicate checks with aggregate reason collection in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/services/eligibilityService.js
- [ ] T028 [US2] Integrate aggregate eligibility evaluator into enrollment service blocked path with no-write behavior in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/services/enrollmentService.js
- [ ] T029 [US2] Implement blocked response mapping (`409 BLOCKED`) with reason metadata in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/controllers/enrollmentController.js
- [ ] T030 [P] [US2] Implement blocked-state UI rendering for combined reasons and remaining-seat details in /home/m_srnic/ece493/group_project/ECE493Group19/frontend/public/js/enrollment.js
- [ ] T031 [P] [US2] Add blocked-reason UI styles and accessibility states in /home/m_srnic/ece493/group_project/ECE493Group19/frontend/public/css/enrollment.css

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Recover Safely from Enrollment Errors (Priority: P2)

**Goal**: Return clear retry messaging on system error while guaranteeing no schedule mutation.

**Independent Test**: Trigger transactional failure during otherwise eligible enrollment and verify `500 ERROR`, retry message, and unchanged enrollment/schedule state.

### Tests for User Story 3

- [ ] T032 [P] [US3] Add contract test for `POST /api/enrollments` error response (`ENROLLMENT_TRANSACTION_FAILED`) in /home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/contract/enrollments.error.contract.test.js
- [ ] T033 [P] [US3] Add integration rollback test ensuring no enrollment row or seat decrement on internal failure in /home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/integration/enrollment.error-rollback.integration.test.js
- [ ] T034 [P] [US3] Add e2e retry-guidance rendering test for system error path in /home/m_srnic/ece493/group_project/ECE493Group19/frontend/tests/e2e/enrollment-error.spec.js

### Implementation for User Story 3

- [ ] T035 [US3] Implement enrollment fault-injection hook and guaranteed rollback handling in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/services/enrollmentService.js
- [ ] T036 [US3] Implement `500 ERROR` response with retry guidance in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/controllers/enrollmentController.js
- [ ] T037 [P] [US3] Implement error-state UI message rendering for retry flow in /home/m_srnic/ece493/group_project/ECE493Group19/frontend/public/js/enrollment.js
- [ ] T038 [P] [US3] Add server-side error logging context for enrollment failures in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/middleware/errorHandler.js

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening and documentation across all stories.

- [ ] T039 [P] Update quickstart verification steps and expected outputs in /home/m_srnic/ece493/group_project/ECE493Group19/specs/001-class-enrollment/quickstart.md
- [ ] T040 [P] Add UC-17/UC-17-AS traceability matrix for implemented endpoints and tests in /home/m_srnic/ece493/group_project/ECE493Group19/docs/traceability/001-class-enrollment.md
- [ ] T041 Run full validation suite (`npm test && npm run lint`) and record results in /home/m_srnic/ece493/group_project/ECE493Group19/specs/001-class-enrollment/tasks.md
- [ ] T042 Implement student-only authorization middleware for enrollment routes in /home/m_srnic/ece493/group_project/ECE493Group19/backend/src/middleware/requireStudentRole.js
- [ ] T043 [P] Add integration test rejecting non-student/admin override enrollment attempts in /home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/integration/enrollment.authorization.integration.test.js
- [ ] T044 [P] Add enrollment latency performance test asserting SC-001 threshold in /home/m_srnic/ece493/group_project/ECE493Group19/backend/tests/integration/enrollment.performance.integration.test.js
- [ ] T045 [P] Record enrollment performance evidence for SC-001 in /home/m_srnic/ece493/group_project/ECE493Group19/docs/traceability/001-class-enrollment-performance.md
- [ ] T046 Execute UC-17-AS acceptance validation and record evidence links in /home/m_srnic/ece493/group_project/ECE493Group19/docs/traceability/001-class-enrollment.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user story work.
- **Phase 3 (US1)**: Depends only on Phase 2.
- **Phase 4 (US2)**: Depends only on Phase 2.
- **Phase 5 (US3)**: Depends only on Phase 2.
- **Phase 6 (Polish)**: Depends on completion of desired user stories.

### User Story Dependency Graph

- **US1**: Start after Phase 2 and establish enrollment success path baseline.
- **US2**: Start after US1 to extend the same enrollment service/controller flow with blocked outcomes.
- **US3**: Start after US2 to add error-path behavior on the same shared flow.

Graph (shared-file dependency order):

`Setup -> Foundational -> US1 -> US2 -> US3 -> Polish`

### Within-Story Execution Rules

- Execute tests before implementation tasks for each story.
- Complete backend service/controller logic before UI wiring in that story.
- Keep each story releasable and testable without requiring incomplete tasks from other stories.

## Parallel Opportunities

- **Setup**: T003, T004, T005 can run in parallel after T002 starts.
- **Foundational**: T007, T008, T009 can run in parallel after T006.
- **US1**: T013, T014, T015 parallel; T020 and T021 parallel after API shape is stable.
- **US2**: T023, T024, T025, T026 parallel; T030 and T031 parallel after blocked-response contract is implemented.
- **US3**: T032, T033, T034 parallel; T037 and T038 parallel after error contract is implemented.

## Parallel Example: User Story 1

```bash
Task: "T013 [US1] Contract success response test in backend/tests/contract/enrollments.success.contract.test.js"
Task: "T014 [US1] Integration success transaction test in backend/tests/integration/enrollment.success.integration.test.js"
Task: "T015 [US1] E2E success flow in frontend/tests/e2e/enrollment-success.spec.js"
```

## Parallel Example: User Story 2

```bash
Task: "T023 [US2] Contract blocked response test in backend/tests/contract/enrollments.blocked.contract.test.js"
Task: "T024 [US2] Integration blocked outcomes in backend/tests/integration/enrollment.blocked.integration.test.js"
Task: "T025 [US2] Integration multi-reason blocking test in backend/tests/integration/enrollment.multiple-reasons.integration.test.js"
Task: "T026 [US2] E2E blocked messaging test in frontend/tests/e2e/enrollment-blocked.spec.js"
```

## Parallel Example: User Story 3

```bash
Task: "T032 [US3] Contract error response test in backend/tests/contract/enrollments.error.contract.test.js"
Task: "T033 [US3] Integration rollback test in backend/tests/integration/enrollment.error-rollback.integration.test.js"
Task: "T034 [US3] E2E retry guidance test in frontend/tests/e2e/enrollment-error.spec.js"
```

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete Phase 3 (US1) and validate independent success-path behavior.
4. Demo/deploy MVP.

### Incremental Delivery

1. Build foundation (Phases 1-2).
2. Deliver US1 (successful enrollment).
3. Deliver US2 (blocked enrollment handling).
4. Deliver US3 (error rollback and retry guidance).
5. Complete polish and full-suite validation.

### Parallel Team Strategy

1. Team aligns on Phases 1-2.
2. After Phase 2, assign one developer to the shared enrollment core path first (US1), then branch US2 and US3 on that baseline.
3. Merge in order US1 -> US2 -> US3 to avoid shared-file contention.
