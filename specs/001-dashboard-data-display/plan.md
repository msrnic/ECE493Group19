# Implementation Plan: Dashboard Data Display

**Branch**: `001-dashboard-data-display` | **Date**: 2026-03-07 | **Spec**: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/spec.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/spec.md)
**Input**: Feature specification from `/specs/001-dashboard-data-display/spec.md`

## Summary

Implement the in-scope course list dashboard page as a web MVC feature where a JavaScript controller fetches latest course list data, applies existing access-policy checks, and renders a resilient HTML/CSS view that supports complete, partial, and unavailable results. Persist and read account/course data from SQLite, and persist retrieval outcome statuses (`complete`, `partial`, `none`) for operational reporting.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2022)  
**Primary Dependencies**: Node.js runtime for tooling, Express.js web server, `sqlite3` driver, server-side template rendering (EJS)  
**Storage**: SQLite (accounts, courses, access-policy mappings, retrieval outcome logs)  
**Testing**: Node test runner + integration tests for controller/model flows, browser-level UI checks for rendering/access behavior  
**Target Platform**: Linux-hosted web application (modern desktop/mobile browsers)  
**Project Type**: Web application (server-rendered MVC)  
**Performance Goals**: >=95% of course-list page requests render complete/partial results within 5 seconds  
**Constraints**: Must use existing role/permission rules with no new roles; must show available data even when partial; must show explicit no-data message when all sources unavailable; style-guide compliance required  
**Scale/Scope**: Single page in this release (dashboard-linked course list view) with role-based visibility and per-request retrieval-status logging

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with
      corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.
  Mapping: `UC-08` + `UC-08-AS` for dashboard navigation/retrieval/partial-data behavior, and `UC-20` + `UC-20-AS` for explicit authorization-denied behavior.
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
specs/001-dashboard-data-display/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── course-list-page-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── controllers/
│   └── courseListController.js
├── models/
│   ├── accountModel.js
│   ├── courseModel.js
│   └── retrievalStatusModel.js
├── views/
│   ├── dashboard/
│   └── courses/
│       └── course-list.ejs
├── routes/
│   └── courseListRoutes.js
└── services/
    └── accessPolicyService.js

db/
└── app.sqlite

tests/
├── integration/
│   └── course-list-page.test.js
├── unit/
│   ├── models/
│   └── controllers/
└── contract/
    └── course-list-page.contract.test.js
```

**Structure Decision**: Use a single web-application codebase with explicit MVC ownership. Models encapsulate SQLite access for accounts/courses/retrieval logs, controllers orchestrate request + authorization + status logging, views render HTML/CSS output states, and routes wire dashboard navigation to the course-list controller.

## Phase 0 Research Summary

All initially identified clarification points are resolved in [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/research.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/research.md), including runtime framework choice, SQLite schema strategy, retrieval-state semantics, and UI signaling patterns for partial/unavailable data.

## Phase 1 Design Summary

- Data model defined in [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/data-model.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/data-model.md), covering account/course/access/retrieval-status entities and validations.
- Interface contract documented in [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/contracts/course-list-page-contract.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/contracts/course-list-page-contract.md).
- Implementation/validation flow documented in [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/quickstart.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-dashboard-data-display/quickstart.md).

## Constitution Check (Post-Design Re-evaluation)

- [x] Scope traceability retained (`UC-08`/`UC-20` with `UC-08-AS`/`UC-20-AS`).
- [x] Stack remains HTML/CSS/JavaScript + SQLite; no alternative stack introduced.
- [x] MVC boundaries are explicit in structure and contract sections.
- [x] Account/course persistence explicitly modeled in SQLite tables.
- [x] No protected use-case/acceptance files modified.
- [x] Style-guide compliance is planned via implementation and review checklist in quickstart.

## Complexity Tracking

No constitution violations or exceptions were required.
