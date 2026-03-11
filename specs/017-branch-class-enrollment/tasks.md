# Tasks: UC-17 Enroll in Found Classes

**Input**: Design documents from `/specs/017-branch-class-enrollment/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include unit, integration, and acceptance-validation tasks because the plan and quickstart explicitly require repeatable validation for eligibility rules, blocked outcomes, and system-error rollback.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this belongs to (e.g., `US1`, `US2`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the planned MVC structure, database scaffolding, and use-case traceability artifacts.

- [ ] T001 Create the MVC and test directory structure in `/home/thaia/ECE493Group19/app/`, `/home/thaia/ECE493Group19/public/`, `/home/thaia/ECE493Group19/database/`, and `/home/thaia/ECE493Group19/tests/`
- [ ] T002 Create the baseline enrollment schema file in `/home/thaia/ECE493Group19/database/schema/enrollment.sql`
- [ ] T003 [P] Create UC-17 seed data for eligible, prerequisite-blocked, hold-blocked, full-class, and system-error scenarios in `/home/thaia/ECE493Group19/database/seeds/uc17-fixtures.sql`
- [ ] T004 [P] Create a traceability checklist for `/home/thaia/ECE493Group19/Use Cases/UC-17.md` and `/home/thaia/ECE493Group19/Acceptance Tests/UC-17-AS.md` in `/home/thaia/ECE493Group19/tests/acceptance/uc17-acceptance-checklist.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared SQLite access, enrollment request handling, and MVC primitives required by every user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create shared SQLite connection and transaction helpers in `/home/thaia/ECE493Group19/app/models/db.js`
- [ ] T006 [P] Create the student data-access model in `/home/thaia/ECE493Group19/app/models/student-model.js`
- [ ] T007 [P] Create the class-offering data-access model in `/home/thaia/ECE493Group19/app/models/class-offering-model.js`
- [ ] T008 [P] Create the enrollment-request and enrollment-record data-access model in `/home/thaia/ECE493Group19/app/models/enrollment-model.js`
- [ ] T009 [P] Create the eligibility evaluation model in `/home/thaia/ECE493Group19/app/models/eligibility-model.js`
- [ ] T010 [P] Create the fee-assessment data-access model in `/home/thaia/ECE493Group19/app/models/fee-assessment-model.js`
- [ ] T011 Create shared enrollment controller utilities for request validation, transaction handling, and outcome routing in `/home/thaia/ECE493Group19/app/controllers/enrollment-controller.js`
- [ ] T012 [P] Create shared enrollment client behavior for submission, duplicate-submit prevention, and result messaging in `/home/thaia/ECE493Group19/public/js/enrollment.js`
- [ ] T013 [P] Create shared enrollment styles for confirmation, blocked-result, and error states in `/home/thaia/ECE493Group19/public/css/enrollment.css`
- [ ] T014 Add style-guide compliance review notes for modified HTML/CSS/JS files in `/home/thaia/ECE493Group19/specs/017-branch-class-enrollment/quickstart.md`
- [ ] T015 Create backend duplicate-enrollment guards and authoritative request resolution in `/home/thaia/ECE493Group19/app/models/enrollment-model.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Enroll in an Eligible Class (Priority: P1) 🎯 MVP

**Goal**: Let an eligible student enroll in a found class, update the schedule, and see a complete confirmation including fee-assessment summary.

**Independent Test**: Use an eligible student and open class, select enroll, and confirm that the system enrolls the student, updates the schedule, and shows class name, schedule placement, enrollment status, and fee summary.

### Tests for User Story 1

- [ ] T016 [P] [US1] Create unit tests for successful eligibility evaluation in `/home/thaia/ECE493Group19/tests/unit/eligibility-model.test.js`
- [ ] T017 [P] [US1] Create integration tests for successful enrollment and schedule update in `/home/thaia/ECE493Group19/tests/integration/enrollment-flow.test.js`

### Implementation for User Story 1

- [ ] T018 [P] [US1] Create the enrollment form view in `/home/thaia/ECE493Group19/app/views/enrollment/enrollment-form.html`
- [ ] T019 [P] [US1] Create the successful enrollment result view in `/home/thaia/ECE493Group19/app/views/enrollment/enrollment-result.html`
- [ ] T020 [US1] Implement successful enrollment flow and confirmation rendering in `/home/thaia/ECE493Group19/app/controllers/enrollment-controller.js`
- [ ] T021 [US1] Extend enrollment persistence for successful enrollment creation in `/home/thaia/ECE493Group19/app/models/enrollment-model.js`
- [ ] T022 [US1] Extend fee-assessment persistence and summary loading for successful enrollment in `/home/thaia/ECE493Group19/app/models/fee-assessment-model.js`
- [ ] T023 [US1] Wire enrollment submission and success-state rendering in `/home/thaia/ECE493Group19/public/js/enrollment.js`

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Block Enrollment When Requirements Are Not Met (Priority: P2)

**Goal**: Block enrollment for unmet prerequisites, registration holds, and schedule conflicts with clear reason messaging and no schedule change.

**Independent Test**: Attempt enrollment with unmet prerequisites, a registration hold, and a schedule conflict, and confirm that each case is blocked with the correct reason while the schedule remains unchanged.

### Tests for User Story 2

- [ ] T024 [P] [US2] Add unit tests for prerequisite, hold, and schedule-conflict failures in `/home/thaia/ECE493Group19/tests/unit/eligibility-model.test.js`
- [ ] T025 [P] [US2] Add integration tests for blocked enrollment due to prerequisites, holds, and schedule conflicts in `/home/thaia/ECE493Group19/tests/integration/enrollment-flow.test.js`

### Implementation for User Story 2

- [ ] T026 [P] [US2] Create the blocked-enrollment error view for eligibility failures in `/home/thaia/ECE493Group19/app/views/enrollment/enrollment-error.html`
- [ ] T027 [US2] Implement prerequisite, hold, and schedule-conflict blocking logic in `/home/thaia/ECE493Group19/app/controllers/enrollment-controller.js`
- [ ] T028 [US2] Extend eligibility evaluation for prerequisite, hold, and schedule-conflict outcomes in `/home/thaia/ECE493Group19/app/models/eligibility-model.js`
- [ ] T029 [US2] Wire blocked-enrollment messaging for prerequisite, hold, and conflict failures in `/home/thaia/ECE493Group19/public/js/enrollment.js`

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Block Enrollment for Full Classes (Priority: P3)

**Goal**: Block enrollment for full classes and show that zero seats remain without changing the student's schedule.

**Independent Test**: Attempt enrollment in a full class and verify that the system blocks the request, shows that zero seats remain, and leaves the schedule unchanged.

### Tests for User Story 3

- [ ] T030 [P] [US3] Add unit tests for capacity failures and zero-seat messaging in `/home/thaia/ECE493Group19/tests/unit/eligibility-model.test.js`
- [ ] T031 [P] [US3] Add integration tests for full-class blocking in `/home/thaia/ECE493Group19/tests/integration/enrollment-flow.test.js`

### Implementation for User Story 3

- [ ] T032 [US3] Implement full-class blocking and seat-message rendering in `/home/thaia/ECE493Group19/app/controllers/enrollment-controller.js`
- [ ] T033 [US3] Extend class-offering capacity lookups and seat-state evaluation in `/home/thaia/ECE493Group19/app/models/class-offering-model.js`
- [ ] T034 [US3] Update the enrollment error view with full-class messaging in `/home/thaia/ECE493Group19/app/views/enrollment/enrollment-error.html`
- [ ] T035 [US3] Wire capacity-blocked messaging in `/home/thaia/ECE493Group19/public/js/enrollment.js`

**Checkpoint**: User Stories 1 through 3 should be independently functional

---

## Phase 6: User Story 4 - Preserve State When Enrollment Fails (Priority: P4)

**Goal**: Preserve schedule state when enrollment writes fail or stale enrollment conditions appear, and tell the student how to recover.

**Independent Test**: Force an enrollment write failure or stale schedule condition after eligibility passes and confirm that no enrollment is created, the schedule remains unchanged, and the student is told to retry after refreshing.

### Tests for User Story 4

- [ ] T036 [P] [US4] Add unit tests for failed-write and stale-state outcomes in `/home/thaia/ECE493Group19/tests/unit/enrollment-controller.test.js`
- [ ] T037 [P] [US4] Add integration tests for rollback behavior and unchanged schedule on failed enrollment in `/home/thaia/ECE493Group19/tests/integration/enrollment-flow.test.js`

### Implementation for User Story 4

- [ ] T038 [US4] Implement rollback handling, stale-state detection, and retry-after-refresh guidance in `/home/thaia/ECE493Group19/app/controllers/enrollment-controller.js`
- [ ] T039 [US4] Extend enrollment persistence with no-partial-write guarantees in `/home/thaia/ECE493Group19/app/models/enrollment-model.js`
- [ ] T040 [US4] Extend fee-assessment handling so failed enrollments create no fee change in `/home/thaia/ECE493Group19/app/models/fee-assessment-model.js`
- [ ] T041 [US4] Update the enrollment error and result views with failure recovery messaging in `/home/thaia/ECE493Group19/app/views/enrollment/enrollment-error.html` and `/home/thaia/ECE493Group19/app/views/enrollment/enrollment-result.html`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finalize accessibility, performance, traceability, and validation evidence across all stories.

- [ ] T042 [P] Add accessibility coverage notes for enrollment confirmation, blocked results, and system-error messaging in `/home/thaia/ECE493Group19/specs/017-branch-class-enrollment/contracts/enrollment-ui-contract.md`
- [ ] T043 [P] Measure the 1-second enrollment-result target under representative concurrent requests and record results in `/home/thaia/ECE493Group19/specs/017-branch-class-enrollment/quickstart.md`
- [ ] T044 [P] Add terminology-consistency review notes for enrollment status and blocker messages in `/home/thaia/ECE493Group19/specs/017-branch-class-enrollment/quickstart.md`
- [ ] T045 Run the UC-17 end-to-end validation checklist and document results in `/home/thaia/ECE493Group19/tests/acceptance/uc17-acceptance-checklist.md`
- [ ] T046 Review modified HTML/CSS against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-html-css.md` and record findings in `/home/thaia/ECE493Group19/specs/017-branch-class-enrollment/quickstart.md`
- [ ] T047 Review modified JavaScript against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-javascript.md` and record findings in `/home/thaia/ECE493Group19/specs/017-branch-class-enrollment/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Stories (Phases 3-6)**: Depend on Foundational completion.
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; no dependency on other stories; defines the MVP.
- **US2 (P2)**: Starts after Phase 2; reuses the same controller and eligibility model but remains independently testable through blocked outcomes.
- **US3 (P3)**: Starts after Phase 2; reuses the same controller and class-offering model but remains independently testable through capacity failures.
- **US4 (P4)**: Starts after Phase 2; reuses the shared transaction path and remains independently testable through forced failure paths.

### Within Each User Story

- Story tests should be written before implementation tasks for that story.
- Model updates should land before controller wiring that depends on them.
- Views and client behavior can proceed in parallel when they touch different files.
- A story is complete only when its independent test criteria pass.

### Parallel Opportunities

- Setup tasks `T003-T004` can run in parallel after `T001-T002`.
- Foundational model tasks `T006-T010` can run in parallel.
- Shared UI tasks `T012-T013` can run in parallel after `T011`.
- Within US1, `T016-T019` can run in parallel; `T021-T022` can also run in parallel.
- Within US2, `T024-T026` can run in parallel before controller integration.
- Within US3, `T030-T031` can run in parallel; `T033-T034` can run in parallel.
- Within US4, `T036-T037` can run in parallel; `T039-T040` can run in parallel.
- Polish tasks `T042-T047` can run in parallel once implementation is complete.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate the successful enrollment flow independently.

### Incremental Delivery

1. Finish Setup and Foundational phases once.
2. Deliver US1 as the MVP increment.
3. Add US2 for prerequisites, holds, and schedule conflicts.
4. Add US3 for full-class handling.
5. Add US4 for rollback and recovery behavior.
6. Finish with accessibility, performance, style, and acceptance validation.

### Parallel Team Strategy

1. One developer can focus on model/data groundwork while another prepares shared views and client behavior after the controller scaffold exists.
2. After Phase 2, separate developers can own US1-US4 in parallel only if shared controller, eligibility model, and integration-test file edits are sequenced deliberately.
3. Keep `enrollment-controller.js`, `eligibility-model.js`, shared views, and `enrollment-flow.test.js` changes batched carefully because those files are shared across stories.
