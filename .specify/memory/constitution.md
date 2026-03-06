<!--
Sync Impact Report
- Version change: N/A -> 1.0.0
- Modified principles:
  - N/A -> I. Use-Case-Driven Scope and Acceptance Coverage
  - N/A -> II. Mandatory Technology Stack
  - N/A -> III. MVC Architecture and Data Boundaries
  - N/A -> IV. Protected Use Case and Acceptance Artifacts
  - N/A -> V. Enforced Style Guide Compliance
- Added sections:
  - Project Constraints and Technical Standards
  - Development Workflow and Quality Gates
  - Governance
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ updated: /home/m_srnic/ece493/group_project/ECE493Group19/.specify/templates/plan-template.md
  - ✅ updated: /home/m_srnic/ece493/group_project/ECE493Group19/.specify/templates/spec-template.md
  - ✅ updated: /home/m_srnic/ece493/group_project/ECE493Group19/.specify/templates/tasks-template.md
  - ⚠ pending: /home/m_srnic/ece493/group_project/ECE493Group19/.specify/templates/commands/*.md (directory not present)
  - ✅ updated: /home/m_srnic/ece493/group_project/ECE493Group19/README.md
- Follow-up TODOs:
  - None
-->
# ECE493Group19 Constitution

## Core Principles

### I. Use-Case-Driven Scope and Acceptance Coverage
All feature scope MUST originate from `Use Cases/UC-XX.md` files, and every
implemented use case MUST have a matching acceptance test definition in
`Acceptance Tests/UC-XX-AS.md`. Delivery is not complete until behavior aligns
with the corresponding acceptance test suite.

Rationale: This project is defined by explicit use cases, so traceability from
implementation to acceptance criteria is required to control scope and validate
correctness.

### II. Mandatory Technology Stack
The application MUST be implemented with HTML, CSS, and JavaScript for the web
stack, and MUST use SQLite as the system database.

Rationale: A fixed stack keeps implementation consistent across contributors and
aligns with the project's required tooling.

### III. MVC Architecture and Data Boundaries
The system MUST follow Model-View-Controller architecture. The data model MUST
include persistent storage for account information and course information in
SQLite.

Rationale: MVC separation improves maintainability and testability, while
required account/course data boundaries ensure core student information needs are
always represented.

### IV. Protected Use Case and Acceptance Artifacts
Files matching `Use Cases/UC-*.md` and `Acceptance Tests/UC-*-AS.md` MUST NOT be
edited without explicit user permission recorded in the task or change request.

Rationale: These artifacts are foundational requirements. Unapproved edits can
change project scope without authorization.

### V. Enforced Style Guide Compliance
All HTML/CSS and JavaScript code MUST comply with the style guides in
`Style Guides/google-style-guide-html-css.md` and
`Style Guides/google-style-guide-javascript.md`.

Rationale: Consistent style improves readability, review quality, and debugging
speed across the team.

## Project Constraints and Technical Standards

1. Source changes MUST preserve one-to-one traceability between use cases,
acceptance tests, implementation tasks, and validation evidence.
2. Any proposed deviation from the mandated stack or architecture MUST be treated
as a constitution amendment and cannot be merged under normal feature work.
3. New modules, routes, and pages MUST declare MVC ownership (model, view, or
controller responsibility) in planning artifacts.

## Development Workflow and Quality Gates

1. During specification, each user story MUST cite applicable `UC-XX` IDs and
expected acceptance test links.
2. During planning, the Constitution Check MUST verify stack compliance, MVC
structure, style-guide enforcement strategy, and protected-file constraints.
3. During implementation, tasks MUST include explicit work to maintain or execute
acceptance validation for impacted use cases.
4. Before merge, reviewers MUST confirm no protected use-case artifacts were
modified without recorded authorization.

## Governance

1. This constitution overrides conflicting process documents for this repository.
2. Amendments require: (a) a documented proposal, (b) explicit project approval,
and (c) updates to impacted templates and guidance artifacts in the same change.
3. Versioning policy for this constitution follows semantic versioning:
   - MAJOR: Removal or incompatible redefinition of a principle or governance
     requirement.
   - MINOR: New principle or materially expanded mandatory guidance.
   - PATCH: Clarifications, wording improvements, or non-semantic refinements.
4. Compliance review is REQUIRED at plan approval and pull-request review. Any
violations MUST be resolved or explicitly approved as an amendment exception.

**Version**: 1.0.0 | **Ratified**: 2026-03-06 | **Last Amended**: 2026-03-06
