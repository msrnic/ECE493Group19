# Implementation Plan: Student Inbox Notifications

**Branch**: `[001-student-inbox-notifications]` | **Date**: 2026-03-10 | **Spec**: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-student-inbox-notifications/spec.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-student-inbox-notifications/spec.md)
**Input**: Feature specification from `/specs/001-student-inbox-notifications/spec.md`

## Summary

Implement UC-42 as an MVC web feature where administrators compose and send in-app notifications to students selected by individual, course roster, or group. The design uses HTML/CSS/JavaScript for views/controllers, a JavaScript backend controller/service layer, and SQLite persistence for account/course data plus notification send requests and per-recipient delivery attempts with retry and retention rules.

## Technical Context

**Language/Version**: JavaScript (ES2023) for server and browser, HTML5, CSS3  
**Primary Dependencies**: Node.js 22 LTS, Express 5 (HTTP + routing), better-sqlite3 (SQLite access), server-side template engine for HTML views, client-side vanilla JavaScript modules  
**Storage**: SQLite (single system database with account, course, notification, and delivery tables)  
**Testing**: Node.js built-in test runner + supertest (API/integration), Playwright (end-to-end UI), SQL migration smoke checks  
**Target Platform**: Linux-hosted web app, modern desktop browsers for admin workflow  
**Project Type**: MVC web application (server-rendered HTML + JSON endpoints)  
**Performance Goals**: Meet SC-001 and SC-004 from spec (<=30s completion summary for <=500 recipients, >=98% successful deliveries reflected in inbox <=60s)  
**Constraints**: All-or-nothing authorization validation, deduplicate recipients per send, retry window 24h, delivery log retention 1 year, no protected artifact edits without permission  
**Scale/Scope**: Administrator sends to up to 500 recipients per request, per-recipient delivery status tracking, UC-42 + UC-42-AS full traceability

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate Review

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.
  - Primary mapping: `Use Cases/UC-42.md` and `Acceptance Tests/UC-42-AS.md`.
  - Downstream inbox behavior alignment: `Use Cases/UC-19.md` and `Acceptance Tests/UC-19-AS.md`.
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
- [x] Design preserves Model-View-Controller boundaries and identifies where account and course data persist in SQLite.
- [x] Plan does not modify `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md` without explicit user authorization.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.

### Post-Phase 1 Re-Check

- [x] `research.md`, `data-model.md`, `contracts/openapi.yaml`, and `quickstart.md` maintain UC-42 / UC-42-AS scope.
- [x] All designed interfaces and data storage remain HTML/CSS/JavaScript + SQLite.
- [x] MVC ownership is explicit in routes/controllers/views/models, including existing account/course SQLite entities.
- [x] No protected use-case/acceptance files were modified.
- [x] Style-guide conformance is included as a validation step in quickstart.

## Project Structure

### Documentation (this feature)

```text
specs/001-student-inbox-notifications/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── controllers/
│   │   └── admin-notifications-controller.js
│   ├── models/
│   │   ├── account-model.js
│   │   ├── course-model.js
│   │   ├── send-request-model.js
│   │   ├── recipient-set-model.js
│   │   └── delivery-attempt-model.js
│   ├── services/
│   │   ├── recipient-resolution-service.js
│   │   ├── authorization-service.js
│   │   ├── inbox-delivery-service.js
│   │   └── retry-service.js
│   ├── routes/
│   │   └── admin-notifications-routes.js
│   └── db/
│       ├── sqlite.js
│       └── migrations/
├── views/
│   └── admin-notifications/
│       ├── compose.html
│       └── summary.html
└── tests/
    ├── contract/
    ├── integration/
    └── unit/

frontend/
└── public/
    ├── css/
    │   └── admin-notifications.css
    └── js/
        └── admin-notifications.js
```

**Structure Decision**: Use the web-application split (`backend` + static `frontend/public`) with strict MVC responsibilities. Controllers and routes orchestrate requests, models and services handle SQLite-backed domain logic, and HTML/CSS/JS views handle the admin workflow UI.

## Complexity Tracking

No constitution violations requiring justification.
