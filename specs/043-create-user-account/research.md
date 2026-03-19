# Phase 0 Research: Administrative Account Creation

## Scope

Feature: `043-create-user-account`  
Primary traceability targets: `UC-43`, `UC-43-AS`, spec FR-001..FR-017.

## Decision 1: Runtime and Web Stack

- Decision: Use JavaScript end-to-end with Node.js 20 LTS on the server, server-rendered HTML views, CSS for styling, and vanilla browser JavaScript for client behavior.
- Rationale: Satisfies constitution-mandated stack exactly (HTML/CSS/JavaScript), minimizes framework overhead, and preserves direct MVC ownership.
- Alternatives considered: TypeScript (rejected to keep mandate strictly JavaScript and avoid extra transpilation complexity); SPA framework (rejected because server-rendered MVC is simpler for admin forms and validation state preservation).

## Decision 2: SQLite Access Strategy

- Decision: Use SQLite as the sole system database with `better-sqlite3` and explicit schema constraints.
- Rationale: Meets constitutional requirement, supports transactional account + role creation, and provides deterministic synchronous access useful for administrative workflows.
- Alternatives considered: Sequelize ORM with SQLite driver (rejected to avoid ORM abstraction complexity at this project stage); file-based JSON storage (rejected because it violates SQLite requirement).

## Decision 3: MVC Boundaries

- Decision: Enforce strict module separation:
  - Models: persistence and domain rules for account, credential, role, and course tables.
  - Controllers: request orchestration, validation outcomes, and HTTP responses.
  - Views: account creation form, inline validation feedback, success/error notices.
- Rationale: Directly satisfies constitution Principle III and supports testable business logic.
- Alternatives considered: Route handlers directly querying DB (rejected because it collapses MVC boundaries and complicates testing).

## Decision 4: Password Handling and First-Login Reset

- Decision: Hash all stored passwords with bcrypt and set `must_change_password = 1` for all newly created accounts, including generated temporary passwords.
- Rationale: Aligns with FR-010 and FR-017, and keeps password reset semantics uniform.
- Alternatives considered: Storing reversible encrypted passwords (rejected due to security risk); conditional first-login reset only for generated passwords (rejected because spec requires mandatory change for all new accounts).

## Decision 5: Duplicate Detection and Normalization

- Decision: Normalize submitted login identifier by trimming leading/trailing whitespace and lowercasing before uniqueness checks and persistence in a dedicated normalized column.
- Rationale: Implements FR-008 and handles race conditions with a unique DB constraint on normalized identifier.
- Alternatives considered: Application-only duplicate checks without DB unique constraint (rejected due to race conditions); case-sensitive uniqueness (rejected by clarified requirement).

## Decision 6: Failure Handling and Transaction Pattern

- Decision: Perform validation and account+role+credential writes in one SQLite transaction; on write failure, roll back fully and log operational error.
- Rationale: Ensures no partial records for extension 9a / FR-012 and preserves consistency.
- Alternatives considered: Multi-step writes without transaction (rejected due to partial-state risk).

## Decision 7: Notification Integration Contract

- Decision: Treat notification as post-commit side-effect. If delivery fails, return account creation success with a warning payload (`notificationStatus = failed`) and do not roll back account data.
- Rationale: Implements FR-014 and FR-016 while keeping account creation durable.
- Alternatives considered: Roll back account on notification failure (rejected by FR-014); include resend/copy recovery actions in this feature (rejected by clarification and FR-016).

## Decision 8: Validation and UX Behavior

- Decision: Use shared validation rules server-side, with optional client-side prechecks for immediate feedback; preserve non-sensitive values on failed submit.
- Rationale: Implements FR-005/FR-006/FR-007/FR-013 and keeps server as source of truth.
- Alternatives considered: Client-only validation (rejected as insecure/incomplete); full form reset on errors (rejected by FR-013).

## Decision 9: Test Strategy

- Decision: Use layered tests:
  - Unit tests for normalization, password policy, and permission checks.
  - Integration tests for controller + SQLite transaction behavior.
  - Contract tests against OpenAPI for status-code/payload guarantees.
  - One end-to-end browser test for successful create and one for validation correction.
- Rationale: Covers UC-43 main and extension flows with practical depth.
- Alternatives considered: E2E-only testing (rejected due to slow diagnosis); unit-only testing (rejected due to missing transaction/HTTP behavior coverage).

## Resolved Clarifications

All technical-context unknowns are resolved for planning:
- Language/version: resolved.
- Dependencies: resolved.
- Storage: resolved.
- Testing approach: resolved.
- Platform/project type: resolved.
- Performance/constraints/scope: resolved.
