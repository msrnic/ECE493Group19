# Implementation Plan: Force Enroll Override

**Branch**: `[001-force-enroll-override]` | **Date**: 2026-03-09 | **Spec**: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-force-enroll-override/spec.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-force-enroll-override/spec.md)
**Input**: Feature specification from `/specs/001-force-enroll-override/spec.md`

## Summary

Deliver an administrator-only Force Enroll workflow for UC-37 that bypasses prerequisite checks while enforcing hard constraints, requiring a non-empty reason, supporting explicit same-admin over-capacity confirmation, and atomically updating enrollment, schedule, capacity, and override audit records using JavaScript MVC backed by SQLite.

## Technical Context

**Language/Version**: JavaScript (Node.js 20 LTS for server, ES2022 browser JavaScript for client)  
**Primary Dependencies**: Express.js (controller routing), EJS (server-rendered HTML views), better-sqlite3 (SQLite access), express-session (admin session auth), Playwright + Node test runner (acceptance/integration)  
**Storage**: SQLite 3 (single system database for account, student, course offering, enrollment, schedule, and override audit data)  
**Testing**: Node.js test runner + Playwright for end-to-end workflow coverage aligned to UC-37-AS  
**Target Platform**: Linux-hosted web application accessed by modern desktop browsers  
**Project Type**: Monolithic web application (MVC server + HTML/CSS/JavaScript frontend)  
**Performance Goals**: Force-enroll request completion (non-over-capacity path) under 2s p95 for 200 concurrent admin operations  
**Constraints**: HTML/CSS/JavaScript + SQLite only, strict MVC boundaries, atomic multi-record updates, no edits to protected use-case/acceptance artifacts  
**Scale/Scope**: University SIS pilot scale up to 50k students, 5k offerings per term, peak 200 concurrent administrators

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.
  Mapping: `Use Cases/UC-37.md` and `Acceptance Tests/UC-37-AS.md` (canonical traceability IDs).
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
- [x] Design preserves Model-View-Controller boundaries and identifies where account and course data persist in SQLite.
- [x] Plan does not modify `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md` without explicit user authorization.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.

## Project Structure

### Documentation (this feature)

```text
specs/001-force-enroll-override/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── force-enroll-openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── controllers/
│   └── forceEnrollController.js
├── models/
│   ├── accountModel.js
│   ├── studentModel.js
│   ├── courseOfferingModel.js
│   ├── enrollmentModel.js
│   ├── scheduleModel.js
│   ├── forceEnrollRequestModel.js
│   └── overrideAuditModel.js
├── services/
│   └── forceEnrollService.js
├── views/
│   └── admin-force-enroll.ejs
├── db/
│   ├── schema.sql
│   └── migrations/
└── routes/
    └── forceEnrollRoutes.js

public/
├── css/
│   └── admin-force-enroll.css
└── js/
    └── admin-force-enroll.js

tests/
├── unit/
├── integration/
└── acceptance/
```

**Structure Decision**: Use a monolithic MVC web app layout (`app/models`, `app/views`, `app/controllers`) to keep controller/view coupling explicit while preserving service-level transaction logic and SQLite persistence boundaries.

## Phase 0: Research Summary

Research outcomes captured in `/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-force-enroll-override/research.md` resolve all technical unknowns, including request confirmation flow, transaction strategy, concurrency handling, and audit policy.

## Phase 1: Design Outputs

- Data model: `/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-force-enroll-override/data-model.md`
- API contract: `/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-force-enroll-override/contracts/force-enroll-openapi.yaml`
- Developer quickstart: `/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-force-enroll-override/quickstart.md`

## Post-Design Constitution Check

- [x] UC and acceptance-test traceability is explicit (`UC-37` + `UC-37-AS`).
- [x] Every planned layer and contract remains within HTML/CSS/JavaScript + SQLite.
- [x] MVC ownership defined for each planned module; account and course data persistence defined in SQLite schema.
- [x] No protected `Use Cases/` or `Acceptance Tests/` files are modified by this plan.
- [x] HTML/CSS/JS style-guide compliance is included in quickstart validation steps.

## Complexity Tracking

No constitution violations requiring justification.
