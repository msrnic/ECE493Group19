# Tasks: UC-27 Set Constraint Priorities

**Input**: Design documents from `/specs/027-branch-constraint-priorities/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No explicit TDD requirement was requested in the feature specification, so this task list focuses on implementation work and acceptance validation support rather than separate test-first tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. [US1], [US2], [US3])
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/`, `frontend/`, `tests/` at repository root
- Backend MVC ownership: `backend/models/`, `backend/controllers/`, `backend/services/`, `backend/db/`
- Frontend MVC ownership: `frontend/pages/`, `frontend/controllers/`, `frontend/views/`, `frontend/styles/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the project directories and shared traceability artifacts required by the plan

- [ ] T001 Create the planned web-app directory structure in `/home/thaia/ECE493Group19/backend/`, `/home/thaia/ECE493Group19/frontend/`, and `/home/thaia/ECE493Group19/tests/`
- [ ] T002 Create UC-27 traceability notes linking FR/NFR items to `AT-UC27-*` evidence in `/home/thaia/ECE493Group19/tests/acceptance/uc27-traceability.md`
- [ ] T003 [P] Add implementation-specific execution and validation notes to `/home/thaia/ECE493Group19/specs/027-branch-constraint-priorities/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish persistence, shared validation, routing, and MVC boundaries before any user story work begins

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create the SQLite schema for term-scoped priority sets and priority settings in `/home/thaia/ECE493Group19/backend/db/constraint-priority-schema.sql`
- [ ] T005 [P] Implement shared repository access for loading and replacing term-scoped priority sets in `/home/thaia/ECE493Group19/backend/services/priority-repository.js`
- [ ] T006 [P] Implement the core term-scoped priority-set model in `/home/thaia/ECE493Group19/backend/models/priority-set.js`
- [ ] T007 [P] Implement shared priority validation rules for range, completeness, and eligibility in `/home/thaia/ECE493Group19/backend/services/priority-validator.js`
- [ ] T008 [P] Create the priority editor page shell, no-eligible-constraints empty state, and shared layout hooks in `/home/thaia/ECE493Group19/frontend/pages/constraint-priorities.html`
- [ ] T009 [P] Create shared priority editor styles aligned to the style guides in `/home/thaia/ECE493Group19/frontend/styles/constraint-priorities.css`
- [ ] T010 Implement the base priority editor route and selected-term loading flow in `/home/thaia/ECE493Group19/backend/controllers/constraint-priority-controller.js`
- [ ] T011 Implement frontend editor state management for loading the selected term, eligible constraints, and current priority set in `/home/thaia/ECE493Group19/frontend/controllers/constraint-priority-editor.js`
- [ ] T012 Add protected-artifact, style-compliance, and acceptance-evidence checkpoints to `/home/thaia/ECE493Group19/tests/acceptance/uc27-traceability.md`

**Checkpoint**: Foundation ready; each user story can now be implemented as an independent vertical slice

---

## Phase 3: User Story 1 - Save Priority Settings for Constraints (Priority: P1) 🎯 MVP

**Goal**: Let a student save a full valid term-scoped priority set and have schedule ranking use the latest saved values

**Independent Test**: Open the priority editor for one term with eligible constraints, assign valid priorities from 1 to 5 to all eligible constraints, save, and reload the term to confirm the latest saved priority set is preserved correctly

### Implementation for User Story 1

- [ ] T013 [P] [US1] Implement the priority-setting model with numeric value and display-order snapshot fields in `/home/thaia/ECE493Group19/backend/models/constraint-priority-setting.js`
- [ ] T014 [P] [US1] Implement full-set replacement persistence for valid priority saves in `/home/thaia/ECE493Group19/backend/services/priority-save-service.js`
- [ ] T015 [US1] Implement valid save and reload actions for the selected term in `/home/thaia/ECE493Group19/backend/controllers/constraint-priority-controller.js`
- [ ] T016 [P] [US1] Build the priority input form, saved-priority list view, and no-eligible-constraints guidance in `/home/thaia/ECE493Group19/frontend/views/constraint-priority-editor-view.js`
- [ ] T017 [US1] Wire valid-save submission, reload, success state handling, and blocked-save behavior when no eligible constraints exist in `/home/thaia/ECE493Group19/frontend/controllers/constraint-priority-editor.js`
- [ ] T018 [US1] Document the US1 acceptance validation steps in `/home/thaia/ECE493Group19/tests/acceptance/uc27-save-valid-priorities.md`

**Checkpoint**: User Story 1 is fully functional and independently testable

---

## Phase 4: User Story 2 - Reject Invalid Priority Assignments (Priority: P2)

**Goal**: Let a student receive clear validation feedback for incomplete, out-of-range, and mixed-invalid priority submissions without changing the active saved set

**Independent Test**: Submit missing, out-of-range, and mixed-invalid priority values, then confirm the system identifies each invalid assignment, rejects the save, and preserves the prior saved set

### Implementation for User Story 2

- [ ] T019 [P] [US2] Extend validation results with mixed-invalid, missing-value, and ineligible-constraint messaging in `/home/thaia/ECE493Group19/backend/services/priority-validator.js`
- [ ] T020 [P] [US2] Implement invalid-save rejection handling that preserves the prior saved set in `/home/thaia/ECE493Group19/backend/services/priority-save-service.js`
- [ ] T021 [US2] Update the controller response flow for invalid priority submissions in `/home/thaia/ECE493Group19/backend/controllers/constraint-priority-controller.js`
- [ ] T022 [P] [US2] Build inline invalid-value and correction summary UI states in `/home/thaia/ECE493Group19/frontend/views/constraint-priority-validation-view.js`
- [ ] T023 [US2] Wire preserved-edit and correction behavior after invalid submissions in `/home/thaia/ECE493Group19/frontend/controllers/constraint-priority-editor.js`
- [ ] T024 [US2] Document the US2 acceptance validation steps in `/home/thaia/ECE493Group19/tests/acceptance/uc27-invalid-priorities.md`

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - Handle Ties and Save Failures Consistently (Priority: P3)

**Goal**: Let a student rely on stable equal-priority ranking behavior and preserve the last saved set when saves fail or eligible constraints change

**Independent Test**: Save equal-priority values and confirm the captured displayed order is preserved on reload, then simulate save failure or changed eligible constraints and confirm the last saved set remains safe while review is required

### Implementation for User Story 3

- [ ] T025 [P] [US3] Implement tie-order capture, stale-constraint review, and save-failure preservation in `/home/thaia/ECE493Group19/backend/services/priority-save-service.js`
- [ ] T026 [P] [US3] Add repository support for stale-session detection, owner-scoped priority loading, and changed-constraint review in `/home/thaia/ECE493Group19/backend/services/priority-repository.js`
- [ ] T027 [US3] Update the controller flow for tie-policy explanations, save failures, stale review prompts, and owner-only access checks in `/home/thaia/ECE493Group19/backend/controllers/constraint-priority-controller.js`
- [ ] T028 [P] [US3] Build tie-policy, stale-review, and save-failure UI messaging in `/home/thaia/ECE493Group19/frontend/views/constraint-priority-recovery-view.js`
- [ ] T029 [US3] Wire equal-priority handling, stale-review correction flow, retry behavior, and stale-session refresh handling in `/home/thaia/ECE493Group19/frontend/controllers/constraint-priority-editor.js`
- [ ] T030 [US3] Document the US3 acceptance validation steps in `/home/thaia/ECE493Group19/tests/acceptance/uc27-ties-and-save-failure.md`

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish ranking integration, accessibility, performance validation, and final traceability across all stories

- [ ] T031 [P] Connect schedule-ranking reads to the latest saved term-scoped priority set and capture FR-007 validation evidence in `/home/thaia/ECE493Group19/backend/services/schedule-ranking-priority-reader.js`
- [ ] T032 [P] Refine keyboard-accessible focus, retry, and stale-review styling in `/home/thaia/ECE493Group19/frontend/styles/constraint-priorities.css`
- [ ] T033 Align final behavior details across `/home/thaia/ECE493Group19/specs/027-branch-constraint-priorities/contracts/constraint-priority-ui-contract.md`, `/home/thaia/ECE493Group19/specs/027-branch-constraint-priorities/quickstart.md`, and `/home/thaia/ECE493Group19/specs/027-branch-constraint-priorities/plan.md`
- [ ] T034 [P] Add authorization and owner-only access validation notes in `/home/thaia/ECE493Group19/tests/acceptance/uc27-authorization-and-privacy.md`
- [ ] T035 [P] Measure and record save, invalid-rejection, and failure response times against the 5-second target in `/home/thaia/ECE493Group19/tests/acceptance/uc27-performance-validation.md`
- [ ] T036 Update the UC-27 traceability matrix with final FR/NFR-to-task and AT evidence mapping in `/home/thaia/ECE493Group19/tests/acceptance/uc27-traceability.md`

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
- **User Story 3 (P3)**: Depends on the saved priority lifecycle from US1 and the validation hooks from US2

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
- **Polish**: T031, T032, T034, and T035 can run in parallel before T033 and T036

## Parallel Example: User Story 1

```bash
Task: "Implement full-set replacement persistence in /home/thaia/ECE493Group19/backend/services/priority-save-service.js"
Task: "Build the priority input form in /home/thaia/ECE493Group19/frontend/views/constraint-priority-editor-view.js"
Task: "Implement the priority-setting model in /home/thaia/ECE493Group19/backend/models/constraint-priority-setting.js"
```

## Parallel Example: User Story 2

```bash
Task: "Extend validation results in /home/thaia/ECE493Group19/backend/services/priority-validator.js"
Task: "Implement invalid-save rejection handling in /home/thaia/ECE493Group19/backend/services/priority-save-service.js"
Task: "Build invalid-value UI states in /home/thaia/ECE493Group19/frontend/views/constraint-priority-validation-view.js"
```

## Parallel Example: User Story 3

```bash
Task: "Implement tie-order capture and save-failure preservation in /home/thaia/ECE493Group19/backend/services/priority-save-service.js"
Task: "Add repository support for stale-session detection in /home/thaia/ECE493Group19/backend/services/priority-repository.js"
Task: "Build tie-policy and stale-review UI messaging in /home/thaia/ECE493Group19/frontend/views/constraint-priority-recovery-view.js"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the US1 independent test and acceptance notes

### Incremental Delivery

1. Deliver US1 for valid priority-save behavior
2. Add US2 for invalid-priority rejection behavior
3. Add US3 for tie-handling and save-failure recovery
4. Finish with ranking integration, accessibility polish, and final traceability

### Parallel Team Strategy

1. One developer completes T004 and T010-T012 while others prepare parallel Phase 2 files
2. After Foundational is complete:
   - Developer A: US1 backend save/load path
   - Developer B: US1 frontend priority editor UI
   - Developer C: acceptance validation notes and later story slices

## Notes

- All tasks follow the required checklist format with checkbox, task ID, story label where needed, and exact file paths
- `[P]` marks tasks that touch different files and can proceed concurrently
- User stories remain independently testable through the criteria stated under each phase
- MVP scope is User Story 1 only
