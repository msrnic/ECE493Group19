# Implementation Plan: UC-27 Set Constraint Priorities

**Branch**: `[027-branch-constraint-priorities]` | **Date**: 2026-03-11 | **Spec**: [spec.md](/home/thaia/ECE493Group19/specs/027-branch-constraint-priorities/spec.md)
**Input**: Feature specification from `/specs/027-branch-constraint-priorities/spec.md`

## Summary

Add a student-facing priority editor for existing scheduling constraints so the student can save a numeric 1-to-5 priority set, allow equal priorities, and rely on a documented tie-breaking rule during schedule ranking. The implementation will stay within the project’s HTML/CSS/JavaScript plus SQLite stack and maintain MVC separation between persisted priority data, controller validation/save flows, and the editor views for valid saves, invalid inputs, ties, and save failures.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2023)  
**Primary Dependencies**: Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript  
**Storage**: SQLite for account information, course information, saved scheduling constraints, and term-scoped constraint priority settings  
**Testing**: `npm test && npm run lint`, plus UC-27 acceptance scenario coverage  
**Target Platform**: Browser-based web application on desktop and mobile-class browsers  
**Project Type**: Web application with MVC separation across `frontend/`, `backend/`, and `tests/`  
**Performance Goals**: Successful priority save or reported save failure within 5 seconds for at least 95% of attempts under normal operating conditions  
**Constraints**: HTML/CSS/JavaScript and SQLite only; preserve MVC boundaries; do not modify `Use Cases/UC-27.md` or `Acceptance Tests/UC-27-AS.md`; comply with Google HTML/CSS and JavaScript style guides  
**Scale/Scope**: One authenticated student's constraint-priority set per term, using a numeric 1-to-5 scale where 1 is highest, equal priorities are allowed, displayed constraint order breaks ties, and save-failure recovery preserves the last saved priority set

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to `Use Cases/UC-27.md`, with corresponding acceptance criteria in `Acceptance Tests/UC-27-AS.md`.
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
- [x] Design preserves Model-View-Controller boundaries and identifies where account, course, scheduling-constraint, and constraint-priority data persist in SQLite.
- [x] Plan does not modify `Use Cases/UC-27.md` or `Acceptance Tests/UC-27-AS.md` without explicit user authorization.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.

## Project Structure

### Documentation (this feature)

```text
specs/027-branch-constraint-priorities/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── constraint-priority-ui-contract.md
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

**Structure Decision**: Use the project-standard web application split declared in [AGENTS.md](/home/thaia/ECE493Group19/AGENTS.md). Priority persistence and ranking-read behavior belong under `backend/`; the priority editor, validation, tie-policy messaging, and save-failure states belong under `frontend/`; acceptance validation evidence belongs under `tests/`.

## Phase 0: Research Plan

Resolved the planning unknowns before design:

- Priority model and allowed value range for saved priorities
- Tie-breaking behavior when equal priorities are allowed
- Persistence strategy for term-scoped student priority sets
- Save-failure handling that preserves the previous saved set

Research outputs are documented in [research.md](/home/thaia/ECE493Group19/specs/027-branch-constraint-priorities/research.md). No `NEEDS CLARIFICATION` items remain.

## Phase 1: Design Plan

- Derive the priority-setting entities, validation outcomes, and relationships in [data-model.md](/home/thaia/ECE493Group19/specs/027-branch-constraint-priorities/data-model.md).
- Define the user-facing priority editor interaction contract in [constraint-priority-ui-contract.md](/home/thaia/ECE493Group19/specs/027-branch-constraint-priorities/contracts/constraint-priority-ui-contract.md).
- Capture implementation and verification guidance in [quickstart.md](/home/thaia/ECE493Group19/specs/027-branch-constraint-priorities/quickstart.md).
- Refresh agent context after the technical context is finalized.

## Post-Design Constitution Check

- [x] UC-27 scope, scenarios, and acceptance-test traceability remain intact across plan, research, data model, contract, and quickstart artifacts.
- [x] The design remains within HTML/CSS/JavaScript plus SQLite.
- [x] MVC ownership is explicit: persistence rules in backend models/services, user actions in controllers, and display/error states in frontend views.
- [x] No protected use-case or acceptance-test artifacts are modified by this plan.
- [x] Style-guide compliance remains an explicit implementation and review requirement.

## Complexity Tracking

No constitution violations or justified exceptions.
