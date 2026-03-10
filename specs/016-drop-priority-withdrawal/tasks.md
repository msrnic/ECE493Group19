# Tasks: UC-16 Drop Priority Over Withdrawal

**Input**: Design documents from `/specs/016-drop-priority-withdrawal/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include unit, integration, and acceptance-validation tasks because the plan and quickstart explicitly require repeatable validation for deadline classification, failure handling, and UC-16 traceability.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the planned MVC structure, database scaffolding, and project-level validation entry points.

- [ ] T001 Create the MVC and test directory structure in `/home/thaia/ECE493Group19/app/`, `/home/thaia/ECE493Group19/public/`, `/home/thaia/ECE493Group19/database/`, and `/home/thaia/ECE493Group19/tests/`
- [ ] T002 Create the baseline SQLite schema file for enrollment data in `/home/thaia/ECE493Group19/database/schema/enrollment.sql`
- [ ] T003 [P] Create seed data for UC-16 deadline scenarios in `/home/thaia/ECE493Group19/database/seeds/uc16-fixtures.sql`
- [ ] T004 [P] Create a project validation checklist mapping implementation work to `/home/thaia/ECE493Group19/Use Cases/UC-16.md` and `/home/thaia/ECE493Group19/Acceptance Tests/UC-16-AS.md` in `/home/thaia/ECE493Group19/tests/acceptance/uc16-acceptance-checklist.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared data access, controller entry points, and cross-cutting safeguards required by every user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create shared SQLite connection and transaction helpers in `/home/thaia/ECE493Group19/app/models/db.js`
- [ ] T006 [P] Create the student data-access model in `/home/thaia/ECE493Group19/app/models/student-model.js`
- [ ] T007 [P] Create the course-offering data-access model in `/home/thaia/ECE493Group19/app/models/course-model.js`
- [ ] T008 [P] Create the enrollment data-access model in `/home/thaia/ECE493Group19/app/models/enrollment-model.js`
- [ ] T009 [P] Create the deadline-policy data-access model in `/home/thaia/ECE493Group19/app/models/deadline-policy-model.js`
- [ ] T010 [P] Create the fee-outcome data-access model in `/home/thaia/ECE493Group19/app/models/fee-outcome-model.js`
- [ ] T011 Create shared class-removal controller utilities for request validation, timestamp evaluation, and audit logging in `/home/thaia/ECE493Group19/app/controllers/class-removal-controller.js`
- [ ] T012 [P] Create shared class-removal client behavior for confirmation and duplicate-submit prevention in `/home/thaia/ECE493Group19/public/js/class-removal.js`
- [ ] T013 [P] Create shared class-removal styles for confirmation, result, and error states in `/home/thaia/ECE493Group19/public/css/class-removal.css`
- [ ] T014 Add style-guide compliance review notes for HTML/CSS/JS files in `/home/thaia/ECE493Group19/specs/016-drop-priority-withdrawal/quickstart.md`
- [ ] T015 Create ownership validation that rejects removal requests outside the authenticated student's schedule in `/home/thaia/ECE493Group19/app/controllers/class-removal-controller.js`
- [ ] T016 [P] Create backend duplicate-request guards and request-state tracking in `/home/thaia/ECE493Group19/app/models/enrollment-model.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Apply Drop Before Withdrawal (Priority: P1) 🎯 MVP

**Goal**: Let an eligible student see deadline details before confirmation and complete a class drop before the deadline with the correct fee summary.

**Independent Test**: Seed a before-deadline enrollment, open the removal flow, verify the deadline details and drop classification are shown before confirmation, then confirm removal and verify the class is dropped with the drop fee summary.

### Tests for User Story 1

- [ ] T017 [P] [US1] Create unit tests for before-deadline classification and authenticated ownership enforcement in `/home/thaia/ECE493Group19/tests/unit/deadline-policy-model.test.js`
- [ ] T018 [P] [US1] Create integration tests for successful drop processing in `/home/thaia/ECE493Group19/tests/integration/class-removal-flow.test.js`

### Implementation for User Story 1

- [ ] T019 [P] [US1] Create the drop-eligible removal form view in `/home/thaia/ECE493Group19/app/views/class-removal/removal-form.html`
- [ ] T020 [P] [US1] Create the successful removal result view for drop outcomes in `/home/thaia/ECE493Group19/app/views/class-removal/removal-result.html`
- [ ] T021 [US1] Implement before-deadline drop evaluation and fee-summary rendering in `/home/thaia/ECE493Group19/app/controllers/class-removal-controller.js`
- [ ] T022 [US1] Extend enrollment persistence for dropped-state updates in `/home/thaia/ECE493Group19/app/models/enrollment-model.js`
- [ ] T023 [US1] Extend fee-outcome persistence for drop-policy summaries in `/home/thaia/ECE493Group19/app/models/fee-outcome-model.js`
- [ ] T024 [US1] Wire deadline display, confirmation handling, and drop-result rendering in `/home/thaia/ECE493Group19/public/js/class-removal.js`

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Fall Back to Withdrawal After Deadline (Priority: P2)

**Goal**: Let a student see when the deadline has passed and complete a withdrawal with the correct post-deadline fee outcome.

**Independent Test**: Seed an after-deadline enrollment, open the removal flow, verify the passed deadline and withdrawal classification are shown, then confirm removal and verify the class is withdrawn with the withdrawal fee summary.

### Tests for User Story 2

- [ ] T025 [P] [US2] Add unit tests for exact-deadline and after-deadline withdrawal classification in `/home/thaia/ECE493Group19/tests/unit/deadline-policy-model.test.js`
- [ ] T026 [P] [US2] Add integration tests for successful withdrawal processing in `/home/thaia/ECE493Group19/tests/integration/class-removal-flow.test.js`

### Implementation for User Story 2

- [ ] T027 [US2] Implement exact-deadline and after-deadline withdrawal evaluation in `/home/thaia/ECE493Group19/app/controllers/class-removal-controller.js`
- [ ] T028 [US2] Extend enrollment persistence for withdrawn-state updates in `/home/thaia/ECE493Group19/app/models/enrollment-model.js`
- [ ] T029 [US2] Extend fee-outcome persistence for withdrawal-policy summaries in `/home/thaia/ECE493Group19/app/models/fee-outcome-model.js`
- [ ] T030 [US2] Update the removal form and result views with passed-deadline messaging in `/home/thaia/ECE493Group19/app/views/class-removal/removal-form.html` and `/home/thaia/ECE493Group19/app/views/class-removal/removal-result.html`

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Block Removal When Policy Cannot Be Determined (Priority: P3)

**Goal**: Block class removal safely when policy data is unavailable, missing, or invalid, and give the student the correct next-step guidance.

**Independent Test**: Simulate temporary lookup failure and missing/invalid policy records, attempt class removal, and verify the flow is blocked with the correct retry-later or contact-admin guidance while schedule and fees remain unchanged.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add unit tests for blocked policy outcomes and guidance selection in `/home/thaia/ECE493Group19/tests/unit/deadline-policy-model.test.js`
- [ ] T032 [P] [US3] Add integration tests for policy lookup failure and invalid-policy blocking in `/home/thaia/ECE493Group19/tests/integration/class-removal-flow.test.js`

### Implementation for User Story 3

- [ ] T033 [P] [US3] Create the blocked-removal error view in `/home/thaia/ECE493Group19/app/views/class-removal/removal-error.html`
- [ ] T034 [US3] Implement blocked-decision handling for temporary lookup failures and invalid/missing policies in `/home/thaia/ECE493Group19/app/controllers/class-removal-controller.js`
- [ ] T035 [US3] Extend deadline-policy lookups to distinguish temporary failures from invalid or missing policy records in `/home/thaia/ECE493Group19/app/models/deadline-policy-model.js`
- [ ] T036 [US3] Wire blocked-flow messaging and retry guidance in `/home/thaia/ECE493Group19/public/js/class-removal.js`

**Checkpoint**: User Stories 1 through 3 should be independently functional

---

## Phase 6: User Story 4 - Preserve State on Update Failure (Priority: P4)

**Goal**: Prevent partial updates when persistence fails or the enrollment changes before commit, and tell the student how to recover safely.

**Independent Test**: Simulate persistence failure and stale-enrollment conflict after policy selection, attempt class removal, and verify the system preserves schedule and fee state, logs the failed outcome, and instructs the student to refresh or retry appropriately.

### Tests for User Story 4

- [ ] T037 [P] [US4] Add unit tests for stale-enrollment, non-active enrollment states, and failed-update outcomes in `/home/thaia/ECE493Group19/tests/unit/class-removal-controller.test.js`
- [ ] T038 [P] [US4] Add integration tests for transactional rollback, stale-state handling, and invalid enrollment-state rejection in `/home/thaia/ECE493Group19/tests/integration/class-removal-flow.test.js`

### Implementation for User Story 4

- [ ] T039 [US4] Implement transactional rollback, stale-state detection, non-active enrollment rejection, and recovery guidance in `/home/thaia/ECE493Group19/app/controllers/class-removal-controller.js`
- [ ] T040 [US4] Extend enrollment persistence with active-state verification before commit in `/home/thaia/ECE493Group19/app/models/enrollment-model.js`
- [ ] T041 [US4] Extend audit and no-change fee outcome recording for failed updates in `/home/thaia/ECE493Group19/app/models/fee-outcome-model.js`
- [ ] T042 [US4] Update the error and result views with refresh-and-retry recovery messaging in `/home/thaia/ECE493Group19/app/views/class-removal/removal-error.html` and `/home/thaia/ECE493Group19/app/views/class-removal/removal-result.html`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finalize cross-story validation, accessibility, and documentation.

- [ ] T043 [P] Add keyboard-accessibility and status-message coverage notes to `/home/thaia/ECE493Group19/specs/016-drop-priority-withdrawal/contracts/class-removal-ui-contract.md`
- [ ] T044 [P] Add performance-validation notes for the 1-second result target in `/home/thaia/ECE493Group19/specs/016-drop-priority-withdrawal/quickstart.md`
- [ ] T045 [P] Add terminology-consistency review notes for `drop`, `withdrawal`, `blocked`, `retry later`, and `contact administrative staff` in `/home/thaia/ECE493Group19/specs/016-drop-priority-withdrawal/quickstart.md`
- [ ] T046 Run the UC-16 end-to-end validation checklist and document results in `/home/thaia/ECE493Group19/tests/acceptance/uc16-acceptance-checklist.md`
- [ ] T047 Review modified HTML/CSS against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-html-css.md` and record findings in `/home/thaia/ECE493Group19/specs/016-drop-priority-withdrawal/quickstart.md`
- [ ] T048 Review modified JavaScript against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-javascript.md` and record findings in `/home/thaia/ECE493Group19/specs/016-drop-priority-withdrawal/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Stories (Phases 3-6)**: Depend on Foundational completion.
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; no dependency on other stories; defines the MVP.
- **US2 (P2)**: Starts after Phase 2; reuses the same controller, views, and persistence components extended by US1.
- **US3 (P3)**: Starts after Phase 2; reuses shared controller/model infrastructure but remains independently testable through blocked flows.
- **US4 (P4)**: Starts after Phase 2; depends on the same transaction path as US1-US3 but is independently testable through forced failure paths.

### Within Each User Story

- Story tests should be written before implementation tasks for that story.
- Data/model updates should land before controller wiring that depends on them.
- Views and client behavior can proceed in parallel when they touch different files.
- A story is complete only when its independent test criteria pass.

### Parallel Opportunities

- Setup tasks `T003-T004` can run in parallel after `T001-T002`.
- Foundational model tasks `T006-T010` can run in parallel.
- Shared UI tasks `T012-T013` can run in parallel after `T011`.
- Within US1, `T017-T020` can run in parallel; `T022-T023` can also run in parallel.
- Within US2, `T025-T026` can run in parallel; `T028-T029` can run in parallel.
- Within US3, `T031-T033` can run in parallel before controller integration.
- Within US4, `T037-T038` can run in parallel; `T040-T041` can run in parallel.
- Polish tasks `T043-T048` can run in parallel once implementation is complete.

---

## Parallel Example: User Story 1

```bash
Task: "T017 [US1] Create unit tests for before-deadline classification and authenticated ownership enforcement in /home/thaia/ECE493Group19/tests/unit/deadline-policy-model.test.js"
Task: "T018 [US1] Create integration tests for successful drop processing in /home/thaia/ECE493Group19/tests/integration/class-removal-flow.test.js"
Task: "T019 [US1] Create the drop-eligible removal form view in /home/thaia/ECE493Group19/app/views/class-removal/removal-form.html"
Task: "T020 [US1] Create the successful removal result view for drop outcomes in /home/thaia/ECE493Group19/app/views/class-removal/removal-result.html"
```

## Parallel Example: User Story 2

```bash
Task: "T025 [US2] Add unit tests for exact-deadline and after-deadline withdrawal classification in /home/thaia/ECE493Group19/tests/unit/deadline-policy-model.test.js"
Task: "T026 [US2] Add integration tests for successful withdrawal processing in /home/thaia/ECE493Group19/tests/integration/class-removal-flow.test.js"
Task: "T028 [US2] Extend enrollment persistence for withdrawn-state updates in /home/thaia/ECE493Group19/app/models/enrollment-model.js"
Task: "T029 [US2] Extend fee-outcome persistence for withdrawal-policy summaries in /home/thaia/ECE493Group19/app/models/fee-outcome-model.js"
```

## Parallel Example: User Story 3

```bash
Task: "T031 [US3] Add unit tests for blocked policy outcomes and guidance selection in /home/thaia/ECE493Group19/tests/unit/deadline-policy-model.test.js"
Task: "T032 [US3] Add integration tests for policy lookup failure and invalid-policy blocking in /home/thaia/ECE493Group19/tests/integration/class-removal-flow.test.js"
Task: "T033 [US3] Create the blocked-removal error view in /home/thaia/ECE493Group19/app/views/class-removal/removal-error.html"
```

## Parallel Example: User Story 4

```bash
Task: "T037 [US4] Add unit tests for stale-enrollment, non-active enrollment states, and failed-update outcomes in /home/thaia/ECE493Group19/tests/unit/class-removal-controller.test.js"
Task: "T038 [US4] Add integration tests for transactional rollback, stale-state handling, and invalid enrollment-state rejection in /home/thaia/ECE493Group19/tests/integration/class-removal-flow.test.js"
Task: "T040 [US4] Extend enrollment persistence with active-state verification before commit in /home/thaia/ECE493Group19/app/models/enrollment-model.js"
Task: "T041 [US4] Extend audit and no-change fee outcome recording for failed updates in /home/thaia/ECE493Group19/app/models/fee-outcome-model.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate the before-deadline drop flow independently.

### Incremental Delivery

1. Finish Setup and Foundational phases once.
2. Deliver US1 as the MVP increment.
3. Add US2 for post-deadline withdrawal handling.
4. Add US3 for blocked policy failures.
5. Add US4 for rollback and stale-state protection.
6. Finish with cross-cutting accessibility, style, and acceptance validation.

### Parallel Team Strategy

1. One developer can finish database/model foundations while another prepares shared views and client behavior after the controller scaffold exists.
2. After Phase 2, separate developers can own US1-US4 in parallel only if shared controller, model, and integration-test file edits are sequenced deliberately.
3. Keep `class-removal-controller.js`, `enrollment-model.js`, `fee-outcome-model.js`, shared views, and `class-removal-flow.test.js` changes batched carefully because those files are shared across stories.

---

## Notes

- All tasks follow the required checklist format with checkbox, task ID, optional parallel marker, story label where required, and exact file path.
- The story phases are independently testable and mapped to the acceptance behavior in UC-16.
- The MVP scope is User Story 1 after Setup and Foundational work are complete.
