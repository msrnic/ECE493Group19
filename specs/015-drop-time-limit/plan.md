# Implementation Plan: Time Limit for Dropping from a Class (UC-15)

**Branch**: `015-drop-time-limit` | **Date**: 2026-03-14 | **Spec**:
[/Users/ahsanmansoor/ECE493Group19/specs/015-drop-time-limit/spec.md](/Users/ahsanmansoor/ECE493Group19/specs/015-drop-time-limit/spec.md)
**Input**: Feature specification from
`/specs/015-drop-time-limit/spec.md`

## Summary

Implement UC-15 to display and enforce term-specific drop deadlines so students
can understand whether dropping is currently allowed. The design provides
MVC-aligned deadline display/evaluation components, strict cutoff enforcement,
timezone-consistent decisions, and failure-safe blocking when deadline data is
unavailable.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2021)  
**Primary Dependencies**: Node.js runtime, SQLite driver, academic calendar
configuration service layer  
**Storage**: SQLite tables for term deadline rules and eligibility evaluation
audit entries  
**Testing**: Manual acceptance execution from `Acceptance Tests/UC-15-AS.md`,
unit tests for deadline evaluator, integration tests for before/after/error
paths with time control and fault injection  
**Target Platform**: Browser-based student portal + server runtime on Linux/macOS  
**Project Type**: Web application (MVC)  
**Performance Goals**: Deadline status displayed in <=1 second under normal
conditions; eligibility decision available in <=2 seconds  
**Constraints**: Strict cutoff with no grace period; canonical university
timezone; block on deadline uncertainty; no protected file edits  
**Scale/Scope**: Current term-based drop deadline enforcement mapped to UC-15 and
UC-15-AS

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with
      corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
- [x] Design preserves Model-View-Controller boundaries and identifies where
      account and course data persist in SQLite.
- [x] Plan does not modify `Use Cases/UC-*.md` or
      `Acceptance Tests/UC-*-AS.md` without explicit user authorization.
- [x] Implementation approach includes style compliance with
      `Style Guides/google-style-guide-html-css.md` and
      `Style Guides/google-style-guide-javascript.md`.

## Project Structure

### Documentation (this feature)

```text
specs/015-drop-time-limit/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── controllers/
│   └── deadline-controller.js
├── models/
│   ├── deadline-rule-model.js
│   └── deadline-evaluation-model.js
├── services/
│   └── deadline-policy-service.js
├── routes/
│   └── deadline-routes.js
└── views/
    └── deadlines/
        ├── add-drop-deadlines.html
        └── drop-eligibility-panel.html

public/
├── css/
│   └── deadlines.css
└── js/
    └── deadlines.js

tests/
├── integration/
│   └── deadline-policy.integration.test.js
└── unit/
    ├── deadline-policy-service.test.js
    └── deadline-controller.test.js
```

**Structure Decision**: Single MVC web application structure with centralized
SQLite-backed deadline rules and service-level eligibility decisions.

## Complexity Tracking

No constitution violations identified; complexity exceptions are not required.
