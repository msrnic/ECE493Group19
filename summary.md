# Project Summary

## Repository State
This repository now contains a working Node.js/Express MVC application with SQLite persistence for the completed authentication and role-based dashboard work in `/home/m_srnic/ece493/group_project/ECE493Group19`.

The project is no longer just a spec repository. It now includes runtime code, schema/migration logic, seeded demo data, unit/integration/contract tests, and Playwright acceptance coverage.

## Features Implemented So Far
The system currently includes:
- Login flow with username/email + password authentication
- Session-based access control with `returnTo` handling
- Logout and session invalidation behavior
- Password change and password reset flows
- Role-based dashboard routing after login
- Student dashboard modules and sections
- Professor dashboard modules and sections
- Admin dashboard modules and sections
- Multi-role dashboard handling with merged authorized modules
- Empty-access dashboard state when no modules are assigned
- Role-data-error dashboard state when role resolution fails
- Partial dashboard rendering when some sections are unavailable
- Retry flow for unavailable dashboard sections only
- Strict filtering so unauthorized modules do not appear in dashboard navigation or content
- Dashboard telemetry and section-state persistence

## Current Role Dashboards
### Student
- Student Academics
- Financial Summary
- Security Center

### Professor
- Teaching Workload
- Grading Queue
- Security Center

### Admin
- Admin Operations
- Security Center

### Multi-role / hybrid behavior
- Authorized modules are merged without duplicates
- Unauthorized modules remain hidden
- Partial and retry states preserve authorization filtering

## Important Runtime Files
### App/runtime
- `package.json`
- `scripts/start-server.js`
- `scripts/run-playwright.js`
- `src/app.js`
- `src/routes/auth-routes.js`
- `src/routes/dashboard-routes.js`
- `src/controllers/auth-controller.js`
- `src/controllers/dashboard-controller.js`
- `src/controllers/dashboard-response.js`
- `src/controllers/validators/dashboard-validator.js`
- `src/models/account-model.js`
- `src/models/role-model.js`
- `src/models/module-model.js`
- `src/models/dashboard-section-model.js`
- `src/models/dashboard-section-state-model.js`
- `src/models/dashboard-load-model.js`
- `src/db/schema.sql`
- `src/db/migrations/apply-schema.js`
- `src/db/migrations/seed-login-fixtures.js`
- `src/views/dashboard.html`
- `public/css/dashboard.css`
- `public/js/dashboard.js`

### Test coverage
- `tests/unit/*.test.js`
- `tests/integration/*.test.js`
- `tests/contract/*.test.js`
- `tests/e2e/uc01.acceptance.spec.js`
- `tests/e2e/uc02.acceptance.spec.js`
- `tests/e2e/uc03.acceptance.spec.js`
- `tests/e2e/uc09.acceptance.spec.js`

## Current Commands
### Install dependencies
```bash
npm install
```

### Reset and reseed the database
```bash
npm run setup
```

### Start the app
```bash
npm start
```

App URL:
- `http://127.0.0.1:3000/`

Optional custom port:
```bash
PORT=4000 npm start
```

## Seeded Demo Accounts
Important seeded accounts after `npm run setup`:
- Student: `userA@example.com` / `CorrectPass!234`
- Professor: `professor@example.com` / `CorrectPass!234`
- Admin: `admin@example.com` / `AdminPass!234`
- Multi-role staff: `hybrid.staff@example.com` / `CorrectPass!234`
- No-module student: `nomodule.student@example.com` / `CorrectPass!234`
- Locked: `locked.user@example.com` / `CorrectPass!234`
- Disabled: `disabled.user@example.com` / `CorrectPass!234`
- Outage simulation: `outage.user@example.com` / `CorrectPass!234`

## Validation Status
Current validation status:
- `npm run setup`: PASS
- `npm run test:coverage`: PASS
- `npm run test:acceptance`: PASS
- `npm run lint`: PASS

Coverage status across `src/**/*.js`:
- `100.00%` lines
- `100.00%` branches
- `100.00%` functions

Acceptance coverage currently passing:
- UC-01 password-management acceptance scenarios
- UC-02 login acceptance scenarios
- UC-03 role-based dashboard acceptance scenarios
- UC-09 financial/minimal-dashboard acceptance scenarios

## Important Fixes Already Made
Useful implementation notes for future work:
- The dashboard feature is implemented in the existing `src/` app structure, not the spec-template `app/` paths.
- `npm run setup` was repaired after a migration regression where child-table foreign keys could still point to `accounts_legacy`.
- The E2E server reset flow now recreates clean seeded dashboard fixtures reliably.
- Playwright acceptance specs were updated to use stricter, non-ambiguous locators.
- Dashboard coverage gaps were closed with targeted controller and migration tests.

## Spec Tracking
Feature/task tracking has been updated for the implemented dashboard work:
- `specs/003-role-based-dashboard/tasks.md` marked complete
- `specs/003-role-based-dashboard/quickstart.md` updated with final verification notes
- `specs/003-role-based-dashboard/checklists/requirements.md` updated with implementation validation notes

Protected use-case and acceptance source documents were intentionally left unchanged.

## Next Course Of Action
Next work should focus on minor UI adjustments for each role dashboard, not on backend behavior changes.

Immediate direction:
- Adjust layout and spacing for the Student dashboard
- Adjust layout and spacing for the Professor dashboard
- Adjust layout and spacing for the Admin dashboard
- Rename dashboard labels/headings where needed for clarity
- Refine navigation wording and section titles per role
- Preserve current authorization, retry, and empty/error-state behavior while making UI-only changes

## If Continuing In A New Conversation
A new conversation should assume:
- authentication, password-management, and role-based dashboard flows are already implemented
- the database setup/reset path is working through `npm run setup`
- the app starts through `npm start` on port `3000` by default
- seeded student/professor/admin accounts already exist
- the codebase is currently in a stable, fully passing state
- the next requested work is expected to be minor layout/renaming adjustments for the role dashboards
