# Implementation Plan: UC-24 Warn About Time Conflicts in Candidate Schedules

**Branch**: `[024-branch-conflict-warnings]` | **Date**: 2026-03-11 | **Spec**: [spec.md](/home/thaia/ECE493Group19/specs/024-branch-conflict-warnings/spec.md)
**Input**: Feature specification from `/specs/024-branch-conflict-warnings/spec.md`

## Summary

Add an MVC schedule-conflict analysis flow that lets an authenticated student inspect a generated candidate schedule, detect overlapping meeting-time conflicts, confirm conflict-free schedules, and handle incomplete or unavailable conflict analysis without changing registration state. The implementation will use server-rendered HTML/CSS/JavaScript views, JavaScript controllers/services, and SQLite-backed account/course/timetable data.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2023)  
**Primary Dependencies**: Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript  
**Storage**: SQLite for account information, course information, timetable records, and generated schedule records used as conflict-analysis inputs  
**Testing**: Acceptance scenarios from `Acceptance Tests/UC-24-AS.md`, plus JavaScript unit and integration coverage for models, controllers, and views  
**Target Platform**: Server-rendered web application for modern desktop and mobile browsers  
**Project Type**: Web application  
**Performance Goals**: Render a conflict-analysis result view for a selected candidate schedule within 2 seconds in normal operating conditions; always return a user-visible incomplete or unavailable state instead of a silent failure  
**Constraints**: HTML/CSS/JavaScript + SQLite only; preserve MVC boundaries; treat only overlapping meeting times as conflicts; conflict analysis is advisory only and must not alter registration data; do not edit protected use-case or acceptance-test artifacts  
**Scale/Scope**: Single-student interactive analysis of one generated candidate schedule at a time within an active academic term

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to `Use Cases/UC-24.md` and `Acceptance Tests/UC-24-AS.md`.
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
- [x] Design preserves Model-View-Controller boundaries and identifies SQLite persistence for account information and course information, along with timetable and generated-schedule records used for conflict analysis.
- [x] Plan does not modify `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md` without explicit user authorization.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.

Post-design review: PASS. Research, data model, quickstart, and UI contract remain within the required stack, MVC separation, protected-file constraints, and acceptance traceability rules.

## Project Structure

### Documentation (this feature)

```text
specs/024-branch-conflict-warnings/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── conflict-analysis-ui-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── controllers/
│   └── schedule-conflict-controller.js
├── models/
│   ├── candidate-schedule-model.js
│   ├── meeting-component-model.js
│   └── timetable-model.js
├── services/
│   └── conflict-analysis-service.js
└── views/
    └── schedule-conflict/
        ├── schedule-conflict-result.html
        ├── schedule-conflict-incomplete.html
        └── schedule-conflict-unavailable.html

database/
├── migrations/
└── seeds/

public/
├── css/
│   └── schedule-conflict.css
└── js/
    └── schedule-conflict.js

tests/
├── acceptance/
├── integration/
└── unit/
```

**Structure Decision**: Use a web-application MVC layout rooted at `app/`, `public/`, `database/`, and `tests/`. Models encapsulate account/course/timetable/generated-schedule persistence, controllers coordinate authenticated requests and state selection, services perform overlap-only conflict analysis in memory for the current request, and views render conflict, conflict-free, incomplete, and unavailable outcomes.

## Phase 0: Research

- Confirm the overlap-only conflict rule and how back-to-back meetings are treated.
- Define how incomplete analysis should be represented when one or more meeting components have TBA or partial times.
- Define a failure-handling pattern for unavailable timetable data that preserves advisory-only behavior and clear retry guidance.
- Confirm a style-compliant MVC rendering pattern for state-specific conflict-analysis views in the mandated stack.

## Phase 1: Design & Contracts

- Model candidate schedules, meeting components, conflict warnings, and conflict-analysis outcomes with explicit validation rules.
- Define the controller/view contract for conflict, conflict-free, incomplete, and unavailable result states.
- Define quickstart validation scenarios aligned to `AT-UC24-01` through `AT-UC24-04`.
- Capture MVC ownership for persistence, analysis, and rendering responsibilities before task generation.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required for this feature.
