# Quickstart: 039-manage-course-offerings

## Purpose

Implement and validate UC-39 add/delete course offerings with FR-001..FR-019 compliance in an HTML/CSS/JavaScript MVC app backed by SQLite.

## Prerequisites

- Node.js 20+
- npm 10+
- SQLite 3
- Browser: current Chrome/Firefox/Edge

## Setup

1. Initialize dependencies:

```bash
npm install
```

2. Create/update SQLite schema and seed baseline data:

```bash
sqlite3 ./data/app.db < ./src/db/schema.sql
sqlite3 ./data/app.db < ./src/db/seeds/dev_seed.sql
```

3. Start the web app:

```bash
npm run dev
```

4. Open admin offerings page at `/admin/offerings` and authenticate as an administrator account.

## Implementation Checklist

1. Add/verify MVC modules:
   - `src/models/offeringModel.js`, `src/models/enrollmentModel.js`, `src/models/auditLogModel.js`
   - `src/controllers/offeringController.js`
   - `src/views/admin/offerings-list.html`, `src/views/admin/offering-form.html`, `src/views/admin/offering-delete-confirm.html`
   - `src/routes/offeringRoutes.js`
2. Add SQLite constraints:
   - Composite unique index for `(course_id, term_id, instructor_id, section)`.
   - Transaction-safe delete flow with final `updated_at` recheck.
3. Implement override delete path:
   - Require explicit confirmation and non-empty override reason.
4. Implement audit fallback:
   - Queue audit payload on audit write failure and raise admin alert.

## Validation Steps

1. Run unit/integration/contract tests:

```bash
npm test
```

2. Run admin-flow smoke tests:

```bash
npm run test:e2e -- --grep "UC-39"
```

3. Manually verify UC-39 critical flows:
   - Add offering success and duplicate rejection.
   - Delete blocked with active enrollments without override.
   - Override delete succeeds with reason and audited indicator.
   - Simulated DB failure causes rollback with no partial mutation.
   - Cancel add/delete persists no changes.

## Style and Governance Checks

1. Ensure HTML/CSS follows `/Style Guides/google-style-guide-html-css.md`.
2. Ensure JavaScript follows `/Style Guides/google-style-guide-javascript.md`.
3. Confirm no edits were made to protected artifacts:
   - `Use Cases/UC-*.md`
   - `Acceptance Tests/UC-*-AS.md`
4. Confirm feature traceability references:
   - Use case: `/Use Cases/UC-39.md`
   - Acceptance: `/Acceptance Tests/UC-39-AS.md`
