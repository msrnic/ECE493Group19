# Tasks: UC-19 Receive Notifications in a Built-in Inbox

**Input**: Design documents from `/specs/019-branch-built-in-inbox/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/inbox-ui-contract.md`, `quickstart.md`

**Tests**: Include JavaScript unit tests for notification delivery logic, integration tests for SQLite-backed inbox notification flows, and acceptance validation tasks because testing is explicitly required by `plan.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the MVC file layout, database entry points, and test harness for the built-in inbox notification feature.

- [ ] T001 Create the inbox notification MVC source and test file structure in `/home/thaia/ECE493Group19/app/`, `/home/thaia/ECE493Group19/public/`, `/home/thaia/ECE493Group19/database/`, and `/home/thaia/ECE493Group19/tests/`
- [ ] T002 Add the baseline inbox notification SQLite schema and UC-19 fixture seed scripts in `/home/thaia/ECE493Group19/database/schema/inbox-notifications.sql` and `/home/thaia/ECE493Group19/database/seeds/uc19-fixtures.sql`
- [ ] T003 [P] Create the initial inbox controller, model, view, and client script placeholders in `/home/thaia/ECE493Group19/app/controllers/inbox-notification-controller.js`, `/home/thaia/ECE493Group19/app/models/student-model.js`, `/home/thaia/ECE493Group19/app/models/academic-event-model.js`, `/home/thaia/ECE493Group19/app/models/inbox-notification-model.js`, `/home/thaia/ECE493Group19/app/models/delivery-attempt-model.js`, `/home/thaia/ECE493Group19/app/models/inbox-access-model.js`, `/home/thaia/ECE493Group19/app/views/inbox/inbox-list.html`, `/home/thaia/ECE493Group19/app/views/inbox/inbox-notification.html`, `/home/thaia/ECE493Group19/app/views/inbox/inbox-status.html`, `/home/thaia/ECE493Group19/public/js/inbox.js`, and `/home/thaia/ECE493Group19/public/css/inbox.css`
- [ ] T004 [P] Create the inbox notification unit, integration, and acceptance test files in `/home/thaia/ECE493Group19/tests/unit/inbox-notification-model.test.js`, `/home/thaia/ECE493Group19/tests/unit/inbox-notification-controller.test.js`, `/home/thaia/ECE493Group19/tests/integration/inbox-notification-flow.test.js`, and `/home/thaia/ECE493Group19/tests/acceptance/uc19-acceptance-checklist.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared persistence, identity, access, and controller plumbing required by all user stories.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [ ] T005 Implement shared SQLite access and notification persistence helpers in `/home/thaia/ECE493Group19/app/models/inbox-notification-model.js`
- [ ] T006 [P] Implement student, academic-event, delivery-attempt, and inbox-access lookup models in `/home/thaia/ECE493Group19/app/models/student-model.js`, `/home/thaia/ECE493Group19/app/models/academic-event-model.js`, `/home/thaia/ECE493Group19/app/models/delivery-attempt-model.js`, and `/home/thaia/ECE493Group19/app/models/inbox-access-model.js`
- [ ] T007 [P] Implement notification identity and deduplication-key handling in `/home/thaia/ECE493Group19/app/models/inbox-notification-model.js` and `/home/thaia/ECE493Group19/app/models/academic-event-model.js`
- [ ] T008 Implement the shared inbox notification controller flow and result mapping in `/home/thaia/ECE493Group19/app/controllers/inbox-notification-controller.js`
- [ ] T009 [P] Implement shared inbox list, notification detail, and status view structure in `/home/thaia/ECE493Group19/app/views/inbox/inbox-list.html`, `/home/thaia/ECE493Group19/app/views/inbox/inbox-notification.html`, `/home/thaia/ECE493Group19/app/views/inbox/inbox-status.html`, and `/home/thaia/ECE493Group19/public/css/inbox.css`
- [ ] T010 [P] Implement the shared inbox client behavior for list loading, detail viewing, and status updates in `/home/thaia/ECE493Group19/public/js/inbox.js`
- [ ] T011 Add shared controller and model test coverage for foundational identity, access, and deduplication rules in `/home/thaia/ECE493Group19/tests/unit/inbox-notification-model.test.js`, `/home/thaia/ECE493Group19/tests/unit/inbox-notification-controller.test.js`, and `/home/thaia/ECE493Group19/tests/integration/inbox-notification-flow.test.js`

**Checkpoint**: Foundation ready. User story implementation can proceed.

---

## Phase 3: User Story 1 - View Inbox Notifications (Priority: P1) 🎯 MVP

**Goal**: Deliver relevant academic notifications into the built-in inbox and let the addressed student view them through normal signed-in inbox use.

**Independent Test**: Trigger course update, grade update, and academic standing events for a student with inbox access enabled and verify each notification appears in the inbox and can be opened by that student.

### Tests for User Story 1

- [ ] T012 [P] [US1] Add unit tests for notification generation and student-only inbox visibility in `/home/thaia/ECE493Group19/tests/unit/inbox-notification-model.test.js`
- [ ] T013 [P] [US1] Add controller tests for delivered notification list and detail responses in `/home/thaia/ECE493Group19/tests/unit/inbox-notification-controller.test.js`
- [ ] T014 [P] [US1] Add SQLite-backed integration tests for delivered notification creation and signed-in inbox viewing in `/home/thaia/ECE493Group19/tests/integration/inbox-notification-flow.test.js`

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implement event-to-notification creation and delivered notification persistence in `/home/thaia/ECE493Group19/app/models/academic-event-model.js` and `/home/thaia/ECE493Group19/app/models/inbox-notification-model.js`
- [ ] T016 [US1] Implement delivered inbox notification orchestration and student-only view authorization in `/home/thaia/ECE493Group19/app/controllers/inbox-notification-controller.js`
- [ ] T017 [US1] Implement inbox list and notification detail UI for delivered notifications in `/home/thaia/ECE493Group19/app/views/inbox/inbox-list.html`, `/home/thaia/ECE493Group19/app/views/inbox/inbox-notification.html`, and `/home/thaia/ECE493Group19/public/js/inbox.js`
- [ ] T018 [US1] Add acceptance steps for successful delivered notification viewing in `/home/thaia/ECE493Group19/tests/acceptance/uc19-acceptance-checklist.md`
- [ ] T018a [US1] Add acceptance steps verifying the feature remains inbox-only and excludes email/SMS or other external channel behavior in `/home/thaia/ECE493Group19/tests/acceptance/uc19-acceptance-checklist.md`
- [ ] T018b [US1] Add acceptance steps for exact duplicate upstream-event handling so only one inbox notification is kept per student-event pair in `/home/thaia/ECE493Group19/tests/acceptance/uc19-acceptance-checklist.md`

**Checkpoint**: User Story 1 is fully functional and testable as the MVP increment.

---

## Phase 4: User Story 2 - Retry Failed Delivery (Priority: P2)

**Goal**: Retry failed inbox deliveries for up to 24 hours, record failed attempts, and expose recovered delivery results cleanly.

**Independent Test**: Simulate a delivery failure for a student with inbox access enabled, verify failed attempts are recorded and retried within the allowed window, and then verify the notification appears after recovery.

### Tests for User Story 2

- [ ] T019 [P] [US2] Add unit tests for failed delivery recording and retry-window eligibility in `/home/thaia/ECE493Group19/tests/unit/inbox-notification-model.test.js`
- [ ] T020 [P] [US2] Add controller tests for retry-status handling and recovered delivery results in `/home/thaia/ECE493Group19/tests/unit/inbox-notification-controller.test.js`
- [ ] T021 [P] [US2] Add integration tests for failed delivery, retry attempts, and recovered inbox availability in `/home/thaia/ECE493Group19/tests/integration/inbox-notification-flow.test.js`

### Implementation for User Story 2

- [ ] T022 [P] [US2] Implement failed delivery attempt recording and retry-window tracking in `/home/thaia/ECE493Group19/app/models/delivery-attempt-model.js` and `/home/thaia/ECE493Group19/app/models/inbox-notification-model.js`
- [ ] T023 [US2] Implement retry orchestration and recovered delivery response handling in `/home/thaia/ECE493Group19/app/controllers/inbox-notification-controller.js`
- [ ] T024 [US2] Implement retry and failure status UI behavior without partial notification state in `/home/thaia/ECE493Group19/app/views/inbox/inbox-status.html` and `/home/thaia/ECE493Group19/public/js/inbox.js`
- [ ] T025 [US2] Add acceptance steps for failed delivery retry and recovered delivery flows in `/home/thaia/ECE493Group19/tests/acceptance/uc19-acceptance-checklist.md`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Preserve Notifications During Restricted Access (Priority: P3)

**Goal**: Store notifications for later viewing while inbox access is restricted, show the correct restricted-access status, and surface stored notifications after access returns.

**Independent Test**: Trigger a relevant event for a student with restricted inbox access, verify the notification is stored with the required status, and then verify it becomes viewable after access is re-enabled.

### Tests for User Story 3

- [ ] T026 [P] [US3] Add unit tests for restricted-access storage and later-view availability in `/home/thaia/ECE493Group19/tests/unit/inbox-notification-model.test.js`
- [ ] T027 [P] [US3] Add controller tests for restricted-access status messaging and re-enabled access behavior in `/home/thaia/ECE493Group19/tests/unit/inbox-notification-controller.test.js`
- [ ] T028 [P] [US3] Add integration tests for stored-for-later notifications and re-enabled inbox viewing in `/home/thaia/ECE493Group19/tests/integration/inbox-notification-flow.test.js`

### Implementation for User Story 3

- [ ] T029 [P] [US3] Implement restricted-access detection and stored-notification state transitions in `/home/thaia/ECE493Group19/app/models/inbox-access-model.js` and `/home/thaia/ECE493Group19/app/models/inbox-notification-model.js`
- [ ] T030 [US3] Implement restricted-access storage orchestration and later-view release handling in `/home/thaia/ECE493Group19/app/controllers/inbox-notification-controller.js`
- [ ] T031 [US3] Implement restricted-access status and stored-notification UI flows in `/home/thaia/ECE493Group19/app/views/inbox/inbox-status.html`, `/home/thaia/ECE493Group19/app/views/inbox/inbox-list.html`, and `/home/thaia/ECE493Group19/public/js/inbox.js`
- [ ] T032 [US3] Add acceptance steps for restricted-access storage and later viewing in `/home/thaia/ECE493Group19/tests/acceptance/uc19-acceptance-checklist.md`

**Checkpoint**: All user stories are independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate style, accessibility, auditability, performance, and end-to-end readiness across the full feature.

- [ ] T033 [P] Implement keyboard-only navigation and assistive-technology messaging refinements in `/home/thaia/ECE493Group19/app/views/inbox/inbox-list.html`, `/home/thaia/ECE493Group19/app/views/inbox/inbox-notification.html`, `/home/thaia/ECE493Group19/app/views/inbox/inbox-status.html`, and `/home/thaia/ECE493Group19/public/js/inbox.js`
- [ ] T034 [P] Review modified HTML and CSS against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-html-css.md` and update `/home/thaia/ECE493Group19/app/views/inbox/inbox-list.html`, `/home/thaia/ECE493Group19/app/views/inbox/inbox-notification.html`, `/home/thaia/ECE493Group19/app/views/inbox/inbox-status.html`, and `/home/thaia/ECE493Group19/public/css/inbox.css` as needed
- [ ] T035 [P] Review modified JavaScript against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-javascript.md` and update `/home/thaia/ECE493Group19/app/controllers/inbox-notification-controller.js`, `/home/thaia/ECE493Group19/app/models/student-model.js`, `/home/thaia/ECE493Group19/app/models/academic-event-model.js`, `/home/thaia/ECE493Group19/app/models/inbox-notification-model.js`, `/home/thaia/ECE493Group19/app/models/delivery-attempt-model.js`, `/home/thaia/ECE493Group19/app/models/inbox-access-model.js`, `/home/thaia/ECE493Group19/public/js/inbox.js`, `/home/thaia/ECE493Group19/tests/unit/inbox-notification-model.test.js`, `/home/thaia/ECE493Group19/tests/unit/inbox-notification-controller.test.js`, and `/home/thaia/ECE493Group19/tests/integration/inbox-notification-flow.test.js` as needed
- [ ] T036 Add audit-record verification for failed delivery attempts and retry outcomes in `/home/thaia/ECE493Group19/tests/integration/inbox-notification-flow.test.js`
- [ ] T037 Run the full UC-19 validation scenarios from `/home/thaia/ECE493Group19/specs/019-branch-built-in-inbox/quickstart.md` and record results in `/home/thaia/ECE493Group19/tests/acceptance/uc19-acceptance-checklist.md`
- [ ] T037a Add accessibility validation evidence for keyboard-only navigation and assistive-technology announcements in `/home/thaia/ECE493Group19/tests/acceptance/uc19-acceptance-checklist.md`
- [ ] T037b Review student-facing inbox text for terminology consistency with `notification`, `built-in inbox`, `delivery failed`, `retry`, `stored for later viewing`, and `restricted access`, and record results in `/home/thaia/ECE493Group19/tests/acceptance/uc19-acceptance-checklist.md`
- [ ] T038 Measure the 1-minute delivery target and 500-user inbox-view target in `/home/thaia/ECE493Group19/tests/integration/inbox-notification-flow.test.js` and document the outcome in `/home/thaia/ECE493Group19/specs/019-branch-built-in-inbox/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phases 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on completion of the desired user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 and is the MVP.
- **US2 (P2)**: Starts after Phase 2 and reuses the shared notification persistence and controller flow.
- **US3 (P3)**: Starts after Phase 2 and reuses the shared notification state and inbox-access models.

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
- `T006`, `T007`, `T009`, and `T010` can run in parallel after `T005`.
- In US1, `T012`, `T013`, and `T014` can run in parallel.
- In US2, `T019`, `T020`, and `T021` can run in parallel, and `T022` can proceed independently before `T023`.
- In US3, `T026`, `T027`, and `T028` can run in parallel, and `T029` can proceed independently before `T030`.
- In Phase 6, `T033`, `T034`, and `T035` can run in parallel.

---

## Parallel Example: User Story 1

```bash
Task: "T012 [US1] Add unit tests for notification generation and student-only inbox visibility in /home/thaia/ECE493Group19/tests/unit/inbox-notification-model.test.js"
Task: "T013 [US1] Add controller tests for delivered notification list and detail responses in /home/thaia/ECE493Group19/tests/unit/inbox-notification-controller.test.js"
Task: "T014 [US1] Add SQLite-backed integration tests for delivered notification creation and signed-in inbox viewing in /home/thaia/ECE493Group19/tests/integration/inbox-notification-flow.test.js"
```

## Parallel Example: User Story 2

```bash
Task: "T019 [US2] Add unit tests for failed delivery recording and retry-window eligibility in /home/thaia/ECE493Group19/tests/unit/inbox-notification-model.test.js"
Task: "T020 [US2] Add controller tests for retry-status handling and recovered delivery results in /home/thaia/ECE493Group19/tests/unit/inbox-notification-controller.test.js"
Task: "T021 [US2] Add integration tests for failed delivery, retry attempts, and recovered inbox availability in /home/thaia/ECE493Group19/tests/integration/inbox-notification-flow.test.js"
```

## Parallel Example: User Story 3

```bash
Task: "T026 [US3] Add unit tests for restricted-access storage and later-view availability in /home/thaia/ECE493Group19/tests/unit/inbox-notification-model.test.js"
Task: "T027 [US3] Add controller tests for restricted-access status messaging and re-enabled access behavior in /home/thaia/ECE493Group19/tests/unit/inbox-notification-controller.test.js"
Task: "T028 [US3] Add integration tests for stored-for-later notifications and re-enabled inbox viewing in /home/thaia/ECE493Group19/tests/integration/inbox-notification-flow.test.js"
```

## Implementation Strategy

### MVP First

- Complete Phases 1 and 2 to establish the shared MVC and SQLite foundation.
- Deliver Phase 3 (US1) as the MVP because it provides the primary student outcome and validates the core inbox-notification architecture.

### Incremental Delivery

- Add Phase 4 to cover retry and recovery behavior for failed delivery.
- Add Phase 5 to cover restricted-access storage and later viewing.

### Validation Finish

- Use Phase 6 to enforce style-guide compliance, accessibility, audit verification, and performance validation.
