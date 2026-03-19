# Implementation Plan: UC-16 Drop Priority Over Withdrawal

**Branch**: `[016-drop-priority-withdrawal]` | **Date**: 2026-03-09 | **Spec**: [spec.md](/home/thaia/ECE493Group19/specs/016-drop-priority-withdrawal/spec.md)
**Input**: Feature specification from `/specs/016-drop-priority-withdrawal/spec.md`

## Summary

Implement the UC-16 class-removal workflow as a web MVC feature that evaluates the add/drop deadline, applies drop before the deadline, applies withdrawal at or after the deadline, blocks the action when policy data cannot be determined, and preserves schedule and fee state if updates fail. The design uses HTML/CSS/JavaScript with SQLite-backed student, course, enrollment, policy, and fee data, plus contract-first documentation for the removal flow.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2023)  
**Primary Dependencies**: Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript  
**Storage**: SQLite  
**Testing**: Browser-based acceptance tests, JavaScript unit tests for model/controller logic, integration tests for SQLite-backed removal flow  
**Target Platform**: Web application running in modern desktop browsers  
**Project Type**: MVC web application  
**Performance Goals**: Return the final removal result within 1 second for at least 95% of requests under up to 20 concurrent class-removal attempts  
**Constraints**: HTML/CSS/JavaScript and SQLite only; preserve MVC boundaries; do not modify protected use case or acceptance-test artifacts; maintain Google HTML/CSS and JavaScript style-guide compliance  
**Scale/Scope**: Single university deployment supporting roughly 5,000 active students, 500 concurrent signed-in users, and up to 20 concurrent class-removal attempts during peak registration periods

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.
  Evidence: Scope maps directly to [UC-16.md](/home/thaia/ECE493Group19/Use%20Cases/UC-16.md) and [UC-16-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-16-AS.md).
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
  Evidence: Technical context and research restrict the feature to HTML/CSS/JavaScript for MVC web delivery and SQLite persistence.
- [x] Design preserves Model-View-Controller boundaries and identifies where account and course data persist in SQLite.
  Evidence: Project structure, data model, and contracts separate controllers, models, views, and place student/course/enrollment/policy data in SQLite.
- [x] Plan does not modify `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md` without explicit user authorization.
  Evidence: Plan outputs are confined to `/specs/016-drop-priority-withdrawal/` and agent-context sync only.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.
  Evidence: Quickstart and plan require implementation review against both style guides before merge.

Post-design re-check: PASS. Phase 1 artifacts preserve the same stack, MVC structure, protected-file constraints, and style-guide enforcement.

## Project Structure

### Documentation (this feature)

```text
specs/016-drop-priority-withdrawal/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── class-removal-ui-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── controllers/
│   └── class-removal-controller.js
├── models/
│   ├── student-model.js
│   ├── course-model.js
│   ├── enrollment-model.js
│   ├── deadline-policy-model.js
│   └── fee-outcome-model.js
└── views/
    └── class-removal/
        ├── removal-form.html
        ├── removal-result.html
        └── removal-error.html

public/
├── css/
│   └── class-removal.css
└── js/
    └── class-removal.js

database/
├── schema/
│   └── enrollment.sql
└── seeds/
    └── uc16-fixtures.sql

tests/
├── unit/
│   ├── deadline-policy-model.test.js
│   └── class-removal-controller.test.js
├── integration/
│   └── class-removal-flow.test.js
└── acceptance/
    └── uc16-acceptance-checklist.md
```

**Structure Decision**: Use a single MVC web application layout rooted at `app/`, `public/`, `database/`, and `tests/`. This structure keeps controller, model, and view ownership explicit while reserving SQLite schema and fixture files for deadline, enrollment, and fee-state validation.

## Complexity Tracking

No constitution violations or exceptional complexity require justification for this feature.
