# Tasks: User Login Authentication

**Input**: Design documents from `/specs/002-user-login/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/login-auth.yaml`, `quickstart.md`

**Tests**: Include unit, integration, and E2E tests because testing is explicitly required by the feature specification and plan.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- `[P]` marks tasks that can run in parallel (different files, no unfinished dependencies)
- `[Story]` labels are used only for user story tasks (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project skeleton and tooling needed by all stories.

- [X] T001 Initialize Node.js project metadata and scripts in `/home/m_srnic/ece493/group_project/ECE493Group19/package.json`
- [X] T002 Add runtime and test dependencies to `/home/m_srnic/ece493/group_project/ECE493Group19/package.json` for `express`, `express-session`, `better-sqlite3`, `bcrypt`, `supertest`, and `playwright`
- [X] T003 [P] Create MVC and test directory skeleton by adding `.gitkeep` placeholders in `/home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/.gitkeep`, `/home/m_srnic/ece493/group_project/ECE493Group19/src/models/.gitkeep`, `/home/m_srnic/ece493/group_project/ECE493Group19/src/services/.gitkeep`, `/home/m_srnic/ece493/group_project/ECE493Group19/src/views/.gitkeep`, `/home/m_srnic/ece493/group_project/ECE493Group19/src/db/migrations/.gitkeep`, `/home/m_srnic/ece493/group_project/ECE493Group19/public/css/.gitkeep`, `/home/m_srnic/ece493/group_project/ECE493Group19/public/js/.gitkeep`, `/home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/.gitkeep`, `/home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/.gitkeep`, and `/home/m_srnic/ece493/group_project/ECE493Group19/tests/e2e/.gitkeep`
- [X] T004 [P] Create Express application bootstrap and server export in `/home/m_srnic/ece493/group_project/ECE493Group19/src/app.js`
- [X] T005 [P] Create shared SQLite connection helper in `/home/m_srnic/ece493/group_project/ECE493Group19/src/db/connection.js`
- [X] T006 Add repository-level traceability note for UC-02 artifacts in `/home/m_srnic/ece493/group_project/ECE493Group19/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build common authentication/data infrastructure required before story implementation.

**⚠️ CRITICAL**: Complete this phase before starting user story tasks.

- [X] T007 Implement baseline SQLite schema for `accounts`, `courses`, `account_courses`, `login_attempts`, and `user_sessions` in `/home/m_srnic/ece493/group_project/ECE493Group19/src/db/schema.sql`
- [X] T008 Create schema apply/migration runner for `sis.db` in `/home/m_srnic/ece493/group_project/ECE493Group19/src/db/migrations/apply-schema.js`
- [X] T009 [P] Implement Express session middleware configuration in `/home/m_srnic/ece493/group_project/ECE493Group19/src/middleware/session-middleware.js`
- [X] T010 [P] Implement authentication guard middleware for dashboard protection in `/home/m_srnic/ece493/group_project/ECE493Group19/src/middleware/require-auth.js`
- [X] T011 [P] Create route wiring module for `/login` and `/dashboard` in `/home/m_srnic/ece493/group_project/ECE493Group19/src/routes/auth-routes.js`
- [X] T012 Implement shared login outcome constants aligned to contract enum values in `/home/m_srnic/ece493/group_project/ECE493Group19/src/services/login-outcomes.js`
- [X] T013 Configure centralized auth error logging helper in `/home/m_srnic/ece493/group_project/ECE493Group19/src/services/auth-audit-service.js`

**Checkpoint**: Foundation complete; user stories can start with no inter-story blocking.

---

## Phase 3: User Story 1 - Sign In Successfully (Priority: P1) 🎯 MVP

**Goal**: Let active users sign in with valid credentials, create session state, and reach dashboard.

**Independent Test**: Submit valid credentials and verify redirect to `/dashboard`, session creation, and authenticated dashboard rendering.

### Tests for User Story 1

- [X] T014 [P] [US1] Add integration test for `POST /login` success redirect and session cookie in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/login-success.test.js`
- [X] T015 [P] [US1] Add integration test for authenticated `GET /dashboard` access in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/dashboard-authenticated.test.js`
- [X] T016 [P] [US1] Add E2E happy-path login journey test in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/e2e/login-success.spec.js`

### Implementation for User Story 1

- [X] T017 [P] [US1] Implement account lookup and status read operations in `/home/m_srnic/ece493/group_project/ECE493Group19/src/models/account-model.js`
- [X] T018 [P] [US1] Implement user session create/read operations in `/home/m_srnic/ece493/group_project/ECE493Group19/src/models/session-model.js`
- [X] T019 [US1] Implement credential verification and success-session orchestration in `/home/m_srnic/ece493/group_project/ECE493Group19/src/services/auth-service.js`
- [X] T020 [US1] Implement `GET /login`, `POST /login` success path, and login redirect behavior in `/home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/auth-controller.js`
- [X] T021 [US1] Implement dashboard rendering controller in `/home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/dashboard-controller.js`
- [X] T022 [P] [US1] Create login form view with identifier/password fields in `/home/m_srnic/ece493/group_project/ECE493Group19/src/views/login.html`
- [X] T023 [P] [US1] Create authenticated dashboard view in `/home/m_srnic/ece493/group_project/ECE493Group19/src/views/dashboard.html`
- [X] T024 [P] [US1] Add login page styles in `/home/m_srnic/ece493/group_project/ECE493Group19/public/css/login.css`
- [X] T025 [P] [US1] Add login form client behavior for field validation/submit UX in `/home/m_srnic/ece493/group_project/ECE493Group19/public/js/login.js`

**Checkpoint**: User Story 1 is independently functional and demo-ready.

---

## Phase 4: User Story 2 - Recover from Invalid Credentials (Priority: P2)

**Goal**: Deny invalid credentials, allow retries, and enforce temporary lockout after 5 failed attempts in 15 minutes.

**Independent Test**: Submit invalid credentials once to get retry feedback, then repeat to threshold and verify lockout response.

### Tests for User Story 2

- [X] T026 [P] [US2] Add integration test for invalid-credentials response and retry message in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/login-invalid-credentials.test.js`
- [X] T027 [P] [US2] Add integration test for lockout enforcement at 5 failed attempts in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/login-lockout-threshold.test.js`
- [X] T028 [P] [US2] Add unit test for lockout duration/reset rules in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/lockout-service.test.js`

### Implementation for User Story 2

- [X] T029 [P] [US2] Implement login attempt persistence operations in `/home/m_srnic/ece493/group_project/ECE493Group19/src/models/login-attempt-model.js`
- [X] T030 [US2] Implement lockout threshold, expiry, and failed-attempt reset policy in `/home/m_srnic/ece493/group_project/ECE493Group19/src/services/lockout-service.js`
- [X] T031 [US2] Update authentication service invalid-credential flow with attempt tracking and lock-state transitions in `/home/m_srnic/ece493/group_project/ECE493Group19/src/services/auth-service.js`
- [X] T032 [US2] Update login controller to return `401` for invalid credentials and `423` for temporary lockout per contract in `/home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/auth-controller.js`
- [X] T033 [US2] Update login view error regions for invalid and locked account messaging in `/home/m_srnic/ece493/group_project/ECE493Group19/src/views/login.html`

**Checkpoint**: User Story 2 is independently testable with invalid/retry/lockout behavior.

---

## Phase 5: User Story 3 - Handle Unavailable or Restricted Access (Priority: P3)

**Goal**: Deny locked/disabled/outage requests with clear guidance and audit failure events.

**Independent Test**: Simulate disabled account and auth-service outage; verify denial, message specificity, and failure logging.

### Tests for User Story 3

- [X] T034 [P] [US3] Add integration test for disabled-account denial guidance on `POST /login` in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/login-disabled-account.test.js`
- [X] T035 [P] [US3] Add integration test for authentication-service-unavailable `503` response and no session creation in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/login-service-unavailable.test.js`
- [X] T036 [P] [US3] Add unit test for outage failure logging behavior in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/auth-audit-service.test.js`
- [X] T046 [P] [US3] Add integration test for locked-account denial with valid credentials in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/login-locked-account.test.js`

### Implementation for User Story 3

- [X] T037 [US3] Implement disabled/locked pre-check query helpers in `/home/m_srnic/ece493/group_project/ECE493Group19/src/models/account-model.js`
- [X] T038 [US3] Implement auth-service unavailable error mapping and denial flow in `/home/m_srnic/ece493/group_project/ECE493Group19/src/services/auth-service.js`
- [X] T039 [US3] Record failure outcomes (`locked`, `disabled`, `service_unavailable`) in `/home/m_srnic/ece493/group_project/ECE493Group19/src/services/auth-audit-service.js`
- [X] T040 [US3] Update login controller to return `403` for disabled accounts and `503` for auth outages in `/home/m_srnic/ece493/group_project/ECE493Group19/src/controllers/auth-controller.js`
- [X] T041 [US3] Update login guidance copy for disabled and service-unavailable states in `/home/m_srnic/ece493/group_project/ECE493Group19/src/views/login.html`

**Checkpoint**: User Story 3 independently handles restricted and outage scenarios.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, compliance checks, and end-to-end validation.

- [X] T042 [P] Add representative seed data for active, locked, and disabled accounts plus course records in `/home/m_srnic/ece493/group_project/ECE493Group19/src/db/migrations/seed-login-fixtures.js`
- [X] T043 Verify Google style-guide compliance for modified HTML/CSS in `/home/m_srnic/ece493/group_project/ECE493Group19/src/views/login.html` and `/home/m_srnic/ece493/group_project/ECE493Group19/public/css/login.css`
- [X] T044 Run full validation commands (`npm test && npm run lint`) and record results in `/home/m_srnic/ece493/group_project/ECE493Group19/specs/002-user-login/quickstart.md`
- [X] T045 Validate no modifications to protected artifacts in `/home/m_srnic/ece493/group_project/ECE493Group19/Use Cases/UC-02.md` and `/home/m_srnic/ece493/group_project/ECE493Group19/Acceptance Tests/UC-02-AS.md`
- [X] T047 [P] Add login performance integration benchmark for SC-001 in `/home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/login-performance.test.js`
- [X] T048 Record SC-001 benchmark evidence and pass/fail threshold results in `/home/m_srnic/ece493/group_project/ECE493Group19/specs/002-user-login/quickstart.md`
- [X] T049 Define SC-005 post-release measurement procedure and reporting template in `/home/m_srnic/ece493/group_project/ECE493Group19/specs/002-user-login/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies.
- Foundational (Phase 2): Depends on Setup; blocks story phases.
- User Story phases (Phase 3-5): Depend only on Foundational completion.
- Polish (Phase 6): Depends on completion of desired story phases.

### User Story Dependencies

- US1 (P1): Starts after Foundational; no dependency on US2 or US3.
- US2 (P2): Starts after Foundational; no dependency on US1 or US3.
- US3 (P3): Starts after Foundational; no dependency on US1 or US2.

### Dependency Graph

- Foundation path: `Phase 1 -> Phase 2`
- Story path options after foundation: `Phase 2 -> US1`, `Phase 2 -> US2`, `Phase 2 -> US3`
- Finalization: `US1/US2/US3 (as selected) -> Phase 6`

### Blocking Dependency Resolution

- Removed cross-story blocking by keeping shared prerequisites in Phase 2 only.
- Kept story-specific logic and tests inside each story phase.
- Ensured no task in US2 or US3 requires completion of US1 tasks.

---

## Parallel Execution Examples

### User Story 1

```bash
Task: "T014 [US1] integration success redirect test in tests/integration/login-success.test.js"
Task: "T015 [US1] integration dashboard access test in tests/integration/dashboard-authenticated.test.js"
Task: "T016 [US1] e2e happy-path login test in tests/e2e/login-success.spec.js"
```

```bash
Task: "T017 [US1] account model operations in src/models/account-model.js"
Task: "T018 [US1] session model operations in src/models/session-model.js"
Task: "T022 [US1] login view in src/views/login.html"
Task: "T023 [US1] dashboard view in src/views/dashboard.html"
Task: "T024 [US1] login styles in public/css/login.css"
Task: "T025 [US1] login client script in public/js/login.js"
```

### User Story 2

```bash
Task: "T026 [US2] invalid credentials integration test in tests/integration/login-invalid-credentials.test.js"
Task: "T027 [US2] lockout threshold integration test in tests/integration/login-lockout-threshold.test.js"
Task: "T028 [US2] lockout unit test in tests/unit/lockout-service.test.js"
Task: "T029 [US2] login attempt model in src/models/login-attempt-model.js"
```

### User Story 3

```bash
Task: "T034 [US3] disabled-account integration test in tests/integration/login-disabled-account.test.js"
Task: "T035 [US3] service-unavailable integration test in tests/integration/login-service-unavailable.test.js"
Task: "T036 [US3] auth audit unit test in tests/unit/auth-audit-service.test.js"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational prerequisites.
3. Complete Phase 3 (US1) and validate independent test criteria.
4. Demo/deploy MVP after US1 passes tests.

### Incremental Delivery

1. Foundation: complete Phases 1-2 once.
2. Deliver US1, then US2, then US3 in priority order, validating each independently.
3. Execute Phase 6 polish checks before release.

### Parallel Team Strategy

1. Team completes Phases 1-2 together.
2. After Phase 2, developers split by story (`US1`, `US2`, `US3`) with no cross-story blockers.
3. Merge completed stories and finish Phase 6.

---

## Notes

- All checklist entries follow the required format: `- [X] T### [P?] [Story?] Description with file path`.
- `[Story]` labels are present on all user story tasks and omitted for setup/foundational/polish.
- Tasks are concrete and executable by an LLM without extra context.
