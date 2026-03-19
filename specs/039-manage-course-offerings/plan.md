# Implementation Plan: Course Offering Administration

**Branch**: `039-manage-course-offerings` | **Date**: 2026-03-09 | **Spec**: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/039-manage-course-offerings/spec.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/039-manage-course-offerings/spec.md)
**Input**: Feature specification from `/specs/039-manage-course-offerings/spec.md`

## Summary

Implement UC-39 add/delete course-offering administration in a web MVC application using HTML/CSS/JavaScript with SQLite persistence. The feature adds validated offering creation, deletion with enrollment-state recheck and override path, transactional rollback on failures, and durable audit logging with retry queueing when audit writes fail.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2023) on Node.js 20 LTS  
**Primary Dependencies**: Express 4 (HTTP + routing), `better-sqlite3` (SQLite access), `express-validator` (request validation)  
**Storage**: SQLite 3 (primary system database for accounts, course offerings, enrollments, audit logs, audit retry queue)  
**Testing**: Vitest (unit/integration), Supertest (API contract verification), Playwright (admin flow smoke checks)  
**Target Platform**: Linux-hosted Node.js web app, modern desktop browsers (Chrome/Firefox/Edge latest)  
**Project Type**: Web application (server-rendered MVC + JSON API endpoints for admin actions)  
**Performance Goals**: Align with SC-001: >=95% of valid add operations complete within 5 seconds; p95 API latency <500ms excluding browser render time  
**Constraints**: Strict MVC boundaries; SQLite transactional consistency; no partial add/delete; deletion recheck at final confirmation; style guide conformance for HTML/CSS/JS  
**Scale/Scope**: Department-scale admin traffic (tens of concurrent admins, thousands of offerings per term)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.
  Mapping: UC-39 -> UC-39 acceptance suite in `/Acceptance Tests/UC-39-AS.md`.
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
- [x] Design preserves Model-View-Controller boundaries and identifies where account and course data persist in SQLite.
- [x] Plan does not modify `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md` without explicit user authorization.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.

## Project Structure

### Documentation (this feature)

```text
specs/039-manage-course-offerings/
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
src/
├── controllers/
│   └── offeringController.js
├── models/
│   ├── offeringModel.js
│   ├── enrollmentModel.js
│   ├── accountModel.js
│   └── auditLogModel.js
├── views/
│   └── admin/
│       ├── offerings-list.html
│       ├── offering-form.html
│       └── offering-delete-confirm.html
├── routes/
│   └── offeringRoutes.js
├── services/
│   ├── offeringService.js
│   ├── auditService.js
│   └── validationService.js
├── db/
│   ├── schema.sql
│   └── migrations/
└── app.js

tests/
├── unit/
├── integration/
└── contract/
```

**Structure Decision**: Single web application with MVC module ownership under `src/`; controllers orchestrate HTTP flows, models encapsulate SQLite access, views contain HTML templates, and services implement reusable business rules (validation, audit retry handling).

## Phase 0: Research

Research output is recorded in `/home/m_srnic/ece493/group_project/ECE493Group19/specs/039-manage-course-offerings/research.md` and resolves all initial technical decisions:

1. SQLite strategy for transactional add/delete + concurrency-safe final deletion recheck.
2. Validation approach for offering uniqueness, schedule overlaps, and capacity bounds.
3. Audit reliability pattern when catalog mutation commits but audit persistence fails.
4. API confirmation workflow for deletion + override reason capture.
5. Testing strategy for rollback, conflict, and retry behaviors.

## Phase 1: Design & Contracts

Design outputs:

1. Data model in `/home/m_srnic/ece493/group_project/ECE493Group19/specs/039-manage-course-offerings/data-model.md`.
2. REST API contract in `/home/m_srnic/ece493/group_project/ECE493Group19/specs/039-manage-course-offerings/contracts/openapi.yaml`.
3. Validation and manual test workflow in `/home/m_srnic/ece493/group_project/ECE493Group19/specs/039-manage-course-offerings/quickstart.md`.
4. Agent context refresh via `.specify/scripts/bash/update-agent-context.sh codex`.

## Post-Design Constitution Check

- [x] Use-case and acceptance mapping retained: UC-39 and UC-39-AS are explicit in plan/research/quickstart.
- [x] Stack compliance retained: all contracts/design artifacts specify HTML/CSS/JavaScript + SQLite.
- [x] MVC boundaries retained: responsibilities separated across `src/models`, `src/views`, and `src/controllers`.
- [x] Protected artifacts unchanged: no edits to `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md`.
- [x] Style-guide compliance planned: quickstart includes lint/style checks against repository guides.

## Complexity Tracking

No constitution violations requiring justification.
