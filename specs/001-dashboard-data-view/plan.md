# Implementation Plan: Dashboard Data View

**Branch**: `001-dashboard-data-view` | **Date**: 2026-03-08 | **Spec**: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-view/spec.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-view/spec.md)
**Input**: Feature specification from `/specs/001-dashboard-data-view/spec.md`

## Summary

Implement dashboard-linked data views for `UC-06`, `UC-20`, `UC-21`, `UC-33`, and `UC-36` using an MVC web architecture with HTML/CSS/JavaScript and SQLite. The solution adds role- and page-aware retrieval, partial-data rendering with missing-data indicators, stale-data indicators, and denied-access audit logging.

## Technical Context

**Language/Version**: JavaScript (Node.js 20 LTS for server, modern browser JavaScript for client)  
**Primary Dependencies**: Express 4 (controller routing), EJS (server-rendered views), `better-sqlite3` (SQLite access), `express-session` (session auth context)  
**Storage**: SQLite 3 (`sis.db`) for persistent account, role, course, enrollment, page-content, and access-audit data  
**Testing**: Vitest + Supertest (controller/model integration), Playwright (critical dashboard page flows)  
**Target Platform**: Linux-hosted web app, latest Chrome/Firefox/Edge on desktop  
**Project Type**: Web application (server-rendered MVC)  
**Performance Goals**: 95% of in-scope dashboard page data loads complete within 5 seconds (SC-006)  
**Constraints**: HTML/CSS/JavaScript + SQLite only, strict MVC ownership, no edits to protected use case/acceptance files, denied access must be audited  
**Scale/Scope**: 5 in-scope page flows, roles `registered_user`, `student`, `professor`, and read-heavy dashboard traffic with per-request authorization checks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.  
      Scope maps to `UC-06`, `UC-20`, `UC-21`, `UC-33`, `UC-36` and matching `UC-06-AS`, `UC-20-AS`, `UC-21-AS`, `UC-33-AS`, `UC-36-AS`.
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.  
      Server and client are JavaScript, views are HTML/CSS, persistence is SQLite.
- [x] Design preserves Model-View-Controller boundaries and identifies where account and course data persist in SQLite.  
      Models own SQLite access (`accounts`, `courses`, related tables); controllers orchestrate authorization/fetch; views render page states.
- [x] Plan does not modify `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md` without explicit user authorization.  
      Feature plan and design artifacts are isolated to `specs/001-dashboard-data-view/`.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.  
      Add linting/config and review checklist enforcing guide-aligned JavaScript and HTML/CSS formatting.

## Project Structure

### Documentation (this feature)

```text
specs/001-dashboard-data-view/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── dashboard-data-view.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
server/
├── app.js
├── controllers/
│   └── dashboardController.js
├── models/
│   ├── accountModel.js
│   ├── courseModel.js
│   ├── dashboardDataModel.js
│   └── accessAuditModel.js
├── services/
│   └── dashboardAuthorizationService.js
├── views/
│   ├── dashboard/
│   │   ├── contact-info.ejs
│   │   ├── course-history.ejs
│   │   ├── transcript.ejs
│   │   ├── student-basic-info.ejs
│   │   └── grade-summary.ejs
│   └── shared/
│       ├── no-data-state.ejs
│       ├── missing-item-badge.ejs
│       └── stale-item-badge.ejs
├── public/
│   ├── css/
│   │   └── dashboard.css
│   └── js/
│       └── dashboard.js
├── routes/
│   └── dashboardRoutes.js
└── db/
    ├── schema.sql
    └── sis.db

tests/
├── unit/
│   └── models/
├── integration/
│   └── dashboard-controller.test.js
├── e2e/
│   └── dashboard-data-states.spec.js
└── contract/
    └── dashboard-data-view-api.test.js
```

**Structure Decision**: Use a single server-rendered web MVC application under `server/`, with explicit controller/model/view ownership and shared rendering components for missing-data and stale-data indicators.

## Phase 0 Research Plan

- Resolve dependency choices for MVC routing/view rendering and SQLite access in JavaScript.
- Define best practices for role-based data filtering at both page and field level.
- Define partial-data, no-data, and may-be-outdated UI behavior contracts.
- Define denied-access audit logging schema and retention considerations.

## Phase 1 Design Plan

- Produce normalized SQLite model for account/course persistence plus dashboard data and audit records.
- Define endpoint/view contracts for each in-scope dashboard page.
- Create quickstart flow for local setup, schema bootstrap, seed data, and validation.
- Update agent context with only newly introduced technology decisions.

## Post-Design Constitution Check

- [x] Use-case and acceptance traceability preserved for all five in-scope UCs.
- [x] Stack remains HTML/CSS/JavaScript + SQLite with no additional runtime language.
- [x] MVC boundaries and SQLite account/course persistence are explicit in design artifacts.
- [x] No protected `Use Cases/` or `Acceptance Tests/` files modified.
- [x] Style-guide compliance strategy is included in implementation/testing approach.

## Complexity Tracking

No constitution violations or approved exceptions.
