# Implementation Plan: Password Change Flow

**Branch**: `001-change-password` | **Date**: 2026-03-07 | **Spec**: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-change-password/spec.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-change-password/spec.md)
**Input**: Feature specification from `/specs/001-change-password/spec.md`

## Summary

Implement a secure password-change feature for end users and authorized admins using an MVC web architecture (HTML/CSS/JavaScript) backed by SQLite. The design adds verification via current password or reset token, policy validation feedback, progressive cooldown after repeated failures, session invalidation behavior after success, and user notification for all successful password changes.

## Technical Context

**Language/Version**: JavaScript (Node.js 20 LTS for server; ES2022 browser JavaScript for client)  
**Primary Dependencies**: Express 4.x (controller routing), `sqlite3` (SQLite driver), `bcrypt` (password hashing), `express-session` (session management), `csurf` (form CSRF protection)  
**Storage**: SQLite (users, reset tokens, session records, password change events, cooldown counters, notifications)  
**Testing**: Node.js built-in test runner + Supertest (HTTP integration) + Playwright (critical UI flow smoke)  
**Target Platform**: Linux-hosted web application accessed through modern desktop/mobile browsers  
**Project Type**: Web application (MVC monolith)  
**Performance Goals**: 99% of valid submissions return final success/failure message within 5 seconds (SC-002); happy-path completion supports <2 minutes user flow (SC-001)  
**Constraints**: Required stack HTML/CSS/JavaScript + SQLite, MVC separation, no protected UC/AT artifact edits without explicit authorization, progressive cooldown 30 seconds to 15 minutes max  
**Scale/Scope**: Existing SIS user base (students/admins), feature scope centered on UC-01 with administrative extension and security/audit logging per request

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
- [x] Design preserves Model-View-Controller boundaries and identifies where account and course data persist in SQLite.
- [x] Plan does not modify `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md` without explicit user authorization.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.

Constitution mapping notes:
- Primary coverage: `UC-01` + `UC-01-AS` for user/self-service and reset-token flows.
- Admin password update flow is aligned to existing administrative authorization/password-policy patterns in `UC-43` + `UC-43-AS`.
- This plan intentionally avoids edits to protected files and preserves traceability in new planning artifacts.

## Project Structure

### Documentation (this feature)

```text
specs/001-change-password/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── password-change-api.yaml
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── controllers/
│   ├── auth-controller.js
│   └── admin-password-controller.js
├── models/
│   ├── user-model.js
│   ├── reset-token-model.js
│   ├── password-change-model.js
│   ├── session-model.js
│   └── notification-model.js
├── views/
│   ├── security/
│   │   ├── change-password.html
│   │   ├── reset-password.html
│   │   └── change-password-result.html
│   └── admin/
│       └── reset-user-password.html
├── public/
│   ├── css/
│   │   └── security.css
│   └── js/
│       ├── change-password.js
│       └── admin-reset-password.js
└── services/
    ├── password-policy-service.js
    ├── password-change-service.js
    ├── cooldown-service.js
    ├── session-service.js
    └── notification-service.js

db/
├── schema.sql
└── migrations/

tests/
├── unit/
├── integration/
└── acceptance/
```

**Structure Decision**: Use a single MVC web application layout with server-side controllers/services/models and HTML/CSS/JS views/assets. SQLite remains the single persistence layer.

## Phase 0 Research Output

See [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-change-password/research.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-change-password/research.md).

## Phase 1 Design Output

- Data model: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-change-password/data-model.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-change-password/data-model.md)
- Contracts: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-change-password/contracts/password-change-api.yaml](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-change-password/contracts/password-change-api.yaml)
- Quickstart: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-change-password/quickstart.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-change-password/quickstart.md)

## Constitution Check (Post-Design)

- [x] All feature scope maps to UC/AT artifacts and planning outputs preserve traceability.
- [x] Design and contracts stay within HTML/CSS/JavaScript + SQLite.
- [x] MVC ownership is explicit across controllers, models, views, and services.
- [x] Protected `Use Cases/` and `Acceptance Tests/` files remain unchanged.
- [x] Style-guide compliance has explicit implementation/test expectations in quickstart.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
