# Tasks: UC-29 Auto-pick Compatible Components

**Input**: Design documents from `/home/thaia/ECE493Group19/specs/029-compatible-components/`
**Prerequisites**: `/home/thaia/ECE493Group19/specs/029-compatible-components/plan.md`, `/home/thaia/ECE493Group19/specs/029-compatible-components/spec.md`, `/home/thaia/ECE493Group19/specs/029-compatible-components/research.md`, `/home/thaia/ECE493Group19/specs/029-compatible-components/data-model.md`, `/home/thaia/ECE493Group19/specs/029-compatible-components/contracts/compatible-components-ui-contract.md`

**Tests**: No separate automated test tasks are generated because the spec does not require TDD. Validation is captured through story-level independent tests and final quickstart verification tasks.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare implementation scaffolding and feature traceability artifacts.

- [ ] T001 Create the UC-29 implementation task scaffold in /home/thaia/ECE493Group19/backend, /home/thaia/ECE493Group19/frontend, and /home/thaia/ECE493Group19/tests
- [ ] T002 Create a UC-29 traceability matrix linking `FR-001` through `FR-012`, `NFR-001` through `NFR-004`, `UC-29`, and `AT-UC29-*` in /home/thaia/ECE493Group19/specs/029-compatible-components/traceability.md
- [ ] T003 [P] Add a UC-29 quickstart validation placeholder for implementation evidence in /home/thaia/ECE493Group19/specs/029-compatible-components/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared compatibility-aware generation foundation that all user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Create the compatibility data gateway for authoritative term offerings and linkage metadata in /home/thaia/ECE493Group19/backend/db/compatibility-repository.js
- [ ] T005 [P] Create the component offering model in /home/thaia/ECE493Group19/backend/models/component-offering.js
- [ ] T006 [P] Create the compatibility linkage rule model in /home/thaia/ECE493Group19/backend/models/compatibility-linkage-rule.js
- [ ] T007 [P] Create the compatible component combination model in /home/thaia/ECE493Group19/backend/models/compatible-component-combination.js
- [ ] T008 [P] Create the compatibility generation result model in /home/thaia/ECE493Group19/backend/models/compatibility-generation-result.js
- [ ] T009 Implement request-scoped compatibility loading and authenticated student context guards in /home/thaia/ECE493Group19/backend/services/compatibility-context-service.js
- [ ] T010 [P] Create the schedule generation controller entry point for compatibility-aware requests in /home/thaia/ECE493Group19/backend/controllers/schedule-generation-controller.js
- [ ] T011 [P] Create the frontend compatibility generation action bridge in /home/thaia/ECE493Group19/frontend/controllers/compatibility-generation-controller.js
- [ ] T012 Establish the shared schedule-results view state contract for compatible, blocked, and failed generation in /home/thaia/ECE493Group19/frontend/views/compatibility-generation-view.js

**Checkpoint**: Foundation ready; user story implementation can begin.

---

## Phase 3: User Story 1 - Generate Only Compatible Component Combinations (Priority: P1) 🎯 MVP

**Goal**: Return schedule options that use only valid compatible lecture, lab, tutorial, and other required component combinations.

**Independent Test**: Select courses with required component pairings, generate schedules, and confirm every returned option shows only compatible combinations with section identifiers for each selected course.

### Implementation for User Story 1

- [ ] T013 [P] [US1] Implement compatible-combination building across required component types for `FR-002`, `FR-003`, and `FR-005` in /home/thaia/ECE493Group19/backend/services/compatible-combination-service.js
- [ ] T014 [P] [US1] Implement request-level filtering for `FR-002`, `FR-004`, `FR-005`, and `FR-010` so multiple selected courses are evaluated together before schedule generation in /home/thaia/ECE493Group19/backend/services/compatibility-filter-service.js
- [ ] T015 [US1] Integrate compatibility-filtered combinations into schedule generation flow for `AT-UC29-01` and `FR-002` through `FR-005` in /home/thaia/ECE493Group19/backend/services/schedule-generation-service.js
- [ ] T016 [P] [US1] Add student-facing rendering of compatible section identifiers for `FR-011` in /home/thaia/ECE493Group19/frontend/views/schedule-results-view.js
- [ ] T017 [US1] Connect the frontend generation flow to display only compatibility-checked schedule results for `AT-UC29-01` in /home/thaia/ECE493Group19/frontend/pages/schedule-generator-page.js
- [ ] T018 [US1] Record US1 implementation-to-acceptance evidence for `AT-UC29-01`, `FR-002` through `FR-005`, and `FR-011` in /home/thaia/ECE493Group19/specs/029-compatible-components/traceability.md

**Checkpoint**: User Story 1 delivers compatibility-only schedule generation and is independently testable.

---

## Phase 4: User Story 2 - Explain When Compatibility Cannot Be Satisfied (Priority: P2)

**Goal**: Block unsafe generation and explain whether the request failed because no compatible combination exists or because compatibility could not be verified.

**Independent Test**: Use one request with no valid compatible combinations and another with missing or inconsistent linkage rules, then confirm generation is blocked, the blocking course is identified, and no schedules are returned.

### Implementation for User Story 2

- [ ] T019 [P] [US2] Implement no-compatible-combination detection and blocking-course capture for `FR-006` and `AT-UC29-02` in /home/thaia/ECE493Group19/backend/services/compatibility-blocking-service.js
- [ ] T020 [P] [US2] Implement missing-rule and inconsistent-rule detection for `FR-001`, `FR-007`, and `AT-UC29-03` using authoritative linkage metadata in /home/thaia/ECE493Group19/backend/services/compatibility-rule-validation-service.js
- [ ] T021 [US2] Extend the schedule generation controller to return blocked outcomes with plain-language reason codes for `FR-006`, `FR-007`, and `NFR-002` in /home/thaia/ECE493Group19/backend/controllers/schedule-generation-controller.js
- [ ] T022 [P] [US2] Add blocked-generation messaging for no-compatible-combination and unverifiable-compatibility outcomes for `NFR-002` in /home/thaia/ECE493Group19/frontend/views/compatibility-generation-view.js
- [ ] T023 [US2] Update the schedule generator page to show the affected course and next action when generation is blocked for `AT-UC29-02` and `AT-UC29-03` in /home/thaia/ECE493Group19/frontend/pages/schedule-generator-page.js
- [ ] T024 [US2] Record US2 implementation-to-acceptance evidence for `AT-UC29-02`, `AT-UC29-03`, `FR-006`, and `FR-007` in /home/thaia/ECE493Group19/specs/029-compatible-components/traceability.md

**Checkpoint**: User Stories 1 and 2 both work independently, and blocked requests are explained clearly.

---

## Phase 5: User Story 3 - Handle Shared Components and Failures Consistently (Priority: P3)

**Goal**: Support shared cross-listed components without duplication and guarantee failure-safe generation behavior.

**Independent Test**: Generate schedules for a shared cross-listed scenario and then simulate a generator failure; confirm a shared component appears once per option and failures return no partial or stale-looking results.

### Implementation for User Story 3

- [ ] T025 [P] [US3] Implement shared-component satisfaction rules for linked listings for `FR-008` and `AT-UC29-05` in /home/thaia/ECE493Group19/backend/services/shared-component-service.js
- [ ] T026 [P] [US3] Extend the compatibility filter to prevent duplicate shared-component representation for `FR-008` in /home/thaia/ECE493Group19/backend/services/compatibility-filter-service.js
- [ ] T027 [US3] Add failure-safe result handling for `FR-009` and `AT-UC29-04` so failed requests expose no partial or previously generated results in /home/thaia/ECE493Group19/backend/services/schedule-generation-service.js
- [ ] T028 [P] [US3] Add shared-component and generation-failure result states for `NFR-002`, `AT-UC29-04`, and `AT-UC29-05` in /home/thaia/ECE493Group19/frontend/views/compatibility-generation-view.js
- [ ] T029 [US3] Update the schedule results page to present shared components once and suppress stale result reuse after failure for `FR-008` and `FR-009` in /home/thaia/ECE493Group19/frontend/pages/schedule-generator-page.js
- [ ] T030 [US3] Record US3 implementation-to-acceptance evidence for `AT-UC29-04`, `AT-UC29-05`, `FR-008`, and `FR-009` in /home/thaia/ECE493Group19/specs/029-compatible-components/traceability.md

**Checkpoint**: All user stories are independently functional and acceptance-traceable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish cross-story validation, style compliance, and documentation alignment.

- [ ] T031 [P] Add unit coverage for compatibility combination, blocking, and shared-component services for `FR-002` through `FR-009` in /home/thaia/ECE493Group19/tests/unit/compatibility-services.test.js
- [ ] T032 [P] Add integration coverage for compatibility-aware generation outcomes for `AT-UC29-01` through `AT-UC29-05` in /home/thaia/ECE493Group19/tests/integration/compatible-components-generation.test.js
- [ ] T033 Verify HTML/CSS/JavaScript style-guide compliance for all UC-29 frontend and backend changes and record the result as validation evidence in /home/thaia/ECE493Group19/specs/029-compatible-components/traceability.md
- [ ] T034 Validate the UC-29 quickstart scenarios and capture final evidence for `FR-012` in /home/thaia/ECE493Group19/specs/029-compatible-components/quickstart.md
- [ ] T035 Add timing validation for `NFR-001` and `NFR-004` across successful and blocked-generation flows in /home/thaia/ECE493Group19/tests/integration/compatible-components-performance.test.js

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phases 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Phase 2 and defines the MVP.
- **User Story 2 (P2)**: Starts after Phase 2 and builds on the same controller/view foundation without requiring US3.
- **User Story 3 (P3)**: Starts after Phase 2 and extends US1-compatible generation behavior with shared-component and failure-safe handling.

### Within Each User Story

- Shared or base models and repositories come before services.
- Services come before controller and page wiring.
- Backend behavior is completed before frontend presentation is finalized.
- Traceability evidence is updated after each story is implemented and validated.

### Parallel Opportunities

- `T005`, `T006`, `T007`, `T008`, `T010`, and `T011` can run in parallel after `T004`.
- In US1, `T013`, `T014`, and `T016` can run in parallel.
- In US2, `T019`, `T020`, and `T022` can run in parallel.
- In US3, `T025`, `T026`, and `T028` can run in parallel.
- In Phase 6, `T031` and `T032` can run in parallel.

---

## Parallel Example: User Story 1

```bash
Task: "T013 [US1] Implement compatible-combination building in /home/thaia/ECE493Group19/backend/services/compatible-combination-service.js"
Task: "T014 [US1] Implement request-level compatibility filtering in /home/thaia/ECE493Group19/backend/services/compatibility-filter-service.js"
Task: "T016 [US1] Add compatible section identifier rendering in /home/thaia/ECE493Group19/frontend/views/schedule-results-view.js"
```

## Parallel Example: User Story 2

```bash
Task: "T019 [US2] Implement no-compatible-combination detection in /home/thaia/ECE493Group19/backend/services/compatibility-blocking-service.js"
Task: "T020 [US2] Implement missing-rule and inconsistent-rule detection in /home/thaia/ECE493Group19/backend/services/compatibility-rule-validation-service.js"
Task: "T022 [US2] Add blocked-generation messaging in /home/thaia/ECE493Group19/frontend/views/compatibility-generation-view.js"
```

## Parallel Example: User Story 3

```bash
Task: "T025 [US3] Implement shared-component satisfaction rules in /home/thaia/ECE493Group19/backend/services/shared-component-service.js"
Task: "T026 [US3] Prevent duplicate shared-component representation in /home/thaia/ECE493Group19/backend/services/compatibility-filter-service.js"
Task: "T028 [US3] Add shared-component and failure result states in /home/thaia/ECE493Group19/frontend/views/compatibility-generation-view.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate that compatible-only schedule generation works independently before expanding scope.

### Incremental Delivery

1. Deliver Setup + Foundational to establish the compatibility-aware generation base.
2. Deliver User Story 1 as the MVP for valid compatible schedules.
3. Deliver User Story 2 to block unsafe requests with actionable explanations.
4. Deliver User Story 3 to support shared components and failure-safe behavior.
5. Finish with Phase 6 validation and documentation updates.

### Parallel Team Strategy

1. One developer can finish repository/models while another prepares controller/view scaffolding in Phase 2.
2. After Phase 2, separate developers can own US1 filtering, US2 blocking flows, and US3 shared/failure flows.
3. Final validation tasks can run in parallel once story work is complete.

---

## Notes

- All tasks use absolute file paths for direct execution.
- `[P]` marks tasks that can proceed in parallel without waiting on another incomplete file-level dependency.
- `[US#]` labels map implementation work back to independently testable user stories.
- The MVP is Phase 3 after Setup and Foundational are complete.
