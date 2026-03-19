# Tasks: View Transaction History (UC-10)

**Input**: Design documents from `/specs/010-transaction-history/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No explicit TDD mandate in the feature spec; tasks include acceptance-validation execution rather than test-first authoring tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline scaffolding for UC-10

- [ ] T001 Create MVC directories for this feature in `/Users/ahsanmansoor/ECE493Group19/src/controllers/`, `/Users/ahsanmansoor/ECE493Group19/src/models/`, `/Users/ahsanmansoor/ECE493Group19/src/services/`, and `/Users/ahsanmansoor/ECE493Group19/src/views/`
- [ ] T002 [P] Create test directory scaffold in `/Users/ahsanmansoor/ECE493Group19/tests/unit/`, `/Users/ahsanmansoor/ECE493Group19/tests/integration/`, and `/Users/ahsanmansoor/ECE493Group19/tests/contract/`
- [ ] T003 [P] Add UC-10 traceability header comments to new feature files in `/Users/ahsanmansoor/ECE493Group19/src/controllers/transaction-history-controller.js` and `/Users/ahsanmansoor/ECE493Group19/src/views/transaction-history-view.html`
- [ ] T004 Record style-guide enforcement checklist for this feature in `/Users/ahsanmansoor/ECE493Group19/specs/010-transaction-history/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Define SQLite read-model query contract for transaction history in `/Users/ahsanmansoor/ECE493Group19/src/models/financial-transaction-model.js`
- [ ] T006 [P] Implement authenticated student ownership guard for history access in `/Users/ahsanmansoor/ECE493Group19/src/controllers/transaction-history-controller.js`
- [ ] T007 [P] Implement shared error response mapper aligned to contract `503/401/403/404` in `/Users/ahsanmansoor/ECE493Group19/src/services/payment-status-service.js`
- [ ] T008 Implement transaction DTO mapper (masked identifiers, newest-first, in-scope filtering) in `/Users/ahsanmansoor/ECE493Group19/src/services/payment-status-service.js`
- [ ] T009 Create base history page shell and state placeholders (list/empty/error) in `/Users/ahsanmansoor/ECE493Group19/src/views/transaction-history-view.html`
- [ ] T010 Validate OpenAPI alignment assumptions and endpoint path usage against `/Users/ahsanmansoor/ECE493Group19/specs/010-transaction-history/contracts/transaction-history.openapi.yaml`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Review Personal Payment Records (Priority: P1) 🎯 MVP

**Goal**: Student can view complete in-scope fee payment history and confirm payment outcomes.

**Independent Test**: Sign in as a student with existing fee-payment records and confirm newest-first list shows date, amount, status, method label, and masked identifier only.

### Implementation for User Story 1

- [ ] T011 [P] [US1] Implement `StudentAccount` lookup and active-account validation in `/Users/ahsanmansoor/ECE493Group19/src/models/student-account-model.js`
- [ ] T012 [P] [US1] Implement transaction retrieval query for all in-scope fee payments in `/Users/ahsanmansoor/ECE493Group19/src/models/financial-transaction-model.js`
- [ ] T013 [US1] Implement controller GET handler for `/api/students/{studentId}/financial-transactions` in `/Users/ahsanmansoor/ECE493Group19/src/controllers/transaction-history-controller.js`
- [ ] T014 [US1] Implement record formatting rules (status mapping, masked display, newest-first ordering) in `/Users/ahsanmansoor/ECE493Group19/src/services/payment-status-service.js`
- [ ] T015 [US1] Render populated transaction history list in `/Users/ahsanmansoor/ECE493Group19/src/views/transaction-history-view.html`
- [ ] T016 [US1] Add contract conformance checks for success payload fields in `/Users/ahsanmansoor/ECE493Group19/tests/contract/transaction-history-contract.test.js`
- [ ] T017 [US1] Add unit coverage for fee-only filtering and masking rules in `/Users/ahsanmansoor/ECE493Group19/tests/unit/financial-transaction-model.test.js`
- [ ] T018 [US1] Run UC-10 main-success validation steps and record evidence in `/Users/ahsanmansoor/ECE493Group19/specs/010-transaction-history/quickstart.md`

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Handle No-Record Case Clearly (Priority: P2)

**Goal**: Student with no historical transactions receives a clear non-error empty state.

**Independent Test**: Sign in as a valid student with zero in-scope fee-payment records and confirm the page shows a no-records message, not a failure state.

### Implementation for User Story 2

- [ ] T019 [P] [US2] Implement empty-result handling branch in `/Users/ahsanmansoor/ECE493Group19/src/controllers/transaction-history-controller.js`
- [ ] T020 [US2] Add explicit no-records view state copy and structure in `/Users/ahsanmansoor/ECE493Group19/src/views/transaction-history-view.html`
- [ ] T021 [US2] Ensure model/service return empty list semantics without error mutation in `/Users/ahsanmansoor/ECE493Group19/src/models/financial-transaction-model.js`
- [ ] T022 [US2] Add integration coverage for empty-state flow in `/Users/ahsanmansoor/ECE493Group19/tests/integration/transaction-history-flow.test.js`
- [ ] T023 [US2] Run UC-10 optional no-transactions validation steps and record evidence in `/Users/ahsanmansoor/ECE493Group19/specs/010-transaction-history/quickstart.md`

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Recover Safely from Retrieval Errors (Priority: P3)

**Goal**: On retrieval failure, the system shows a clear error and preserves state, with retry support.

**Independent Test**: Simulate transaction retrieval failure and confirm error message, no transaction/account/course mutation, and successful retry once dependency fault is removed.

### Implementation for User Story 3

- [ ] T024 [P] [US3] Implement retrieval-failure branch and retry trigger wiring in `/Users/ahsanmansoor/ECE493Group19/src/controllers/transaction-history-controller.js`
- [ ] T025 [US3] Implement dependency-failure mapping to retryable error response in `/Users/ahsanmansoor/ECE493Group19/src/services/payment-status-service.js`
- [ ] T026 [US3] Add error-state and retry UI requirements in `/Users/ahsanmansoor/ECE493Group19/src/views/transaction-history-view.html`
- [ ] T027 [US3] Add integration coverage for extension 2a failure-and-recovery path in `/Users/ahsanmansoor/ECE493Group19/tests/integration/transaction-history-flow.test.js`
- [ ] T028 [US3] Add contract checks for `503` error schema and retryable flag in `/Users/ahsanmansoor/ECE493Group19/tests/contract/transaction-history-contract.test.js`
- [ ] T029 [US3] Run UC-10 extension 2a validation steps and record evidence in `/Users/ahsanmansoor/ECE493Group19/specs/010-transaction-history/quickstart.md`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T030 [P] Consolidate and normalize terminology across feature files in `/Users/ahsanmansoor/ECE493Group19/src/controllers/transaction-history-controller.js`, `/Users/ahsanmansoor/ECE493Group19/src/services/payment-status-service.js`, and `/Users/ahsanmansoor/ECE493Group19/src/views/transaction-history-view.html`
- [ ] T031 Verify style-guide compliance for all modified HTML/CSS/JS files using `/Users/ahsanmansoor/ECE493Group19/Style Guides/google-style-guide-html-css.md` and `/Users/ahsanmansoor/ECE493Group19/Style Guides/google-style-guide-javascript.md`
- [ ] T032 Verify protected artifacts remain unchanged by checking `/Users/ahsanmansoor/ECE493Group19/Use Cases/UC-10.md` and `/Users/ahsanmansoor/ECE493Group19/Acceptance Tests/UC-10-AS.md`
- [ ] T033 Execute full quickstart validation sequence and finalize implementation notes in `/Users/ahsanmansoor/ECE493Group19/specs/010-transaction-history/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
  - Preferred order: US1 (P1) -> US2 (P2) -> US3 (P3)
  - US2 and US3 may start after US1 foundation slices stabilize
- **Polish (Phase 6)**: Depends on all targeted user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Phase 2; no dependency on other stories
- **User Story 2 (P2)**: Starts after Phase 2; reuses US1 retrieval path but remains independently testable
- **User Story 3 (P3)**: Starts after Phase 2; reuses US1 retrieval path and adds failure/retry behavior

### Dependency Graph

- Setup -> Foundational -> US1 -> (US2, US3) -> Polish

### Within Each User Story

- Model/query tasks before controller final wiring
- Controller/service behavior before view completion
- Implementation before validation evidence updates

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel
- **Phase 2**: T006 and T007 can run in parallel
- **US1**: T011 and T012 can run in parallel
- **US2**: T019 and T021 can run in parallel
- **US3**: T024 and T025 can run in parallel
- **Polish**: T030 can run in parallel with T031 after story completion

---

## Parallel Example: User Story 1

```bash
Task: "T011 [US1] Implement StudentAccount lookup in /Users/ahsanmansoor/ECE493Group19/src/models/student-account-model.js"
Task: "T012 [US1] Implement in-scope fee-payment retrieval in /Users/ahsanmansoor/ECE493Group19/src/models/financial-transaction-model.js"
```

## Parallel Example: User Story 2

```bash
Task: "T019 [US2] Implement empty-result handling in /Users/ahsanmansoor/ECE493Group19/src/controllers/transaction-history-controller.js"
Task: "T021 [US2] Ensure empty-list semantics in /Users/ahsanmansoor/ECE493Group19/src/models/financial-transaction-model.js"
```

## Parallel Example: User Story 3

```bash
Task: "T024 [US3] Implement retrieval-failure and retry wiring in /Users/ahsanmansoor/ECE493Group19/src/controllers/transaction-history-controller.js"
Task: "T025 [US3] Implement dependency-failure response mapping in /Users/ahsanmansoor/ECE493Group19/src/services/payment-status-service.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate US1 independently via T018
4. Demo/deploy MVP slice

### Incremental Delivery

1. Deliver US1 (core history view)
2. Deliver US2 (empty-state clarity)
3. Deliver US3 (failure + retry safety)
4. Run cross-cutting polish and final quickstart validation

### Parallel Team Strategy

1. Team aligns on Phase 1 and 2 together
2. Developer A continues US1 hardening
3. Developer B implements US2
4. Developer C implements US3
5. Consolidate in Phase 6

---

## Notes

- All tasks use strict checklist format with IDs, optional `[P]`, and required `[US#]` labels in story phases.
- Each user story includes independent validation criteria and task closure point.
- Paths are absolute to make execution unambiguous.
