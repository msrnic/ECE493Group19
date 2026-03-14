# Tasks: Store Banking Information

**Input**: Design documents from `/specs/011-store-banking-information/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include targeted integration/unit tests for UC-11 behavior coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare feature scaffolding and traceability.

- [ ] T001 Create feature traceability section for UC-11 in specs/011-store-banking-information/spec.md
- [ ] T002 [P] Create payment methods view templates in src/views/payment-methods/list.html and src/views/payment-methods/add-bank-account.html
- [ ] T003 [P] Create controller and service stubs in src/controllers/payment_methods_controller.js and src/services/banking_network_service.js
- [ ] T004 Add SQLite migration scaffold for bank payment methods in src/models/migrations/011_bank_payment_methods.sql
- [ ] T005 Add style-guide compliance checklist reference in specs/011-store-banking-information/checklists/requirements.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish core data and flow infrastructure required by all stories.

- [ ] T006 Implement `payment_methods` schema and uniqueness constraints in src/models/migrations/011_bank_payment_methods.sql
- [ ] T007 [P] Implement base model methods for bank payment methods in src/models/payment_method_model.js
- [ ] T008 [P] Implement controller routing for payment methods list/add/cancel in src/controllers/payment_methods_controller.js
- [ ] T009 Implement banking-network validation adapter in src/services/banking_network_service.js
- [ ] T010 Add shared validation helpers for bank-account fields in src/controllers/validators/bank_account_validator.js
- [ ] T011 Add centralized error mapping for validation/network rejections in src/controllers/errors/payment_method_errors.js
- [ ] T012 Add protected-artifact guard note to implementation docs in specs/011-store-banking-information/quickstart.md

**Checkpoint**: Foundation complete. User story tasks can start.

---

## Phase 3: User Story 1 - Add Bank Account for Fee Payments (Priority: P1) 🎯 MVP

**Goal**: Student can add valid banking details and immediately use the stored method for fee payments.

**Independent Test**: Submit valid details and verify stored active bank method appears in payment methods.

### Tests for User Story 1

- [ ] T013 [P] [US1] Add model unit tests for successful bank-method persistence in tests/unit/models/payment_method_model.test.js
- [ ] T014 [P] [US1] Add controller integration test for successful add-bank flow in tests/integration/payment-methods/add_bank_success.test.js

### Implementation for User Story 1

- [ ] T015 [US1] Implement secure persistence path for accepted bank accounts in src/models/payment_method_model.js
- [ ] T016 [US1] Implement add-bank submission handler in src/controllers/payment_methods_controller.js
- [ ] T017 [US1] Implement success confirmation rendering with masked account identifier in src/views/payment-methods/list.html
- [ ] T018 [US1] Ensure fee-payment availability flag is set for active bank methods in src/models/payment_method_model.js
- [ ] T019 [US1] Validate MVC boundaries and style-guide compliance for touched HTML/CSS/JS files in src/views/payment-methods/add-bank-account.html

**Checkpoint**: US1 works independently.

---

## Phase 4: User Story 2 - Handle Invalid Banking Details (Priority: P2)

**Goal**: Invalid or rejected banking details are blocked with clear correction feedback and no persistence.

**Independent Test**: Submit invalid and network-rejected details and verify clear errors plus no saved records.

### Tests for User Story 2

- [ ] T020 [P] [US2] Add controller integration tests for field validation failures in tests/integration/payment-methods/add_bank_validation_error.test.js
- [ ] T021 [P] [US2] Add controller integration tests for banking-network rejection in tests/integration/payment-methods/add_bank_network_rejected.test.js

### Implementation for User Story 2

- [ ] T022 [US2] Enforce required-field and format validation before network calls in src/controllers/validators/bank_account_validator.js
- [ ] T023 [US2] Add duplicate-account rejection for same student fingerprint in src/models/payment_method_model.js
- [ ] T024 [US2] Implement actionable validation and rejection messaging in src/views/payment-methods/add-bank-account.html
- [ ] T025 [US2] Prevent any database mutation on validation/network failure in src/controllers/payment_methods_controller.js
- [ ] T026 [US2] Verify style-guide compliance for modified HTML/CSS/JS files in src/views/payment-methods/add-bank-account.html

**Checkpoint**: US2 works independently and does not regress US1.

---

## Phase 5: User Story 3 - Cancel Bank Entry Without Side Effects (Priority: P3)

**Goal**: Student can cancel bank entry and return without changes.

**Independent Test**: Start add-bank flow, cancel, and verify no new data was persisted.

### Tests for User Story 3

- [ ] T027 [P] [US3] Add integration test for cancel flow with no persistence in tests/integration/payment-methods/add_bank_cancel.test.js

### Implementation for User Story 3

- [ ] T028 [US3] Implement cancel action handler returning to payment methods list in src/controllers/payment_methods_controller.js
- [ ] T029 [US3] Wire cancel control in add-bank view in src/views/payment-methods/add-bank-account.html
- [ ] T030 [US3] Enforce explicit no-change behavior on cancel in src/models/payment_method_model.js
- [ ] T031 [US3] Verify style-guide compliance for modified HTML/CSS/JS files in src/views/payment-methods/add-bank-account.html

**Checkpoint**: US3 works independently and preserves existing behaviors.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency and readiness checks across all stories.

- [ ] T032 [P] Update feature quickstart and result evidence in specs/011-store-banking-information/quickstart.md
- [ ] T033 [P] Run and document acceptance checks for UC-11 in tests/integration/payment-methods/
- [ ] T034 Confirm no changes were made to protected use-case artifacts in Use Cases/UC-11.md and Acceptance Tests/UC-11-AS.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user-story implementation.
- **User Stories (Phases 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on completion of desired user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; no dependency on other stories.
- **US2 (P2)**: Starts after Phase 2; independent but validates shared add-bank path.
- **US3 (P3)**: Starts after Phase 2; independent cancel behavior.

### Parallel Opportunities

- Phase 1 tasks T002 and T003 can run in parallel.
- Phase 2 tasks T007 and T008 can run in parallel after T006.
- Per-story test tasks marked [P] can run in parallel.

---

## Parallel Example: User Story 2

```bash
Task: "Add controller integration tests for field validation failures in tests/integration/payment-methods/add_bank_validation_error.test.js"
Task: "Add controller integration tests for banking-network rejection in tests/integration/payment-methods/add_bank_network_rejected.test.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete Phase 3 (US1).
4. Validate US1 independently.

### Incremental Delivery

1. Add US1 (core add flow).
2. Add US2 (error/rejection robustness).
3. Add US3 (cancel safety).
4. Finish polish and acceptance evidence.
