# Implementation Plan: UC-28 Save and Name Constraint Sets

**Branch**: `[028-save-constraint-sets]` | **Date**: 2026-03-11 | **Spec**: [spec.md](/home/thaia/ECE493Group19/specs/028-save-constraint-sets/spec.md)
**Input**: Feature specification from `/specs/028-save-constraint-sets/spec.md`

## Summary

Add student-facing saved-set management for scheduling constraints so a student can save the current constraint configuration under a reusable name, handle duplicate-name overwrite policy explicitly, rename or delete existing saved sets, and recover cleanly from failed persistence operations. The implementation will stay within the project's HTML/CSS/JavaScript plus SQLite stack and preserve MVC separation between saved-set persistence, controller validation and conflict handling, and the saved-set list and form views.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2023)  
**Primary Dependencies**: Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript  
**Storage**: SQLite for account information, course information, scheduling constraints, and named constraint-set records  
**Testing**: `npm test && npm run lint`, plus UC-28 acceptance scenario coverage  
**Target Platform**: Browser-based web application on desktop and mobile-class browsers  
**Project Type**: Web application with MVC separation across `frontend/`, `backend/`, and `tests/`  
**Performance Goals**: Successful save, overwrite, rename, delete, or reported failure within 5 seconds for at least 95% of actions under normal operating conditions  
**Constraints**: HTML/CSS/JavaScript and SQLite only; preserve MVC boundaries; do not modify `Use Cases/UC-28.md` or `Acceptance Tests/UC-28-AS.md`; comply with Google HTML/CSS and JavaScript style guides  
**Scale/Scope**: One authenticated student's named constraint-set collection per term, with names limited to 50 trimmed characters using the allowed character rule, duplicate-name detection by normalized comparison, explicit overwrite confirmation, and failure-safe persistence for save, rename, and delete flows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to `Use Cases/UC-28.md`, with corresponding acceptance criteria in `Acceptance Tests/UC-28-AS.md`.
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
- [x] Design preserves Model-View-Controller boundaries and identifies where account, course, scheduling-constraint, and named constraint-set data persist in SQLite.
- [x] Plan does not modify `Use Cases/UC-28.md` or `Acceptance Tests/UC-28-AS.md` without explicit user authorization.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.

## Project Structure

### Documentation (this feature)

```text
specs/028-save-constraint-sets/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── saved-constraint-set-ui-contract.md
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

**Structure Decision**: Use the project-standard web application split declared in [AGENTS.md](/home/thaia/ECE493Group19/AGENTS.md). Named constraint-set persistence and overwrite/delete rules belong under `backend/`; student actions, validation responses, and saved-set-management display states belong under `frontend/`; acceptance validation evidence belongs under `tests/`.

## Phase 0: Research Plan

Resolved the planning unknowns before design:

- Saved-set naming policy for allowed characters, trimming, and duplicate comparison
- Overwrite behavior when a normalized duplicate name already exists
- Persistence behavior for save, rename, and delete actions scoped by student and term
- Failure handling that preserves previously saved named sets and prevents stale overwrites

Research outputs are documented in [research.md](/home/thaia/ECE493Group19/specs/028-save-constraint-sets/research.md). No `NEEDS CLARIFICATION` items remain.

## Phase 1: Design Plan

- Derive the named constraint-set entities, normalization rules, and operation outcomes in [data-model.md](/home/thaia/ECE493Group19/specs/028-save-constraint-sets/data-model.md).
- Define the student-facing saved-set management interaction contract in [saved-constraint-set-ui-contract.md](/home/thaia/ECE493Group19/specs/028-save-constraint-sets/contracts/saved-constraint-set-ui-contract.md).
- Capture implementation and verification guidance in [quickstart.md](/home/thaia/ECE493Group19/specs/028-save-constraint-sets/quickstart.md).
- Refresh agent context after the technical context is finalized.

## Post-Design Constitution Check

- [x] UC-28 scope, scenarios, and acceptance-test traceability remain intact across plan, research, data model, contract, and quickstart artifacts.
- [x] The design remains within HTML/CSS/JavaScript plus SQLite.
- [x] MVC ownership is explicit: persistence rules in backend models/services, user actions in controllers, and display/error states in frontend views.
- [x] No protected use-case or acceptance-test artifacts are modified by this plan.
- [x] Style-guide compliance remains an explicit implementation and review requirement.

## Complexity Tracking

No constitution violations or justified exceptions.
