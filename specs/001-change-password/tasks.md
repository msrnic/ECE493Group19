# Tasks: Password Change Flow

**Input**: Design documents from `/specs/001-change-password/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/password-change-api.yaml`, `quickstart.md`

**Tests**: Include unit, integration, contract, and acceptance coverage because testing expectations are explicitly defined in the feature plan and quickstart.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align project wiring, tooling, and feature scaffolding.

- [ ] T001 Add password-change feature route mounts in /home/m_srnic/ece493/group_project/ECE493Group19/app/routes/index.js
- [ ] T002 Add security feature configuration defaults in /home/m_srnic/ece493/group_project/ECE493Group19/app/config/security-config.js
- [ ] T003 [P] Add password-change test data seed helpers in /home/m_srnic/ece493/group_project/ECE493Group19/tests/helpers/password-change-seeds.js
- [ ] T004 [P] Add password-change fixture reset helper in /home/m_srnic/ece493/group_project/ECE493Group19/tests/helpers/reset-password-change-fixtures.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared persistence and service foundations required by all stories.

- [ ] T005 Create password feature migration for cooldown, attempts, sessions, and notifications tables in /home/m_srnic/ece493/group_project/ECE493Group19/db/migrations/001_change_password.sql
- [ ] T006 [P] Register migration in migration loader in /home/m_srnic/ece493/group_project/ECE493Group19/db/migrations/index.js
- [ ] T007 [P] Implement password change attempt persistence model in /home/m_srnic/ece493/group_project/ECE493Group19/app/models/password-change-model.js
- [ ] T008 [P] Implement verification cooldown persistence model in /home/m_srnic/ece493/group_project/ECE493Group19/app/models/verification-cooldown-model.js
- [ ] T009 [P] Implement session invalidation persistence model in /home/m_srnic/ece493/group_project/ECE493Group19/app/models/session-model.js
- [ ] T010 [P] Implement password-change notification persistence model in /home/m_srnic/ece493/group_project/ECE493Group19/app/models/notification-model.js
- [ ] T011 Implement reusable password policy validator service in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/password-policy-service.js
- [ ] T012 Implement reusable progressive cooldown service in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/cooldown-service.js
- [ ] T013 Implement reusable session invalidation service in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/session-service.js
- [ ] T014 Implement reusable user notification service in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/notification-service.js

**Checkpoint**: Foundational services and storage are ready; user stories can proceed independently.

---

## Phase 3: User Story 1 - Change Password from Settings (Priority: P1) 🎯 MVP

**Goal**: Authenticated user changes their password from account security settings; authorized admins can change another user's password.

**Independent Test**: Sign in as a user and change password with current password verification, then sign in as admin and change a target user's password, verifying success messaging, session invalidation rules, and notification creation.

### Tests for User Story 1

- [ ] T015 [P] [US1] Add contract test for `POST /account/security/password-change` in /home/m_srnic/ece493/group_project/ECE493Group19/tests/contract/password-change-self-service.contract.test.js
- [ ] T016 [P] [US1] Add contract test for `POST /admin/users/{userId}/password` in /home/m_srnic/ece493/group_project/ECE493Group19/tests/contract/password-change-admin.contract.test.js
- [ ] T017 [P] [US1] Add integration test for successful self-service password change in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/change-password-self-service.test.js
- [ ] T018 [P] [US1] Add integration test for successful admin password change in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/change-password-admin.test.js
- [ ] T019 [P] [US1] Add unit test for session invalidation behavior preserving current session in /home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/session-service.test.js

### Implementation for User Story 1

- [ ] T020 [US1] Implement self-service password change orchestration in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/password-change-service.js
- [ ] T021 [US1] Implement admin-initiated password change orchestration in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/admin-password-change-service.js
- [ ] T022 [US1] Implement self-service password change controller action in /home/m_srnic/ece493/group_project/ECE493Group19/app/controllers/auth-controller.js
- [ ] T023 [US1] Implement admin password reset controller action with RBAC enforcement in /home/m_srnic/ece493/group_project/ECE493Group19/app/controllers/admin-password-controller.js
- [ ] T024 [US1] Add account security password-change form view in /home/m_srnic/ece493/group_project/ECE493Group19/app/views/security/change-password.html
- [ ] T025 [US1] Add admin reset-user-password form view in /home/m_srnic/ece493/group_project/ECE493Group19/app/views/admin/reset-user-password.html
- [ ] T026 [US1] Add client-side self-service submit handling and CSRF wiring in /home/m_srnic/ece493/group_project/ECE493Group19/app/public/js/change-password.js
- [ ] T027 [US1] Add client-side admin reset submit handling and CSRF wiring in /home/m_srnic/ece493/group_project/ECE493Group19/app/public/js/admin-reset-password.js
- [ ] T028 [US1] Add password change styles for self-service and admin forms in /home/m_srnic/ece493/group_project/ECE493Group19/app/public/css/security.css
- [ ] T029 [US1] Add success result rendering for password-change completion in /home/m_srnic/ece493/group_project/ECE493Group19/app/views/security/change-password-result.html

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Recover via Reset Token (Priority: P2)

**Goal**: User sets a new password using a valid reset token without current password input.

**Independent Test**: Open reset-password flow with a valid token and submit a compliant password for success; retry with expired/invalid token and verify rejection plus recovery options.

### Tests for User Story 2

- [ ] T030 [P] [US2] Add contract test for `POST /auth/reset-password/confirm` in /home/m_srnic/ece493/group_project/ECE493Group19/tests/contract/password-change-reset-token.contract.test.js
- [ ] T031 [P] [US2] Add integration test for successful token-based password reset in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/change-password-reset-token-success.test.js
- [ ] T032 [P] [US2] Add integration test for expired or invalid reset token rejection in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/change-password-reset-token-failure.test.js

### Implementation for User Story 2

- [ ] T033 [US2] Implement reset token verification and consume-on-success model logic in /home/m_srnic/ece493/group_project/ECE493Group19/app/models/reset-token-model.js
- [ ] T034 [US2] Implement token-based password change orchestration in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/reset-token-password-change-service.js
- [ ] T035 [US2] Implement reset-password confirmation controller action in /home/m_srnic/ece493/group_project/ECE493Group19/app/controllers/auth-controller.js
- [ ] T036 [US2] Add reset-password form and token error messaging view in /home/m_srnic/ece493/group_project/ECE493Group19/app/views/security/reset-password.html
- [ ] T037 [US2] Add reset-password client-side submission behavior in /home/m_srnic/ece493/group_project/ECE493Group19/app/public/js/change-password.js

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Handle Validation, Errors, and Cancellation (Priority: P3)

**Goal**: Users receive clear policy/error/cancellation feedback with no unintended password updates.

**Independent Test**: Trigger policy violations, cooldown blocks, and simulated system failures; cancel before submit; verify unchanged password state and correct user-facing guidance.

### Tests for User Story 3

- [ ] T038 [P] [US3] Add integration test for password policy rejection feedback in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/change-password-policy-errors.test.js
- [ ] T039 [P] [US3] Add integration test for progressive cooldown and retry-after messaging in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/change-password-cooldown.test.js
- [ ] T040 [P] [US3] Add integration test for system failure rollback preserving existing password in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/change-password-system-failure.test.js
- [ ] T041 [P] [US3] Add acceptance test for cancellation behavior with no persisted changes in /home/m_srnic/ece493/group_project/ECE493Group19/tests/acceptance/change-password-cancel.spec.js

### Implementation for User Story 3

- [ ] T042 [US3] Implement requirement-specific policy failure response mapping in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/password-policy-service.js
- [ ] T043 [US3] Implement cooldown block response mapping with retry-after values in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/cooldown-service.js
- [ ] T044 [US3] Implement transactional rollback guard for password update failures in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/password-change-service.js
- [ ] T045 [US3] Implement cancel action handler that discards unsaved form inputs in /home/m_srnic/ece493/group_project/ECE493Group19/app/public/js/change-password.js
- [ ] T046 [US3] Add validation, cooldown, and system-error message rendering states in /home/m_srnic/ece493/group_project/ECE493Group19/app/views/security/change-password-result.html

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete release hardening and full-flow verification across stories.

- [ ] T047 [P] Update quickstart verification notes with concrete command examples in /home/m_srnic/ece493/group_project/ECE493Group19/specs/001-change-password/quickstart.md
- [ ] T048 Run full password-change automated suite command updates in /home/m_srnic/ece493/group_project/ECE493Group19/package.json
- [ ] T049 [P] Add security-focused structured logging fields for password-change outcomes in /home/m_srnic/ece493/group_project/ECE493Group19/app/services/password-change-service.js
- [ ] T050 Run end-to-end quickstart checklist capture in /home/m_srnic/ece493/group_project/ECE493Group19/specs/001-change-password/tasks.md
- [ ] T051 Add UC-to-acceptance traceability evidence for UC-01-AS and UC-43-AS in /home/m_srnic/ece493/group_project/ECE493Group19/tests/acceptance/uc-password-change-traceability.md
- [ ] T052 Add explicit style-guide lint/check commands for HTML/CSS/JS in /home/m_srnic/ece493/group_project/ECE493Group19/package.json
- [ ] T053 [P] Add integration test asserting admin flow does not require target current-password or reset-token fields in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/change-password-admin-no-target-verification.test.js
- [ ] T054 [P] Add performance integration test to verify valid submission responses meet 5-second target in /home/m_srnic/ece493/group_project/ECE493Group19/tests/integration/change-password-performance.test.js
- [ ] T055 [P] Add acceptance timing scenario to measure sub-2-minute happy-path completion in /home/m_srnic/ece493/group_project/ECE493Group19/tests/acceptance/change-password-timing.spec.js
- [ ] T056 Add post-release support-contact metric collection plan for SC-006 in /home/m_srnic/ece493/group_project/ECE493Group19/specs/001-change-password/support-metrics.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: no dependencies.
- **Phase 2 (Foundational)**: depends on Phase 1 and is the only blocking phase.
- **Phase 3 (US1), Phase 4 (US2), Phase 5 (US3)**: each depends only on Phase 2 completion and has no dependency on other user stories.
- **Phase 6 (Polish)**: depends on completion of any stories being released.

### User Story Dependencies

- **US1**: No dependency on US2 or US3.
- **US2**: No dependency on US1 or US3.
- **US3**: No dependency on US1 or US2.

### Blocking Dependency Resolution

- Cross-story dependencies were removed by assigning shared models/services to Phase 2.
- Story-specific controllers, views, client behavior, and tests are scoped within each story phase.
- Result: no blocking dependencies between user stories inside `tasks.md`.

### Parallel Opportunities

- Setup: T003 and T004 can run in parallel after T001-T002.
- Foundational: T006-T010 can run in parallel after T005.
- US1: T015-T019 can run in parallel; T024-T028 can run in parallel after service/controller tasks.
- US2: T030-T032 can run in parallel; T036-T037 can run in parallel after T035.
- US3: T038-T041 can run in parallel; T045-T046 can run in parallel after T042-T044.
- Polish: T053-T055 can run in parallel after T048.

---

## Parallel Example: User Story 1

```bash
# Run US1 contract and integration tests together
Task T015
Task T016
Task T017
Task T018
Task T019

# Build US1 views/assets together once controllers are in place
Task T024
Task T025
Task T026
Task T027
Task T028
```

## Parallel Example: User Story 2

```bash
# Run US2 tests together
Task T030
Task T031
Task T032

# Build US2 UI pieces together after controller logic
Task T036
Task T037
```

## Parallel Example: User Story 3

```bash
# Run US3 failure-path tests together
Task T038
Task T039
Task T040
Task T041

# Implement US3 UX feedback tasks together after services
Task T045
Task T046
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 and Phase 2.
2. Complete US1 tasks (Phase 3).
3. Validate US1 independently with T015-T019 before release.

### Incremental Delivery

1. Deliver US1 (MVP) after foundational readiness.
2. Deliver US2 reset-token recovery as independent increment.
3. Deliver US3 validation/error/cancellation hardening as independent increment.

### Parallel Team Strategy

1. Team completes Phases 1-2 together.
2. After Phase 2, assign separate developers to US1, US2, and US3 concurrently.
3. Merge and run Phase 6 hardening before final release.

---

## Notes

- All tasks use required checklist format: `- [ ] Txxx [P?] [US?] Description with file path`.
- Story labels are only applied to user-story phases.
- Task ordering enforces implementation flow without cross-story blockers.
