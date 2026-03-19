# Tasks: Financial Information Dashboard

**Input**: Design documents from `/Users/ahsanmansoor/ECE493Group19/specs/009-view-financial-dashboard/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Contract and integration tests are included because plan/research/quickstart explicitly require acceptance alignment and automated validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project at repository root: `src/`, `tests/`
- Documentation and planning in `/Users/ahsanmansoor/ECE493Group19/specs/009-view-financial-dashboard/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline repo structure

- [ ] T001 Create MVC directory structure in /Users/ahsanmansoor/ECE493Group19/src/{models,controllers,services,views/dashboard,routes}
- [ ] T002 Create test directory structure in /Users/ahsanmansoor/ECE493Group19/tests/{contract,integration,unit}
- [ ] T003 Initialize Node.js project metadata and scripts in /Users/ahsanmansoor/ECE493Group19/package.json
- [ ] T004 [P] Add runtime and test dependencies (Express, sqlite3, Vitest, supertest) in /Users/ahsanmansoor/ECE493Group19/package.json
- [ ] T005 [P] Add lint/style tooling configuration in /Users/ahsanmansoor/ECE493Group19/.eslintrc.json and /Users/ahsanmansoor/ECE493Group19/.prettierrc
- [ ] T006 Map feature traceability references (UC-09/UC-09-AS, UC-02/UC-03 support) in /Users/ahsanmansoor/ECE493Group19/specs/009-view-financial-dashboard/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create SQLite schema and migration script for StudentAccount, DashboardModule, ModuleAssignment, FinancialSummarySnapshot, and ModuleAvailability in /Users/ahsanmansoor/ECE493Group19/src/models/schema.sql
- [ ] T008 [P] Implement SQLite connection and repository bootstrap in /Users/ahsanmansoor/ECE493Group19/src/models/db.js
- [ ] T009 [P] Implement authentication/session guard middleware for dashboard routes in /Users/ahsanmansoor/ECE493Group19/src/services/auth-guard.js
- [ ] T010 Implement base dashboard route wiring and controller entrypoints in /Users/ahsanmansoor/ECE493Group19/src/routes/dashboard-routes.js and /Users/ahsanmansoor/ECE493Group19/src/controllers/dashboard-controller.js
- [ ] T011 [P] Implement centralized error/degradation response helpers in /Users/ahsanmansoor/ECE493Group19/src/services/dashboard-error-policy.js
- [ ] T012 [P] Add protected-artifact change guard check for Use Cases and Acceptance Tests in /Users/ahsanmansoor/ECE493Group19/scripts/protected-artifacts-check.sh
- [ ] T013 Add style-guide compliance npm scripts and CI hooks in /Users/ahsanmansoor/ECE493Group19/package.json and /Users/ahsanmansoor/ECE493Group19/.github/workflows/ci.yml

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Financial Dashboard (Priority: P1) 🎯 MVP

**Goal**: Show a student financial-priority dashboard after login with navigation to all permitted modules

**Independent Test**: Log in as a valid student with assigned modules and confirm dashboard shell, prioritized financial section, and navigation to permitted modules all appear.

### Tests for User Story 1

- [ ] T014 [P] [US1] Add contract test for GET /api/dashboard in /Users/ahsanmansoor/ECE493Group19/tests/contract/dashboard-contract.test.js
- [ ] T015 [P] [US1] Add contract test for GET /api/dashboard/modules in /Users/ahsanmansoor/ECE493Group19/tests/contract/dashboard-contract.test.js
- [ ] T016 [P] [US1] Add integration test for successful login-to-dashboard flow (AT-UC09-01 alignment) in /Users/ahsanmansoor/ECE493Group19/tests/integration/dashboard-flow.test.js

### Implementation for User Story 1

- [ ] T017 [P] [US1] Implement StudentAccount and DashboardModule model accessors in /Users/ahsanmansoor/ECE493Group19/src/models/student-account.js and /Users/ahsanmansoor/ECE493Group19/src/models/dashboard-module.js
- [ ] T018 [P] [US1] Implement ModuleAssignment model accessors for permitted-module resolution in /Users/ahsanmansoor/ECE493Group19/src/models/module-assignment.js
- [ ] T019 [US1] Implement role-module resolution service for permitted navigation in /Users/ahsanmansoor/ECE493Group19/src/services/role-module-service.js
- [ ] T020 [US1] Implement main dashboard controller logic for full dashboard responses in /Users/ahsanmansoor/ECE493Group19/src/controllers/dashboard-controller.js
- [ ] T021 [US1] Implement dashboard and module endpoints from contract in /Users/ahsanmansoor/ECE493Group19/src/routes/dashboard-routes.js
- [ ] T022 [US1] Build financial-priority dashboard view template with permitted navigation rendering in /Users/ahsanmansoor/ECE493Group19/src/views/dashboard/index.html

**Checkpoint**: User Story 1 should be fully functional and independently testable

---

## Phase 4: User Story 2 - Handle Missing Role Assignments (Priority: P2)

**Goal**: Show a minimal dashboard and admin-contact message when no roles/modules are assigned

**Independent Test**: Log in as a valid student with no assigned modules and confirm minimal dashboard shell and admin-contact message are displayed.

### Tests for User Story 2

- [ ] T023 [P] [US2] Add contract assertion for minimal dashboard response shape (dashboardType=minimal) in /Users/ahsanmansoor/ECE493Group19/tests/contract/dashboard-contract.test.js
- [ ] T024 [P] [US2] Add integration test for no-assignment flow (AT-UC09-02 alignment) in /Users/ahsanmansoor/ECE493Group19/tests/integration/dashboard-flow.test.js

### Implementation for User Story 2

- [ ] T025 [US2] Implement no-assignment branch in role-module service to return unassigned state in /Users/ahsanmansoor/ECE493Group19/src/services/role-module-service.js
- [ ] T026 [US2] Implement minimal-dashboard controller response including admin-contact message in /Users/ahsanmansoor/ECE493Group19/src/controllers/dashboard-controller.js
- [ ] T027 [US2] Build minimal-dashboard view fragment and message component in /Users/ahsanmansoor/ECE493Group19/src/views/dashboard/minimal-state.html
- [ ] T028 [US2] Integrate minimal-state rendering with dashboard route/view selection in /Users/ahsanmansoor/ECE493Group19/src/routes/dashboard-routes.js and /Users/ahsanmansoor/ECE493Group19/src/views/dashboard/index.html
- [ ] T029 [US2] Add CSS style-guide-compliant presentation rules for minimal state messaging in /Users/ahsanmansoor/ECE493Group19/src/views/dashboard/dashboard.css

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Handle Partial Data Unavailability (Priority: P3)

**Goal**: Render a partial dashboard with unavailable indicators and stale financial values with timestamp when live data fails

**Independent Test**: Simulate one or more dashboard data source failures and confirm partial dashboard rendering, unavailable section indicators, and stale-value timestamped fallback.

### Tests for User Story 3

- [ ] T030 [P] [US3] Add contract test for GET /api/dashboard/financial-summary live/stale response states in /Users/ahsanmansoor/ECE493Group19/tests/contract/dashboard-contract.test.js
- [ ] T031 [P] [US3] Add integration test for partial-data degraded flow (AT-UC09-03 alignment) in /Users/ahsanmansoor/ECE493Group19/tests/integration/dashboard-flow.test.js

### Implementation for User Story 3

- [ ] T032 [P] [US3] Implement FinancialSummarySnapshot model and stale snapshot retrieval in /Users/ahsanmansoor/ECE493Group19/src/models/financial-summary-item.js
- [ ] T033 [P] [US3] Implement ModuleAvailability model and unavailable reason tracking in /Users/ahsanmansoor/ECE493Group19/src/models/module-availability.js
- [ ] T034 [US3] Implement financial dashboard service fallback logic (live to stale transitions) in /Users/ahsanmansoor/ECE493Group19/src/services/financial-dashboard-service.js
- [ ] T035 [US3] Implement financial-summary endpoint with stale notice/timestamp output in /Users/ahsanmansoor/ECE493Group19/src/controllers/dashboard-controller.js
- [ ] T036 [US3] Build partial-state view fragment with unavailable section indicators in /Users/ahsanmansoor/ECE493Group19/src/views/dashboard/partial-state.html
- [ ] T037 [US3] Integrate partial-state rendering and recovery signaling in /Users/ahsanmansoor/ECE493Group19/src/routes/dashboard-routes.js and /Users/ahsanmansoor/ECE493Group19/src/views/dashboard/index.html

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T038 [P] Update contract documentation and endpoint examples in /Users/ahsanmansoor/ECE493Group19/specs/009-view-financial-dashboard/contracts/dashboard.openapi.yaml
- [ ] T039 [P] Update quickstart validation steps with exact local run commands in /Users/ahsanmansoor/ECE493Group19/specs/009-view-financial-dashboard/quickstart.md
- [ ] T040 Run full test/lint/style suite and record results in /Users/ahsanmansoor/ECE493Group19/specs/009-view-financial-dashboard/implementation-validation.md
- [ ] T041 [P] Add regression test coverage for own-data-only boundary (no cross-student leakage) in /Users/ahsanmansoor/ECE493Group19/tests/integration/dashboard-flow.test.js
- [ ] T042 Verify protected use-case and acceptance artifacts remain unchanged and log outcome in /Users/ahsanmansoor/ECE493Group19/specs/009-view-financial-dashboard/implementation-validation.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependency Graph

- **US1 (P1)**: Starts after Phase 2 and defines MVP dashboard behavior
- **US2 (P2)**: Starts after Phase 2; reuses US1 routing/controller surface but remains independently testable via no-assignment scenario
- **US3 (P3)**: Starts after Phase 2; reuses US1 shell and extends with degraded/stale-data behavior

Graph:
`Foundation -> US1 -> Polish`
`Foundation -> US2 -> Polish`
`Foundation -> US3 -> Polish`

### Within Each User Story

- Contract/integration tests before implementation tasks
- Models before services
- Services before controller/route integration
- Controller/route integration before view polish

### Parallel Opportunities

- Setup: T004, T005 can run in parallel after T003
- Foundational: T008, T009, T011, T012 can run in parallel after T007
- US1: T014, T015, T016, T017, T018 can run in parallel initially
- US2: T023 and T024 parallel; T027 and T029 parallel after T026
- US3: T030 and T031 parallel; T032 and T033 parallel before T034
- Polish: T038, T039, T041 can run in parallel before final validation tasks

---

## Parallel Example: User Story 1

```bash
Task: "T014 [US1] Add contract test for GET /api/dashboard in /Users/ahsanmansoor/ECE493Group19/tests/contract/dashboard-contract.test.js"
Task: "T015 [US1] Add contract test for GET /api/dashboard/modules in /Users/ahsanmansoor/ECE493Group19/tests/contract/dashboard-contract.test.js"
Task: "T016 [US1] Add integration test for successful login-to-dashboard flow in /Users/ahsanmansoor/ECE493Group19/tests/integration/dashboard-flow.test.js"
Task: "T017 [US1] Implement StudentAccount and DashboardModule model accessors in /Users/ahsanmansoor/ECE493Group19/src/models/student-account.js and /Users/ahsanmansoor/ECE493Group19/src/models/dashboard-module.js"
Task: "T018 [US1] Implement ModuleAssignment model accessors in /Users/ahsanmansoor/ECE493Group19/src/models/module-assignment.js"
```

## Parallel Example: User Story 2

```bash
Task: "T023 [US2] Add minimal-dashboard contract assertion in /Users/ahsanmansoor/ECE493Group19/tests/contract/dashboard-contract.test.js"
Task: "T024 [US2] Add no-assignment integration test in /Users/ahsanmansoor/ECE493Group19/tests/integration/dashboard-flow.test.js"
Task: "T027 [US2] Build minimal-dashboard view fragment in /Users/ahsanmansoor/ECE493Group19/src/views/dashboard/minimal-state.html"
Task: "T029 [US2] Add minimal-state CSS rules in /Users/ahsanmansoor/ECE493Group19/src/views/dashboard/dashboard.css"
```

## Parallel Example: User Story 3

```bash
Task: "T030 [US3] Add financial-summary contract test in /Users/ahsanmansoor/ECE493Group19/tests/contract/dashboard-contract.test.js"
Task: "T031 [US3] Add partial-data integration test in /Users/ahsanmansoor/ECE493Group19/tests/integration/dashboard-flow.test.js"
Task: "T032 [US3] Implement FinancialSummarySnapshot model in /Users/ahsanmansoor/ECE493Group19/src/models/financial-summary-item.js"
Task: "T033 [US3] Implement ModuleAvailability model in /Users/ahsanmansoor/ECE493Group19/src/models/module-availability.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate against AT-UC09-01 flow
5. Demo MVP financial-priority dashboard

### Incremental Delivery

1. Setup + Foundational complete
2. Deliver US1 (main success path)
3. Deliver US2 (no-assignment minimal dashboard)
4. Deliver US3 (partial-data degradation and stale fallback)
5. Run Phase 6 polish and validation

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. Then parallelize by story:
   - Developer A: US1 core dashboard
   - Developer B: US2 no-assignment flow
   - Developer C: US3 degraded/stale-data flow
3. Re-converge for polish, regression, and validation

## Notes

- [P] tasks indicate safe parallel execution on independent files or independent assertions.
- [USx] labels map each task to a specific user story for traceability.
- All tasks include explicit file paths and are ready for direct execution.
