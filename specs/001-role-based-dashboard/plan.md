# Implementation Plan: Role-Based Dashboard Access

**Branch**: `001-role-based-dashboard` | **Date**: 2026-03-07 | **Spec**: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-role-based-dashboard/spec.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-role-based-dashboard/spec.md)
**Input**: Feature specification from `/specs/001-role-based-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Deliver a role-scoped dashboard after successful login with resilient partial rendering, per-section retry, and strict prevention of unauthorized module exposure. The implementation uses a JavaScript MVC web app with SQLite persistence for accounts, courses, roles, modules, and dashboard load telemetry; the UI is HTML/CSS/JavaScript with disabled unavailable navigation entries and explicit empty/error states.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: JavaScript (Node.js 20 LTS server, ES2022 browser JavaScript)  
**Primary Dependencies**: Express 4 (routing/controllers), better-sqlite3 (SQLite access), express-session (session handling), EJS or HTML template partials for server-rendered views  
**Storage**: SQLite 3 (`database/app.db`) with persistent account, course, role, module, and dashboard load-outcome tables  
**Testing**: Vitest (unit/service tests), Supertest (HTTP controller tests), Playwright (dashboard integration flows)  
**Target Platform**: Linux-hosted web server, modern desktop/mobile browsers  
**Project Type**: Web application (monolithic MVC server + server-rendered HTML/CSS/JS)  
**Performance Goals**: Meet SC-001: 95% of authenticated actors receive initial dashboard view (full or partial) within 3 seconds  
**Constraints**: HTML/CSS/JavaScript only for web stack; SQLite only for system DB; MVC boundaries enforced; protected use-case and acceptance files untouched  
**Scale/Scope**: Initial dashboard for Registered User/Student roles; tens of modules/sections per user; single institution deployment profile

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with
      corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.
      Mapped sources: `UC-03`/`UC-03-AS` (main dashboard + partial load), `UC-09`/`UC-09-AS` (no modules + unavailable sections), `UC-02`/`UC-02-AS` (login/session re-entry path).
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
- [x] Design preserves Model-View-Controller boundaries and identifies where
      account and course data persist in SQLite (`accounts`, `courses`, and related mapping tables).
- [x] Plan does not modify `Use Cases/UC-*.md` or
      `Acceptance Tests/UC-*-AS.md` without explicit user authorization.
- [x] Implementation approach includes style compliance with
      `Style Guides/google-style-guide-html-css.md` and
      `Style Guides/google-style-guide-javascript.md` (lint + review checklist in quickstart).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
app/
├── controllers/
│   ├── auth-controller.js
│   └── dashboard-controller.js
├── models/
│   ├── account-model.js
│   ├── course-model.js
│   ├── role-model.js
│   ├── module-model.js
│   └── dashboard-load-model.js
├── views/
│   ├── layouts/
│   ├── dashboard/
│   └── auth/
├── public/
│   ├── css/
│   └── js/
├── routes/
│   ├── auth-routes.js
│   └── dashboard-routes.js
└── db/
    ├── schema.sql
    ├── migrations/
    └── app.db

tests/
├── unit/
├── integration/
└── contract/
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]
Single web application with explicit MVC ownership: `models/` encapsulate SQLite queries and validation, `controllers/` implement request/session orchestration and retries, and `views/` + `public/` render HTML/CSS/JavaScript dashboard states.

## Phase 0 Research Summary

Research decisions and alternatives are documented in [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-role-based-dashboard/research.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-role-based-dashboard/research.md). All initial clarifications are resolved with concrete stack, retry behavior, telemetry, and session-expiration handling.

## Phase 1 Design Outputs

- Data model: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-role-based-dashboard/data-model.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-role-based-dashboard/data-model.md)
- Interface contracts: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-role-based-dashboard/contracts/dashboard-api.yaml](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-role-based-dashboard/contracts/dashboard-api.yaml)
- Quickstart: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-role-based-dashboard/quickstart.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-role-based-dashboard/quickstart.md)

## Post-Design Constitution Check

- [x] Scope remains traced to `UC-03`, `UC-09`, and `UC-02` with matching acceptance suites.
- [x] Design remains HTML/CSS/JavaScript + SQLite only.
- [x] MVC boundaries are explicit in directory structure and contract responsibilities.
- [x] Account and course persistence is explicitly defined in SQLite schema/entities.
- [x] Protected use-case and acceptance artifacts are unchanged.
- [x] Style-guide compliance strategy is included in quickstart quality gates.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
