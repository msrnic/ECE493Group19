# Tasks: Course Offering Administration

**Input**: Design documents from `/specs/001-manage-course-offerings/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`

**Tests**: Included because the feature docs define a concrete multi-layer test strategy (Vitest, Supertest, Playwright) and independent story validation.

## Format: `[ID] [P?] [Story] Description`

- `[P]`: Can run in parallel (different files, no dependency on incomplete tasks)
- `[Story]`: Story scope label (`[US1]`, `[US2]`, `[US3]`) for user-story phases only
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare project-level wiring and test scaffolding for UC-39 implementation.

- [ ] T001 Align feature scripts and test commands for unit/integration/contract/e2e in `/home/m_srnic/ece493/group_project/ECE493Group19/package.json`
- [ ] T002 Register offering administration router mount in `/home/m_srnic/ece493/group_project/ECE493Group19/src/app.js`
- [ ] T003 [P] Add reusable offering/enrollment fixture builders in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/fixtures/offeringFixtures.js`
- [ ] T004 [P] Create shared test database setup helper for feature suites in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/helpers/testDb.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build core schema, model, validation, audit, and route/controller foundations required by all stories.

- [ ] T005 Add feature migration for offerings, logs, and retry queue tables in `/home/m_srnic/ece493/group_project/ECE493Group19/src/db/migrations/001_manage_course_offerings.sql`
- [ ] T006 Update SQLite schema constraints and indexes (unique offering identity + foreign keys) in `/home/m_srnic/ece493/group_project/ECE493Group19/src/db/schema.sql`
- [ ] T007 [P] Implement offering CRUD/query data-access primitives in `/home/m_srnic/ece493/group_project/ECE493Group19/src/models/offeringModel.js`
- [ ] T008 [P] Implement active-enrollment counting and status filters in `/home/m_srnic/ece493/group_project/ECE493Group19/src/models/enrollmentModel.js`
- [ ] T009 [P] Implement audit log and retry queue persistence primitives in `/home/m_srnic/ece493/group_project/ECE493Group19/src/models/auditLogModel.js`
- [ ] T010 Implement shared request and domain validation utilities in `/home/m_srnic/ece493/group_project/ECE493Group19/src/services/validationService.js`
- [ ] T011 Implement audit queue enqueue + admin alert abstraction in `/home/m_srnic/ece493/group_project/ECE493Group19/src/services/auditService.js`
- [ ] T012 Define offering API/admin route scaffolding (`GET /offerings`, `POST /offerings`, delete-check, delete confirm) in `/home/m_srnic/ece493/group_project/ECE493Group19/src/routes/offeringRoutes.js`
- [ ] T013 Implement controller scaffolding and normalized API error mapping in `/home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/offeringController.js`

**Checkpoint**: Foundation complete; US1/US2/US3 can be implemented independently without depending on each other.

---

## Phase 3: User Story 1 - Add New Offering (Priority: P1) 🎯 MVP

**Goal**: Allow administrators to create valid offerings, reject invalid inputs, and support cancellation without persistence.

**Independent Test**: Submit valid offering data and verify catalog update + audit outcome; submit invalid data and verify field errors; cancel creation and verify unchanged catalog.

### Tests for User Story 1

- [ ] T014 [P] [US1] Add contract tests for `POST /api/offerings` success/validation/duplicate responses in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/contract/offering.create.contract.test.js`
- [ ] T015 [P] [US1] Add integration tests for add-offering success, validation feedback, and cancel-no-change behavior in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/offering.create.integration.test.js`
- [ ] T016 [P] [US1] Add Playwright smoke coverage for admin add/cancel flow in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/e2e/admin-offering-add.spec.ts`

### Implementation for User Story 1

- [ ] T017 [US1] Implement create-offering transaction with uniqueness and schedule-overlap enforcement in `/home/m_srnic/ece493/group_project/ECE493Group19/src/services/offeringService.js`
- [ ] T018 [US1] Wire create-offering request validation and response handling in `/home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/offeringController.js`
- [ ] T019 [P] [US1] Build add-offering form template with field-level validation rendering in `/home/m_srnic/ece493/group_project/ECE493Group19/src/views/admin/offering-form.html`
- [ ] T020 [P] [US1] Add create-action entry points and success messaging in `/home/m_srnic/ece493/group_project/ECE493Group19/src/views/admin/offerings-list.html`
- [ ] T021 [US1] Implement client-side submit/cancel behavior for offering form in `/home/m_srnic/ece493/group_project/ECE493Group19/src/views/admin/offering-form.js`
- [ ] T022 [US1] Add admin page handlers for offering list/new form routes in `/home/m_srnic/ece493/group_project/ECE493Group19/src/routes/offeringRoutes.js`
- [ ] T023 [US1] Add unit coverage for create validation/domain rule edge cases in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/services/offeringService.create.test.js`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Delete Existing Offering (Priority: P2)

**Goal**: Allow deletion of offerings with explicit confirmation, block active enrollments unless override is confirmed with reason, and preserve cancel behavior.

**Independent Test**: Delete an offering without active enrollments; verify block when active enrollments exist and no override; verify override delete succeeds with audit reason; verify delete cancel keeps data unchanged.

### Tests for User Story 2

- [ ] T024 [P] [US2] Add contract tests for `POST /api/offerings/{offeringId}/deletion-check` and `POST /api/offerings/{offeringId}/delete` in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/contract/offering.delete.contract.test.js`
- [ ] T025 [P] [US2] Add integration tests for blocked delete, override delete, and cancel confirmation flows in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/offering.delete.integration.test.js`
- [ ] T026 [P] [US2] Add Playwright smoke coverage for delete-confirm and override-reason UI in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/e2e/admin-offering-delete.spec.ts`

### Implementation for User Story 2

- [ ] T027 [US2] Implement deletion pre-check and confirmation-token creation in `/home/m_srnic/ece493/group_project/ECE493Group19/src/services/offeringService.js`
- [ ] T028 [US2] Implement final delete with `expected_updated_at` recheck, active-enrollment gate, and override reason enforcement in `/home/m_srnic/ece493/group_project/ECE493Group19/src/services/offeringService.js`
- [ ] T029 [US2] Wire delete-check and delete-confirm controller handlers in `/home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/offeringController.js`
- [ ] T030 [P] [US2] Build delete confirmation view with override prompt and conflict messaging in `/home/m_srnic/ece493/group_project/ECE493Group19/src/views/admin/offering-delete-confirm.html`
- [ ] T031 [P] [US2] Add delete actions and state indicators in offerings list UI in `/home/m_srnic/ece493/group_project/ECE493Group19/src/views/admin/offerings-list.html`
- [ ] T032 [US2] Add admin delete-confirm page route handlers in `/home/m_srnic/ece493/group_project/ECE493Group19/src/routes/offeringRoutes.js`
- [ ] T033 [US2] Add unit coverage for delete policy gate and override reason requirements in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/services/offeringService.delete-policy.test.js`

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Handle Save/Delete Failures Safely (Priority: P3)

**Goal**: Guarantee rollback/no-partial-mutation behavior and clear failure feedback for add/delete errors, including durable audit retry handling.

**Independent Test**: Simulate add/delete failures and verify rollback to pre-operation state, clear failure response, and queued retry when audit write fails post-mutation.

### Tests for User Story 3

- [ ] T034 [P] [US3] Add integration tests for rollback on simulated create/delete persistence failures in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/offering.rollback.integration.test.js`
- [ ] T035 [P] [US3] Add contract tests for conflict/internal-error payloads and status codes in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/contract/offering.failure.contract.test.js`
- [ ] T036 [P] [US3] Add unit tests for audit retry backoff metadata and alert emission in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/services/auditService.retry.test.js`

### Implementation for User Story 3

- [ ] T037 [US3] Add transactional create/delete wrapper with explicit rollback semantics in `/home/m_srnic/ece493/group_project/ECE493Group19/src/services/offeringService.js`
- [ ] T038 [US3] Implement audit-write fallback path (queue + alert) when primary audit insert fails in `/home/m_srnic/ece493/group_project/ECE493Group19/src/services/auditService.js`
- [ ] T039 [US3] Persist retry payload metadata (`attempt_count`, `next_attempt_at`, `last_error`) in `/home/m_srnic/ece493/group_project/ECE493Group19/src/models/auditLogModel.js`
- [ ] T040 [US3] Return deterministic failure/conflict responses that preserve pre-operation catalog state in `/home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/offeringController.js`
- [ ] T041 [US3] Render administrator-facing failure notices for add/delete errors in `/home/m_srnic/ece493/group_project/ECE493Group19/src/views/admin/offerings-list.html`

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, observability, and documentation updates across all stories.

- [ ] T042 [P] Add latency instrumentation for add/delete API operations (SC-001 tracking) in `/home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/offeringController.js`
- [ ] T043 [P] Add controller-level error-mapping unit regression tests in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/controllers/offeringController.error-map.test.js`
- [ ] T044 Update UC-39 quickstart validation steps and final command list in `/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-manage-course-offerings/quickstart.md`
- [ ] T045 Harden admin authorization middleware usage for all offering routes in `/home/m_srnic/ece493/group_project/ECE493Group19/src/routes/offeringRoutes.js`
- [ ] T046 Validate UC-39 acceptance criteria against `Acceptance Tests/UC-39-AS.md` and record execution commands in `/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-manage-course-offerings/quickstart.md`
- [ ] T047 Record UC-39 acceptance evidence for add/delete/failure flows in `/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-manage-course-offerings/UC-39-validation-report.md`
- [ ] T048 Add performance integration coverage asserting SC-001 (>=95% of valid adds complete within 5 seconds) in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/offering.performance.integration.test.js`
- [ ] T049 Add audit reliability integration coverage defining run window and SC-005 validation criteria in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/offering.audit-reliability.integration.test.js`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) has no dependencies.
- Foundational (Phase 2) depends on Setup and is the only blocking phase.
- User Story phases (Phases 3-5) each depend only on Foundational completion and do not depend on each other.
- Polish (Phase 6) depends on completion of the stories selected for release.

### User Story Dependencies

- **US1 (P1)**: No dependency on US2 or US3.
- **US2 (P2)**: No dependency on US1 or US3.
- **US3 (P3)**: No dependency on US1 or US2.
- **Shared-file sequencing constraint**: US1/US2/US3 all touch `src/services/offeringService.js` and `src/controllers/offeringController.js`; merge these tasks in controlled PR order to avoid overwrite conflicts while preserving story-level test independence.

### Dependency Graph

- `Setup -> Foundational -> {US1, US2, US3} -> Polish`

### Within Each User Story

- Implement tests first and confirm they fail before coding.
- Complete service logic before controller wiring.
- Complete controller wiring before final UI polish for that story.

## Parallel Opportunities

- Setup: T003 and T004 can run in parallel after T001/T002.
- Foundational: T007, T008, and T009 can run in parallel; T010 and T011 can run after model primitives stabilize.
- US1: T014, T015, T016 run in parallel; T019 and T020 run in parallel.
- US2: T024, T025, T026 run in parallel; T030 and T031 run in parallel.
- US3: T034, T035, T036 run in parallel.
- Polish: T042 and T043 run in parallel.

## Parallel Example: User Story 1

```bash
Task T014: tests/contract/offering.create.contract.test.js
Task T015: tests/integration/offering.create.integration.test.js
Task T016: tests/e2e/admin-offering-add.spec.ts
```

```bash
Task T019: src/views/admin/offering-form.html
Task T020: src/views/admin/offerings-list.html
```

## Parallel Example: User Story 2

```bash
Task T024: tests/contract/offering.delete.contract.test.js
Task T025: tests/integration/offering.delete.integration.test.js
Task T026: tests/e2e/admin-offering-delete.spec.ts
```

```bash
Task T030: src/views/admin/offering-delete-confirm.html
Task T031: src/views/admin/offerings-list.html
```

## Parallel Example: User Story 3

```bash
Task T034: tests/integration/offering.rollback.integration.test.js
Task T035: tests/contract/offering.failure.contract.test.js
Task T036: tests/unit/services/auditService.retry.test.js
```

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Complete US1 (Phase 3) and validate its independent test criteria.
3. Demo/deploy MVP once US1 passes.

### Incremental Delivery

1. Deliver US1 independently.
2. Deliver US2 independently.
3. Deliver US3 independently.
4. Finish Polish tasks for release readiness.

### Parallel Team Strategy

1. Team completes Setup + Foundational.
2. Split implementation concurrently across US1, US2, and US3 owners.
3. Merge each story behind passing story-specific tests.
