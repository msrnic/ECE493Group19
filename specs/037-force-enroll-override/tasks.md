# Tasks: Force Enroll Override

**Input**: Design documents from `/specs/037-force-enroll-override/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`

**Tests**: Include integration and acceptance tests because the feature specification and plan explicitly require UC-37 scenario validation.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`) for story-phase tasks only
- Each task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare baseline project wiring for this feature.

- [ ] T001 Add Force Enroll feature traceability notes to /home/m_srnic/ece493/group_project/ECE493Group19/specs/037-force-enroll-override/plan.md
- [ ] T002 [P] Create Force Enroll route module scaffold in /home/m_srnic/ece493/group_project/ECE493Group19/app/routes/forceEnrollRoutes.js
- [ ] T003 [P] Create Force Enroll controller scaffold in /home/m_srnic/ece493/group_project/ECE493Group19/app/controllers/forceEnrollController.js
- [ ] T004 [P] Create Force Enroll service scaffold in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/forceEnrollService.js

---

## Phase 2: Foundational (Shared Prerequisites)

**Purpose**: Shared schema and wiring required by both user stories.

- [ ] T005 Add `force_enroll_requests` and `override_audit_entries` tables to /home/m_srnic/ece493/group_project/ECE493Group19/app/db/schema.sql
- [ ] T006 Add enrollment uniqueness and supporting indexes migration in /home/m_srnic/ece493/group_project/ECE493Group19/app/db/migrations/001_force_enroll_override.sql
- [ ] T007 [P] Implement ForceEnrollRequest data access model in /home/m_srnic/ece493/group_project/ECE493Group19/app/models/forceEnrollRequestModel.js
- [ ] T008 [P] Implement OverrideAuditEntry append-only model in /home/m_srnic/ece493/group_project/ECE493Group19/app/models/overrideAuditModel.js
- [ ] T009 Wire Force Enroll routes into the app router in /home/m_srnic/ece493/group_project/ECE493Group19/app/routes/index.js
- [ ] T010 Add shared Force Enroll error code mapping utilities in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/forceEnrollErrors.js

**Checkpoint**: Shared data model and routing are ready for independent story implementation.

---

## Phase 3: User Story 1 - Force Enroll Eligible Student (Priority: P1) 🎯 MVP

**Goal**: Allow an authorized admin to force enroll an eligible student, including reason validation, over-capacity confirmation, atomic writes, and success confirmation.

**Independent Test**: Submit force enroll for existing student/offering with unmet prerequisites but satisfied hard constraints; verify enrollment, schedule, capacity, and audit updates plus over-capacity confirmation behavior.

### Tests for User Story 1

- [ ] T011 [P] [US1] Add create-request integration tests for success, missing reason, duplicate enrollment, and hard-constraint failure in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/forceEnroll.createRequest.test.js (Trace: UC-37, UC-37-AS)
- [ ] T012 [P] [US1] Add over-capacity confirmation integration tests (same-admin confirm and different-admin rejection) in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/forceEnroll.confirmOverCapacity.test.js (Trace: UC-37, UC-37-AS)
- [ ] T013 [P] [US1] Add Playwright acceptance flow for UC-37 happy path and over-capacity path in /home/m_srnic/ece493/group_project/ECE493Group19/tests/acceptance/force-enroll-override.spec.js (Trace: UC-37, UC-37-AS)

### Implementation for User Story 1

- [ ] T014 [P] [US1] Extend enrollment transaction helpers for force override inserts in /home/m_srnic/ece493/group_project/ECE493Group19/app/models/enrollmentModel.js (Trace: UC-37, UC-37-AS)
- [ ] T015 [P] [US1] Add schedule upsert support for force enrollment success path in /home/m_srnic/ece493/group_project/ECE493Group19/app/models/scheduleModel.js (Trace: UC-37, UC-37-AS)
- [ ] T016 [P] [US1] Add capacity increment and over-capacity detection helpers in /home/m_srnic/ece493/group_project/ECE493Group19/app/models/courseOfferingModel.js (Trace: UC-37, UC-37-AS)
- [ ] T017 [US1] Implement create-force-enroll workflow with reason validation, hard-constraint checks, and atomic transaction in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/forceEnrollService.js (Trace: UC-37, UC-37-AS)
- [ ] T018 [US1] Implement confirm-over-capacity workflow enforcing same-admin confirmation in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/forceEnrollService.js (Trace: UC-37, UC-37-AS)
- [ ] T019 [US1] Implement POST `/api/force-enroll/requests` and POST `/api/force-enroll/requests/:requestId/confirm-over-capacity` handlers in /home/m_srnic/ece493/group_project/ECE493Group19/app/controllers/forceEnrollController.js (Trace: UC-37, UC-37-AS)
- [ ] T020 [US1] Implement GET `/api/force-enroll/requests/:requestId` status handler in /home/m_srnic/ece493/group_project/ECE493Group19/app/controllers/forceEnrollController.js (Trace: UC-37, UC-37-AS)
- [ ] T021 [P] [US1] Build admin force-enroll form with required reason and confirmation state in /home/m_srnic/ece493/group_project/ECE493Group19/app/views/admin-force-enroll.ejs (Trace: UC-37, UC-37-AS)
- [ ] T022 [P] [US1] Implement client-side request/confirm workflow and feedback rendering in /home/m_srnic/ece493/group_project/ECE493Group19/public/js/admin-force-enroll.js (Trace: UC-37, UC-37-AS)
- [ ] T023 [P] [US1] Add Force Enroll page styling and validation error presentation in /home/m_srnic/ece493/group_project/ECE493Group19/public/css/admin-force-enroll.css (Trace: UC-37, UC-37-AS)

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Reject Invalid Force Enrollment Request (Priority: P2)

**Goal**: Reject requests with non-existent student or offering IDs with clear errors and no committed side effects.

**Independent Test**: Submit force enroll requests with invalid `studentId` and invalid `offeringId`; verify 404-style error responses and unchanged enrollment/schedule/capacity/audit state.

### Tests for User Story 2

- [ ] T024 [P] [US2] Add integration tests for missing student and missing offering rejection paths in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/forceEnroll.invalidEntities.test.js (Trace: UC-37, UC-37-AS)
- [ ] T025 [P] [US2] Add acceptance test for invalid target rejection messaging in /home/m_srnic/ece493/group_project/ECE493Group19/tests/acceptance/force-enroll-invalid-targets.spec.js (Trace: UC-37, UC-37-AS)

### Implementation for User Story 2

- [ ] T026 [P] [US2] Add explicit student existence lookup for force-enroll validation in /home/m_srnic/ece493/group_project/ECE493Group19/app/models/studentModel.js (Trace: UC-37, UC-37-AS)
- [ ] T027 [P] [US2] Add explicit offering existence lookup for force-enroll validation in /home/m_srnic/ece493/group_project/ECE493Group19/app/models/courseOfferingModel.js (Trace: UC-37, UC-37-AS)
- [ ] T028 [US2] Implement invalid-entity rejection logic with zero-side-effect guarantees in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/forceEnrollService.js (Trace: UC-37, UC-37-AS)
- [ ] T029 [US2] Return clear not-found response payloads for invalid targets in /home/m_srnic/ece493/group_project/ECE493Group19/app/controllers/forceEnrollController.js (Trace: UC-37, UC-37-AS)
- [ ] T030 [US2] Display invalid student/offering errors in the admin force-enroll UI in /home/m_srnic/ece493/group_project/ECE493Group19/public/js/admin-force-enroll.js (Trace: UC-37, UC-37-AS)

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, docs, and validation across stories.

- [ ] T031 [P] Add Force Enroll API examples and error codes to /home/m_srnic/ece493/group_project/ECE493Group19/specs/037-force-enroll-override/contracts/force-enroll-openapi.yaml
- [ ] T032 [P] Document execution and verification steps for both stories in /home/m_srnic/ece493/group_project/ECE493Group19/specs/037-force-enroll-override/quickstart.md
- [ ] T033 [P] Add Force Enroll entry action on the course offering management page in /home/m_srnic/ece493/group_project/ECE493Group19/app/views/course-offering-management.ejs (Trace: UC-37, UC-37-AS)
- [ ] T034 Wire management-page Force Enroll navigation handler in /home/m_srnic/ece493/group_project/ECE493Group19/app/controllers/courseOfferingController.js (Trace: UC-37, UC-37-AS)
- [ ] T035 [P] Add load/performance test for POST `/api/force-enroll/requests` at 200 concurrent admins in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/forceEnroll.performance.test.js (Trace: UC-37, UC-37-AS)
- [ ] T036 Record p95 latency evidence for non-over-capacity requests in /home/m_srnic/ece493/group_project/ECE493Group19/specs/037-force-enroll-override/quickstart.md (Trace: UC-37, UC-37-AS)
- [ ] T037 Run full feature test sweep and store execution evidence in /home/m_srnic/ece493/group_project/ECE493Group19/tests/reports/force-enroll-override-test-report.md
- [ ] T038 Run HTML/CSS/JS style-guide compliance checks and log outputs in /home/m_srnic/ece493/group_project/ECE493Group19/tests/reports/style-guide-compliance.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1 only.
- **Phase 3 (US1)**: Depends on Phase 2 only.
- **Phase 4 (US2)**: Depends on Phase 2 only.
- **Phase 5 (Polish)**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on US2.
- **US2 (P2)**: No dependency on US1.

Both stories are independently implementable after Phase 2, so there are no blocking cross-story dependencies.

### Within Each User Story

- Tests first, then implementation.
- Model updates before service logic.
- Service logic before controller wiring.
- Controller wiring before UI feedback polish.

### Parallel Opportunities

- Setup: T002, T003, T004 can run in parallel.
- Foundational: T007 and T008 can run in parallel.
- US1 tests: T011, T012, T013 can run in parallel.
- US1 model/UI tasks: T014, T015, T016, T021, T022, T023 can run in parallel.
- US2 tests and model tasks: T024, T025, T026, T027 can run in parallel.
- Polish docs and integration/performance prep: T031, T032, T033, T035 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Run US1 test authoring in parallel:
Task T011: tests/integration/forceEnroll.createRequest.test.js
Task T012: tests/integration/forceEnroll.confirmOverCapacity.test.js
Task T013: tests/acceptance/force-enroll-override.spec.js

# Run US1 model and UI tasks in parallel:
Task T014: app/models/enrollmentModel.js
Task T015: app/models/scheduleModel.js
Task T016: app/models/courseOfferingModel.js
Task T021: app/views/admin-force-enroll.ejs
Task T022: public/js/admin-force-enroll.js
Task T023: public/css/admin-force-enroll.css
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently before moving on.

### Incremental Delivery

1. Deliver US1 as MVP.
2. Deliver US2 as separate increment with independent tests.
3. Apply Phase 5 polish and full regression validation.

### Parallel Team Strategy

1. Team completes Phase 1 and Phase 2 together.
2. After Phase 2, one developer can execute US1 while another executes US2.
3. Merge both streams for Phase 5 hardening.

---

## Notes

- All tasks follow the required checklist format with IDs, optional `[P]`, optional `[US#]`, and exact file paths.
- No task in US1 depends on completion of US2, and no task in US2 depends on completion of US1.
- Protected use-case and acceptance artifacts remain unchanged.
