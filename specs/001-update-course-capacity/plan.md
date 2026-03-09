# Implementation Plan: Update Course Capacity

**Branch**: `001-update-course-capacity` | **Date**: 2026-03-09 | **Spec**: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-update-course-capacity/spec.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-update-course-capacity/spec.md)
**Input**: Feature specification from `/specs/001-update-course-capacity/spec.md`

## Summary

Implement administrator course-capacity updates with stale-write protection, below-enrollment override workflow, and transactional persistence so capacity + remaining seats updates are atomic. The implementation uses a JavaScript MVC web app (HTML/CSS/JS views + JS controllers/models) backed by SQLite for durable account/course/override audit data.

## Technical Context

**Language/Version**: JavaScript (Node.js 20 LTS for server/controllers/models, ES2022 browser JavaScript for views)  
**Primary Dependencies**: Express 4 (routing/controllers), better-sqlite3 (SQLite access), EJS (server-rendered HTML views), express-validator (input validation), dotenv (config)  
**Storage**: SQLite 3 (`data/app.db`) with persistent account, course offering, enrollment snapshot, and override audit tables  
**Testing**: Jest + Supertest (unit/integration/API contract checks)  
**Target Platform**: Linux server environment for app runtime; modern desktop browsers for admin UI  
**Project Type**: Web application (MVC monolith)  
**Performance Goals**: Meet SC-001 by completing 95% of valid updates within 10 seconds  
**Constraints**: HTML/CSS/JavaScript stack only, SQLite only, reject stale submissions, retain override approvals for 7 years, do not modify protected UC/AS artifacts  
**Scale/Scope**: Admin workflow for one use case (UC-40) with expected concurrent edits by multiple administrators

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
- [x] Design preserves Model-View-Controller boundaries and identifies where account and course data persist in SQLite.
- [x] Plan does not modify `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md` without explicit user authorization.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.

### Post-Design Gate (After Phase 1)

- [x] Scope remains traceable to UC-40 and UC-40-AS scenarios (success, invalid reduction, failure handling, stale submission).
- [x] Contracts and data model keep SQLite as single source of persistence for account/course/override audit data.
- [x] MVC ownership is explicit: models (DB/state), controllers (workflow/validation), views (HTML/CSS/JS UI).
- [x] No protected use-case or acceptance artifacts were modified.
- [x] Design artifacts include style-guide compliance checkpoints for HTML/CSS and JavaScript.

## Project Structure

### Documentation (this feature)

```text
specs/001-update-course-capacity/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md                 # Created later by /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── controllers/
│   └── courseCapacityController.js
├── models/
│   ├── accountModel.js
│   ├── courseOfferingModel.js
│   └── capacityOverrideModel.js
├── views/
│   └── course-capacity/
│       ├── edit.ejs
│       └── result.ejs
├── routes/
│   └── courseCapacityRoutes.js
├── public/
│   ├── css/
│   │   └── course-capacity.css
│   └── js/
│       └── course-capacity.js
└── db/
    ├── migrations/
    │   └── 001_course_capacity_override.sql
    └── sqliteClient.js

tests/
├── unit/
│   ├── models/
│   └── controllers/
├── integration/
│   └── course-capacity-flow.test.js
└── contract/
    └── course-capacity-api.test.js
```

**Structure Decision**: Use a single MVC web application in `src/` with server-rendered HTML views and controller-driven routes. SQLite access is isolated in model/db layers to preserve controller/view separation and satisfy constitution principles II and III.

## Phase 0: Research Plan

- Resolve policy and concurrency choices needed for deterministic implementation behavior.
- Validate SQLite transaction and retention approach for 7-year override audit requirement.
- Lock API/interface decisions needed for Phase 1 contracts.

## Phase 1: Design Plan

- Define entities and validation/state rules in `data-model.md`.
- Define REST endpoints and schemas in `contracts/openapi.yaml`.
- Define implementation + verification workflow in `quickstart.md`.
- Update Codex agent context using `.specify/scripts/bash/update-agent-context.sh codex`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
