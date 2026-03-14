# Tasks: Enter final grades for students (UC-34)

**Input**: Design documents from `/specs/034-enter-final-grades/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Include acceptance-aligned validation for primary, alternate, and error paths.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Create feature folder placeholders in src/controllers, src/models, src/services, src/routes, and src/views
- [ ] T002 [P] Create or update feature assets in public/css and public/js with style-guide references
- [ ] T003 [P] Create test placeholders in tests/unit and tests/integration for this feature
- [ ] T004 Add explicit UC/AS traceability references to specs/034-enter-final-grades/plan.md and specs/034-enter-final-grades/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T005 Define/extend SQLite tables needed for RequestContext, DecisionResult, and AuditEntry in src/models/migrations/034-enter-final-grades_feature.sql
- [ ] T006 [P] Implement RequestContext model access in src/models/034-enter-final-grades-request-context-model.js
- [ ] T007 [P] Implement DecisionResult model access in src/models/034-enter-final-grades-decision-result-model.js
- [ ] T008 [P] Implement AuditEntry persistence in src/models/034-enter-final-grades-audit-model.js
- [ ] T009 Implement core service evaluation logic in src/services/034-enter-final-grades-service.js
- [ ] T010 Implement controller validation and result mapping in src/controllers/034-enter-final-grades-controller.js
- [ ] T011 Wire routes for contract endpoints in src/routes/034-enter-final-grades-routes.js
- [ ] T012 Add protected-file and style-guide compliance checks in specs/034-enter-final-grades/checklists/requirements.md

---

## Phase 3: User Story 1 - Primary Flow (Priority: P1) 🎯 MVP

- [ ] T013 [P] [US1] Add unit tests for primary flow service logic in tests/unit/034-enter-final-grades-service.test.js
- [ ] T014 [P] [US1] Add integration tests for primary flow endpoint(s) in tests/integration/034-enter-final-grades.integration.test.js
- [ ] T015 [US1] Implement primary service path in src/services/034-enter-final-grades-service.js
- [ ] T016 [US1] Implement primary controller path in src/controllers/034-enter-final-grades-controller.js
- [ ] T017 [US1] Implement primary view rendering in src/views/034-enter-final-grades.html
- [ ] T018 [US1] Implement frontend wiring in public/js/034-enter-final-grades.js

---

## Phase 4: User Story 2 - Alternate/No-Result Flow (Priority: P2)

- [ ] T019 [P] [US2] Add unit tests for alternate outcomes in tests/unit/034-enter-final-grades-service.test.js
- [ ] T020 [P] [US2] Add integration tests for alternate endpoint behavior in tests/integration/034-enter-final-grades.integration.test.js
- [ ] T021 [US2] Implement alternate response handling in src/services/034-enter-final-grades-service.js
- [ ] T022 [US2] Implement alternate UI messaging in src/views/034-enter-final-grades.html

---

## Phase 5: User Story 3 - Error/Recovery Safety (Priority: P3)

- [ ] T023 [P] [US3] Add unit tests for dependency error handling in tests/unit/034-enter-final-grades-service.test.js
- [ ] T024 [P] [US3] Add integration tests ensuring no partial updates on errors in tests/integration/034-enter-final-grades.integration.test.js
- [ ] T025 [US3] Implement error-path guardrails in src/services/034-enter-final-grades-service.js
- [ ] T026 [US3] Implement controller error messaging and rollback-safe response in src/controllers/034-enter-final-grades-controller.js
- [ ] T027 [US3] Persist error outcomes to audit store in src/models/034-enter-final-grades-audit-model.js

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T028 [P] Validate contract consistency with specs/034-enter-final-grades/contracts/final-grade-entry-api.yaml
- [ ] T029 Confirm acceptance traceability against `Use Cases/UC-34.md` and `Acceptance Tests/UC-34-AS.md`
- [ ] T030 [P] Verify style-guide compliance for modified HTML/CSS/JS files
- [ ] T031 Confirm no edits to protected use-case/acceptance-test artifacts
