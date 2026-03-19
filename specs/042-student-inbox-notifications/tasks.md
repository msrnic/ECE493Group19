# Tasks: Student Inbox Notifications

**Input**: Design documents from `/specs/042-student-inbox-notifications/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Include unit, contract, integration, and E2E coverage because testing is explicitly required by plan.md/research.md/quickstart.md.

**Organization**: Tasks are grouped by user story so each story is independently implementable and testable after foundational tasks complete.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize feature scaffolding and quality gates.

- [ ] T001 Create feature route/view/module skeletons in `backend/src/routes/admin-notifications-routes.js`, `backend/src/controllers/admin-notifications-controller.js`, `backend/views/admin-notifications/compose.html`, and `backend/views/admin-notifications/summary.html`
- [ ] T002 [P] Add frontend asset entry points for this feature in `frontend/public/css/admin-notifications.css` and `frontend/public/js/admin-notifications.js`
- [ ] T003 [P] Add feature test placeholders in `backend/tests/contract/admin-notifications/.gitkeep`, `backend/tests/integration/admin-notifications/.gitkeep`, `backend/tests/unit/admin-notifications/.gitkeep`, and `backend/tests/e2e/admin-notifications/.gitkeep`
- [ ] T004 Add UC traceability note for UC-42/UC-42-AS in `specs/042-student-inbox-notifications/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data and service foundations required before user-story implementation.

- [ ] T005 Create SQLite migration for `notification_message`, `send_request`, and `delivery_attempt` tables in `backend/src/db/migrations/001_student_inbox_notifications.sql`
- [ ] T006 [P] Add indexes/constraints for dedupe, delivery lookup, and retry-window queries in `backend/src/db/migrations/001_student_inbox_notifications.sql`
- [ ] T007 Implement shared repository models for send/message/delivery persistence in `backend/src/models/send-request-model.js`, `backend/src/models/recipient-set-model.js`, and `backend/src/models/delivery-attempt-model.js`
- [ ] T008 [P] Implement shared authorization and policy settings service in `backend/src/services/authorization-service.js`
- [ ] T009 [P] Implement shared recipient resolution and deduplication service in `backend/src/services/recipient-resolution-service.js`
- [ ] T010 Add shared controller error mapping utilities for validation/auth/conflict responses in `backend/src/controllers/admin-notifications-controller.js`
- [ ] T011 [P] Add unit tests for foundational authorization/recipient-resolution rules in `backend/tests/unit/admin-notifications/authorization-service.test.js` and `backend/tests/unit/admin-notifications/recipient-resolution-service.test.js`
- [ ] T012 Register admin notifications routes with app router in `backend/src/routes/index.js`

**Checkpoint**: Foundation complete. US1, US2, and US3 can now proceed without blocking one another.

---

## Phase 3: User Story 1 - Send Notification to Selected Students (Priority: P1) 🎯 MVP

**Goal**: Authorized administrators can send valid notifications to resolved student recipients.

**Independent Test**: Authorized admin sends a valid message to individual/roster/group recipients and all targeted students receive one inbox message each.

### Tests for User Story 1

- [ ] T013 [P] [US1] Add contract test for `POST /api/admin/notifications/preview-recipients` success flow in `backend/tests/contract/admin-notifications/preview-recipients.contract.test.js`
- [ ] T014 [P] [US1] Add contract test for `POST /api/admin/notifications/send` accepted flow in `backend/tests/contract/admin-notifications/send.contract.test.js`
- [ ] T015 [P] [US1] Add integration test for successful send and deduplicated recipient metrics in `backend/tests/integration/admin-notifications/send-success.integration.test.js`
- [ ] T016 [P] [US1] Add Playwright scenario for admin compose-and-send happy path in `backend/tests/e2e/admin-notifications/send-success.e2e.spec.js`

### Implementation for User Story 1

- [ ] T017 [US1] Implement message content validation helpers (required/length checks) in `backend/src/services/message-validation-service.js`
- [ ] T018 [US1] Implement inbox delivery orchestration for per-recipient write and status update in `backend/src/services/inbox-delivery-service.js`
- [ ] T019 [US1] Implement preview recipients endpoint logic in `backend/src/controllers/admin-notifications-controller.js`
- [ ] T020 [US1] Implement send endpoint orchestration (resolve, authorize, persist, deliver, summarize) in `backend/src/controllers/admin-notifications-controller.js`
- [ ] T021 [US1] Wire preview/send endpoints and handlers in `backend/src/routes/admin-notifications-routes.js`
- [ ] T022 [US1] Build compose page form and recipient selectors in `backend/views/admin-notifications/compose.html`
- [ ] T023 [US1] Implement compose form client behavior for preview/send submission in `frontend/public/js/admin-notifications.js`
- [ ] T024 [US1] Add compose/summary styling for core send workflow in `frontend/public/css/admin-notifications.css`

**Checkpoint**: US1 is independently functional and demoable as MVP.

---

## Phase 4: User Story 2 - Prevent Invalid Send Attempts (Priority: P2)

**Goal**: Invalid recipient or message input is blocked with clear corrective guidance.

**Independent Test**: Send attempts with empty/invalid/unauthorized recipients or invalid content are blocked and return actionable errors.

### Tests for User Story 2

- [ ] T025 [P] [US2] Add contract tests for `POST /api/admin/notifications/preview-recipients` 400/403 responses in `backend/tests/contract/admin-notifications/preview-recipients-errors.contract.test.js`
- [ ] T026 [P] [US2] Add contract tests for `POST /api/admin/notifications/send` 400/403 responses in `backend/tests/contract/admin-notifications/send-errors.contract.test.js`
- [ ] T027 [P] [US2] Add integration tests for empty selection, unauthorized recipient, and invalid content blocking in `backend/tests/integration/admin-notifications/send-validation.integration.test.js`
- [ ] T028 [P] [US2] Add Playwright scenario for inline correction guidance on invalid send attempts in `backend/tests/e2e/admin-notifications/send-validation.e2e.spec.js`

### Implementation for User Story 2

- [ ] T029 [US2] Extend recipient resolution service to detect zero-active recipients and invalid roster/group selections in `backend/src/services/recipient-resolution-service.js`
- [ ] T030 [US2] Extend authorization service to enforce all-or-nothing unauthorized recipient blocking in `backend/src/services/authorization-service.js`
- [ ] T031 [US2] Extend controller validation/error payload mapping for recipient/content violations in `backend/src/controllers/admin-notifications-controller.js`
- [ ] T032 [US2] Implement UI error-summary rendering and field-level feedback behavior in `frontend/public/js/admin-notifications.js`
- [ ] T033 [US2] Add styles for validation/error states and correction hints in `frontend/public/css/admin-notifications.css`

**Checkpoint**: US2 is independently testable without requiring US3.

---

## Phase 5: User Story 3 - Handle Partial Delivery and Retry (Priority: P3)

**Goal**: Admins can view partial failures and retry only failed recipients within 24 hours.

**Independent Test**: Mixed delivery outcomes produce summary with failed recipients; retry resends only failed recipients and enforces retry expiry.

### Tests for User Story 3

- [ ] T034 [P] [US3] Add contract test for `GET /api/admin/notifications/send-requests/{sendRequestId}` summary response in `backend/tests/contract/admin-notifications/send-summary.contract.test.js`
- [ ] T035 [P] [US3] Add contract tests for `POST /api/admin/notifications/send-requests/{sendRequestId}/retry` 202/400/410 responses in `backend/tests/contract/admin-notifications/retry.contract.test.js`
- [ ] T036 [P] [US3] Add integration tests for partial success summary and retry-only-failed behavior in `backend/tests/integration/admin-notifications/retry.integration.test.js`
- [ ] T037 [P] [US3] Add Playwright scenario for failed-recipient summary and retry action in `backend/tests/e2e/admin-notifications/retry.e2e.spec.js`

### Implementation for User Story 3

- [ ] T038 [US3] Implement retry orchestration service for failed recipients with 24h window enforcement in `backend/src/services/retry-service.js`
- [ ] T039 [US3] Implement send summary query/aggregation helpers in `backend/src/models/delivery-attempt-model.js` and `backend/src/models/send-request-model.js`
- [ ] T040 [US3] Implement summary and retry endpoint logic in `backend/src/controllers/admin-notifications-controller.js`
- [ ] T041 [US3] Wire summary/retry routes in `backend/src/routes/admin-notifications-routes.js`
- [ ] T042 [US3] Build summary view with failed-recipient details and retry controls in `backend/views/admin-notifications/summary.html`
- [ ] T043 [US3] Add client-side polling/retry submission logic for summary page in `frontend/public/js/admin-notifications.js`

**Checkpoint**: US3 is independently testable once foundational tasks are complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hardening and compliance tasks spanning all stories.

- [ ] T044 Implement one-year delivery-log retention maintenance job in `backend/src/services/delivery-retention-service.js` and schedule hookup in `backend/src/app.js`
- [ ] T045 [P] Add integration test for retention cleanup behavior in `backend/tests/integration/admin-notifications/retention.integration.test.js`
- [ ] T046 Run end-to-end quickstart validation updates and record pass criteria in `specs/042-student-inbox-notifications/quickstart.md`
- [ ] T047 [P] Verify HTML/CSS/JS style-guide compliance for `backend/views/admin-notifications/compose.html`, `backend/views/admin-notifications/summary.html`, `frontend/public/css/admin-notifications.css`, and `frontend/public/js/admin-notifications.js`
- [ ] T048 [P] Add load/performance test for <=500 recipients and <=30s completion summary validation in `backend/tests/integration/admin-notifications/performance-send.integration.test.js`
- [ ] T049 [P] Add inbox reflection latency test for <=60s and >=98% successful-delivery visibility in `backend/tests/integration/admin-notifications/inbox-latency.integration.test.js`
- [ ] T050 Create UAT runbook and first-attempt completion metric capture (>=90%) in `specs/042-student-inbox-notifications/uat.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks story implementation.
- **Phase 3 (US1), Phase 4 (US2), Phase 5 (US3)**: Each depends only on Phase 2; no cross-story blocking dependencies.
- **Phase 6 (Polish)**: Depends on completion of the stories you choose to ship.

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational completion.
- **US2 (P2)**: Depends only on Foundational completion.
- **US3 (P3)**: Depends only on Foundational completion.

### Within Each User Story

- Tests before implementation.
- Services/models before controller wiring.
- Controller wiring before UI finalization for that story.

### Blocking-Dependency Resolution

All cross-story dependencies were removed. No task in US2 requires US1 completion, and no task in US3 requires US1/US2 completion; shared prerequisites were moved to Phase 2.

---

## Parallel Opportunities

- Setup: T002 and T003 can run in parallel after T001 starts.
- Foundational: T006, T008, T009, and T011 can run in parallel after T005.
- US1: T013-T016 can run in parallel; T022 and T024 can run in parallel once endpoint contracts are stable.
- US2: T025-T028 can run in parallel; T032 and T033 can run in parallel.
- US3: T034-T037 can run in parallel; T042 and T043 can run in parallel after T040.
- Polish: T045, T047, T048, and T049 can run in parallel with documentation finalization T046 and T050.

### Parallel Example: User Story 1

```bash
Task T013: backend/tests/contract/admin-notifications/preview-recipients.contract.test.js
Task T014: backend/tests/contract/admin-notifications/send.contract.test.js
Task T015: backend/tests/integration/admin-notifications/send-success.integration.test.js
Task T016: backend/tests/e2e/admin-notifications/send-success.e2e.spec.js
```

### Parallel Example: User Story 2

```bash
Task T025: backend/tests/contract/admin-notifications/preview-recipients-errors.contract.test.js
Task T026: backend/tests/contract/admin-notifications/send-errors.contract.test.js
Task T027: backend/tests/integration/admin-notifications/send-validation.integration.test.js
Task T028: backend/tests/e2e/admin-notifications/send-validation.e2e.spec.js
```

### Parallel Example: User Story 3

```bash
Task T034: backend/tests/contract/admin-notifications/send-summary.contract.test.js
Task T035: backend/tests/contract/admin-notifications/retry.contract.test.js
Task T036: backend/tests/integration/admin-notifications/retry.integration.test.js
Task T037: backend/tests/e2e/admin-notifications/retry.e2e.spec.js
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1) fully.
3. Validate US1 independently using T013-T016 and acceptance criteria.

### Incremental Delivery

1. Ship US1 after foundational completion.
2. Add US2 as validation hardening without introducing dependency on US1 internals.
3. Add US3 retry/partial-failure handling using shared Phase 2 foundations.

### Parallel Team Strategy

1. Team completes Phase 1-2 together.
2. After Phase 2, separate owners can execute US1, US2, and US3 concurrently.
3. Merge each story independently once its tests pass.
