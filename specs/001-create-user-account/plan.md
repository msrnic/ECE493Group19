# Implementation Plan: Administrative Account Creation

**Branch**: `001-create-user-account` | **Date**: 2026-03-10 | **Spec**: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-create-user-account/spec.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-create-user-account/spec.md)
**Input**: Feature specification from `/specs/001-create-user-account/spec.md`

## Summary

Implement administrator-driven user account creation for `UC-43` with strict validation, role assignment, duplicate detection, transactional persistence, and notification-failure reporting. The implementation uses a web MVC architecture with HTML/CSS/JavaScript and SQLite, including persistent account and course data boundaries in the model layer.

## Technical Context

**Language/Version**: JavaScript (Node.js 20 LTS for server, ES2022 for browser)  
**Primary Dependencies**: Express.js (MVC web routing), better-sqlite3 (SQLite access), bcryptjs (password hashing), express-validator (input validation)  
**Storage**: SQLite (single source of truth for accounts, roles, credentials, course data)  
**Testing**: Node.js `node:test` + Supertest (controller/API integration) + Playwright (critical end-to-end form path)  
**Target Platform**: Linux-hosted web app; modern desktop browsers for admin UI  
**Project Type**: Web application (server-rendered MVC with JSON endpoints for submit/validation outcomes)  
**Performance Goals**: Meet SC-001 (`>=95%` valid submissions complete with confirmation in `<=10s`) and SC-003 (`100%` invalid/duplicate blocked)  
**Constraints**: HTML/CSS/JavaScript + SQLite only, MVC separation required, no edits to protected `Use Cases/` or `Acceptance Tests/` artifacts, style-guide compliance required, notification resend/copy recovery out of scope per clarified requirement FR-016  
**Scale/Scope**: University SIS admin workflows; low-to-moderate concurrent administrative usage with occasional onboarding spikes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate Review

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.  
      Mapping: `Use Cases/UC-43.md` and `Acceptance Tests/UC-43-AS.md`.
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.  
      Planned stack is JavaScript across server/client, HTML/CSS views, SQLite storage.
- [x] Design preserves Model-View-Controller boundaries and identifies where account and course data persist in SQLite.  
      MVC module ownership and SQLite entities are defined in this plan and `data-model.md`.
- [x] Plan does not modify `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md` without explicit user authorization.  
      No protected artifacts will be edited in this plan workflow.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.  
      Style checks are included in quickstart/test workflow.

### Post-Phase 1 Re-Check

- [x] Scope/design artifacts (`research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`) remain traceable to UC-43 + UC-43-AS and spec FR-001..FR-017.
- [x] Contracts and data model keep MVC boundaries explicit and maintain SQLite persistence for both account and course domains.
- [x] No constitution violations introduced; no amendments required.

## Project Structure

### Documentation (this feature)

```text
specs/001-create-user-account/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── openapi.yaml
```

### Source Code (repository root)

```text
app/
├── controllers/
│   └── adminAccountController.js
├── models/
│   ├── userAccountModel.js
│   ├── roleModel.js
│   ├── credentialModel.js
│   ├── userRoleAssignmentModel.js
│   ├── notificationAttemptModel.js
│   └── courseModel.js
├── views/
│   └── admin/
│       └── create-account.html
├── public/
│   ├── css/
│   │   └── admin-account.css
│   └── js/
│       └── create-account.js
├── services/
│   ├── passwordPolicyService.js
│   └── notificationService.js
├── db/
│   ├── schema.sql
│   └── migrations/
└── routes/
    └── adminAccountRoutes.js

tests/
├── unit/
├── integration/
├── e2e/
└── contract/
```

**Structure Decision**: Use a single web MVC project rooted at `app/` with server controllers/models/services, server-rendered views, and static frontend assets. SQLite schema and migrations are centralized in `app/db/` to enforce data boundaries for account and course information.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
