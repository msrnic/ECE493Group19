# Tasks: UC-28 Save and Name Constraint Sets

**Input**: Design documents from `/specs/028-save-constraint-sets/`
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
- [ ] T002 Create UC-28 traceability notes linking each FR/NFR item and `AT-UC28-*` artifact to implementation tasks and evidence in `/home/thaia/ECE493Group19/tests/acceptance/uc28-traceability.md`
- [ ] T003 [P] Add implementation-specific execution and validation notes to `/home/thaia/ECE493Group19/specs/028-save-constraint-sets/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish persistence, normalization, routing, and MVC boundaries before any user story work begins

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create the SQLite schema for term-scoped named constraint sets in `/home/thaia/ECE493Group19/backend/db/named-constraint-set-schema.sql`
- [ ] T005 [P] Implement shared owner-scoped repository access for loading, saving, renaming, overwriting, and deleting named sets in `/home/thaia/ECE493Group19/backend/services/named-constraint-set-repository.js`
- [ ] T006 [P] Implement the base named-constraint-set model in `/home/thaia/ECE493Group19/backend/models/named-constraint-set.js`
- [ ] T007 [P] Implement shared saved-set name normalization and validation rules in `/home/thaia/ECE493Group19/backend/services/named-set-name-validator.js`
- [ ] T008 [P] Create the saved-set management page shell, zero-state messaging, and shared layout hooks in `/home/thaia/ECE493Group19/frontend/pages/saved-constraint-sets.html`
- [ ] T009 [P] Create shared saved-set management styles aligned to the style guides in `/home/thaia/ECE493Group19/frontend/styles/saved-constraint-sets.css`
- [ ] T010 Implement the base owner-scoped saved-set route and selected-term loading flow in `/home/thaia/ECE493Group19/backend/controllers/named-constraint-set-controller.js`
- [ ] T011 Implement frontend state management for the selected term, saved-set list, and current constraint snapshot in `/home/thaia/ECE493Group19/frontend/controllers/saved-constraint-set-manager.js`
- [ ] T012 Add protected-artifact, style-compliance, and acceptance-evidence checkpoints for `AT-UC28-01` through `AT-UC28-06` to `/home/thaia/ECE493Group19/tests/acceptance/uc28-traceability.md`

**Checkpoint**: Foundation ready; each user story can now be implemented as an independent vertical slice

---

## Phase 3: User Story 1 - Save a Named Constraint Set (Priority: P1) 🎯 MVP

**Goal**: Let a student save the current term-scoped constraint configuration under a valid name and see it available for later reuse

**Independent Test**: Configure constraints for one term, provide a valid new name, save, reload the saved-set list, and confirm the named set appears and can be selected to repopulate the constraint editor for the same term

### Implementation for User Story 1

- [ ] T013 [P] [US1] Implement the saved-set operation result model in `/home/thaia/ECE493Group19/backend/models/saved-set-operation-result.js`
- [ ] T014 [P] [US1] Implement valid named-set save, list-reload, and reuse-read behavior for `FR-001`, `FR-002`, `FR-008`, and `AT-UC28-01` in `/home/thaia/ECE493Group19/backend/services/named-constraint-set-save-service.js`
- [ ] T015 [US1] Implement valid owner-scoped save and reload actions for the selected term for `FR-001`, `FR-008`, and `AT-UC28-01` in `/home/thaia/ECE493Group19/backend/controllers/named-constraint-set-controller.js`
- [ ] T016 [P] [US1] Build the save form, saved-set list view, and reuse-selection controls for `FR-008` and `AT-UC28-01` in `/home/thaia/ECE493Group19/frontend/views/saved-constraint-set-list-view.js`
- [ ] T017 [US1] Wire valid-save submission, reload, and saved-set selection to repopulate the editor for `FR-008` and `AT-UC28-01` in `/home/thaia/ECE493Group19/frontend/controllers/saved-constraint-set-manager.js`
- [ ] T018 [US1] Document the US1 acceptance validation steps and evidence for `FR-001`, `FR-008`, and `AT-UC28-01` in `/home/thaia/ECE493Group19/tests/acceptance/uc28-save-named-set.md`

**Checkpoint**: User Story 1 is fully functional and independently testable

---

## Phase 4: User Story 2 - Handle Invalid or Duplicate Names (Priority: P2)

**Goal**: Let a student receive clear feedback for invalid names and require explicit overwrite handling for duplicates without accidental data loss

**Independent Test**: Attempt save with blank, overlength, invalid-character, and duplicate names, then confirm invalid saves are rejected, overwrite requires explicit confirmation, and only one normalized saved-set name remains after confirmed overwrite

### Implementation for User Story 2

- [ ] T019 [P] [US2] Extend validation results with invalid-character, blank-name, overlength, and duplicate-name outcomes for `FR-003` through `FR-006` and `AT-UC28-02` through `AT-UC28-03` in `/home/thaia/ECE493Group19/backend/services/named-set-name-validator.js`
- [ ] T020 [P] [US2] Implement duplicate-name detection and explicit overwrite replacement behavior for `FR-005` through `FR-007` and `AT-UC28-03` in `/home/thaia/ECE493Group19/backend/services/named-constraint-set-save-service.js`
- [ ] T021 [US2] Update owner-scoped controller responses for invalid-name rejection and overwrite confirmation flows for `FR-004`, `FR-006`, and `AT-UC28-02` through `AT-UC28-03` in `/home/thaia/ECE493Group19/backend/controllers/named-constraint-set-controller.js`
- [ ] T022 [P] [US2] Build invalid-name and overwrite-confirmation UI states for `NFR-002` and `AT-UC28-02` through `AT-UC28-03` in `/home/thaia/ECE493Group19/frontend/views/saved-constraint-set-validation-view.js`
- [ ] T023 [US2] Wire preserved-name, preserved-unsaved-configuration, rename, and overwrite-confirmation behavior for `FR-004`, `FR-006`, and `AT-UC28-02` through `AT-UC28-03` in `/home/thaia/ECE493Group19/frontend/controllers/saved-constraint-set-manager.js`
- [ ] T024 [US2] Document the US2 acceptance validation steps and evidence for `FR-003` through `FR-007` and `AT-UC28-02` through `AT-UC28-03` in `/home/thaia/ECE493Group19/tests/acceptance/uc28-invalid-and-duplicate-names.md`

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - Manage Existing Named Sets Reliably (Priority: P3)

**Goal**: Let a student rename or delete existing saved sets and recover cleanly from failed or stale mutating actions

**Independent Test**: Rename an existing saved set, delete another saved set, simulate save or rename failure, then confirm stored sets remain consistent, same-name rename does not conflict with itself, and stale-session actions are blocked from restoring newer data

### Implementation for User Story 3

- [ ] T025 [P] [US3] Implement rename, delete, rollback, stale-session handling, and owner-only mutation enforcement for `FR-009` through `FR-013` and `AT-UC28-04` through `AT-UC28-06` in `/home/thaia/ECE493Group19/backend/services/named-constraint-set-management-service.js`
- [ ] T026 [P] [US3] Add repository support for owner-scoped version-token checks, same-name rename handling, and delete persistence for `FR-009` through `FR-013` and `AT-UC28-05` through `AT-UC28-06` in `/home/thaia/ECE493Group19/backend/services/named-constraint-set-repository.js`
- [ ] T027 [US3] Update the owner-scoped controller flow for rename, delete, refresh-required, and failure responses for `FR-009` through `FR-013` and `AT-UC28-04` through `AT-UC28-06` in `/home/thaia/ECE493Group19/backend/controllers/named-constraint-set-controller.js`
- [ ] T028 [P] [US3] Build rename, delete-confirmation, refresh-required, and rollback messaging UI states for `NFR-002`, `NFR-003`, and `AT-UC28-04` through `AT-UC28-06` in `/home/thaia/ECE493Group19/frontend/views/saved-constraint-set-recovery-view.js`
- [ ] T029 [US3] Wire rename, delete, retry, and stale-session refresh behavior for `FR-009` through `FR-013` and `AT-UC28-04` through `AT-UC28-06` in `/home/thaia/ECE493Group19/frontend/controllers/saved-constraint-set-manager.js`
- [ ] T030 [US3] Document the US3 acceptance validation steps and evidence for `FR-009` through `FR-013` and `AT-UC28-04` through `AT-UC28-06` in `/home/thaia/ECE493Group19/tests/acceptance/uc28-rename-delete-and-recovery.md`

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish accessibility, style compliance, reuse integration, performance validation, and final traceability across all stories

- [ ] T031 [P] Refine shared saved-set selection wiring and cross-story reuse integration for `FR-008` in `/home/thaia/ECE493Group19/frontend/controllers/saved-constraint-set-apply-controller.js`
- [ ] T032 [P] Refine keyboard-accessible focus, confirm, cancel, and stale-refresh styling in `/home/thaia/ECE493Group19/frontend/styles/saved-constraint-sets.css`
- [ ] T033 Align final behavior details across `/home/thaia/ECE493Group19/specs/028-save-constraint-sets/contracts/saved-constraint-set-ui-contract.md`, `/home/thaia/ECE493Group19/specs/028-save-constraint-sets/quickstart.md`, and `/home/thaia/ECE493Group19/specs/028-save-constraint-sets/plan.md`
- [ ] T034 [P] Add authorization and owner-only access validation notes for `FR-013`, `NFR-004`, and `AT-UC28-*` privacy evidence in `/home/thaia/ECE493Group19/tests/acceptance/uc28-authorization-and-privacy.md`
- [ ] T035 [P] Measure and record save, overwrite, rename, delete, and failure response times against `NFR-001`, `NFR-005`, and `SC-005` in `/home/thaia/ECE493Group19/tests/acceptance/uc28-performance-validation.md`
- [ ] T036 Update the UC-28 traceability matrix with final one-to-one FR/NFR-to-task and `AT-UC28-*` evidence mapping in `/home/thaia/ECE493Group19/tests/acceptance/uc28-traceability.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories
- **User Story phases (Phases 3-5)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on completion of all targeted user stories

### User Story Dependencies

- **User Story 1 (P1)**: Starts immediately after Foundational; forms the MVP
- **User Story 2 (P2)**: Depends on the save/list flow from US1 but remains independently testable once implemented
- **User Story 3 (P3)**: Depends on the saved-set lifecycle from US1 and the duplicate-handling rules from US2

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
Task: "Implement valid named-set save and list-reload behavior in /home/thaia/ECE493Group19/backend/services/named-constraint-set-save-service.js"
Task: "Build the save form and saved-set list view in /home/thaia/ECE493Group19/frontend/views/saved-constraint-set-list-view.js"
Task: "Implement the saved-set operation result model in /home/thaia/ECE493Group19/backend/models/saved-set-operation-result.js"
```

## Parallel Example: User Story 2

```bash
Task: "Extend validation results in /home/thaia/ECE493Group19/backend/services/named-set-name-validator.js"
Task: "Implement duplicate-name detection and explicit overwrite replacement in /home/thaia/ECE493Group19/backend/services/named-constraint-set-save-service.js"
Task: "Build invalid-name and overwrite-confirmation UI states in /home/thaia/ECE493Group19/frontend/views/saved-constraint-set-validation-view.js"
```

## Parallel Example: User Story 3

```bash
Task: "Implement rename, delete, rollback, and stale-session handling in /home/thaia/ECE493Group19/backend/services/named-constraint-set-management-service.js"
Task: "Add repository support for version-token checks and same-name rename handling in /home/thaia/ECE493Group19/backend/services/named-constraint-set-repository.js"
Task: "Build rename, delete-confirmation, refresh-required, and rollback messaging UI states in /home/thaia/ECE493Group19/frontend/views/saved-constraint-set-recovery-view.js"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the US1 independent test and acceptance notes

### Incremental Delivery

1. Deliver US1 for valid named-set save behavior
2. Add US2 for invalid-name rejection and duplicate overwrite handling
3. Add US3 for rename, delete, and failure-safe recovery
4. Finish with reuse integration, accessibility polish, and final traceability

### Parallel Team Strategy

1. One developer completes T004 and T010-T012 while others prepare parallel Phase 2 files
2. After Foundational is complete:
   - Developer A: US1 backend save/list path
   - Developer B: US1 frontend saved-set UI
   - Developer C: acceptance validation notes and later story slices

## Notes

- All tasks follow the required checklist format with checkbox, task ID, story label where needed, and exact file paths
- `[P]` marks tasks that touch different files and can proceed concurrently
- User stories remain independently testable through the criteria stated under each phase
- MVP scope is User Story 1 only
