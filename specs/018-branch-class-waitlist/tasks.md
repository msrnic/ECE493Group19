# Tasks: UC-18 Join Class Waitlists

**Input**: Design documents from `/specs/018-branch-class-waitlist/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/waitlist-ui-contract.md`, `quickstart.md`

**Tests**: Include JavaScript unit tests for waitlist eligibility logic, integration tests for SQLite-backed waitlist flows, and acceptance validation tasks because testing is explicitly required by `plan.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`, `US4`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the MVC file layout, database entry points, and test harness for the waitlist feature.

- [ ] T001 Create the waitlist MVC source and test file structure in `/home/thaia/ECE493Group19/app/`, `/home/thaia/ECE493Group19/public/`, `/home/thaia/ECE493Group19/database/`, and `/home/thaia/ECE493Group19/tests/`
- [ ] T002 Add the baseline waitlist SQLite schema and UC-18 fixture seed scripts in `/home/thaia/ECE493Group19/database/schema/waitlist.sql` and `/home/thaia/ECE493Group19/database/seeds/uc18-fixtures.sql`
- [ ] T003 [P] Create the initial waitlist controller, model, view, and client script placeholders in `/home/thaia/ECE493Group19/app/controllers/waitlist-controller.js`, `/home/thaia/ECE493Group19/app/models/waitlist-model.js`, `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-form.html`, `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-result.html`, `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-error.html`, `/home/thaia/ECE493Group19/public/js/waitlist.js`, and `/home/thaia/ECE493Group19/public/css/waitlist.css`
- [ ] T004 [P] Create the waitlist unit, integration, and acceptance test files in `/home/thaia/ECE493Group19/tests/unit/waitlist-eligibility-model.test.js`, `/home/thaia/ECE493Group19/tests/unit/waitlist-controller.test.js`, `/home/thaia/ECE493Group19/tests/integration/waitlist-flow.test.js`, and `/home/thaia/ECE493Group19/tests/acceptance/uc18-acceptance-checklist.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared persistence, eligibility, request orchestration, and UI contract plumbing required by all user stories.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [ ] T005 Implement shared SQLite access and transaction helpers for UC-18 in `/home/thaia/ECE493Group19/app/models/waitlist-model.js`
- [ ] T006 [P] Implement waitlist request audit-record persistence for successful, blocked, and failed outcomes in `/home/thaia/ECE493Group19/app/models/waitlist-model.js`
- [ ] T007 [P] Implement student, section, enrollment, and registration-term lookup models in `/home/thaia/ECE493Group19/app/models/student-model.js`, `/home/thaia/ECE493Group19/app/models/class-section-model.js`, `/home/thaia/ECE493Group19/app/models/enrollment-model.js`, and `/home/thaia/ECE493Group19/app/models/registration-term-model.js`
- [ ] T008 [P] Implement waitlist eligibility evaluation and blocker aggregation in `/home/thaia/ECE493Group19/app/models/waitlist-eligibility-model.js`
- [ ] T009 Implement the shared waitlist request controller flow and result mapping in `/home/thaia/ECE493Group19/app/controllers/waitlist-controller.js`
- [ ] T010 [P] Implement the shared waitlist form rendering and accessible result-state styling in `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-form.html`, `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-result.html`, `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-error.html`, and `/home/thaia/ECE493Group19/public/css/waitlist.css`
- [ ] T011 [P] Implement the client-side waitlist submission and authoritative-result handling in `/home/thaia/ECE493Group19/public/js/waitlist.js`
- [ ] T012 Add shared controller, eligibility-model, and audit-record test coverage for foundational validation rules in `/home/thaia/ECE493Group19/tests/unit/waitlist-eligibility-model.test.js`, `/home/thaia/ECE493Group19/tests/unit/waitlist-controller.test.js`, and `/home/thaia/ECE493Group19/tests/integration/waitlist-flow.test.js`

**Checkpoint**: Foundation ready. User story implementation can proceed.

---

## Phase 3: User Story 1 - Join an Eligible Waitlist (Priority: P1) 🎯 MVP

**Goal**: Allow an eligible authenticated student to join the waitlist for a full, waitlist-enabled section and see waitlist status with a numeric position when applicable.

**Independent Test**: Select a full, waitlist-enabled section as an eligible student and verify the request succeeds, the student is added to the waitlist, and the result shows waitlist status plus a position only for sections that assign numeric positions.

### Tests for User Story 1

- [ ] T013 [P] [US1] Add unit tests for eligible waitlist decisions and no-position status handling in `/home/thaia/ECE493Group19/tests/unit/waitlist-eligibility-model.test.js`
- [ ] T014 [P] [US1] Add controller tests for successful waitlist responses and result rendering in `/home/thaia/ECE493Group19/tests/unit/waitlist-controller.test.js`
- [ ] T015 [P] [US1] Add SQLite-backed integration tests for successful waitlist creation and optional position assignment in `/home/thaia/ECE493Group19/tests/integration/waitlist-flow.test.js`

### Implementation for User Story 1

- [ ] T016 [P] [US1] Implement waitlist request persistence and successful entry creation in `/home/thaia/ECE493Group19/app/models/waitlist-model.js`
- [ ] T017 [US1] Implement assigned-position and no-position success behavior in `/home/thaia/ECE493Group19/app/models/class-section-model.js` and `/home/thaia/ECE493Group19/app/models/waitlist-model.js`
- [ ] T018 [US1] Implement successful join orchestration in `/home/thaia/ECE493Group19/app/controllers/waitlist-controller.js`
- [ ] T019 [US1] Implement success-state UI rendering for waitlisted status and optional position display in `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-result.html` and `/home/thaia/ECE493Group19/public/js/waitlist.js`
- [ ] T020 [US1] Add acceptance steps for the primary successful join flow in `/home/thaia/ECE493Group19/tests/acceptance/uc18-acceptance-checklist.md`

**Checkpoint**: User Story 1 is fully functional and testable as the MVP increment.

---

## Phase 4: User Story 2 - Block Waitlisting When the Section Cannot Be Waitlisted (Priority: P2)

**Goal**: Block requests for full sections that are not waitlist-eligible and present relevant alternatives without changing state.

**Independent Test**: Select a full section with waitlisting disabled and verify that the request is blocked, no waitlist entry is created, and the result shows at least one relevant alternative section or course option.

### Tests for User Story 2

- [ ] T021 [P] [US2] Add unit tests for not-waitlist-eligible section blocking in `/home/thaia/ECE493Group19/tests/unit/waitlist-eligibility-model.test.js`
- [ ] T022 [P] [US2] Add integration tests for blocked waitlist-unavailable requests and unchanged state in `/home/thaia/ECE493Group19/tests/integration/waitlist-flow.test.js`

### Implementation for User Story 2

- [ ] T023 [P] [US2] Implement waitlist-enabled and alternative-section lookup behavior in `/home/thaia/ECE493Group19/app/models/class-section-model.js`
- [ ] T024 [US2] Implement waitlist-unavailable blocking and alternative selection logic in `/home/thaia/ECE493Group19/app/controllers/waitlist-controller.js`
- [ ] T025 [US2] Implement blocked-result UI for waitlist-unavailable messaging and alternative options in `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-result.html`, `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-form.html`, and `/home/thaia/ECE493Group19/public/js/waitlist.js`
- [ ] T026 [US2] Add acceptance steps for the not-waitlist-eligible blocked flow in `/home/thaia/ECE493Group19/tests/acceptance/uc18-acceptance-checklist.md`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Prevent Duplicate or Ineligible Waitlist Requests (Priority: P3)

**Goal**: Reject duplicate and ineligible waitlist requests with specific blocker reasons and next-step guidance while preserving state.

**Independent Test**: Attempt to join a waitlist when the student is already enrolled, already waitlisted, on hold, or outside an open term and verify the system reports the correct reason, gives blocker-specific guidance, and leaves registration and waitlist state unchanged.

### Tests for User Story 3

- [ ] T027 [P] [US3] Add unit tests for duplicate-status, hold, closed-term, and multi-blocker decisions in `/home/thaia/ECE493Group19/tests/unit/waitlist-eligibility-model.test.js`
- [ ] T028 [P] [US3] Add controller tests for blocker-specific guidance and authoritative duplicate-request responses in `/home/thaia/ECE493Group19/tests/unit/waitlist-controller.test.js`
- [ ] T029 [P] [US3] Add integration tests for duplicate and ineligible blocked flows in `/home/thaia/ECE493Group19/tests/integration/waitlist-flow.test.js`

### Implementation for User Story 3

- [ ] T030 [P] [US3] Implement duplicate-status and registration-access lookup rules in `/home/thaia/ECE493Group19/app/models/enrollment-model.js`, `/home/thaia/ECE493Group19/app/models/registration-term-model.js`, and `/home/thaia/ECE493Group19/app/models/waitlist-eligibility-model.js`
- [ ] T031 [US3] Implement duplicate-submit protection and blocker-specific response mapping in `/home/thaia/ECE493Group19/app/controllers/waitlist-controller.js`
- [ ] T032 [US3] Implement blocked-result UI for duplicate, hold, closed-term, and multi-blocker guidance in `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-result.html` and `/home/thaia/ECE493Group19/public/js/waitlist.js`
- [ ] T033 [US3] Add acceptance steps for duplicate and ineligible blocked flows in `/home/thaia/ECE493Group19/tests/acceptance/uc18-acceptance-checklist.md`

**Checkpoint**: User Stories 1 through 3 are independently functional.

---

## Phase 6: User Story 4 - Preserve State When Waitlist Recording Fails (Priority: P4)

**Goal**: Fail cleanly when waitlist entry recording or required position assignment cannot complete, with no partial state change.

**Independent Test**: Force waitlist record or position-assignment failure for an otherwise eligible request and verify no waitlist entry or position is created, the student is not shown as waitlisted, and the result states the request did not complete.

### Tests for User Story 4

- [ ] T034 [P] [US4] Add unit tests for dependency-data failure and atomic failure decisions in `/home/thaia/ECE493Group19/tests/unit/waitlist-controller.test.js`
- [ ] T035 [P] [US4] Add integration tests for waitlist-recording failure, position-assignment failure, unchanged state, and audit-record outcomes in `/home/thaia/ECE493Group19/tests/integration/waitlist-flow.test.js`

### Implementation for User Story 4

- [ ] T036 [P] [US4] Implement atomic transaction rollback and dependency-unavailable failure handling in `/home/thaia/ECE493Group19/app/models/waitlist-model.js`
- [ ] T037 [US4] Implement controller failure responses for storage, position-assignment, and stale-data failures in `/home/thaia/ECE493Group19/app/controllers/waitlist-controller.js`
- [ ] T038 [US4] Implement failure-result UI stating no entry and no position were created in `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-error.html`, `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-result.html`, and `/home/thaia/ECE493Group19/public/js/waitlist.js`
- [ ] T039 [US4] Add acceptance steps for waitlist-recording and position-assignment failure flows in `/home/thaia/ECE493Group19/tests/acceptance/uc18-acceptance-checklist.md`

**Checkpoint**: All four user stories are independently functional and testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate style, accessibility, performance, and end-to-end readiness across the full feature.

- [ ] T040 [P] Implement keyboard focus order and assistive-technology status announcements in `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-form.html`, `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-result.html`, `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-error.html`, and `/home/thaia/ECE493Group19/public/js/waitlist.js`
- [ ] T041 [P] Review modified HTML and CSS against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-html-css.md` and update `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-form.html`, `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-result.html`, `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-error.html`, and `/home/thaia/ECE493Group19/public/css/waitlist.css` as needed
- [ ] T042 [P] Review modified JavaScript against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-javascript.md` and update `/home/thaia/ECE493Group19/app/controllers/waitlist-controller.js`, `/home/thaia/ECE493Group19/app/models/student-model.js`, `/home/thaia/ECE493Group19/app/models/class-section-model.js`, `/home/thaia/ECE493Group19/app/models/enrollment-model.js`, `/home/thaia/ECE493Group19/app/models/waitlist-model.js`, `/home/thaia/ECE493Group19/app/models/registration-term-model.js`, `/home/thaia/ECE493Group19/app/models/waitlist-eligibility-model.js`, `/home/thaia/ECE493Group19/public/js/waitlist.js`, `/home/thaia/ECE493Group19/tests/unit/waitlist-eligibility-model.test.js`, `/home/thaia/ECE493Group19/tests/unit/waitlist-controller.test.js`, and `/home/thaia/ECE493Group19/tests/integration/waitlist-flow.test.js` as needed
- [ ] T043 Review and normalize the terms `waitlisted`, `waitlist position`, `waitlist unavailable`, `already enrolled`, `already waitlisted`, `registration hold`, and `term closed` across `/home/thaia/ECE493Group19/app/controllers/waitlist-controller.js`, `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-result.html`, `/home/thaia/ECE493Group19/app/views/waitlist/waitlist-error.html`, `/home/thaia/ECE493Group19/public/js/waitlist.js`, and `/home/thaia/ECE493Group19/tests/acceptance/uc18-acceptance-checklist.md`
- [ ] T044 Add accessibility validation steps for keyboard-only navigation and announced status messaging in `/home/thaia/ECE493Group19/tests/acceptance/uc18-acceptance-checklist.md`
- [ ] T045 Run the full UC-18 validation scenarios from `/home/thaia/ECE493Group19/specs/018-branch-class-waitlist/quickstart.md` and record results in `/home/thaia/ECE493Group19/tests/acceptance/uc18-acceptance-checklist.md`
- [ ] T046 Measure the 1-second response target under up to 20 concurrent waitlist attempts in `/home/thaia/ECE493Group19/tests/integration/waitlist-flow.test.js` and document the outcome in `/home/thaia/ECE493Group19/specs/018-branch-class-waitlist/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phases 3-6)**: Depend on Foundational completion.
- **Polish (Phase 7)**: Depends on completion of the desired user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 and is the MVP.
- **US2 (P2)**: Starts after Phase 2 and reuses the shared controller and section lookup built in Phase 2.
- **US3 (P3)**: Starts after Phase 2 and reuses the shared eligibility and controller flow from Phase 2.
- **US4 (P4)**: Starts after Phase 2 and depends on the shared model transaction flow from Phase 2.

### Recommended Completion Order

1. Finish Phase 1.
2. Finish Phase 2.
3. Deliver US1 as the MVP.
4. Deliver US2, then US3, then US4.
5. Finish Phase 7 validation and polish.

---

## Parallel Opportunities

- `T003` and `T004` can run in parallel after `T001`.
- `T006`, `T007`, `T008`, `T010`, and `T011` can run in parallel after `T005`.
- In US1, `T013`, `T014`, and `T015` can run in parallel.
- In US2, `T021` and `T022` can run in parallel, and `T023` can proceed independently before `T024`.
- In US3, `T027`, `T028`, and `T029` can run in parallel, and `T030` can proceed independently before `T031`.
- In US4, `T034` and `T035` can run in parallel, and `T036` can proceed independently before `T037`.
- In Phase 7, `T040`, `T041`, and `T042` can run in parallel.

---

## Parallel Example: User Story 1

```bash
Task: "T013 [US1] Add unit tests for eligible waitlist decisions and no-position status handling in /home/thaia/ECE493Group19/tests/unit/waitlist-eligibility-model.test.js"
Task: "T014 [US1] Add controller tests for successful waitlist responses and result rendering in /home/thaia/ECE493Group19/tests/unit/waitlist-controller.test.js"
Task: "T015 [US1] Add SQLite-backed integration tests for successful waitlist creation and optional position assignment in /home/thaia/ECE493Group19/tests/integration/waitlist-flow.test.js"

Task: "T016 [US1] Implement waitlist request persistence and successful entry creation in /home/thaia/ECE493Group19/app/models/waitlist-model.js"
Task: "T017 [US1] Implement assigned-position and no-position success behavior in /home/thaia/ECE493Group19/app/models/class-section-model.js and /home/thaia/ECE493Group19/app/models/waitlist-model.js"
```

## Parallel Example: User Story 2

```bash
Task: "T021 [US2] Add unit tests for not-waitlist-eligible section blocking in /home/thaia/ECE493Group19/tests/unit/waitlist-eligibility-model.test.js"
Task: "T022 [US2] Add integration tests for blocked waitlist-unavailable requests and unchanged state in /home/thaia/ECE493Group19/tests/integration/waitlist-flow.test.js"

Task: "T023 [US2] Implement waitlist-enabled and alternative-section lookup behavior in /home/thaia/ECE493Group19/app/models/class-section-model.js"
```

## Parallel Example: User Story 3

```bash
Task: "T027 [US3] Add unit tests for duplicate-status, hold, closed-term, and multi-blocker decisions in /home/thaia/ECE493Group19/tests/unit/waitlist-eligibility-model.test.js"
Task: "T028 [US3] Add controller tests for blocker-specific guidance and authoritative duplicate-request responses in /home/thaia/ECE493Group19/tests/unit/waitlist-controller.test.js"
Task: "T029 [US3] Add integration tests for duplicate and ineligible blocked flows in /home/thaia/ECE493Group19/tests/integration/waitlist-flow.test.js"
```

## Parallel Example: User Story 4

```bash
Task: "T034 [US4] Add unit tests for dependency-data failure and atomic failure decisions in /home/thaia/ECE493Group19/tests/unit/waitlist-controller.test.js"
Task: "T035 [US4] Add integration tests for waitlist-recording failure, position-assignment failure, unchanged state, and audit-record outcomes in /home/thaia/ECE493Group19/tests/integration/waitlist-flow.test.js"

Task: "T036 [US4] Implement atomic transaction rollback and dependency-unavailable failure handling in /home/thaia/ECE493Group19/app/models/waitlist-model.js"
```

---

## Implementation Strategy

### MVP First

- Complete Phases 1 and 2 to establish the shared MVC and SQLite foundation.
- Deliver Phase 3 (US1) as the MVP because it provides the primary student outcome and validates the core waitlist join architecture.

### Incremental Delivery

- Add Phase 4 to block unavailable sections with alternatives.
- Add Phase 5 to cover duplicate and ineligible blockers with precise guidance.
- Add Phase 6 to guarantee rollback and failure-state correctness.

### Validation Finish

- Use Phase 7 to enforce style-guide compliance, run the quickstart scenarios, and confirm the performance target.
