# Tasks: Update Course Capacity

**Input**: Design documents from `/specs/040-update-course-capacity/`
**Prerequisites**: `/specs/040-update-course-capacity/plan.md`, `/specs/040-update-course-capacity/spec.md`, `/specs/040-update-course-capacity/research.md`, `/specs/040-update-course-capacity/data-model.md`, `/specs/040-update-course-capacity/contracts/openapi.yaml`, `/specs/040-update-course-capacity/quickstart.md`

**Tests**: Include unit, integration, and contract tests because testing coverage is explicitly defined in plan/research/quickstart artifacts.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently after foundational work.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`) for story-phase tasks only
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize dependencies and project wiring for this feature.

- [ ] T001 Add feature environment variables and defaults in /home/m_srnic/ece493/group_project/ECE493Group19/.env.example
- [ ] T002 Add required npm scripts for unit/integration/contract test execution in /home/m_srnic/ece493/group_project/ECE493Group19/package.json
- [ ] T003 [P] Register the course-capacity route mount in /home/m_srnic/ece493/group_project/ECE493Group19/src/app.js
- [ ] T004 [P] Create base stylesheet and client script placeholders in /home/m_srnic/ece493/group_project/ECE493Group19/src/public/css/course-capacity.css and /home/m_srnic/ece493/group_project/ECE493Group19/src/public/js/course-capacity.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data and backend primitives required by all user stories.

**⚠️ CRITICAL**: Complete this phase before starting user story phases.

- [ ] T005 Create migration for capacity request + override audit persistence in /home/m_srnic/ece493/group_project/ECE493Group19/src/db/migrations/001_course_capacity_override.sql
- [ ] T006 [P] Add SQLite transaction helper methods for atomic capacity updates in /home/m_srnic/ece493/group_project/ECE493Group19/src/db/sqliteClient.js
- [ ] T007 [P] Implement course offering read/write + version-check model methods in /home/m_srnic/ece493/group_project/ECE493Group19/src/models/courseOfferingModel.js
- [ ] T008 [P] Implement capacity update request audit model methods in /home/m_srnic/ece493/group_project/ECE493Group19/src/models/capacityUpdateRequestModel.js
- [ ] T009 [P] Implement override authorization persistence and 7-year retention metadata in /home/m_srnic/ece493/group_project/ECE493Group19/src/models/capacityOverrideModel.js
- [ ] T010 Implement shared validation middleware for capacity and override payloads in /home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/validators/courseCapacityValidators.js
- [ ] T011 Implement base controller error/result mapper (`UPDATED`, `VALIDATION_ERROR`, `OVERRIDE_REQUIRED`, `STALE_SUBMISSION`, `UPDATE_FAILED`) in /home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/courseCapacityController.js
- [ ] T012 Add feature route definitions for GET/POST capacity and POST override endpoints in /home/m_srnic/ece493/group_project/ECE493Group19/src/routes/courseCapacityRoutes.js

**Checkpoint**: Foundation complete; user stories can proceed independently with no cross-story blocking.

---

## Phase 3: User Story 1 - Update Capacity Successfully (Priority: P1) 🎯 MVP

**Goal**: Administrator submits a valid capacity increase and receives success confirmation with updated remaining seats.

**Independent Test**: Open an offering, submit a valid capacity above enrollment, and verify saved capacity + recalculated remaining seats + confirmation message.

### Tests for User Story 1

- [ ] T013 [P] [US1] Add contract test for `GET /admin/course-offerings/{offeringId}/capacity` and successful `POST /capacity` response schema in /home/m_srnic/ece493/group_project/ECE493Group19/tests/contract/course-capacity-api.test.js
- [ ] T014 [P] [US1] Add integration test for successful capacity update and persisted remaining seats recalculation in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/course-capacity-flow.test.js
- [ ] T015 [P] [US1] Add unit tests for positive-integer capacity validation and success result mapping in /home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/controllers/courseCapacityController.test.js

### Implementation for User Story 1

- [ ] T016 [P] [US1] Implement edit-form and result rendering handlers for course capacity in /home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/courseCapacityController.js
- [ ] T017 [P] [US1] Build capacity edit and result views with version token + confirmation fields in /home/m_srnic/ece493/group_project/ECE493Group19/src/views/course-capacity/edit.ejs and /home/m_srnic/ece493/group_project/ECE493Group19/src/views/course-capacity/result.ejs
- [ ] T018 [US1] Implement successful submit workflow (validate, transactionally persist capacity + remaining seats, mark request applied) in /home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/courseCapacityController.js
- [ ] T019 [US1] Implement client-side form constraints and success state rendering hooks in /home/m_srnic/ece493/group_project/ECE493Group19/src/public/js/course-capacity.js and /home/m_srnic/ece493/group_project/ECE493Group19/src/public/css/course-capacity.css

**Checkpoint**: US1 is independently functional and demo-ready as MVP.

---

## Phase 4: User Story 2 - Prevent Invalid Capacity Reduction (Priority: P2)

**Goal**: Prevent below-enrollment updates without approved override and support in-feature override approval workflow when policy allows.

**Independent Test**: Submit below-enrollment capacity once without override (rejected) and once with approved override (accepted with audit record).

### Tests for User Story 2

- [ ] T020 [P] [US2] Add contract test for `POST /admin/course-offerings/{offeringId}/capacity/overrides` including 201 and 403 outcomes in /home/m_srnic/ece493/group_project/ECE493Group19/tests/contract/course-capacity-api.test.js
- [ ] T021 [P] [US2] Add integration test for below-enrollment rejection without override and unchanged persisted capacity in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/course-capacity-flow.test.js
- [ ] T022 [P] [US2] Add integration test for approved override path with recorded approver/requester identity and retention date in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/course-capacity-flow.test.js
- [ ] T023 [P] [US2] Add unit tests for self-approval policy enforcement in override workflow in /home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/models/capacityOverrideModel.test.js

### Implementation for User Story 2

- [ ] T024 [US2] Implement below-enrollment guard with `OVERRIDE_REQUIRED` rejection when no approved override exists in /home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/courseCapacityController.js
- [ ] T025 [US2] Implement override request/decision endpoint logic with self-approval policy checks in /home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/courseCapacityController.js
- [ ] T026 [P] [US2] Add override workflow UI elements (reason input, decision controls, policy messaging) in /home/m_srnic/ece493/group_project/ECE493Group19/src/views/course-capacity/edit.ejs
- [ ] T027 [P] [US2] Implement override submission client behavior and validation messaging in /home/m_srnic/ece493/group_project/ECE493Group19/src/public/js/course-capacity.js

**Checkpoint**: US2 independently enforces policy-safe below-enrollment behavior.

---

## Phase 5: User Story 3 - Handle Update Failures Safely (Priority: P3)

**Goal**: Failed or stale updates never partially persist and return clear failure outcomes requiring reload for stale data.

**Independent Test**: Simulate stale version and transaction failure; verify unchanged stored values and correct error messaging.

### Tests for User Story 3

- [ ] T028 [P] [US3] Add contract test for stale submission `409` and failed update `500` response bodies in /home/m_srnic/ece493/group_project/ECE493Group19/tests/contract/course-capacity-api.test.js
- [ ] T029 [P] [US3] Add integration test for stale submission rejection with unchanged persisted values in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/course-capacity-flow.test.js
- [ ] T030 [P] [US3] Add integration test for transactional rollback on simulated failure path in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/course-capacity-flow.test.js
- [ ] T031 [P] [US3] Add unit tests for controller failure mapping to `UPDATE_FAILED` and `STALE_SUBMISSION` in /home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/controllers/courseCapacityController.test.js

### Implementation for User Story 3

- [ ] T032 [US3] Implement stale submission detection using submitted version mismatch with reload-required response in /home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/courseCapacityController.js
- [ ] T033 [US3] Implement explicit transaction rollback + failed request audit status on write exceptions in /home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/courseCapacityController.js and /home/m_srnic/ece493/group_project/ECE493Group19/src/db/sqliteClient.js
- [ ] T034 [P] [US3] Add failure-state UI rendering and retry/reload guidance in /home/m_srnic/ece493/group_project/ECE493Group19/src/views/course-capacity/result.ejs
- [ ] T035 [P] [US3] Add client handling for stale/failure response codes and messages in /home/m_srnic/ece493/group_project/ECE493Group19/src/public/js/course-capacity.js

**Checkpoint**: US3 independently guarantees safe failure handling and stale-write protection.

---

## Phase 5A: User Story 1 Remediation Addendum (Priority: P1)

**Purpose**: Close explicit no-op edge-case coverage identified during analysis.

- [ ] T041 [P] [US1] Add integration test for unchanged-capacity no-op outcome and unchanged persisted values in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/course-capacity-flow.test.js

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, compliance checks, and documentation.

- [ ] T036 [P] Add retention maintenance job for purging override audits older than `retention_until` in /home/m_srnic/ece493/group_project/ECE493Group19/src/db/jobs/purgeExpiredOverrideAudits.js
- [ ] T037 [P] Add end-to-end quickstart verification script for UC-40 scenarios in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/course-capacity-quickstart.test.js
- [ ] T038 Run full quality gate (`npm test && npm run lint`) and capture results in /home/m_srnic/ece493/group_project/ECE493Group19/specs/040-update-course-capacity/quickstart.md
- [ ] T039 Verify style-guide conformance for changed HTML/CSS/JS files in /home/m_srnic/ece493/group_project/ECE493Group19/src/views/course-capacity/edit.ejs, /home/m_srnic/ece493/group_project/ECE493Group19/src/views/course-capacity/result.ejs, /home/m_srnic/ece493/group_project/ECE493Group19/src/public/css/course-capacity.css, and /home/m_srnic/ece493/group_project/ECE493Group19/src/public/js/course-capacity.js
- [ ] T040 Confirm no unauthorized edits to protected artifacts and log traceability to UC-40/UC-40-AS in /home/m_srnic/ece493/group_project/ECE493Group19/specs/040-update-course-capacity/plan.md
- [ ] T042 [P] Add performance integration test validating SC-001 (95% of valid updates complete within 10 seconds) in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/course-capacity-performance.test.js
- [ ] T043 Record SC-001 timing evidence and pass/fail summary in /home/m_srnic/ece493/group_project/ECE493Group19/specs/040-update-course-capacity/performance-report.md
- [ ] T044 Define policy source and fallback behavior for `allow_self_approval` in /home/m_srnic/ece493/group_project/ECE493Group19/src/config/overridePolicy.js
- [ ] T045 Produce UC-40 to implementation traceability matrix for FR/SC coverage in /home/m_srnic/ece493/group_project/ECE493Group19/specs/040-update-course-capacity/traceability.md
- [ ] T046 Define UAT protocol and capture SC-004 first-attempt completion evidence in /home/m_srnic/ece493/group_project/ECE493Group19/specs/040-update-course-capacity/uat-results.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks story phases.
- **Phase 3-5A (US1-US3 + US1 addendum)**: Depend only on Phase 2 completion.
- **Phase 6 (Polish)**: Depends on completion of desired story phases.

### User Story Dependencies

- **US1 (P1)**: No dependency on US2 or US3.
- **US2 (P2)**: No dependency on US1 or US3; relies only on foundational tasks.
- **US3 (P3)**: No dependency on US1 or US2; relies only on foundational tasks.

### Dependency Resolution Applied

- Moved shared persistence, validation, routing, and result-mapping work into Phase 2 to remove cross-story blocking.
- Kept each story’s tests and implementation self-contained to preserve independent delivery and validation.

### Within Each User Story

- Write tests first and confirm they fail before implementation.
- Implement controller/model logic before UI-only refinements.
- Complete story acceptance checks before moving to next deployment increment.

---

## Parallel Opportunities

- **Setup**: T003 and T004 can run in parallel after T001-T002.
- **Foundational**: T006-T009 can run in parallel once T005 is ready.
- **US1**: T013-T015 parallel test authoring; T016-T017 parallel implementation before T018.
- **US1 addendum**: T041 can run in parallel with other post-US1 validation tasks.
- **US2**: T020-T023 parallel tests; T026-T027 parallel UI/client work while T024-T025 progress.
- **US3**: T028-T031 parallel tests; T034-T035 parallel UI/client work while T032-T033 progress.
- **Polish**: T036 and T037 can run in parallel.

## Parallel Example: User Story 1

```bash
Task: T013 [US1] Contract success-path response test in tests/contract/course-capacity-api.test.js
Task: T014 [US1] Integration success update flow in tests/integration/course-capacity-flow.test.js
Task: T015 [US1] Unit validation/result mapping test in tests/unit/controllers/courseCapacityController.test.js
```

```bash
Task: T016 [US1] Controller form/result rendering in src/controllers/courseCapacityController.js
Task: T017 [US1] View templates in src/views/course-capacity/edit.ejs and src/views/course-capacity/result.ejs
```

## Parallel Example: User Story 2

```bash
Task: T020 [US2] Contract override endpoint test in tests/contract/course-capacity-api.test.js
Task: T021 [US2] Integration rejection test in tests/integration/course-capacity-flow.test.js
Task: T022 [US2] Integration approved-override test in tests/integration/course-capacity-flow.test.js
Task: T023 [US2] Unit self-approval policy test in tests/unit/models/capacityOverrideModel.test.js
```

```bash
Task: T026 [US2] Override UI controls in src/views/course-capacity/edit.ejs
Task: T027 [US2] Override client behavior in src/public/js/course-capacity.js
```

## Parallel Example: User Story 3

```bash
Task: T028 [US3] Contract stale/failure response test in tests/contract/course-capacity-api.test.js
Task: T029 [US3] Integration stale submission test in tests/integration/course-capacity-flow.test.js
Task: T030 [US3] Integration rollback-on-failure test in tests/integration/course-capacity-flow.test.js
Task: T031 [US3] Unit failure mapping test in tests/unit/controllers/courseCapacityController.test.js
```

```bash
Task: T034 [US3] Failure-state result view in src/views/course-capacity/result.ejs
Task: T035 [US3] Client stale/failure handling in src/public/js/course-capacity.js
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete Phase 3 (US1).
4. Validate US1 independently using T013-T015 and quickstart success scenario.
5. Demo/deploy MVP.

### Incremental Delivery

1. Deliver US1 (normal successful updates).
2. Deliver US2 (override/rejection policy paths).
3. Deliver US3 (stale detection and failure safety).
4. Finish with Phase 6 polish, retention job, and full quality gate.

### Parallel Team Strategy

1. Team completes Setup + Foundational.
2. Then developers split by US1, US2, and US3 simultaneously.
3. Merge each story after its independent tests pass.

---

## Notes

- All tasks use strict checklist format with task ID and file path.
- `[Story]` labels are only used in user story phases.
- Cross-story blocking dependencies were removed by centralizing shared prerequisites in Phase 2.
