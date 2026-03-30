# Implementation Plan: UC-26 Create Custom Scheduling Constraints

**Branch**: `[026-branch-scheduling-constraints]` | **Date**: 2026-03-11 | **Spec**: [spec.md](/home/thaia/ECE493Group19/specs/026-branch-scheduling-constraints/spec.md)
**Input**: Feature specification from `/specs/026-branch-scheduling-constraints/spec.md`

## Summary

Add a student-facing constraints editor that lets authenticated students create, update, confirm conflicting, and delete term-specific scheduling constraints used by schedule generation. The implementation will use the repository’s required HTML/CSS/JavaScript plus SQLite stack, with MVC separation between controller flows, persisted constraint models, and view rendering for create/save/delete/error states.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2023)  
**Primary Dependencies**: Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript  
**Storage**: SQLite for account information, course information, and term-scoped student scheduling constraints  
**Testing**: `npm test && npm run lint`, plus UC-26 acceptance scenario coverage  
**Target Platform**: Browser-based web application on desktop and mobile-class browsers  
**Project Type**: Web application with MVC separation across `frontend/`, `backend/`, and `tests/`  
**Performance Goals**: Successful save or failure response within 5 seconds for at least 95% of attempts under normal operating conditions  
**Constraints**: HTML/CSS/JavaScript and SQLite only; preserve MVC boundaries; do not modify `Use Cases/UC-26.md` or `Acceptance Tests/UC-26-AS.md`; comply with Google HTML/CSS and JavaScript style guides  
**Scale/Scope**: One authenticated student's constraint set per term, with support for blocked time ranges, earliest-start preferences, latest-end preferences, no-class day preferences, professor preferences, validation warnings, delete flow, and save-failure recovery

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to `Use Cases/UC-26.md`, with corresponding acceptance criteria in `Acceptance Tests/UC-26-AS.md`.
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
- [x] Design preserves Model-View-Controller boundaries and identifies where account, course, and scheduling-constraint data persist in SQLite.
- [x] Plan does not modify `Use Cases/UC-26.md` or `Acceptance Tests/UC-26-AS.md` without explicit user authorization.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.

## Project Structure

### Documentation (this feature)

```text
specs/026-branch-scheduling-constraints/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── constraints-editor-ui-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── models/
├── controllers/
├── services/
└── db/

frontend/
├── pages/
├── controllers/
├── views/
└── styles/

tests/
├── acceptance/
├── integration/
└── unit/
```

**Structure Decision**: Use the project-standard web application split declared in [AGENTS.md](/home/thaia/ECE493Group19/AGENTS.md), even though the source directories are not yet present in the current branch. Constraint persistence and schedule-read integration belong under `backend/`; the constraints editor and confirmation/error views belong under `frontend/`; validation, persistence, and acceptance coverage belong under `tests/`.

## Phase 0: Research Plan

Resolved the planning unknowns before design:

- Constraint persistence model for one student and one term
- Conflict-handling behavior after validation warnings
- MVC boundary for schedule-constraint editing versus later schedule generation
- Validation and failure-handling patterns that preserve prior saved state

Research outputs are documented in [research.md](/home/thaia/ECE493Group19/specs/026-branch-scheduling-constraints/research.md). No `NEEDS CLARIFICATION` items remain.

## Phase 1: Design Plan

- Derive the term-scoped constraint entities, validation states, and relationships in [data-model.md](/home/thaia/ECE493Group19/specs/026-branch-scheduling-constraints/data-model.md).
- Define the user-facing constraints editor interaction contract in [constraints-editor-ui-contract.md](/home/thaia/ECE493Group19/specs/026-branch-scheduling-constraints/contracts/constraints-editor-ui-contract.md).
- Capture implementation and verification steps in [quickstart.md](/home/thaia/ECE493Group19/specs/026-branch-scheduling-constraints/quickstart.md).
- Refresh agent context after the technical context is finalized.

## Post-Design Constitution Check

- [x] UC-26 scope, scenarios, and acceptance-test traceability remain intact across plan, research, data model, contract, and quickstart artifacts.
- [x] The design remains within HTML/CSS/JavaScript plus SQLite.
- [x] MVC ownership is explicit: persistence rules in backend models/services, user actions in controllers, and display/error states in frontend views.
- [x] No protected use-case or acceptance-test artifacts are modified by this plan.
- [x] Style-guide compliance remains an explicit implementation and review requirement.

## Complexity Tracking

No constitution violations or justified exceptions.
