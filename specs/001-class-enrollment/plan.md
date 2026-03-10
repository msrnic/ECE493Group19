# Implementation Plan: Student Course Enrollment

**Branch**: `[001-class-enrollment]` | **Date**: 2026-03-09 | **Spec**: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-class-enrollment/spec.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-class-enrollment/spec.md)
**Input**: Feature specification from `/specs/001-class-enrollment/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement student self-service class enrollment for found offerings with pre-commit eligibility checks (holds, prerequisites, schedule conflicts, capacity), atomic success/failure behavior, and clear enrollment results including fee-change messaging. The solution will use a JavaScript MVC web application with HTML/CSS/JavaScript views and SQLite persistence for account/course/enrollment data, mapped directly to UC-17 and UC-17-AS.

## Technical Context

**Language/Version**: JavaScript (Node.js 20 LTS for server, ES2022 in browser)  
**Primary Dependencies**: Express 4 (HTTP + controllers), EJS (HTML views), `sqlite3` driver, `express-validator` for request validation  
**Storage**: SQLite 3 (single app database file with transactional enrollment writes)  
**Testing**: Node test runner + Supertest (API/integration), Playwright (critical browser flow), SQL fixture scripts  
**Target Platform**: Linux-hosted web application, modern desktop/mobile browsers
**Project Type**: Web application (MVC server-rendered pages + JSON endpoints)  
**Performance Goals**: P95 enrollment request latency under 2s; UI confirmation under 10s for fee status display path  
**Constraints**: HTML/CSS/JavaScript only for web stack, SQLite only for DB, atomic enrollment transactions, no waitlist behavior, no staff/admin override actions  
**Scale/Scope**: Initial rollout for up to 10k students and 2k concurrent enrollment attempts during registration windows

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

Constitution gate status (pre-Phase 0): PASS
Traceability mapping:
- `specs/001-class-enrollment/spec.md` user stories and scenarios map to `Use Cases/UC-17.md`
- Acceptance validation maps to `Acceptance Tests/UC-17-AS.md`

## Project Structure

### Documentation (this feature)

```text
specs/001-class-enrollment/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
```text
backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── services/
│   ├── routes/
│   ├── views/
│   └── db/
└── tests/
    ├── integration/
    └── contract/

frontend/
├── public/
│   ├── css/
│   └── js/
└── tests/
    └── e2e/

shared/
└── validation/

scripts/
└── sqlite/

docs/
└── traceability/

Acceptance Tests/
Use Cases/
Style Guides/
specs/
```

**Structure Decision**: Chose a web-application split (`backend/` + `frontend/`) because this feature requires explicit MVC layering plus browser-delivered HTML/CSS/JavaScript. MVC ownership is defined as:
- Model: `backend/src/models/` + SQLite schema/migrations in `backend/src/db/` and `scripts/sqlite/`
- View: `backend/src/views/` templates + static assets in `frontend/public/`
- Controller: `backend/src/controllers/` with route wiring in `backend/src/routes/`

## Phase 0 Research Summary

All technical unknowns were resolved in [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-class-enrollment/research.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-class-enrollment/research.md):
- Runtime/framework and SQLite integration approach selected
- Atomic transaction strategy selected
- Eligibility evaluation ordering and multi-reason reporting format selected
- Style-guide enforcement approach selected

No unresolved `NEEDS CLARIFICATION` items remain.

## Phase 1 Design Outputs

- Data model: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-class-enrollment/data-model.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-class-enrollment/data-model.md)
- Contracts: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-class-enrollment/contracts/openapi.yaml](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-class-enrollment/contracts/openapi.yaml)
- Quickstart: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-class-enrollment/quickstart.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-class-enrollment/quickstart.md)

## Constitution Check (Post-Design Re-check)

- [x] Scope remains mapped to `UC-17` and `UC-17-AS` only.
- [x] Stack remains HTML/CSS/JavaScript + SQLite.
- [x] MVC boundaries are explicit in structure and contracts.
- [x] No protected `Use Cases/` or `Acceptance Tests/` artifacts were modified.
- [x] Style-guide compliance is planned via lint/check tasks in implementation.

Constitution gate status (post-Phase 1): PASS

## Complexity Tracking

No constitution violations or exceptions identified.
