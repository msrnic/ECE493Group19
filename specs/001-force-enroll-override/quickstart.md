# Quickstart: Force Enroll Override

## 1. Prerequisites
- Node.js 20.x
- npm 10+
- SQLite 3

## 2. Prepare database
1. Create or open the SQLite database used by the web app.
2. Apply schema/migration updates for:
   - `force_enroll_requests`
   - `override_audit_entries`
   - unique enrollment index on (`student_id`, `offering_id`)
3. Seed test data for:
   - one admin account
   - valid/invalid student IDs
   - valid/invalid offerings
   - an offering already at capacity

## 3. Implement MVC wiring
1. Model layer (`app/models`): add data access for requests, enrollment, capacity, schedule, and audit append.
2. Service layer (`app/services/forceEnrollService.js`):
   - bypass prerequisites
   - enforce hard constraints
   - run atomic SQLite transaction for success path
   - enforce same-admin confirmation for over-capacity requests
3. Controller layer (`app/controllers/forceEnrollController.js`): expose contract endpoints and user-facing error messages.
4. View layer (`app/views/admin-force-enroll.ejs` + `public/js/admin-force-enroll.js` + `public/css/admin-force-enroll.css`):
   - reason input required
   - explicit second confirmation UI for full offerings
   - clear success/failure feedback

## 4. Run tests mapped to UC-37
1. Main success: prerequisites unmet but hard constraints pass -> enrollment + schedule + capacity + audit updated.
2. Student/offering missing -> rejection with no data changes.
3. Hard constraint failure -> rejection with clear reason and no changes.
4. Over-capacity:
   - first call returns `PENDING_CONFIRMATION`
   - same admin confirms and completes
   - other admin confirmation is rejected.
5. System failure during transaction -> rollback verified.

## 5. Style and constitution checks
1. Verify HTML/CSS against `Style Guides/google-style-guide-html-css.md`.
2. Verify JavaScript against `Style Guides/google-style-guide-javascript.md`.
3. Confirm no edits were made to protected `Use Cases/` or `Acceptance Tests/` artifacts.
4. Confirm stack remains HTML/CSS/JavaScript + SQLite and MVC ownership remains explicit.
