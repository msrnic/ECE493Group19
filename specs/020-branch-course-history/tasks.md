# Tasks: UC-20 View Course History

**Input**: Design documents from `/specs/020-branch-course-history/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/course-history-ui-contract.md`, `quickstart.md`

**Tests**: Include JavaScript unit tests for course-history retrieval and authorization rules, integration tests for SQLite-backed course-history flows, and acceptance validation tasks because testing is explicitly required by `plan.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the MVC file layout, SQLite entry points, validation files, and protected-artifact traceability for the course-history feature.

- [ ] T001 Create the course-history MVC source and test file structure in `/home/thaia/ECE493Group19/app/`, `/home/thaia/ECE493Group19/public/`, `/home/thaia/ECE493Group19/database/`, and `/home/thaia/ECE493Group19/tests/`
- [ ] T002 Add the baseline course-history SQLite schema and UC-20 fixture seed scripts in `/home/thaia/ECE493Group19/database/schema/course-history.sql` and `/home/thaia/ECE493Group19/database/seeds/uc20-fixtures.sql`
- [ ] T003 [P] Create the initial course-history controller, model, view, and client script placeholders in `/home/thaia/ECE493Group19/app/controllers/course-history-controller.js`, `/home/thaia/ECE493Group19/app/models/student-model.js`, `/home/thaia/ECE493Group19/app/models/course-history-model.js`, `/home/thaia/ECE493Group19/app/models/authorization-audit-model.js`, `/home/thaia/ECE493Group19/app/views/course-history/course-history-page.html`, `/home/thaia/ECE493Group19/app/views/course-history/course-history-empty.html`, `/home/thaia/ECE493Group19/app/views/course-history/course-history-error.html`, `/home/thaia/ECE493Group19/app/views/course-history/course-history-unauthorized.html`, `/home/thaia/ECE493Group19/public/js/course-history.js`, and `/home/thaia/ECE493Group19/public/css/course-history.css`
- [ ] T004 [P] Create the course-history unit, integration, and acceptance test files in `/home/thaia/ECE493Group19/tests/unit/course-history-model.test.js`, `/home/thaia/ECE493Group19/tests/unit/course-history-controller.test.js`, `/home/thaia/ECE493Group19/tests/integration/course-history-flow.test.js`, and `/home/thaia/ECE493Group19/tests/acceptance/uc20-acceptance-checklist.md`
- [ ] T005 Map implementation artifacts for this feature to `/home/thaia/ECE493Group19/Use Cases/UC-20.md` and `/home/thaia/ECE493Group19/Acceptance Tests/UC-20-AS.md` in `/home/thaia/ECE493Group19/tests/acceptance/uc20-acceptance-checklist.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared persistence, authorization, view-state handling, and controller plumbing required by all user stories.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [ ] T006 Implement shared SQLite access and base course-history persistence helpers in `/home/thaia/ECE493Group19/app/models/course-history-model.js`
- [ ] T007 [P] Implement student account lookup and authorization-scope helpers in `/home/thaia/ECE493Group19/app/models/student-model.js`
- [ ] T008 [P] Implement authorization failure recording and fallback logging helpers in `/home/thaia/ECE493Group19/app/models/authorization-audit-model.js`
- [ ] T009 [P] Implement shared course-history view-state resolution for complete, partial, empty, unavailable, and denied outcomes in `/home/thaia/ECE493Group19/app/models/course-history-model.js` and `/home/thaia/ECE493Group19/app/models/student-model.js`
- [ ] T010 Implement the shared course-history controller flow and result mapping in `/home/thaia/ECE493Group19/app/controllers/course-history-controller.js`
- [ ] T011 [P] Implement the shared course-history page, empty-state, unavailable-state, and unauthorized-state view structure in `/home/thaia/ECE493Group19/app/views/course-history/course-history-page.html`, `/home/thaia/ECE493Group19/app/views/course-history/course-history-empty.html`, `/home/thaia/ECE493Group19/app/views/course-history/course-history-error.html`, `/home/thaia/ECE493Group19/app/views/course-history/course-history-unauthorized.html`, and `/home/thaia/ECE493Group19/public/css/course-history.css`
- [ ] T012 [P] Implement the shared course-history client behavior for loading, state messaging, and read-only rendering in `/home/thaia/ECE493Group19/public/js/course-history.js`
- [ ] T013 Add shared model and controller test coverage for authorization scope, view-state selection, and read-only behavior in `/home/thaia/ECE493Group19/tests/unit/course-history-model.test.js`, `/home/thaia/ECE493Group19/tests/unit/course-history-controller.test.js`, and `/home/thaia/ECE493Group19/tests/integration/course-history-flow.test.js`

**Checkpoint**: Foundation ready. User story implementation can proceed.

---

## Phase 3: User Story 1 - View Complete Course History (Priority: P1) 🎯 MVP

**Goal**: Let an authorized student open the course-history view and review all available past enrollments with final outcomes in a readable, read-only layout.

**Independent Test**: Sign in as an authorized student with complete course-history records and verify the student can open the course-history page from the dashboard, see all available records grouped by academic period, and view only their own data.

### Tests for User Story 1

- [ ] T014 [P] [US1] Add unit tests for full course-history retrieval and required record-field mapping in `/home/thaia/ECE493Group19/tests/unit/course-history-model.test.js`
- [ ] T015 [P] [US1] Add controller tests for authorized course-history page responses and self-only access enforcement in `/home/thaia/ECE493Group19/tests/unit/course-history-controller.test.js`
- [ ] T016 [P] [US1] Add SQLite-backed integration tests for authorized complete-history viewing from the dashboard entry point in `/home/thaia/ECE493Group19/tests/integration/course-history-flow.test.js`

### Implementation for User Story 1

- [ ] T017 [P] [US1] Implement complete course-history record retrieval with required display fields in `/home/thaia/ECE493Group19/app/models/course-history-model.js`
- [ ] T018 [US1] Implement authorized complete-history orchestration in `/home/thaia/ECE493Group19/app/controllers/course-history-controller.js`
- [ ] T019 [US1] Implement complete-history page rendering grouped by academic period in `/home/thaia/ECE493Group19/app/views/course-history/course-history-page.html`, `/home/thaia/ECE493Group19/public/js/course-history.js`, and `/home/thaia/ECE493Group19/public/css/course-history.css`
- [ ] T020 [US1] Add acceptance steps for authorized complete course-history viewing in `/home/thaia/ECE493Group19/tests/acceptance/uc20-acceptance-checklist.md`

**Checkpoint**: User Story 1 is fully functional and testable as the MVP increment.

---

## Phase 4: User Story 2 - View Available History When Records Are Incomplete (Priority: P2)

**Goal**: Show available course-history records when some records are missing, distinguish empty history from unavailable history, and preserve read-only behavior.

**Independent Test**: Sign in as an authorized student once with partial course-history data, once with no course-history records, and once when the academic record source is unavailable; verify the feature shows the correct partial, empty, and unavailable states without exposing misleading data.

### Tests for User Story 2

- [ ] T021 [P] [US2] Add unit tests for partial-history, empty-history, and unavailable-history state selection in `/home/thaia/ECE493Group19/tests/unit/course-history-model.test.js`
- [ ] T022 [P] [US2] Add controller tests for partial-data indicators, empty-history messaging, and unavailable-state retry handling in `/home/thaia/ECE493Group19/tests/unit/course-history-controller.test.js`
- [ ] T023 [P] [US2] Add integration tests for partial, empty, and unavailable course-history viewing flows in `/home/thaia/ECE493Group19/tests/integration/course-history-flow.test.js`

### Implementation for User Story 2

- [ ] T024 [P] [US2] Implement partial-record, empty-history, and unavailable-source handling in `/home/thaia/ECE493Group19/app/models/course-history-model.js`
- [ ] T025 [US2] Implement partial, empty, and unavailable state orchestration with retry-safe read-only behavior in `/home/thaia/ECE493Group19/app/controllers/course-history-controller.js`
- [ ] T026 [US2] Implement partial-history indicators and empty-history page messaging in `/home/thaia/ECE493Group19/app/views/course-history/course-history-page.html`, `/home/thaia/ECE493Group19/app/views/course-history/course-history-empty.html`, and `/home/thaia/ECE493Group19/public/js/course-history.js`
- [ ] T027 [US2] Implement unavailable-state messaging and retry guidance in `/home/thaia/ECE493Group19/app/views/course-history/course-history-error.html`, `/home/thaia/ECE493Group19/public/js/course-history.js`, and `/home/thaia/ECE493Group19/public/css/course-history.css`
- [ ] T028 [US2] Add acceptance steps for partial, empty, and unavailable course-history scenarios in `/home/thaia/ECE493Group19/tests/acceptance/uc20-acceptance-checklist.md`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Block Unauthorized Access to Course History (Priority: P3)

**Goal**: Deny unauthorized course-history access for direct-link, manipulated-path, and signed-in-but-restricted requests while recording authorization failures and preserving privacy.

**Independent Test**: Attempt to access course history through an authenticated but unauthorized session, through a direct route to another student's history, and while failure logging is degraded; verify no course-history data is shown and denial handling remains correct.

### Tests for User Story 3

- [ ] T029 [P] [US3] Add unit tests for unauthorized access classification and audit-record payload generation in `/home/thaia/ECE493Group19/tests/unit/course-history-model.test.js` and `/home/thaia/ECE493Group19/tests/unit/course-history-controller.test.js`
- [ ] T030 [P] [US3] Add integration tests for denied direct-route access, restricted self-service access, and degraded denial logging fallback in `/home/thaia/ECE493Group19/tests/integration/course-history-flow.test.js`

### Implementation for User Story 3

- [ ] T031 [P] [US3] Implement unauthorized-access classification for direct-link, manipulated-path, and restricted account states in `/home/thaia/ECE493Group19/app/models/student-model.js` and `/home/thaia/ECE493Group19/app/models/course-history-model.js`
- [ ] T032 [P] [US3] Implement authorization-failure record creation and degraded logging fallback in `/home/thaia/ECE493Group19/app/models/authorization-audit-model.js`
- [ ] T033 [US3] Implement denied-access controller handling that preserves privacy and blocks data exposure in `/home/thaia/ECE493Group19/app/controllers/course-history-controller.js`
- [ ] T034 [US3] Implement unauthorized-state UI messaging in `/home/thaia/ECE493Group19/app/views/course-history/course-history-unauthorized.html` and `/home/thaia/ECE493Group19/public/js/course-history.js`
- [ ] T035 [US3] Add acceptance steps for unauthorized course-history denial and logging behavior in `/home/thaia/ECE493Group19/tests/acceptance/uc20-acceptance-checklist.md`

**Checkpoint**: All user stories are independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate accessibility, privacy, performance, style compliance, and end-to-end readiness across the full feature.

- [ ] T036 [P] Implement keyboard-only navigation and assistive-technology messaging refinements across course-history states in `/home/thaia/ECE493Group19/app/views/course-history/course-history-page.html`, `/home/thaia/ECE493Group19/app/views/course-history/course-history-empty.html`, `/home/thaia/ECE493Group19/app/views/course-history/course-history-error.html`, `/home/thaia/ECE493Group19/app/views/course-history/course-history-unauthorized.html`, and `/home/thaia/ECE493Group19/public/js/course-history.js`
- [ ] T037 [P] Review modified HTML and CSS against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-html-css.md` and update `/home/thaia/ECE493Group19/app/views/course-history/course-history-page.html`, `/home/thaia/ECE493Group19/app/views/course-history/course-history-empty.html`, `/home/thaia/ECE493Group19/app/views/course-history/course-history-error.html`, `/home/thaia/ECE493Group19/app/views/course-history/course-history-unauthorized.html`, and `/home/thaia/ECE493Group19/public/css/course-history.css` as needed
- [ ] T038 [P] Review modified JavaScript against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-javascript.md` and update `/home/thaia/ECE493Group19/app/controllers/course-history-controller.js`, `/home/thaia/ECE493Group19/app/models/student-model.js`, `/home/thaia/ECE493Group19/app/models/course-history-model.js`, `/home/thaia/ECE493Group19/app/models/authorization-audit-model.js`, `/home/thaia/ECE493Group19/public/js/course-history.js`, `/home/thaia/ECE493Group19/tests/unit/course-history-model.test.js`, `/home/thaia/ECE493Group19/tests/unit/course-history-controller.test.js`, and `/home/thaia/ECE493Group19/tests/integration/course-history-flow.test.js` as needed
- [ ] T039 Add integration coverage for read-only repeat viewing and privacy preservation across all course-history states in `/home/thaia/ECE493Group19/tests/integration/course-history-flow.test.js`
- [ ] T040 Run the full UC-20 validation scenarios from `/home/thaia/ECE493Group19/specs/020-branch-course-history/quickstart.md` and record results in `/home/thaia/ECE493Group19/tests/acceptance/uc20-acceptance-checklist.md`
- [ ] T041 Measure the 30-second dashboard-to-history target and 2-second initial usable result target in `/home/thaia/ECE493Group19/tests/integration/course-history-flow.test.js` and document the outcome in `/home/thaia/ECE493Group19/specs/020-branch-course-history/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phases 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on completion of the desired user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 and is the MVP.
- **US2 (P2)**: Starts after Phase 2 and reuses the shared course-history retrieval and view-state foundation.
- **US3 (P3)**: Starts after Phase 2 and reuses the shared authorization and audit foundation.

### Recommended Completion Order

1. Finish Phase 1.
2. Finish Phase 2.
3. Deliver US1 as the MVP.
4. Deliver US2.
5. Deliver US3.
6. Finish Phase 6 validation and polish.

---

## Parallel Opportunities

- `T003` and `T004` can run in parallel after `T001`.
- `T007`, `T008`, `T009`, `T011`, and `T012` can run in parallel after `T006`.
- In US1, `T014`, `T015`, and `T016` can run in parallel.
- In US2, `T021`, `T022`, and `T023` can run in parallel, and `T024` can proceed independently before `T025`.
- In US3, `T029` and `T030` can run in parallel, and `T031` and `T032` can run in parallel before `T033`.
- In Phase 6, `T036`, `T037`, and `T038` can run in parallel.

---

## Parallel Example: User Story 1

```bash
Task: "T014 [US1] Add unit tests for full course-history retrieval and required record-field mapping in /home/thaia/ECE493Group19/tests/unit/course-history-model.test.js"
Task: "T015 [US1] Add controller tests for authorized course-history page responses and self-only access enforcement in /home/thaia/ECE493Group19/tests/unit/course-history-controller.test.js"
Task: "T016 [US1] Add SQLite-backed integration tests for authorized complete-history viewing from the dashboard entry point in /home/thaia/ECE493Group19/tests/integration/course-history-flow.test.js"
```

## Parallel Example: User Story 2

```bash
Task: "T021 [US2] Add unit tests for partial-history, empty-history, and unavailable-history state selection in /home/thaia/ECE493Group19/tests/unit/course-history-model.test.js"
Task: "T022 [US2] Add controller tests for partial-data indicators, empty-history messaging, and unavailable-state retry handling in /home/thaia/ECE493Group19/tests/unit/course-history-controller.test.js"
Task: "T023 [US2] Add integration tests for partial, empty, and unavailable course-history viewing flows in /home/thaia/ECE493Group19/tests/integration/course-history-flow.test.js"
```

## Parallel Example: User Story 3

```bash
Task: "T029 [US3] Add unit tests for unauthorized access classification and audit-record payload generation in /home/thaia/ECE493Group19/tests/unit/course-history-model.test.js and /home/thaia/ECE493Group19/tests/unit/course-history-controller.test.js"
Task: "T030 [US3] Add integration tests for denied direct-route access, restricted self-service access, and degraded denial logging fallback in /home/thaia/ECE493Group19/tests/integration/course-history-flow.test.js"
Task: "T031 [US3] Implement unauthorized-access classification for direct-link, manipulated-path, and restricted account states in /home/thaia/ECE493Group19/app/models/student-model.js and /home/thaia/ECE493Group19/app/models/course-history-model.js"
```

## Implementation Strategy

### MVP First

- Complete Phases 1 and 2 to establish the shared MVC and SQLite foundation.
- Deliver Phase 3 (US1) as the MVP because it provides the primary student outcome and validates the core course-history architecture.

### Incremental Delivery

- Add Phase 4 to cover partial, empty, and unavailable course-history states.
- Add Phase 5 to cover unauthorized access denial and audit logging.

### Validation Finish

- Use Phase 6 to enforce style-guide compliance, accessibility, privacy, and performance validation.
