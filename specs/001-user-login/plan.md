# Implementation Plan: User Login Authentication

**Branch**: `001-user-login` | **Date**: 2026-03-07 | **Spec**: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-user-login/spec.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-user-login/spec.md)
**Input**: Feature specification from `/specs/001-user-login/spec.md`

## Summary

Deliver password-only login for registered users with MVC boundaries: login page and feedback views (View), request/session orchestration and lockout handling (Controller), and SQLite-backed account/course/session/attempt persistence (Model). The feature must satisfy UC-02 and UC-02-AS including success, invalid credentials retry, temporary lockout (5 attempts/15 minutes), locked/disabled states, and authentication-service unavailability.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2022, Node.js 20 LTS runtime for server-side JS)
**Primary Dependencies**: Express 4 (HTTP routing/controller layer), `express-session` (session management), `better-sqlite3` (SQLite access), bcrypt (password hash verification)
**Storage**: SQLite 3 (`sis.db`) for persistent account and course data, plus login attempts and session records
**Testing**: Node.js built-in test runner + Supertest for HTTP/integration tests; Playwright for login UI flow validation
**Target Platform**: Linux-hosted web server, modern evergreen desktop/mobile browsers
**Project Type**: Web application (server-rendered MVC)
**Performance Goals**: 95% of valid logins complete and reach dashboard within 30 seconds under normal conditions (SC-001)
**Constraints**: Password-only authentication (no MFA), lockout policy fixed at 5 failed attempts/15 minutes, no edits to protected use-case/acceptance artifacts, HTML/CSS/JS + SQLite only
**Scale/Scope**: Initial cohort up to 10k user accounts and 5k courses with daily student logins

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

## Project Structure

### Documentation (this feature)

```text
specs/001-user-login/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── login-auth.yaml
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── controllers/
│   └── auth-controller.js
├── models/
│   ├── account-model.js
│   ├── course-model.js
│   ├── login-attempt-model.js
│   └── session-model.js
├── views/
│   ├── login.html
│   └── dashboard.html
├── services/
│   ├── auth-service.js
│   └── lockout-service.js
├── db/
│   ├── schema.sql
│   └── migrations/
└── app.js

public/
├── css/
│   └── login.css
└── js/
    └── login.js

tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: Single web application with explicit MVC folders (`models`, `views`, `controllers`) and service/helpers separated from MVC core responsibilities.

## Phase 0: Research Summary

All previously open technical choices are resolved in `research.md`:
- Authentication-service integration pattern for a JS MVC web app
- Secure session handling with SQLite-backed session metadata
- Deterministic lockout behavior (5 attempts/15 minutes) and reset logic
- SQLite schema/index strategy for account, course, attempt, and session records

## Phase 1: Design Outputs

- Data model documented in `data-model.md` with entities, constraints, and state transitions
- HTTP/login interface contract documented in `contracts/login-auth.yaml`
- Validation and local execution flow documented in `quickstart.md`
- Agent context updated using `.specify/scripts/bash/update-agent-context.sh codex`

## Post-Design Constitution Check

- [x] Scope remains traceable to `Use Cases/UC-02.md` and `Acceptance Tests/UC-02-AS.md`
- [x] Stack remains HTML/CSS/JavaScript + SQLite only
- [x] MVC ownership declared for all planned modules
- [x] Persistent SQLite design includes account and course information
- [x] Protected use-case/acceptance files remain unchanged
- [x] Style-guide compliance is included in quickstart validation steps

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations identified.
