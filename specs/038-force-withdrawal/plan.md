# Implementation Plan: Administrative Forced Course Withdrawal

**Branch**: `038-force-withdrawal` | **Date**: 2026-03-09 | **Spec**: `/home/m_srnic/ece493/group_project/ECE493Group19/specs/038-force-withdrawal/spec.md`
**Input**: Feature specification from `/home/m_srnic/ece493/group_project/ECE493Group19/specs/038-force-withdrawal/spec.md`

## Summary

Implement an administrator-only forced withdrawal workflow for UC-38 using a web MVC architecture (HTML/CSS/JavaScript) backed by SQLite. The flow presents withdrawal implications, requires a reason and explicit confirmation, applies enrollment/schedule/transcript/fee updates atomically, and records an auditable action with a pending-audit retry path when audit persistence initially fails.

## Technical Context

**Language/Version**: JavaScript (Node.js 20 LTS backend, ES2022 browser JavaScript frontend)
**Primary Dependencies**: Express 4 (routing/controllers), `sqlite3` (SQLite access), vanilla HTML/CSS/JavaScript views
**Storage**: SQLite 3 (single system database with transactional updates)
**Testing**: Node.js test runner (`node --test`) for unit/integration tests + UC-38 acceptance scenarios from `Acceptance Tests/UC-38-AS.md`
**Target Platform**: Linux-hosted web application, modern desktop browsers used by administrators
**Project Type**: Web application (server-rendered MVC)
**Performance Goals**: Force-withdraw confirmation request completes in <=2s p95 under normal load; supports SC-001 completion within 2 minutes for >=90% admin attempts
**Constraints**: HTML/CSS/JavaScript + SQLite only; strict transactional consistency for enrollment/schedule/transcript/fee; idempotent concurrent processing (first succeeds, later rejected); required reason on confirmation; style guide compliance for HTML/CSS/JS
**Scale/Scope**: Registrar/admin operations for single-student single-offering withdrawals; low-to-moderate concurrency (tens of concurrent admin actions, hundreds of withdrawals/day)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
- [x] Design preserves Model-View-Controller boundaries and identifies where account and course data persist in SQLite.
- [x] Plan does not modify `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md` without explicit user authorization.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.

## Phase 0 Research Summary

- Resolved transaction boundary and rollback design using one SQLite transaction across enrollment, schedule, transcript, and fee updates.
- Resolved concurrency/idempotency strategy using atomic status transition checks and uniqueness constraints per student+offering active enrollment.
- Resolved pending-audit handling by persisting `pending_audit` status and retry metadata in a dedicated table.
- Resolved API approach with REST endpoints and explicit result codes for success, not-enrolled, conflict/already-withdrawn, and failure.
- Resolved style/compliance approach by adopting vanilla HTML templates, controller-driven view models, and static checks for style guide conformance.

## Project Structure

### Documentation (this feature)

```text
specs/038-force-withdrawal/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── force-withdrawal.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── controllers/
│   │   └── forceWithdrawalController.js
│   ├── models/
│   │   ├── enrollmentModel.js
│   │   ├── transcriptModel.js
│   │   ├── feeLedgerModel.js
│   │   ├── forcedWithdrawalModel.js
│   │   └── auditEventModel.js
│   ├── services/
│   │   ├── forceWithdrawalService.js
│   │   └── auditRetryService.js
│   ├── routes/
│   │   └── forceWithdrawalRoutes.js
│   ├── views/
│   │   └── admin-force-withdrawal.html
│   └── db/
│       ├── schema.sql
│       └── migrations/
└── tests/
    ├── unit/
    ├── integration/
    └── contract/

frontend/
└── admin/
    ├── force-withdrawal.js
    └── force-withdrawal.css
```

**Structure Decision**: Use a web-application split with backend MVC ownership (`models/`, `controllers/`, `views/`) and thin frontend admin page assets. Persistent account and course information remains in SQLite tables managed by backend models.

## Post-Design Constitution Check

- [x] `UC-38` and `UC-38-AS` are the governing scope and acceptance artifacts for this feature.
- [x] All planned implementation elements remain in HTML/CSS/JavaScript and SQLite.
- [x] MVC ownership is explicit in planned directories and responsibilities.
- [x] Account and course information persistence is modeled in SQLite entities (`accounts/users`, `course_offerings`, `enrollments`, related records).
- [x] No protected `Use Cases/` or `Acceptance Tests/` files are modified by this plan.
- [x] Style-guide compliance is planned as part of implementation and review gates.

## Complexity Tracking

No constitution violations requiring justification.
