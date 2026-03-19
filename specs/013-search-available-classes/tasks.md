# Tasks: Search for Available Classes (UC-13)

**Input**: Design documents from `/specs/013-search-available-classes/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Include unit and integration tests for matching search, no-results,
and failure flow behavior aligned to UC-13-AS.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize class-search modules and traceability scaffolding.

- [ ] T001 Create MVC files for class search in src/controllers/class-search-controller.js, src/models/class-offering-model.js, src/services/class-search-service.js, and src/routes/class-search-routes.js
- [ ] T002 Create search view and detail templates in src/views/class-search/index.html and src/views/class-search/class-detail.html
- [ ] T003 [P] Create frontend assets in public/css/class-search.css and public/js/class-search.js
- [ ] T004 [P] Create unit/integration test placeholders in tests/unit/class-search-service.test.js and tests/integration/class-search.integration.test.js
- [ ] T005 Add UC-13 traceability references in specs/013-search-available-classes/quickstart.md and specs/013-search-available-classes/plan.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared search infrastructure required by all user stories.

- [ ] T006 Create SQLite schema/migration for catalog snapshot caching in src/models/migrations/013_class_search_snapshot.sql
- [ ] T007 [P] Implement class offering query and filter methods in src/models/class-offering-model.js
- [ ] T008 [P] Implement catalog snapshot freshness helper in src/models/catalog-snapshot-model.js
- [ ] T009 Implement catalog client wrapper and timeout/error mapping in src/services/class-search-service.js
- [ ] T010 Implement request validation and normalized filter parsing in src/controllers/class-search-validator.js
- [ ] T011 Add route wiring for GET /api/classes/search and GET /classes/:offeringId in src/routes/class-search-routes.js
- [ ] T012 Add style and protected-file compliance notes in specs/013-search-available-classes/checklists/requirements.md

**Checkpoint**: Foundation complete; user stories can proceed.

---

## Phase 3: User Story 1 - Find Matching Available Classes (Priority: P1) 🎯 MVP

**Goal**: Student can submit query/filter criteria and view matching available
classes, then open class details.

**Independent Test**: Execute `AT-UC13-01` from `Acceptance Tests/UC-13-AS.md`.

### Tests for User Story 1

- [ ] T013 [P] [US1] Add unit tests for query normalization and result mapping in tests/unit/class-search-service.test.js
- [ ] T014 [P] [US1] Add integration test for successful matching search flow in tests/integration/class-search.integration.test.js

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implement query search and active-term default logic in src/services/class-search-service.js
- [ ] T016 [US1] Implement successful search controller response in src/controllers/class-search-controller.js
- [ ] T017 [US1] Implement search submission and results rendering in src/views/class-search/index.html
- [ ] T018 [US1] Implement search form behavior and result list state handling in public/js/class-search.js
- [ ] T019 [US1] Implement class detail retrieval and display in src/views/class-search/class-detail.html and src/controllers/class-search-controller.js
- [ ] T020 [US1] Add result-row styling for readability and status indicators in public/css/class-search.css

**Checkpoint**: User Story 1 independently functional and testable.

---

## Phase 4: User Story 2 - Refine Search to Reach the Intended Class (Priority: P2)

**Goal**: Student can refine searches and receive deterministic ordering to find
intended class quickly.

**Independent Test**: Use subject/course/term filters and verify deterministic
ordering by earliest meeting availability then course code.

### Tests for User Story 2

- [ ] T021 [P] [US2] Add unit tests for multi-filter intersection and ordering rules in tests/unit/class-search-service.test.js
- [ ] T022 [P] [US2] Add integration test for narrowed result sets with ordering assertions in tests/integration/class-search.integration.test.js

### Implementation for User Story 2

- [ ] T023 [US2] Implement term override, subject, and course number filtering in src/services/class-search-service.js
- [ ] T024 [US2] Enforce deterministic ordering rules in src/models/class-offering-model.js
- [ ] T025 [US2] Add filter controls and selected-filter chips in src/views/class-search/index.html
- [ ] T026 [US2] Implement filter state management and reset behavior in public/js/class-search.js
- [ ] T027 [US2] Add no-results guidance panel for refined queries in src/views/class-search/index.html

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Receive Safe Feedback on Search Failures (Priority: P3)

**Goal**: Student receives clear error feedback on catalog failures and no stale
results are shown as current.

**Independent Test**: Execute `AT-UC13-02` from `Acceptance Tests/UC-13-AS.md`.

### Tests for User Story 3

- [ ] T028 [P] [US3] Add unit tests for timeout and service error mapping in tests/unit/class-search-service.test.js
- [ ] T029 [P] [US3] Add integration test ensuring failure response and no current stale results in tests/integration/class-search.integration.test.js

### Implementation for User Story 3

- [ ] T030 [US3] Implement service failure handling and error response model in src/services/class-search-service.js
- [ ] T031 [US3] Implement controller failure branch preserving read-only state in src/controllers/class-search-controller.js
- [ ] T032 [US3] Add UI error state and retry messaging in src/views/class-search/index.html
- [ ] T033 [US3] Implement stale-result labeling and timestamp display rules in public/js/class-search.js
- [ ] T034 [US3] Add stale/current visual state styles in public/css/class-search.css

**Checkpoint**: All user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening and compliance validation.

- [ ] T035 [P] Add validation tests for empty-query handling and input constraints in tests/unit/class-search-controller.test.js
- [ ] T036 Confirm contract alignment with specs/013-search-available-classes/contracts/class-search-api.yaml and src/routes/class-search-routes.js
- [ ] T037 [P] Verify style-guide compliance for modified HTML/CSS/JS files in src/views/class-search/index.html, public/css/class-search.css, and public/js/class-search.js
- [ ] T038 Document acceptance evidence for AT-UC13-01 and AT-UC13-02 in specs/013-search-available-classes/quickstart.md
- [ ] T039 Confirm protected files remain unchanged by checking Use Cases/UC-13.md and Acceptance Tests/UC-13-AS.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 -> no dependencies.
- Phase 2 -> depends on Phase 1 and blocks all user stories.
- Phase 3 (US1) -> depends on Phase 2.
- Phase 4 (US2) -> depends on Phase 2 and shared US1 search flow.
- Phase 5 (US3) -> depends on Phase 2 and shared request flow.
- Phase 6 -> depends on completed user stories.

### User Story Dependencies

- US1 is MVP and should be delivered first.
- US2 depends on base search pipeline from US1 but remains independently testable.
- US3 depends on base search pipeline from US1 but remains independently testable.

### Parallel Opportunities

- T003 and T004 can run in parallel after T001-T002.
- T007 and T008 can run in parallel after T006.
- T013 and T014 can run in parallel.
- T021 and T022 can run in parallel.
- T028 and T029 can run in parallel.
- T035 and T037 can run in parallel in polish phase.

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate `AT-UC13-01`.

### Incremental Delivery

1. Add US2 and validate deterministic filter + ordering behavior.
2. Add US3 and validate `AT-UC13-02` failure behavior.
3. Complete polish tasks and compliance checks.
