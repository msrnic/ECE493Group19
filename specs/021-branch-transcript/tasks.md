# Tasks: UC-21 View My Transcript

**Input**: Design documents from `/specs/021-branch-transcript/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/transcript-ui-contract.md`, `quickstart.md`

**Tests**: Include JavaScript unit tests for transcript retrieval and authorization rules, integration tests for SQLite-backed transcript flows, and acceptance validation tasks because testing is explicitly required by `plan.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this belongs to (`US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the backend, frontend, database, and test structure for the transcript feature.

- [ ] T001 Create the transcript MVC source and test file structure in `/home/thaia/ECE493Group19/backend/`, `/home/thaia/ECE493Group19/frontend/`, and `/home/thaia/ECE493Group19/tests/`
- [ ] T002 Add the baseline transcript SQLite schema and UC-21 fixture seed scripts in `/home/thaia/ECE493Group19/backend/db/schema/transcript.sql` and `/home/thaia/ECE493Group19/backend/db/seeds/uc21-fixtures.sql`
- [ ] T003 [P] Create the initial transcript controller, model, view, and client script placeholders in `/home/thaia/ECE493Group19/backend/controllers/transcript-controller.js`, `/home/thaia/ECE493Group19/backend/models/student-model.js`, `/home/thaia/ECE493Group19/backend/models/transcript-model.js`, `/home/thaia/ECE493Group19/backend/models/authorization-audit-model.js`, `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-page.html`, `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-empty.html`, `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-unavailable.html`, `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-unauthorized.html`, `/home/thaia/ECE493Group19/frontend/js/transcript.js`, and `/home/thaia/ECE493Group19/frontend/css/transcript.css`
- [ ] T004 [P] Create the transcript unit, integration, and acceptance test files in `/home/thaia/ECE493Group19/tests/unit/transcript-model.test.js`, `/home/thaia/ECE493Group19/tests/unit/transcript-controller.test.js`, `/home/thaia/ECE493Group19/tests/integration/transcript-flow.test.js`, and `/home/thaia/ECE493Group19/tests/acceptance/uc21-acceptance-checklist.md`
- [ ] T005 Map implementation artifacts for this feature to `/home/thaia/ECE493Group19/Use Cases/UC-21.md` and `/home/thaia/ECE493Group19/Acceptance Tests/UC-21-AS.md` in `/home/thaia/ECE493Group19/tests/acceptance/uc21-acceptance-checklist.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared persistence, authorization, transcript state handling, and controller plumbing required by all user stories.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [ ] T006 Implement shared SQLite access and base transcript persistence helpers in `/home/thaia/ECE493Group19/backend/models/transcript-model.js`
- [ ] T007 [P] Implement student account lookup and transcript authorization helpers in `/home/thaia/ECE493Group19/backend/models/student-model.js`
- [ ] T008 [P] Implement authorization failure recording helpers in `/home/thaia/ECE493Group19/backend/models/authorization-audit-model.js`
- [ ] T009 [P] Implement shared transcript view-state resolution for full, partial, empty, unavailable, and denied outcomes in `/home/thaia/ECE493Group19/backend/models/transcript-model.js` and `/home/thaia/ECE493Group19/backend/models/student-model.js`
- [ ] T010 Implement the shared transcript controller flow and view-state mapping in `/home/thaia/ECE493Group19/backend/controllers/transcript-controller.js`
- [ ] T011 [P] Implement the shared transcript page, empty-state, unavailable-state, and unauthorized-state view structure in `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-page.html`, `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-empty.html`, `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-unavailable.html`, `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-unauthorized.html`, and `/home/thaia/ECE493Group19/frontend/css/transcript.css`
- [ ] T012 [P] Implement the shared transcript client behavior for state messaging and read-only rendering in `/home/thaia/ECE493Group19/frontend/js/transcript.js`
- [ ] T013 Add shared model and controller test coverage for authorization scope, view-state selection, and read-only transcript behavior in `/home/thaia/ECE493Group19/tests/unit/transcript-model.test.js`, `/home/thaia/ECE493Group19/tests/unit/transcript-controller.test.js`, and `/home/thaia/ECE493Group19/tests/integration/transcript-flow.test.js`

**Checkpoint**: Foundation ready. User story implementation can proceed.

---

## Phase 3: User Story 1 - View Full Transcript (Priority: P1) 🎯 MVP

**Goal**: Let an authorized student open the transcript view and review all available academic results in a grouped, read-only layout.

**Independent Test**: Sign in as an authorized student with a complete transcript and verify the student can open the transcript page from the dashboard, see grouped transcript entries, and view only their own transcript.

### Tests for User Story 1

- [ ] T014 [P] [US1] Add unit tests for full transcript retrieval and required transcript-entry field mapping in `/home/thaia/ECE493Group19/tests/unit/transcript-model.test.js`
- [ ] T015 [P] [US1] Add controller tests for authorized transcript responses and self-only access enforcement in `/home/thaia/ECE493Group19/tests/unit/transcript-controller.test.js`
- [ ] T016 [P] [US1] Add SQLite-backed integration tests for authorized full-transcript viewing from the dashboard entry point in `/home/thaia/ECE493Group19/tests/integration/transcript-flow.test.js`

### Implementation for User Story 1

- [ ] T017 [P] [US1] Implement full transcript-entry retrieval with academic term, course identifier, course title, credits, and final result fields in `/home/thaia/ECE493Group19/backend/models/transcript-model.js`
- [ ] T018 [US1] Implement authorized full-transcript orchestration in `/home/thaia/ECE493Group19/backend/controllers/transcript-controller.js`
- [ ] T019 [US1] Implement full-transcript page rendering grouped by academic term in `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-page.html`, `/home/thaia/ECE493Group19/frontend/js/transcript.js`, and `/home/thaia/ECE493Group19/frontend/css/transcript.css`
- [ ] T020 [US1] Add acceptance steps for authorized full-transcript viewing in `/home/thaia/ECE493Group19/tests/acceptance/uc21-acceptance-checklist.md`

**Checkpoint**: User Story 1 is fully functional and testable as the MVP increment.

---

## Phase 4: User Story 2 - View Available Transcript When Data Is Incomplete (Priority: P2)

**Goal**: Show available transcript entries when some data is missing, distinguish empty and unavailable states, and preserve retry-safe read-only behavior.

**Independent Test**: Sign in as an authorized student once with partial transcript data, once with no transcript entries, and once when transcript retrieval is unavailable; verify the feature shows the correct partial, empty, and unavailable states without misleading the student.

### Tests for User Story 2

- [ ] T021 [P] [US2] Add unit tests for partial-transcript, empty-transcript, and unavailable-transcript state selection in `/home/thaia/ECE493Group19/tests/unit/transcript-model.test.js`
- [ ] T022 [P] [US2] Add controller tests for missing-data indicators, empty-transcript messaging, and unavailable-state retry handling in `/home/thaia/ECE493Group19/tests/unit/transcript-controller.test.js`
- [ ] T023 [P] [US2] Add integration tests for partial, empty, and unavailable transcript viewing flows in `/home/thaia/ECE493Group19/tests/integration/transcript-flow.test.js`

### Implementation for User Story 2

- [ ] T024 [P] [US2] Implement partial-entry, empty-transcript, and unavailable-source handling in `/home/thaia/ECE493Group19/backend/models/transcript-model.js`
- [ ] T025 [US2] Implement partial, empty, and unavailable transcript state orchestration with retry-safe behavior in `/home/thaia/ECE493Group19/backend/controllers/transcript-controller.js`
- [ ] T026 [US2] Implement partial-transcript indicators and empty-transcript messaging in `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-page.html`, `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-empty.html`, and `/home/thaia/ECE493Group19/frontend/js/transcript.js`
- [ ] T027 [US2] Implement unavailable-state messaging and retry guidance in `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-unavailable.html`, `/home/thaia/ECE493Group19/frontend/js/transcript.js`, and `/home/thaia/ECE493Group19/frontend/css/transcript.css`
- [ ] T028 [US2] Add acceptance steps for partial, empty, and unavailable transcript scenarios in `/home/thaia/ECE493Group19/tests/acceptance/uc21-acceptance-checklist.md`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Block Unauthorized Transcript Access (Priority: P3)

**Goal**: Deny unauthorized transcript access for direct-link, manipulated-path, and self-service-permission failures while recording audit details and preserving privacy.

**Independent Test**: Attempt to access transcript data through an authenticated but unauthorized session, through a direct-link route to another student's transcript, and through a signed-in account without transcript self-service permission; verify no transcript data is shown and denial handling remains correct.

### Tests for User Story 3

- [ ] T029 [P] [US3] Add unit tests for unauthorized transcript access classification and audit-record payload generation in `/home/thaia/ECE493Group19/tests/unit/transcript-model.test.js` and `/home/thaia/ECE493Group19/tests/unit/transcript-controller.test.js`
- [ ] T030 [P] [US3] Add integration tests for denied direct-link access, manipulated-path denial, and missing self-service permission handling in `/home/thaia/ECE493Group19/tests/integration/transcript-flow.test.js`

### Implementation for User Story 3

- [ ] T031 [P] [US3] Implement unauthorized transcript access classification for direct-link, manipulated-path, and no-self-service-permission requests in `/home/thaia/ECE493Group19/backend/models/student-model.js` and `/home/thaia/ECE493Group19/backend/models/transcript-model.js`
- [ ] T032 [P] [US3] Implement authorization-failure record creation with required audit fields in `/home/thaia/ECE493Group19/backend/models/authorization-audit-model.js`
- [ ] T033 [US3] Implement denied-transcript controller handling that preserves privacy and blocks data exposure in `/home/thaia/ECE493Group19/backend/controllers/transcript-controller.js`
- [ ] T034 [US3] Implement unauthorized-state transcript messaging in `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-unauthorized.html` and `/home/thaia/ECE493Group19/frontend/js/transcript.js`
- [ ] T035 [US3] Add acceptance steps for unauthorized transcript denial and logging behavior in `/home/thaia/ECE493Group19/tests/acceptance/uc21-acceptance-checklist.md`

**Checkpoint**: All user stories are independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate accessibility, privacy, performance, style compliance, and end-to-end readiness across the feature.

- [ ] T036 [P] Implement keyboard-only navigation and assistive-technology messaging refinements across transcript states in `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-page.html`, `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-empty.html`, `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-unavailable.html`, `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-unauthorized.html`, and `/home/thaia/ECE493Group19/frontend/js/transcript.js`
- [ ] T037 [P] Review modified HTML and CSS against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-html-css.md` and update `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-page.html`, `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-empty.html`, `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-unavailable.html`, `/home/thaia/ECE493Group19/frontend/views/transcript/transcript-unauthorized.html`, and `/home/thaia/ECE493Group19/frontend/css/transcript.css` as needed
- [ ] T038 [P] Review modified JavaScript against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-javascript.md` and update `/home/thaia/ECE493Group19/backend/controllers/transcript-controller.js`, `/home/thaia/ECE493Group19/backend/models/student-model.js`, `/home/thaia/ECE493Group19/backend/models/transcript-model.js`, `/home/thaia/ECE493Group19/backend/models/authorization-audit-model.js`, `/home/thaia/ECE493Group19/frontend/js/transcript.js`, `/home/thaia/ECE493Group19/tests/unit/transcript-model.test.js`, `/home/thaia/ECE493Group19/tests/unit/transcript-controller.test.js`, and `/home/thaia/ECE493Group19/tests/integration/transcript-flow.test.js` as needed
- [ ] T039 Add integration coverage for repeat read-only viewing and transcript privacy preservation across all transcript states in `/home/thaia/ECE493Group19/tests/integration/transcript-flow.test.js`
- [ ] T040 Run the full UC-21 validation scenarios from `/home/thaia/ECE493Group19/specs/021-branch-transcript/quickstart.md` and record results in `/home/thaia/ECE493Group19/tests/acceptance/uc21-acceptance-checklist.md`
- [ ] T041 Measure the 30-second dashboard-to-transcript target and the 2-second first-state-appropriate-content target in `/home/thaia/ECE493Group19/tests/integration/transcript-flow.test.js` and document the outcome in `/home/thaia/ECE493Group19/specs/021-branch-transcript/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phases 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on completion of the desired user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 and is the MVP.
- **US2 (P2)**: Starts after Phase 2 and reuses the shared transcript retrieval and view-state foundation.
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
Task: "T014 [US1] Add unit tests for full transcript retrieval and required transcript-entry field mapping in /home/thaia/ECE493Group19/tests/unit/transcript-model.test.js"
Task: "T015 [US1] Add controller tests for authorized transcript responses and self-only access enforcement in /home/thaia/ECE493Group19/tests/unit/transcript-controller.test.js"
Task: "T016 [US1] Add SQLite-backed integration tests for authorized full-transcript viewing from the dashboard entry point in /home/thaia/ECE493Group19/tests/integration/transcript-flow.test.js"
```

## Parallel Example: User Story 2

```bash
Task: "T021 [US2] Add unit tests for partial-transcript, empty-transcript, and unavailable-transcript state selection in /home/thaia/ECE493Group19/tests/unit/transcript-model.test.js"
Task: "T022 [US2] Add controller tests for missing-data indicators, empty-transcript messaging, and unavailable-state retry handling in /home/thaia/ECE493Group19/tests/unit/transcript-controller.test.js"
Task: "T023 [US2] Add integration tests for partial, empty, and unavailable transcript viewing flows in /home/thaia/ECE493Group19/tests/integration/transcript-flow.test.js"
```

## Parallel Example: User Story 3

```bash
Task: "T029 [US3] Add unit tests for unauthorized transcript access classification and audit-record payload generation in /home/thaia/ECE493Group19/tests/unit/transcript-model.test.js and /home/thaia/ECE493Group19/tests/unit/transcript-controller.test.js"
Task: "T030 [US3] Add integration tests for denied direct-link access, manipulated-path denial, and missing self-service permission handling in /home/thaia/ECE493Group19/tests/integration/transcript-flow.test.js"
Task: "T031 [US3] Implement unauthorized transcript access classification for direct-link, manipulated-path, and no-self-service-permission requests in /home/thaia/ECE493Group19/backend/models/student-model.js and /home/thaia/ECE493Group19/backend/models/transcript-model.js"
```

## Implementation Strategy

### MVP First

- Complete Phases 1 and 2 to establish the shared transcript MVC and SQLite foundation.
- Deliver Phase 3 (US1) as the MVP because it provides the primary student outcome and validates the core transcript architecture.

### Incremental Delivery

- Add Phase 4 to cover partial, empty, and unavailable transcript states.
- Add Phase 5 to cover unauthorized transcript denial and audit logging.

### Validation Finish

- Use Phase 6 to enforce style-guide compliance, accessibility, privacy, and performance validation.
