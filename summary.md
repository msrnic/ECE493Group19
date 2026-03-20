# Project Summary

## Repository State
This repository now contains a working Node.js/Express MVC implementation for feature `002-user-login` in `/home/m_srnic/ece493/group_project/ECE493Group19`.

The original repo mostly contained specs, use cases, acceptance-test documents, and governance files. We created the application scaffold, runtime code, database schema, seed data, and automated tests.

## Implemented Feature
Feature implemented: `002-user-login`

Primary behavior now in the system:
- A title page exists at `/`.
- The title page contains a login button linking to `/login`.
- `/login` supports username/email + password authentication.
- Successful login creates a session and redirects to `/dashboard`.
- Invalid credentials return a retryable error.
- Lockout policy is enforced: after 5 failed attempts, the account is locked for 15 minutes.
- Locked accounts are denied even with valid credentials during the lock period.
- Disabled accounts are denied with guidance.
- Simulated authentication-service outage returns `503` and records a failure.
- `/dashboard` requires an authenticated session.

## Important Files
### App/runtime
- `package.json`
- `package-lock.json`
- `scripts/start-server.js`
- `scripts/run-playwright.js`
- `src/app.js`
- `src/routes/auth-routes.js`
- `src/controllers/home-controller.js`
- `src/controllers/auth-controller.js`
- `src/controllers/dashboard-controller.js`
- `src/services/auth-service.js`
- `src/services/lockout-service.js`
- `src/services/auth-audit-service.js`
- `src/models/account-model.js`
- `src/models/login-attempt-model.js`
- `src/models/session-model.js`
- `src/db/schema.sql`
- `src/db/migrations/apply-schema.js`
- `src/db/migrations/seed-login-fixtures.js`
- `src/views/home.html`
- `src/views/login.html`
- `src/views/dashboard.html`
- `public/css/login.css`
- `public/js/login.js`

### Tests
- `tests/unit/*.test.js`
- `tests/integration/*.test.js`
- `tests/e2e/uc02.acceptance.spec.js`
- `tests/e2e/start-server.js`
- `tests/helpers/test-context.js`
- `playwright.config.js`

### Docs/spec tracking
- `README.md`
- `specs/002-user-login/tasks.md`
- `specs/002-user-login/quickstart.md`

## Current Commands
### One-time setup
Run this once after cloning or when resetting the database:

```bash
npm install
npm run setup
```

`npm run setup` runs:
- `npm run db:migrate`
- `npm run db:seed:login`

### Start app
Run this each time you want to start the app:

```bash
npm start
```

App URL:
- `http://127.0.0.1:3000/`

Optional custom port:

```bash
PORT=4000 npm start
```

### Validation
```bash
npm test
npm run lint
```

## Seeded Accounts
These are the important seeded login fixtures:
- Active: `userA@example.com` / `CorrectPass!234`
- Locked: `locked.user@example.com` / `CorrectPass!234`
- Disabled: `disabled.user@example.com` / `CorrectPass!234`
- Outage simulation: `outage.user@example.com` / `CorrectPass!234`

## Coverage and Test Status
At the end of the work, validation passed with:
- `npm test`: PASS
- `npm run lint`: PASS
- Source coverage across `src/**/*.js`: `100.00%` lines, `100.00%` branches, `100.00%` functions
- Playwright acceptance suite: `5/5` passing

## Acceptance Coverage Implemented
The acceptance suite currently covers:
- AT-UC02-01 successful login
- AT-UC02-02 invalid credentials then retry success
- AT-UC02-03 repeated failures causing temporary lockout
- AT-UC02-04 locked and disabled account handling
- AT-UC02-05 authentication-service outage handling

## Environment-Specific Note
Playwright Chromium needed local runtime-library workarounds in this environment because system packages were missing and `playwright install-deps` could not be run non-interactively due to sudo/password restrictions.

We handled that by:
- downloading local shared-library packages into `tmp/`
- using `scripts/run-playwright.js` to inject `LD_LIBRARY_PATH`

Important local directories created for this:
- `tmp/libgbm/`
- `tmp/chromium-libs/`

This means `npm test` already knows how to run the acceptance suite in this repo without manually exporting `LD_LIBRARY_PATH`.

## Notable Fixes Made During Implementation
These are useful if future work touches the same code:
- Added `npm run setup` and `npm start` so startup is no longer manual.
- Added a landing/title page at `/` with a login button.
- Fixed seed data so it uses actual inserted account IDs rather than hardcoded `account_id = 1`; this mattered when reseeding a reused SQLite file.
- Fixed deterministic Playwright test-server time by pinning the E2E server clock to the seeded fixture time, so locked-account acceptance behavior is stable.
- Updated startup message so users are directed to `/` instead of being dropped straight onto `/login`.

## Spec/Task Tracking State
`specs/002-user-login/tasks.md` was updated so tasks are marked complete.
`specs/002-user-login/quickstart.md` was updated with validation evidence and the SC-005 post-release measurement procedure.
Protected use-case and acceptance documents were intentionally not modified.

## Current User-Facing Behavior
If a user asks “how do I run the project?”, the current correct answer is:
- first time: `npm install && npm run setup`
- after that: `npm start`
- open `http://127.0.0.1:3000/`

## If Continuing In A New Conversation
A new conversation should assume:
- the login feature is already implemented and passing
- the title page exists at `/`
- branch coverage is already at 100%
- acceptance tests are already passing through `npm test`
- the environment-specific Playwright runtime workaround is already built into `scripts/run-playwright.js`

If further work is requested, it should build on the existing app rather than recreate the scaffold.
