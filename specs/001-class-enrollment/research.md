# Phase 0 Research: Student Course Enrollment

## Scope and Inputs

- Feature: `001-class-enrollment`
- Spec: `/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-class-enrollment/spec.md`
- Constitution: `/home/m_srnic/ece493/group_project/ECE493Group19/.specify/memory/constitution.md`
- Traceability targets: `Use Cases/UC-17.md`, `Acceptance Tests/UC-17-AS.md`

## Research Tasks Dispatched

- Research JavaScript MVC web implementation pattern for enrollment flow with server-rendered HTML views.
- Research SQLite transactional pattern to prevent partial enrollment writes and race conditions.
- Research best-practice structure for returning multiple blocking reasons in one enrollment response.
- Research style-guide enforcement strategy for HTML/CSS/JavaScript in CI and local development.

## Decisions

### 1) Web Runtime and MVC Framework
- Decision: Use Node.js 20 + Express + EJS templates with controllers/services/models split.
- Rationale: Satisfies constitution stack constraints (HTML/CSS/JS + SQLite), supports clear MVC boundaries, and keeps enrollment logic centralized in service/model layers.
- Alternatives considered:
  - Vanilla `http` server: rejected due to higher routing/validation boilerplate.
  - SPA-only frontend + API backend: deferred for later; adds build/runtime complexity not required for this feature.

### 2) SQLite Access Pattern
- Decision: Use SQLite with explicit transaction boundaries (`BEGIN IMMEDIATE`/`COMMIT`/`ROLLBACK`) for enrollment operations.
- Rationale: Guarantees FR-010 atomic behavior and mitigates over-enrollment under concurrent requests by serializing conflicting seat updates.
- Alternatives considered:
  - Non-transactional write sequence: rejected because it can produce partial state.
  - Deferred transactions only: rejected for weaker lock timing during high-contention seat allocation.

### 3) Eligibility Evaluation + Multi-Reason Blocking
- Decision: Evaluate all eligibility checks in a single request and return all failures in `blockingReasons[]` with stable codes (`PREREQUISITE`, `CAPACITY`, `HOLD`, `SCHEDULE_CONFLICT`, `DUPLICATE_ENROLLMENT`).
- Rationale: Meets FR-013 requirement and improves student clarity by avoiding iterative failure loops.
- Alternatives considered:
  - Fail-fast first error only: rejected because it violates FR-013.
  - Sequential UI-only validation: rejected because server-side authority is required for correctness and concurrency.

### 4) Fee Assessment Communication
- Decision: Return immediate fee summary when available; otherwise return `feeStatus: "PENDING_REFRESH"` with a user-safe message.
- Rationale: Matches edge case requiring success confirmation even when fee update display is delayed.
- Alternatives considered:
  - Block enrollment until fee calculation completes: rejected because it increases latency and failure surface for enrollment-critical path.

### 5) Style Compliance Enforcement
- Decision: Enforce style via ESLint + HTML/CSS lint configuration aligned to project style guides, validated in pre-merge checks.
- Rationale: Satisfies constitution principle V with automated enforcement.
- Alternatives considered:
  - Manual review only: rejected due to inconsistency risk.

## Clarification Resolution Status

All planning unknowns are resolved. No remaining `NEEDS CLARIFICATION` items.
