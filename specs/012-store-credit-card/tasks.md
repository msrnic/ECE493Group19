# Tasks: Store Credit Card Information (UC-12)

**Input**: Design documents from `/specs/012-store-credit-card/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Include unit and integration tests for tokenization success, rejection,
and unavailability paths, plus acceptance-traceability checks to UC-12-AS.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project structure and traceability scaffolding.

- [ ] T001 Create MVC source directories in src/controllers, src/models, src/services, src/routes, and src/views/payment-methods
- [ ] T002 Create frontend asset directories and files in public/css/payment-methods.css and public/js/payment-methods.js
- [ ] T003 [P] Create test directories and placeholders in tests/unit and tests/integration
- [ ] T004 Add UC-12 traceability notes in specs/012-store-credit-card/quickstart.md and specs/012-store-credit-card/plan.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build core shared infrastructure that blocks all user stories.

- [ ] T005 Create SQLite schema migration for payment_methods in src/models/migrations/012_payment_methods.sql
- [ ] T006 [P] Implement PaymentMethod base model with SQLite access helpers in src/models/payment-method-model.js
- [ ] T007 [P] Implement payment processor client wrapper with timeout handling in src/services/payment-tokenization-service.js
- [ ] T008 Implement payment-method route registration in src/routes/payment-method-routes.js
- [ ] T009 Implement common payment-method request validation utilities in src/controllers/payment-method-validator.js
- [ ] T010 Add style and protected-file compliance checklist notes in specs/012-store-credit-card/checklists/requirements.md

**Checkpoint**: Foundation complete; user stories can proceed.

---

## Phase 3: User Story 1 - Add Credit Card for Future Fee Payments (Priority: P1) 🎯 MVP

**Goal**: Student can add and store a tokenized credit card and use it for fee payment.

**Independent Test**: Execute AT-UC12-01 flow from `Acceptance Tests/UC-12-AS.md`.

### Tests for User Story 1

- [ ] T011 [P] [US1] Add unit tests for successful tokenization response mapping in tests/unit/payment-tokenization-service.test.js
- [ ] T012 [P] [US1] Add integration test for successful add-card submission in tests/integration/payment-method-tokenization.integration.test.js

### Implementation for User Story 1

- [ ] T013 [P] [US1] Add PaymentMethod create/read methods for success path in src/models/payment-method-model.js
- [ ] T014 [US1] Implement add-card controller success flow in src/controllers/payment-method-controller.js
- [ ] T015 [US1] Wire POST /payment-methods/credit-card success handler in src/routes/payment-method-routes.js
- [ ] T016 [US1] Create payment methods UI and add-card form view in src/views/payment-methods/add-credit-card.html
- [ ] T017 [US1] Implement add-card client submission handler and success rendering in public/js/payment-methods.js
- [ ] T018 [US1] Add masked metadata display styles in public/css/payment-methods.css
- [ ] T019 [US1] Ensure stored method is selectable in fee payment UI in src/views/payment-methods/index.html
- [ ] T020 [US1] Verify no full PAN is persisted or displayed across src/controllers/payment-method-controller.js and src/views/payment-methods/add-credit-card.html

**Checkpoint**: User Story 1 independently functional and testable.

---

## Phase 4: User Story 2 - Handle Processor Rejection with Safe Retry (Priority: P2)

**Goal**: Student receives safe rejection messaging and can retry successfully.

**Independent Test**: Execute AT-UC12-02 flow from `Acceptance Tests/UC-12-AS.md`.

### Tests for User Story 2

- [ ] T021 [P] [US2] Add unit tests for rejection mapping to safe messages in tests/unit/payment-tokenization-service.test.js
- [ ] T022 [P] [US2] Add integration test for rejection-no-persist behavior in tests/integration/payment-method-tokenization.integration.test.js

### Implementation for User Story 2

- [ ] T023 [US2] Implement rejection branch and safe feedback mapping in src/services/payment-tokenization-service.js
- [ ] T024 [US2] Implement rejection handling and retry allowance in src/controllers/payment-method-controller.js
- [ ] T025 [US2] Add rejection feedback rendering and retry UX in src/views/payment-methods/add-credit-card.html
- [ ] T026 [US2] Implement client-side retry state handling in public/js/payment-methods.js
- [ ] T027 [US2] Enforce no record creation on rejected responses in src/models/payment-method-model.js

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Handle Processor Unavailability Gracefully (Priority: P3)

**Goal**: Student receives outage guidance and state remains consistent.

**Independent Test**: Execute AT-UC12-03 flow from `Acceptance Tests/UC-12-AS.md`.

### Tests for User Story 3

- [ ] T028 [P] [US3] Add unit tests for timeout-to-unavailable classification in tests/unit/payment-tokenization-service.test.js
- [ ] T029 [P] [US3] Add integration test for unavailable-no-persist behavior in tests/integration/payment-method-tokenization.integration.test.js

### Implementation for User Story 3

- [ ] T030 [US3] Implement 10-second timeout and unavailable result mapping in src/services/payment-tokenization-service.js
- [ ] T031 [US3] Implement unavailable response handling in src/controllers/payment-method-controller.js
- [ ] T032 [US3] Add unavailable guidance UI text and alternate-method message in src/views/payment-methods/add-credit-card.html
- [ ] T033 [US3] Prevent persistence on unavailable responses in src/models/payment-method-model.js
- [ ] T034 [US3] Ensure controller returns retry-later semantics per contract in src/routes/payment-method-routes.js

**Checkpoint**: All three user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening and traceability validation across stories.

- [ ] T035 [P] Add duplicate active-token guard tests in tests/unit/payment-method-controller.test.js
- [ ] T036 Add unique active-token enforcement in src/models/payment-method-model.js
- [ ] T037 [P] Verify contract alignment with implementation in specs/012-store-credit-card/contracts/payment-methods-api.yaml and src/routes/payment-method-routes.js
- [ ] T038 Run and document UC-12 acceptance validation evidence in specs/012-store-credit-card/quickstart.md
- [ ] T039 Verify style guide compliance for modified HTML/CSS/JS files in public/css/payment-methods.css, public/js/payment-methods.js, and src/views/payment-methods/add-credit-card.html
- [ ] T040 Confirm protected files remain unchanged by checking Use Cases/UC-12.md and Acceptance Tests/UC-12-AS.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 -> no dependencies.
- Phase 2 -> depends on Phase 1 and blocks all user stories.
- Phase 3 (US1) -> depends on Phase 2.
- Phase 4 (US2) -> depends on Phase 2 and integrates with US1 components.
- Phase 5 (US3) -> depends on Phase 2 and integrates with shared components.
- Phase 6 -> depends on completed user stories.

### User Story Dependencies

- US1 is MVP and should be delivered first.
- US2 depends on shared add-card path from US1 but remains independently testable.
- US3 depends on shared add-card path from US1 but remains independently testable.

### Parallel Opportunities

- T003 can run with T001-T002.
- T006 and T007 can run in parallel after T005 starts schema baseline.
- T011 and T012 can run in parallel.
- T021 and T022 can run in parallel.
- T028 and T029 can run in parallel.
- T035 and T037 can run in parallel in polish phase.

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate AT-UC12-01.

### Incremental Delivery

1. Add US2 and validate AT-UC12-02.
2. Add US3 and validate AT-UC12-03.
3. Complete cross-cutting polish and compliance checks.
