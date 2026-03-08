# Implementation Plan: Dashboard Data Display

**Branch**: `001-display-dashboard-data` | **Date**: 2026-03-07 | **Spec**: `/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-display-dashboard-data/spec.md`
**Input**: Feature specification from `/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-display-dashboard-data/spec.md`

## Summary

Implement dashboard-linked data display pages for `UC-06`, `UC-20`, `UC-21`, `UC-33`, and `UC-36` using MVC with server-side JavaScript controllers, SQLite-backed models, and HTML/CSS/JavaScript views. The feature enforces page-level and field-level access control, supports partial-data rendering with missing-item indicators, and shows a dedicated no-data state with retry guidance.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2022) on Node.js 20 LTS  
**Primary Dependencies**: Express.js (routing/controllers), `better-sqlite3` (SQLite access), server-rendered templates + browser JavaScript for page behavior  
**Storage**: SQLite 3 (persistent account and course information, plus page-specific display data)  
**Testing**: Acceptance-test traceability to `Acceptance Tests/UC-06-AS.md`, `UC-20-AS.md`, `UC-21-AS.md`, `UC-33-AS.md`, `UC-36-AS.md`; automated controller/model tests with Node test runner + Supertest  
**Target Platform**: Linux-hosted web app; modern desktop/mobile browsers  
**Project Type**: Web application (MVC)  
**Performance Goals**: Dashboard target page renders in <2s p95 for authorized users with available data; no-data/partial-data states render in same request cycle  
**Constraints**: HTML/CSS/JavaScript + SQLite only; strict MVC boundaries; read-only display behavior; no new logging obligations beyond existing project behavior; style-guide compliance required  
**Scale/Scope**: 5 in-scope dashboard pages (`UC-06`, `UC-20`, `UC-21`, `UC-33`, `UC-36`), role-based access across student/professor/registered-user actors

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate Review

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
- [x] Design preserves Model-View-Controller boundaries and identifies where account and course data persist in SQLite.
- [x] Plan does not modify `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md` without explicit user authorization.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.

**Gate Status**: PASS

### Post-Phase 1 Gate Re-Check

- [x] `research.md` resolves stack, architecture, and access-control design decisions without violating mandated technologies.
- [x] `data-model.md` defines persistent SQLite entities for account and course information and keeps model/controller/view responsibilities explicit.
- [x] `contracts/dashboard-data-api.yaml` keeps the exposed interface aligned to authorized display use cases and no-data/partial-data behaviors.
- [x] No protected use-case or acceptance artifacts were modified.
- [x] `quickstart.md` includes explicit style-guide compliance and acceptance-trace validation steps.

**Gate Status**: PASS

## Project Structure

### Documentation (this feature)

```text
/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-display-dashboard-data/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── dashboard-data-api.yaml
└── tasks.md
```

### Source Code (repository root)

```text
/home/m_srnic/ece493/group_project/ECE493Group19/
├── server/
│   ├── controllers/
│   │   └── dashboard-data-controller.js
│   ├── models/
│   │   ├── account-model.js
│   │   ├── course-model.js
│   │   └── dashboard-data-model.js
│   ├── routes/
│   │   └── dashboard-data-routes.js
│   ├── services/
│   │   └── authorization-service.js
│   └── db/
│       ├── schema.sql
│       └── sqlite-client.js
├── web/
│   ├── views/
│   │   ├── dashboard-data/
│   │   ├── errors/
│   │   └── shared/
│   ├── css/
│   └── js/
└── tests/
    ├── unit/
    ├── integration/
    └── contract/
```

**Structure Decision**: Web application structure selected. `server/models` owns SQLite access and domain mapping, `server/controllers` handles request orchestration and authorization outcomes, and `web/views` + `web/css` + `web/js` owns presentation behavior.

## Phase 0 Research Scope

- Resolve best-practice decisions for MVC layering in a JavaScript + SQLite web app.
- Resolve role-based page/field visibility strategy for in-scope use cases.
- Resolve partial/no-data display contract strategy for deterministic UI behavior.
- Resolve test strategy that preserves acceptance traceability to mapped artifacts.

## Phase 1 Design Outputs

- Data model for actor/account/course/dashboard display artifacts and access rules.
- HTTP/view-model contract for dashboard page data retrieval and error/no-data states.
- Quickstart that defines implementation order and validation sequence.
- Agent context update for codex completed via `.specify/scripts/bash/update-agent-context.sh codex`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
