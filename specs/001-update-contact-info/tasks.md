# Tasks: Contact Information Update

**Input**: Design documents from `/specs/001-update-contact-info/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/contact-info-api.md, quickstart.md

**Tests**: Include unit/integration tests because `plan.md` requires JavaScript unit/integration coverage plus manual acceptance verification.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently after foundational work.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize feature scaffolding and traceability artifacts.

- [ ] T001 Create contact feature route scaffold in app/routes/contactRoutes.js
- [ ] T002 Create contact controller scaffold in app/controllers/contactController.js
- [ ] T003 [P] Create contact info view scaffold in app/views/contact-info.html
- [ ] T004 [P] Create contact page styles scaffold in app/public/css/contact-info.css
- [ ] T005 [P] Create contact page client script scaffold in app/public/js/contact-info.js
- [ ] T006 Create feature traceability notes for UC-07 and UC-07-AS in specs/001-update-contact-info/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before user story implementation.

- [ ] T007 Add contact schema tables (`contact_profiles`, `emergency_contacts`, `contact_update_events`) in app/db/schema.sql
- [ ] T008 Create migration for contact tables and indexes in app/db/migrations/001_update_contact_info.sql
- [ ] T009 Implement shared contact validation helpers (normalize/validate email, phone, address) in app/models/contactValidation.js
- [ ] T010 Implement contact data-access and transaction primitives in app/models/contactInfoModel.js
- [ ] T011 [P] Wire `/contact-info` GET and POST routes with auth middleware in app/routes/contactRoutes.js
- [ ] T012 [P] Register contact routes with the main Express app in app/app.js
- [ ] T013 Implement shared contact error/response mapper for controllers in app/controllers/contactController.js

**Checkpoint**: Foundational work complete; all user stories can proceed independently with no cross-story blocking.

---

## Phase 3: User Story 1 - Update Contact Details (Priority: P1) 🎯 MVP

**Goal**: Let authenticated users view and save valid updates to their own basic and emergency contact details.

**Independent Test**: Log in as a user, load `/contact-info`, submit valid edits for both sections, verify persisted values and success confirmation.

### Tests for User Story 1

- [ ] T014 [P] [US1] Add model unit tests for successful read/write transaction path in tests/unit/models/contactInfoModel.test.js
- [ ] T015 [P] [US1] Add controller unit tests for authenticated own-account access in tests/unit/controllers/contactController.test.js
- [ ] T016 [US1] Add integration test for successful contact update flow in tests/integration/contact-info-flow.test.js

### Implementation for User Story 1

- [ ] T017 [US1] Implement GET `/contact-info` load logic for current basic and emergency values in app/controllers/contactController.js
- [ ] T018 [US1] Implement POST `/contact-info` success path using atomic model transaction in app/controllers/contactController.js
- [ ] T019 [P] [US1] Implement contact form markup and immutable-field treatment in app/views/contact-info.html
- [ ] T020 [P] [US1] Implement success-state rendering and section layout styles in app/public/css/contact-info.css
- [ ] T021 [P] [US1] Implement client-side payload building and submit handling in app/public/js/contact-info.js
- [ ] T022 [US1] Implement success confirmation response payload mapping in app/controllers/contactController.js

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Correct Invalid Formats (Priority: P1)

**Goal**: Block invalid submissions and provide field-level corrective feedback.

**Independent Test**: Submit invalid email/phone/address values, verify field-level errors and zero persistence; correct fields and verify save succeeds.

### Tests for User Story 2

- [ ] T023 [P] [US2] Add validation helper unit tests for invalid/normalized inputs in tests/unit/models/contactValidation.test.js
- [ ] T024 [P] [US2] Add controller unit tests for 400 validation responses and field error mapping in tests/unit/controllers/contactController.test.js
- [ ] T025 [US2] Add integration test for invalid submit then corrected resubmit flow in tests/integration/contact-info-flow.test.js

### Implementation for User Story 2

- [ ] T026 [US2] Implement server-side normalization + validation gating before save in app/controllers/contactController.js
- [ ] T027 [US2] Implement all-or-nothing rejection when any field fails validation in app/models/contactInfoModel.js
- [ ] T028 [P] [US2] Implement field-level validation message rendering in app/views/contact-info.html
- [ ] T029 [P] [US2] Implement invalid-field highlight and inline guidance styles in app/public/css/contact-info.css
- [ ] T030 [P] [US2] Implement client-side error highlighting and correction state clearing in app/public/js/contact-info.js

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Cancel or Recover from Save Failure (Priority: P2)

**Goal**: Ensure unsaved edits are discarded and failed saves never persist partial updates.

**Independent Test**: Cancel or navigate away before submit to confirm no data changes; simulate DB failure on submit and verify rollback + retry-later message.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add model unit tests for transaction rollback on persistence failure in tests/unit/models/contactInfoModel.test.js
- [ ] T032 [P] [US3] Add controller unit tests for save-failed response and retry messaging in tests/unit/controllers/contactController.test.js
- [ ] T033 [US3] Add integration test for cancel/abandon and simulated save failure behaviors in tests/integration/contact-info-flow.test.js

### Implementation for User Story 3

- [ ] T034 [US3] Implement rollback-safe persistence failure handling in app/models/contactInfoModel.js
- [ ] T035 [US3] Implement controller save-failure messaging (`status=save_failed`) in app/controllers/contactController.js
- [ ] T036 [P] [US3] Implement cancel navigation behavior that discards unsaved edits in app/public/js/contact-info.js
- [ ] T037 [P] [US3] Implement UI retry-later error banner state in app/views/contact-info.html
- [ ] T038 [US3] Implement last-write-wins conflict notice and event logging in app/models/contactInfoModel.js
- [ ] T039 [US3] Implement post-save conflict notice mapping in app/controllers/contactController.js

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening and feature-wide verification.

- [ ] T040 [P] Run and fix JavaScript lint issues for touched files with output captured in specs/001-update-contact-info/quickstart.md
- [ ] T041 [P] Run HTML/CSS style-guide compliance review for app/views/contact-info.html and app/public/css/contact-info.css with findings captured in specs/001-update-contact-info/quickstart.md
- [ ] T042 [P] Run and fix automated unit/integration tests for touched files with output captured in specs/001-update-contact-info/quickstart.md
- [ ] T043 Add p95 latency instrumentation assertions for GET and POST contact flows in tests/integration/contact-info-flow.test.js
- [ ] T044 Record p95 performance evidence against <=500ms read and <=800ms save in specs/001-update-contact-info/quickstart.md
- [ ] T045 Execute manual UC-07 acceptance checklist and record pass/fail notes in specs/001-update-contact-info/quickstart.md
- [ ] T046 Create FR/SC/UC to task/evidence traceability matrix in specs/001-update-contact-info/traceability.md
- [ ] T047 Add SC-001 and SC-005 measurement method/status notes in specs/001-update-contact-info/traceability.md
- [ ] T048 Update feature documentation and implementation notes in specs/001-update-contact-info/plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies.
- Foundational (Phase 2): Depends on Setup completion; blocks story work.
- User Stories (Phases 3-5): Each depends only on Foundational completion.
- Polish (Phase 6): Depends on completion of selected user stories.

### User Story Dependencies (No Blocking Cross-Story Dependencies)

- US1: Depends only on Phase 2.
- US2: Depends only on Phase 2.
- US3: Depends only on Phase 2.
- Cross-story dependency status: None required; stories are independently implementable/testable.

### Dependency Graph

- Foundation path: Phase 1 -> Phase 2
- Story start point: Phase 2 -> {US1, US2, US3}
- Finish path: {US1, US2, US3} -> Phase 6

### Within Each User Story

- Tests first (should fail before implementation).
- Controller/model logic before final UI polish for that story.
- Story-specific checkpoint validation before moving to polish.

## Parallel Opportunities

- Setup parallel tasks: T003, T004, T005.
- Foundational parallel tasks: T011, T012.
- US1 parallel tasks: T014 and T015; T019, T020, and T021.
- US2 parallel tasks: T023 and T024; T028, T029, and T030.
- US3 parallel tasks: T031 and T032; T036 and T037.
- Polish parallel tasks: T040, T041, and T042.

## Parallel Example: User Story 1

```bash
Task: "T014 [US1] Add model unit tests in tests/unit/models/contactInfoModel.test.js"
Task: "T015 [US1] Add controller unit tests in tests/unit/controllers/contactController.test.js"

Task: "T019 [US1] Implement form markup in app/views/contact-info.html"
Task: "T020 [US1] Implement styles in app/public/css/contact-info.css"
Task: "T021 [US1] Implement client submit handling in app/public/js/contact-info.js"
```

## Parallel Example: User Story 2

```bash
Task: "T023 [US2] Add validation helper unit tests in tests/unit/models/contactValidation.test.js"
Task: "T024 [US2] Add controller validation tests in tests/unit/controllers/contactController.test.js"

Task: "T028 [US2] Implement validation messages in app/views/contact-info.html"
Task: "T029 [US2] Implement invalid-field styles in app/public/css/contact-info.css"
Task: "T030 [US2] Implement client error highlighting in app/public/js/contact-info.js"
```

## Parallel Example: User Story 3

```bash
Task: "T031 [US3] Add rollback tests in tests/unit/models/contactInfoModel.test.js"
Task: "T032 [US3] Add save-failed controller tests in tests/unit/controllers/contactController.test.js"

Task: "T036 [US3] Implement cancel discard behavior in app/public/js/contact-info.js"
Task: "T037 [US3] Implement retry banner UI in app/views/contact-info.html"
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 and Phase 2.
2. Complete US1 (Phase 3) and validate independently.
3. Demo/deploy MVP.

### Incremental Delivery

1. Deliver US1 (core update path).
2. Deliver US2 (validation UX and strict rejection).
3. Deliver US3 (cancel/failure/conflict robustness).
4. Run Phase 6 polish before release.
