# Quickstart: User Login Authentication

## 1. Prerequisites
- Node.js 20 LTS
- npm
- SQLite 3

## 2. Initialize project skeleton (if not already present)
- Create MVC directories from `plan.md` under `src/` and `public/`.
- Add dependencies: `express`, `express-session`, `better-sqlite3`, `bcrypt`, `supertest`, `playwright`.

## 3. Create and migrate SQLite schema
- Create `src/db/schema.sql` with at least:
  - `accounts`
  - `courses`
  - `account_courses`
  - `login_attempts`
  - `user_sessions`
- Apply schema to `sis.db`.

## 4. Implement MVC flow
- Model:
  - Implement account lookup, lockout updates, session persistence, and login-attempt recording.
  - Keep course persistence in SQLite schema even if unchanged by login.
- Controller:
  - `GET /login` and `POST /login` per `contracts/login-auth.yaml`.
  - `GET /dashboard` with session guard.
- View:
  - Login page with identifier/password fields and outcome-specific messaging.
  - Dashboard page for authenticated users.

## 5. Validate acceptance behavior (UC-02-AS)
- Successful login redirects to dashboard and creates session.
- Invalid credentials return error and allow retry.
- Five failed attempts lock account for 15 minutes.
- Locked/disabled accounts denied with guidance.
- Auth-service outage returns service-unavailable response and records failure.

## 6. Style and compliance checks
- Ensure HTML/CSS follows `Style Guides/google-style-guide-html-css.md`.
- Ensure JavaScript follows `Style Guides/google-style-guide-javascript.md`.
- Confirm no edits to `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md`.
