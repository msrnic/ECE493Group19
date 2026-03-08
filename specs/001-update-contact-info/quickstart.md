# Quickstart — 001-update-contact-info

## Purpose

Implement and validate UC-07 contact information editing using HTML/CSS/JavaScript MVC with SQLite persistence.

## Preconditions

- Node.js LTS installed
- SQLite available
- Auth flow already provides logged-in user context
- Use-case and acceptance artifacts remain read-only:
  - `Use Cases/UC-07.md`
  - `Acceptance Tests/UC-07-AS.md`

## Implementation Steps

1. Create MVC paths under `app/`:
   - `app/models/contactInfoModel.js`
   - `app/controllers/contactController.js`
   - `app/routes/contactRoutes.js`
   - `app/views/contact-info.html`
   - `app/public/js/contact-info.js`
   - `app/public/css/contact-info.css`
2. Add/extend SQLite schema (`app/db/schema.sql`) for:
   - `contact_profiles`
   - `emergency_contacts`
   - `contact_update_events` (optional audit)
   - ensure existing `accounts` and `courses` remain persisted.
3. Implement GET `/contact-info` controller flow:
   - authorize authenticated user for own account
   - load current basic + emergency data
   - render view with current values
4. Implement POST `/contact-info` controller flow:
   - trim/normalize input
   - validate email/phone/address formats
   - if invalid, return field-level errors and do not save
   - if valid, execute one SQLite transaction for both sections
   - on transaction failure, rollback and return retry-later error
   - on success, show confirmation and conflict notice when overlap detected
5. Wire client-side JS for inline field highlighting and message rendering.
6. Apply style-guide checks for modified HTML/CSS/JS files.

## Validation Checklist (UC-07-AS aligned)

1. Main success flow (`AT-UC07-01`): valid updates persist and confirmation is shown.
2. Invalid formats (`AT-UC07-02`): invalid fields highlighted; nothing saved until corrected.
3. Save failure (`AT-UC07-03`): simulated DB failure produces retry message and no changes.
4. Cancel/abandon (`AT-UC07-04`): unsaved edits are discarded.
5. Additional spec edge cases:
   - normalized whitespace is stored trimmed
   - one invalid field blocks entire submission
   - last-write-wins saves latest submission and shows notice

## Definition of Done

- Feature behavior matches `specs/001-update-contact-info/spec.md`
- Traceability to `UC-07` and `UC-07-AS` documented in tasks/tests
- Stack/architecture constraints satisfied (HTML/CSS/JS + SQLite, MVC)
- No edits made to protected use-case/acceptance files
