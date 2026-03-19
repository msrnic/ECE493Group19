# Tasks: UC-26 Create Custom Scheduling Constraints

**Input**: Design documents from `/specs/026-branch-scheduling-constraints/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No explicit TDD requirement was requested in the feature specification, so this task list focuses on implementation work and acceptance validation support rather than separate test-first tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Traceability Matrix

| Story / Requirement | Acceptance Tests | Primary Tasks | Validation Evidence |
|---------------------|------------------|---------------|---------------------|
| US1 / FR-001, FR-002, FR-007, FR-008, FR-012 | AT-UC26-01 | T010, T011, T013, T014, T015, T016, T017, T018 | `/home/thaia/ECE493Group19/tests/acceptance/uc26-save-valid-constraints.md`, `/home/thaia/ECE493Group19/tests/acceptance/uc26-traceability.md` |
| US2 / FR-004, FR-005, FR-006, NFR-002 | AT-UC26-02, AT-UC26-03 | T007, T019, T020, T021, T022, T023, T024 | `/home/thaia/ECE493Group19/tests/acceptance/uc26-invalid-and-conflicting-constraints.md`, `/home/thaia/ECE493Group19/tests/acceptance/uc26-traceability.md` |
| US3 / FR-009, FR-010, FR-011, FR-013, FR-014 | AT-UC26-04, AT-UC26-05 | T025, T026, T027, T028, T029, T030 | `/home/thaia/ECE493Group19/tests/acceptance/uc26-delete-and-save-failure.md`, `/home/thaia/ECE493Group19/tests/acceptance/uc26-traceability.md` |
| Cross-cutting / FR-015, FR-016, NFR-001, NFR-003, NFR-004, NFR-005 | AT-UC26-01, AT-UC26-02, AT-UC26-03, AT-UC26-04, AT-UC26-05 | T002, T012, T031, T032, T034, T035, T036, T037 | `/home/thaia/ECE493Group19/tests/acceptance/uc26-traceability.md`, `/home/thaia/ECE493Group19/tests/acceptance/uc26-authorization-and-privacy.md`, `/home/thaia/ECE493Group19/tests/acceptance/uc26-performance-validation.md` |

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. [US1], [US2], [US3])
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/`, `frontend/`, `tests/` at repository root
- Backend MVC ownership: `backend/models/`, `backend/controllers/`, `backend/services/`, `backend/db/`
- Frontend MVC ownership: `frontend/pages/`, `frontend/controllers/`, `frontend/views/`, `frontend/styles/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the project directories and shared documentation hooks required by the plan

- [ ] T001 Create the planned web-app directory structure in `/home/thaia/ECE493Group19/backend/`, `/home/thaia/ECE493Group19/frontend/`, and `/home/thaia/ECE493Group19/tests/`
- [ ] T002 Create the UC-26 traceability matrix linking FR/NFR items, AT-UC26 cases, and validation evidence in `/home/thaia/ECE493Group19/tests/acceptance/uc26-traceability.md`
- [ ] T003 [P] Add implementation-specific execution notes and validation commands to `/home/thaia/ECE493Group19/specs/026-branch-scheduling-constraints/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish persistence, shared validation, routing, and MVC boundaries before any user story work begins

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create the SQLite schema for term-scoped constraint sets and entries in `/home/thaia/ECE493Group19/backend/db/constraints-schema.sql`
- [ ] T005 [P] Implement shared constraint repository access for loading and replacing full saved sets in `/home/thaia/ECE493Group19/backend/services/constraint-repository.js`
- [ ] T006 [P] Implement the core term-scoped constraint-set model in `/home/thaia/ECE493Group19/backend/models/constraint-set.js`
- [ ] T007 [P] Implement shared constraint validation rules and warning classification in `/home/thaia/ECE493Group19/backend/services/constraint-validator.js`
- [ ] T008 [P] Create the constraints editor page shell and shared layout hooks in `/home/thaia/ECE493Group19/frontend/pages/constraints-editor.html`
- [ ] T009 [P] Create shared constraints editor styles aligned to the style guides in `/home/thaia/ECE493Group19/frontend/styles/constraints-editor.css`
- [ ] T010 Implement the base constraints controller route and term-loading flow in `/home/thaia/ECE493Group19/backend/controllers/constraints-controller.js`
- [ ] T011 Implement frontend editor state management for loading the selected term and current saved set in `/home/thaia/ECE493Group19/frontend/controllers/constraints-editor.js`
- [ ] T012 Add protected-artifact, style-compliance, and acceptance-evidence checkpoints to `/home/thaia/ECE493Group19/tests/acceptance/uc26-traceability.md`

**Checkpoint**: Foundation ready; each user story can now be implemented as an independent vertical slice

---

## Phase 3: User Story 1 - Save Scheduling Constraints (Priority: P1) 🎯 MVP

**Goal**: Let a student create or update a full valid constraint set for one term and have the next schedule-generation request use that saved set

**Independent Test**: Open the constraints editor for one term, add valid blocked-time, time-preference, and professor-preference entries, save them, reload the term, and confirm the same term’s latest saved set is returned for schedule generation use

### Implementation for User Story 1

- [ ] T013 [P] [US1] Extend the constraint-entry model for blocked times, time preferences, day preferences, and professor preferences in `/home/thaia/ECE493Group19/backend/models/constraint-entry.js`
- [ ] T014 [P] [US1] Implement full-set replacement persistence for valid saves in `/home/thaia/ECE493Group19/backend/services/constraint-save-service.js`
- [ ] T015 [US1] Implement save and reload actions for valid submissions in `/home/thaia/ECE493Group19/backend/controllers/constraints-controller.js`
- [ ] T016 [P] [US1] Build the constraint entry form and saved-set list view in `/home/thaia/ECE493Group19/frontend/views/constraints-editor-view.js`
- [ ] T017 [US1] Wire valid-save submission, reload, and success state handling in `/home/thaia/ECE493Group19/frontend/controllers/constraints-editor.js`
- [ ] T018 [US1] Document the US1 acceptance validation steps in `/home/thaia/ECE493Group19/tests/acceptance/uc26-save-valid-constraints.md`

**Checkpoint**: User Story 1 is fully functional and independently testable

---

## Phase 4: User Story 2 - Correct Invalid or Conflicting Constraints (Priority: P2)

**Goal**: Let a student see field-level invalid errors, distinguish warning conflicts from invalid input, and explicitly confirm a conflicting set before saving

**Independent Test**: Submit malformed constraints and confirm the save is rejected with preserved edits, then submit a conflicting but individually valid set and confirm the warning identifies the conflicting entries and requires explicit confirmation before saving

### Implementation for User Story 2

- [ ] T019 [P] [US2] Extend validation results with malformed-input, term-context, and warning-conflict detail messaging in `/home/thaia/ECE493Group19/backend/services/constraint-validator.js`
- [ ] T020 [P] [US2] Implement warning-confirmation save handling for previously conflicting sets in `/home/thaia/ECE493Group19/backend/services/constraint-save-service.js`
- [ ] T021 [US2] Update the controller response flow for invalid saves and explicit warning confirmations in `/home/thaia/ECE493Group19/backend/controllers/constraints-controller.js`
- [ ] T022 [P] [US2] Build inline validation, warning summary, and confirm-save-anyway UI states in `/home/thaia/ECE493Group19/frontend/views/constraints-warning-view.js`
- [ ] T023 [US2] Wire preserved-unsaved-edits, correction, and explicit-confirmation behavior in `/home/thaia/ECE493Group19/frontend/controllers/constraints-editor.js`
- [ ] T024 [US2] Document the US2 acceptance validation steps in `/home/thaia/ECE493Group19/tests/acceptance/uc26-invalid-and-conflicting-constraints.md`

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - Remove Constraints and Recover from Save Failure (Priority: P3)

**Goal**: Let a student delete saved constraints, preserve an empty valid set when needed, and recover safely from save failures without overwriting the last saved state

**Independent Test**: Delete a saved constraint and confirm it no longer appears or applies later, then simulate a persistence failure and confirm the last saved set remains active while unsaved edits stay visible for retry

### Implementation for User Story 3

- [ ] T025 [P] [US3] Implement delete, empty-set preservation, stale dependency detection, and stale-session protection in `/home/thaia/ECE493Group19/backend/services/constraint-save-service.js`
- [ ] T026 [P] [US3] Add repository support for delete operations, active-set preservation, stale-save detection, and owner-scoped constraint loading in `/home/thaia/ECE493Group19/backend/services/constraint-repository.js`
- [ ] T027 [US3] Update the controller flow for delete confirmations, save failures, stale dependency revision prompts, owner-only access checks, retry states, and stale-session refresh requirements in `/home/thaia/ECE493Group19/backend/controllers/constraints-controller.js`
- [ ] T028 [P] [US3] Build delete-confirmation, stale-data revision, save-failure, and retry-state UI messaging in `/home/thaia/ECE493Group19/frontend/views/constraints-recovery-view.js`
- [ ] T029 [US3] Wire delete actions, stale-data correction flow, failure recovery, and retry behavior in `/home/thaia/ECE493Group19/frontend/controllers/constraints-editor.js`
- [ ] T030 [US3] Document the US3 acceptance validation steps in `/home/thaia/ECE493Group19/tests/acceptance/uc26-delete-and-save-failure.md`

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish integration with schedule generation, accessibility, and final validation across all stories

- [ ] T031 [P] Connect schedule-generation reads to the latest saved term-specific constraint set in `/home/thaia/ECE493Group19/backend/services/schedule-generation-constraint-reader.js`
- [ ] T032 [P] Refine keyboard-accessible focus, confirmation, and retry styling in `/home/thaia/ECE493Group19/frontend/styles/constraints-editor.css`
- [ ] T033 Align the UI contract, quickstart validation steps, and implementation notes with final behavior in `/home/thaia/ECE493Group19/specs/026-branch-scheduling-constraints/contracts/constraints-editor-ui-contract.md`
- [ ] T034 Run the feature validation checklist and record results in `/home/thaia/ECE493Group19/tests/acceptance/uc26-traceability.md`
- [ ] T035 [P] Add authenticated-student authorization and owner-only access validation notes in `/home/thaia/ECE493Group19/tests/acceptance/uc26-authorization-and-privacy.md`
- [ ] T036 [P] Measure and record save, warning, and failure response times against the 5-second target in `/home/thaia/ECE493Group19/tests/acceptance/uc26-performance-validation.md`
- [ ] T037 Update the UC-26 traceability matrix with final FR/NFR-to-task and AT evidence mapping in `/home/thaia/ECE493Group19/tests/acceptance/uc26-traceability.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories
- **User Story phases (Phases 3-5)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on completion of all targeted user stories

### User Story Dependencies

- **User Story 1 (P1)**: Starts immediately after Foundational; forms the MVP
- **User Story 2 (P2)**: Depends on the save/edit flow from US1 but remains independently testable once implemented
- **User Story 3 (P3)**: Depends on the saved-set lifecycle from US1 and error/warning flow hooks from US2

### Dependency Graph

`Setup -> Foundational -> US1 -> US2 -> US3 -> Polish`

### Within Each User Story

- Models and pure service changes before controller wiring
- Backend save/load behavior before frontend interaction wiring
- Story documentation and acceptance validation notes after the slice is functional

## Parallel Opportunities

- **Phase 2**: T005, T006, T007, T008, and T009 can run in parallel after T004
- **US1**: T013, T014, and T016 can run in parallel before T015 and T017
- **US2**: T019, T020, and T022 can run in parallel before T021 and T023
- **US3**: T025, T026, and T028 can run in parallel before T027 and T029
- **Polish**: T031, T032, T035, and T036 can run in parallel before T033, T034, and T037

## Parallel Example: User Story 1

```bash
Task: "Implement full-set replacement persistence in /home/thaia/ECE493Group19/backend/services/constraint-save-service.js"
Task: "Build the constraint entry form in /home/thaia/ECE493Group19/frontend/views/constraints-editor-view.js"
Task: "Extend the constraint-entry model in /home/thaia/ECE493Group19/backend/models/constraint-entry.js"
```

## Parallel Example: User Story 2

```bash
Task: "Extend validation results in /home/thaia/ECE493Group19/backend/services/constraint-validator.js"
Task: "Implement warning-confirmation save handling in /home/thaia/ECE493Group19/backend/services/constraint-save-service.js"
Task: "Build warning UI states in /home/thaia/ECE493Group19/frontend/views/constraints-warning-view.js"
```

## Parallel Example: User Story 3

```bash
Task: "Implement delete and stale-session protection in /home/thaia/ECE493Group19/backend/services/constraint-save-service.js"
Task: "Add repository support for delete and stale-save detection in /home/thaia/ECE493Group19/backend/services/constraint-repository.js"
Task: "Build save-failure and retry UI messaging in /home/thaia/ECE493Group19/frontend/views/constraints-recovery-view.js"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the US1 independent test and acceptance notes

### Incremental Delivery

1. Deliver US1 for valid-save behavior
2. Add US2 for invalid and conflicting-constraint handling
3. Add US3 for delete and recovery behavior
4. Finish with schedule-generation integration and accessibility polish

### Parallel Team Strategy

1. One developer completes T004 and T010-T012 while others prepare parallel Phase 2 files
2. After Foundational is complete:
   - Developer A: US1 backend save/load path
   - Developer B: US1 frontend editor UI
   - Developer C: acceptance validation notes and later story slices

## Notes

- All tasks follow the required checklist format with checkbox, task ID, story label where needed, and exact file paths
- `[P]` marks tasks that touch different files and can proceed concurrently
- User stories remain independently testable through the criteria stated under each phase
- MVP scope is User Story 1 only
