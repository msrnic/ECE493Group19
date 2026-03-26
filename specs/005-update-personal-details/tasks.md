# Tasks: Update Personal Details

**Input**: Design documents from `/specs/005-update-personal-details/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/personal-details-api.yaml, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Each task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize workspace and feature scaffolding.

- [X] T001 Add personal-details feature wiring entry in backend/src/app.js
- [X] T002 Create personal-details route module scaffold in backend/src/routes/personal-details-routes.js
- [X] T003 [P] Create personal-details controller scaffold in backend/src/controllers/personal-details-controller.js
- [X] T004 [P] Create personal-details model scaffold in backend/src/models/personal-details-model.js
- [X] T005 [P] Create personal-details view scaffold in backend/src/views/personal-details.html
- [X] T006 [P] Create personal-details client script scaffold in frontend/src/js/personal-details.js
- [X] T007 [P] Create personal-details stylesheet scaffold in frontend/src/css/personal-details.css
- [X] T008 Add personal-details test suite placeholders in backend/tests/integration/personal-details.integration.test.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Complete core prerequisites required by all stories.

**⚠️ CRITICAL**: Complete this phase before starting user story phases.

- [X] T009 Define/extend SQLite schema for `personal_details` and indexes in backend/src/models/schema.sql
- [X] T010 Add DB access helpers for personal-details transactions in backend/src/models/personal-details-model.js
- [X] T011 [P] Implement authenticated-account guard for personal-details routes in backend/src/routes/personal-details-routes.js
- [X] T012 [P] Define shared editable-field configuration constants in backend/src/models/personal-details-field-rules.js
- [X] T013 Implement shared request/response mapper utilities for contract field names in backend/src/controllers/personal-details-controller.js
- [X] T014 [P] Add centralized personal-details error response helper for 400/401/500 outcomes in backend/src/controllers/personal-details-controller.js
- [X] T015 Add explicit UC-05-AS scenario-to-test-task mapping in specs/005-update-personal-details/quickstart.md

**Checkpoint**: Foundation complete; user story work can proceed.

---

## Phase 3: User Story 1 - Edit and Save Personal Details (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can open their personal details, edit allowed fields, save, and see persisted updates.

**Independent Test**: Log in, open personal details, submit valid edits, receive success confirmation, then reload and verify stored values changed.

### Tests for User Story 1

- [X] T016 [P] [US1] Add GET `/api/personal-details` contract/integration success test (UC-05-AS main flow display step) in backend/tests/integration/personal-details.get.success.test.js
- [X] T017 [P] [US1] Add PUT `/api/personal-details` valid-save success test (UC-05-AS main flow save/confirm steps) in backend/tests/integration/personal-details.put.success.test.js

### Implementation for User Story 1

- [X] T018 [US1] Implement `getPersonalDetailsByAccountId` read query in backend/src/models/personal-details-model.js
- [X] T019 [US1] Implement `updatePersonalDetailsByAccountId` transactional save query in backend/src/models/personal-details-model.js
- [X] T020 [US1] Implement GET handler returning `PersonalDetailsResponse` in backend/src/controllers/personal-details-controller.js
- [X] T021 [US1] Implement PUT handler success path returning `UpdateSuccessResponse` in backend/src/controllers/personal-details-controller.js
- [X] T022 [US1] Wire GET and PUT endpoints for `/api/personal-details` in backend/src/routes/personal-details-routes.js
- [X] T023 [US1] Build personal-details form rendering with editable fields and read-only credential fields in backend/src/views/personal-details.html
- [X] T024 [US1] Implement form submission client flow and success message rendering in frontend/src/js/personal-details.js
- [X] T025 [US1] Add personal-details page layout and field-state styling in frontend/src/css/personal-details.css

**Checkpoint**: US1 works independently and is demo-ready as MVP.

---

## Phase 4: User Story 2 - Correct Invalid Input (Priority: P2)

**Goal**: Invalid submissions are blocked with field-level errors and corrected retries can succeed.

**Independent Test**: Submit missing/invalid required values, verify per-field errors and no persistence; correct values and resubmit successfully.

### Tests for User Story 2

- [X] T026 [P] [US2] Add PUT validation-failure test for required/format errors (UC-05-AS extension 3a/3a1) in backend/tests/integration/personal-details.put.validation.test.js
- [X] T027 [P] [US2] Add validation-retry success test after correction (UC-05-AS extension recovery) in backend/tests/integration/personal-details.put.validation-retry.test.js

### Implementation for User Story 2

- [X] T028 [US2] Implement server-side validation against editable rules and date constraints in backend/src/controllers/personal-details-controller.js
- [X] T029 [US2] Return `ValidationErrorResponse` fieldErrors contract shape for invalid payloads in backend/src/controllers/personal-details-controller.js
- [X] T030 [US2] Add client-side inline validation and error highlighting behavior in frontend/src/js/personal-details.js
- [X] T031 [US2] Add visual error states and helper text styles in frontend/src/css/personal-details.css
- [X] T032 [US2] Prevent non-editable/credential fields from update payload construction in frontend/src/js/personal-details.js

**Checkpoint**: US2 works independently with clear validation feedback.

---

## Phase 5: User Story 3 - Handle Interruptions and Failures Safely (Priority: P3)

**Goal**: Cancel/abandon and save-failure paths avoid unintended or partial changes.

**Independent Test**: Trigger unsaved-change navigation prompt and cancel flow; simulate server save failure and verify no partial update with retry message.

### Tests for User Story 3

- [X] T033 [P] [US3] Add simulated DB save-failure no-partial-write test (UC-05-AS extension 4a/4a1) in backend/tests/integration/personal-details.put.save-failure.test.js
- [X] T034 [P] [US3] Add cancel/abandon unsaved-change browser-flow test (UC-05-AS extension 6a/6a1/6a2) in frontend/tests/personal-details.unsaved-navigation.test.js
- [X] T035 [P] [US3] Add near-concurrent update last-write-wins integration test (UC-05 concurrency clarification) in backend/tests/integration/personal-details.put.concurrency.test.js

### Implementation for User Story 3

- [X] T036 [US3] Add explicit DB transaction rollback handling for save exceptions in backend/src/models/personal-details-model.js
- [X] T037 [US3] Implement controller save-failure response message for retry guidance in backend/src/controllers/personal-details-controller.js
- [X] T038 [US3] Implement client dirty-state tracking and before-unload confirmation prompt in frontend/src/js/personal-details.js
- [X] T039 [US3] Implement cancel-action flow that discards unsaved edits and restores last saved state in frontend/src/js/personal-details.js
- [X] T040 [US3] Ensure last-write-wins behavior by commit-order update timestamp handling in backend/src/models/personal-details-model.js

**Checkpoint**: US3 works independently for interruption and failure resilience.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize quality, performance checks, and docs.

- [X] T041 [P] Add/update feature-specific unit tests for validation helpers in backend/tests/unit/personal-details-validation.test.js
- [X] T042 Run full personal-details regression suite and record results in specs/005-update-personal-details/quickstart.md
- [X] T043 [P] Verify HTML/CSS/JS style-guide compliance for touched files in frontend/src/css/personal-details.css
- [X] T044 [P] Verify JavaScript style-guide compliance for touched backend files in backend/src/controllers/personal-details-controller.js
- [X] T045 [P] Add first-attempt success metric capture for valid update submissions in backend/src/controllers/personal-details-controller.js
- [X] T046 [P] Add personal-details response-time benchmark test for p95 <= 3s in backend/tests/integration/personal-details.performance.test.js
- [X] T047 Record SC-001 and SC-002 measurement evidence in specs/005-update-personal-details/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user stories.
- **Phase 3/4/5 (US1/US2/US3)**: Each depends only on Phase 2, not on completion of another story.
- **Phase 6 (Polish)**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2.
- **US2 (P2)**: Starts after Phase 2; no blocking dependency on US1 completion.
- **US3 (P3)**: Starts after Phase 2; no blocking dependency on US1/US2 completion.

### Dependency Graph

- Setup -> Foundational -> {US1, US2, US3 in parallel} -> Polish

### Within-Story Order Rules

- Write tests for a story before implementation tasks in that story.
- Backend model/controller implementation before route/view wiring that consumes it.
- Client behavior before final visual/error-state polish tasks.

## Parallel Execution Examples

### User Story 1

- Run `T016` and `T017` in parallel.
- After core handlers exist, run `T023` and `T025` in parallel.

### User Story 2

- Run `T026` and `T027` in parallel.
- Run `T030` and `T031` in parallel.

### User Story 3

- Run `T033`, `T034`, and `T035` in parallel.
- Run `T038` and `T039` in parallel.

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1) only.
3. Validate US1 independent test criteria before expanding scope.

### Incremental Delivery

1. Deliver US1 (core edit/save).
2. Deliver US2 (validation robustness).
3. Deliver US3 (failure/cancel/concurrency safety).
4. Finish Phase 6 polish.
