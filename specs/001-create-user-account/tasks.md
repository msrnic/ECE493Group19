# Tasks: Administrative Account Creation

**Input**: Design documents from `/specs/001-create-user-account/`
**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`

**Tests**: Tests are included because the feature artifacts explicitly define unit, integration, contract, and E2E verification for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and feature scaffolding

- [ ] T001 Create feature traceability note mapping FR-001..FR-017 and UC-43 references in specs/001-create-user-account/implementation-notes.md
- [ ] T002 Create admin account creation route scaffold and router registration in app/routes/adminAccountRoutes.js
- [ ] T003 [P] Create controller skeleton for form metadata and account creation handlers in app/controllers/adminAccountController.js
- [ ] T004 [P] Create base admin account creation view shell in app/views/admin/create-account.html
- [ ] T005 [P] Create base stylesheet and client script scaffolds in app/public/css/admin-account.css and app/public/js/create-account.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create/extend SQLite schema for user_accounts, roles, user_role_assignments, credentials, notification_attempts, and preserve course tables in app/db/schema.sql
- [ ] T007 Add migration for account-creation tables, constraints, and foreign keys in app/db/migrations/001_create_user_account.sql
- [ ] T008 [P] Implement reusable identifier normalization and duplicate-safe lookup utility in app/services/loginIdentifierService.js
- [ ] T009 [P] Implement password policy validation and temporary password generation service in app/services/passwordPolicyService.js
- [ ] T010 [P] Implement role existence and assignability permission checks in app/models/roleModel.js
- [ ] T011 Implement transactional account creation repository operations (account + credential + role assignment) in app/models/userAccountModel.js
- [ ] T012 [P] Implement credential hashing/storage model helpers in app/models/credentialModel.js
- [ ] T013 [P] Implement notification delivery adapter + notification_attempts persistence helpers in app/services/notificationService.js and app/models/notificationAttemptModel.js
- [ ] T014 Implement shared request validation chains for create-account payloads in app/validators/adminAccountValidators.js
- [ ] T015 Implement operational error logging helpers for account creation failures in app/services/accountCreationLogger.js
- [ ] T016 Wire foundational middleware (auth + permission guard + JSON error response envelope) for admin account routes in app/routes/adminAccountRoutes.js

**Checkpoint**: Foundation complete; user stories can proceed independently without cross-story blocking.

---

## Phase 3: User Story 1 - Create Account Successfully (Priority: P1) 🎯 MVP

**Goal**: Allow authorized administrators to create active accounts with role assignment and first-login password-change enforcement.

**Independent Test**: Submit valid requests for both preset-password and generated-password modes and verify `201` response with account identifier, assigned role, `active` status, and `mustChangePassword=true`.

### Tests for User Story 1

- [ ] T017 [P] [US1] Add contract test for GET metadata and POST success responses in tests/contract/admin-account.contract.test.js
- [ ] T018 [P] [US1] Add integration test for successful preset-password account creation transaction in tests/integration/admin-account.create-success.test.js
- [ ] T019 [P] [US1] Add integration test for generated-password success path in tests/integration/admin-account.generate-password.test.js
- [ ] T020 [P] [US1] Add E2E test for successful administrator form submission and confirmation display in tests/e2e/admin-account-success.spec.js

### Implementation for User Story 1

- [ ] T023 [US1] Implement role assignment persistence model for single-role mapping in app/models/userRoleAssignmentModel.js
- [ ] T025 [US1] Enforce first-login password-change flags and active status defaults during creation in app/models/userAccountModel.js and app/models/credentialModel.js
- [ ] T021 [US1] Implement GET /api/admin/accounts/form-metadata handler returning assignable roles, password policy, and notification toggle in app/controllers/adminAccountController.js
- [ ] T022 [US1] Implement POST /api/admin/accounts success path orchestration (validation pass -> transactional create -> success payload) in app/controllers/adminAccountController.js
- [ ] T024 [US1] Implement success confirmation rendering and payload mapping in app/views/admin/create-account.html and app/public/js/create-account.js

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Correct Invalid Input Before Creation (Priority: P2)

**Goal**: Block invalid identity/role/password submissions with clear field-level guidance and preserve non-sensitive form inputs for correction.

**Independent Test**: Submit missing/invalid identity, invalid role, and invalid password payloads; verify `400` errors with field details, preserved non-sensitive values, correction, and successful resubmission.

### Tests for User Story 2

- [ ] T026 [P] [US2] Add contract test for validation error response schema and preserved values in tests/contract/admin-account.validation.contract.test.js
- [ ] T027 [P] [US2] Add integration tests for missing/malformed identity and correction-resubmission in tests/integration/admin-account.validation-identity.test.js
- [ ] T028 [P] [US2] Add integration tests for non-assignable role and invalid password policy failures in tests/integration/admin-account.validation-role-password.test.js
- [ ] T029 [P] [US2] Add E2E test for validation feedback, value preservation, and corrected resubmission in tests/e2e/admin-account-validation-correction.spec.js

### Implementation for User Story 2

- [ ] T031 [US2] Implement request validators for required identity fields, login identifier format, and role/password mode requirements in app/validators/adminAccountValidators.js
- [ ] T032 [US2] Implement password policy guidance payload generation for failed preset-password checks in app/services/passwordPolicyService.js
- [ ] T030 [US2] Implement field-level validation failure response formatting with error codes/messages and preserved non-sensitive values in app/controllers/adminAccountController.js
- [ ] T034 [US2] Ensure sensitive password fields are never echoed or preserved in failure responses in app/controllers/adminAccountController.js
- [ ] T033 [US2] Implement client-side rendering for inline validation errors and non-sensitive value repopulation in app/public/js/create-account.js and app/views/admin/create-account.html

**Checkpoint**: User Story 2 is independently functional and testable without relying on User Story 1 completion.

---

## Phase 5: User Story 3 - Handle Conflicts and Operational Failures (Priority: P3)

**Goal**: Handle duplicate identifiers, transactional system failures, and post-commit notification failures with correct outcomes and logging.

**Independent Test**: Trigger duplicate normalized identifiers (`409`), simulated transaction failures (`500` with no records committed), and notification failures (`201` with warning and persisted account).

### Tests for User Story 3

- [ ] T035 [P] [US3] Add contract test for duplicate conflict and server error response schemas in tests/contract/admin-account.error.contract.test.js
- [ ] T036 [P] [US3] Add integration test for case/whitespace-insensitive duplicate detection and conflict handling in tests/integration/admin-account.duplicate-conflict.test.js
- [ ] T037 [P] [US3] Add integration test for transaction rollback on simulated write failure in tests/integration/admin-account.transaction-failure.test.js
- [ ] T038 [P] [US3] Add integration test for notification failure warning without rollback in tests/integration/admin-account.notification-failure.test.js

### Implementation for User Story 3

- [ ] T042 [US3] Persist notification attempt audit rows for success/failure/disabled paths in app/models/notificationAttemptModel.js
- [ ] T041 [US3] Implement post-commit notification attempt status reporting (`sent`, `failed`, `skipped_disabled`) without create rollback in app/services/notificationService.js and app/controllers/adminAccountController.js
- [ ] T039 [US3] Implement duplicate detection and `409 DUPLICATE_IDENTIFIER` response using normalized identifier uniqueness in app/controllers/adminAccountController.js and app/services/loginIdentifierService.js
- [ ] T040 [US3] Implement transaction rollback + `500 INTERNAL_ERROR` response and structured failure logging in app/controllers/adminAccountController.js and app/services/accountCreationLogger.js
- [ ] T043 [US3] Surface duplicate and operational failure messages in the admin UI form workflow in app/public/js/create-account.js and app/views/admin/create-account.html

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements spanning all stories

- [ ] T044 [P] Add unit tests for identifier normalization, role permission checks, and password policy edge cases in tests/unit/login-identifier.service.test.js, tests/unit/role-model.test.js, and tests/unit/password-policy.service.test.js
- [ ] T045 Validate OpenAPI contract coverage for implemented handlers and update discrepancies in specs/001-create-user-account/contracts/openapi.yaml
- [ ] T046 Run full verification workflow and record results (`npm test && npm run lint`) in specs/001-create-user-account/implementation-notes.md
- [ ] T047 Verify FR-to-acceptance mapping completeness for UC-43/UC-43-AS and archive checklist in specs/001-create-user-account/checklists/quality-gate.md
- [ ] T048 [P] Add performance integration test to measure valid account-creation latency budget in tests/integration/admin-account.performance.test.js
- [ ] T049 Implement account-creation latency metrics logging and rolling-window summary output in app/services/accountCreationLogger.js
- [ ] T050 Implement first-attempt success metric tracking and reporting for create-account flow in app/services/accountCreationMetricsService.js and specs/001-create-user-account/implementation-notes.md
- [ ] T051 Add post-release admin feedback capture/reporting checklist for error-message clarity in specs/001-create-user-account/checklists/quality-gate.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks user-story execution.
- **Phase 3 (US1), Phase 4 (US2), Phase 5 (US3)**: Each depends only on Phase 2, not on each other.
- **Phase 6 (Polish)**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational completion; no dependency on US2/US3.
- **US2 (P2)**: Starts after Foundational completion; no dependency on US1/US3.
- **US3 (P3)**: Starts after Foundational completion; no dependency on US1/US2.

### Within-Story Ordering Rules

- Tests are authored before implementation for each story.
- Validation/model/service tasks precede controller and UI finalization tasks in the same story.
- Story completion does not gate the start of other stories.

### Dependency Graph (No Cross-Story Blocking)

- Setup -> Foundational -> {US1, US2, US3 in parallel} -> Polish

---

## Parallel Execution Examples

## User Story 1

```bash
Task T017 + T018 + T019 + T020 can run in parallel.
After model/service readiness, T021 + T023 + T024 can be split across contributors.
```

## User Story 2

```bash
Task T026 + T027 + T028 + T029 can run in parallel.
Task T031 and T033 can run in parallel before T030/T034 merge behavior.
```

## User Story 3

```bash
Task T035 + T036 + T037 + T038 can run in parallel.
Task T039, T041, and T042 can proceed in parallel, then converge in T040/T043.
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently via tests and quickstart scenario checks.
4. Demo/deploy MVP.

### Incremental Delivery

1. Deliver US1 (core create success flow).
2. Deliver US2 (validation and correction UX).
3. Deliver US3 (conflict/failure resilience).
4. Finish Polish phase with full verification and traceability checks.

### Parallel Team Strategy

1. Team jointly completes Setup + Foundational.
2. After Foundational, assign separate engineers to US1, US2, and US3 concurrently.
3. Merge stories independently since no story has a hard dependency on another.

---

## Notes

- `[P]` tasks are parallelizable because they touch different files or independent test files.
- All user-story phases are independently testable after foundational completion.
- No cross-story blocking dependencies remain in this plan.
