# Project Summary

## Repository State
This repository is an active Node.js/Express MVC application with SQLite persistence in `/home/m_srnic/ece493/group_project/ECE493Group19`.

The project now includes implemented runtime code, schema and migration logic, seeded fixtures, unit tests, integration tests, contract tests, and Playwright acceptance coverage. It is no longer just a spec repository.

The working tree is currently dirty with uncommitted changes for the latest profile work and UC-43 account-creation feature.

## Features Implemented So Far
The current system includes:
- Login flow with username/email plus password authentication
- Session-based access control with `returnTo` handling
- Logout and session invalidation behavior
- Password change and password reset flows
- First-login forced password change support via `must_change_password`
- Role-based dashboard routing after login
- Student, Professor, and Admin dashboards
- Multi-role dashboard handling with merged authorized modules
- Empty-access, partial, retry, and role-data-error dashboard states
- Personal Profile display for all roles
- Personal details update flow for full name, birthday, and country of origin
- Contact information display for all roles
- Contact information update flow for phone/email plus emergency contact details
- Admin account creation flow from the Admin dashboard
- Assignable-role validation for new account creation
- Email normalization and duplicate detection for new account creation
- Password-policy validation and bcrypt-hashed credential storage for new account creation
- Notification-attempt audit logging for account creation outcomes

## Latest Completed Work
### Dashboard profile features
The Personal Profile area across all roles now shows:
- Full Name
- Birthday
- Country of Origin
- Phone Number
- Email
- Emergency Contact Name
- Emergency Contact Phone Number
- Emergency Contact Relation

The Personal Profile area also exposes:
- `Update Personal Information`
- `Update Contact Information`
- `Change password`

Editing flows are implemented for both profile forms and preserve the existing authentication and authorization behavior.

### UC-43: Create user account
The Admin dashboard now includes a `Create New User` entry in the `Admin Operations` section.

Implemented flow:
- `GET /admin/users/new` renders the create-user page
- `POST /admin/users` handles the server-rendered submission flow
- `GET /api/admin/accounts/form-metadata` returns assignable roles, password policy, and notification state
- `POST /api/admin/accounts` handles the JSON submission flow

Current shipped UC-43 scope is the requested preset-password flow only:
- Admin enters `email`, `role`, and `password`
- Email must be syntactically valid
- Email uniqueness is enforced after trim-and-lowercase normalization
- Role must still exist and still be assignable at submit time
- Password must satisfy the active policy
- On success, the account is created as `active` with `must_change_password = 1`
- First successful login for the created account redirects to `/account/security/password-change?required=1`
- Notification delivery is attempted after creation and logged as `sent`, `failed`, or `skipped_disabled`

Explicit scope note:
- Generated-password mode was not implemented for UC-43
- Notification resend/copy/download actions were not implemented for UC-43

## Important Runtime Files
### Core app and data
- `package.json`
- `scripts/start-server.js`
- `src/app.js`
- `src/db/schema.sql`
- `src/db/migrations/apply-schema.js`
- `src/db/migrations/seed-login-fixtures.js`

### Authentication and dashboards
- `src/controllers/auth-controller.js`
- `src/controllers/dashboard-controller.js`
- `src/controllers/dashboard-response.js`
- `src/routes/auth-routes.js`
- `src/routes/dashboard-routes.js`
- `src/models/account-model.js`
- `src/models/role-model.js`

### Profile display and editing
- `src/controllers/profile-controller.js`
- `src/controllers/validators/profile-validator.js`
- `src/routes/profile-routes.js`
- `src/models/personal-details-model.js`
- `src/models/contact-info-model.js`
- `src/views/personal-information.html`
- `src/views/contact-information.html`
- `public/css/profile-editor.css`
- `public/js/profile-form.js`

### Admin account creation
- `src/controllers/admin-account-controller.js`
- `src/controllers/validators/admin-account-validator.js`
- `src/routes/admin-account-routes.js`
- `src/services/account-creation-service.js`
- `src/services/password-policy-service.js`
- `src/services/notification-service.js`
- `src/models/user-account-model.js`
- `src/models/notification-attempt-model.js`
- `src/views/create-user-account.html`
- `public/css/admin-account.css`
- `public/js/create-account.js`

### Test files added for UC-43
- `tests/contract/admin-account.contract.test.js`
- `tests/integration/admin-account.integration.test.js`
- `tests/e2e/uc43.acceptance.spec.js`
- `tests/unit/account-creation-service.test.js`
- `tests/unit/admin-account-controller.test.js`
- `tests/unit/admin-account-extra-coverage.test.js`
- `tests/unit/admin-account-models.test.js`
- `tests/unit/admin-account-validator.test.js`
- `tests/unit/notification-service.test.js`

## Seeded Demo Accounts
Important seeded accounts after database setup:
- Student: `userA@example.com` / `CorrectPass!234`
- Professor: `professor@example.com` / `CorrectPass!234`
- Admin: `admin@example.com` / `AdminPass!234`
- Multi-role staff: `hybrid.staff@example.com` / `CorrectPass!234`
- No-module student: `nomodule.student@example.com` / `CorrectPass!234`
- Locked: `locked.user@example.com` / `CorrectPass!234`
- Disabled: `disabled.user@example.com` / `CorrectPass!234`
- Outage simulation: `outage.user@example.com` / `CorrectPass!234`

New accounts created through the UC-43 flow are written into the current SQLite database and persist until the database is reset.

## Validation Status
Latest verification completed in this session:
- `npm run test:coverage`: PASS
- `npm run test:acceptance`: PASS
- `npm run lint`: PASS

Coverage across the codebase is currently:
- `100.00%` lines
- `100.00%` branches
- `100.00%` functions

Acceptance test total on the latest run:
- `34` passing Playwright tests

## Spec Tracking
Spec and task tracking updated for UC-43:
- `specs/043-create-user-account/contracts/openapi.yaml` now matches the implemented preset-password API
- `specs/043-create-user-account/implementation-notes.md` added with FR and UC traceability
- `specs/043-create-user-account/checklists/quality-gate.md` added
- `specs/043-create-user-account/tasks.md` updated to mark completed delivered work

Important task note:
- Some UC-43 tasks remain intentionally open because they describe out-of-scope work that was not requested or delivered, including generated-password mode, extra metrics/performance tasks, and draft-only helper/service splits

## Environment And Tooling Notes
- The implemented app lives in `src/`, `public/`, and `tests/`, not the spec template `app/` paths used in some planning docs
- In this Codex environment, the built-in `apply_patch` tool was failing with `bwrap: Unknown option --argv0`; edits were made with the standalone shell `apply_patch` binary instead
- Playwright acceptance runs passed in this environment, but raw shell execution may still require the local Chromium library path override used during this session

## Recommended Next Step For A New Conversation
If continuing from here, assume:
- authentication, password-management, dashboard, profile, and UC-43 create-user flows are already implemented
- the latest full verification passed with 100% branch coverage
- the current tree contains uncommitted changes for the delivered UC-43 work and related spec updates

Most likely next actions are:
- review and commit the current worktree
- decide whether any remaining open UC-43 tasks should actually be implemented or formally deferred
- move on to the next requested feature after preserving the current passing state
