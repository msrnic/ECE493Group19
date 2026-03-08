# Quickstart: Update Personal Details

## Scope Traceability

- Use case: `Use Cases/UC-05.md`
- Acceptance tests: `Acceptance Tests/UC-05-AS.md`
- Feature spec: `specs/001-update-personal-details/spec.md`

## Prerequisites

- Node.js 20+
- npm 10+
- SQLite 3

## 1. Install dependencies

```bash
npm install
```

## 2. Initialize database

```bash
mkdir -p backend/data
sqlite3 backend/data/app.db < backend/src/models/schema.sql
```

Required persistent tables include:
- Account boundary: `accounts`
- Course boundary: `courses`
- Feature table: `personal_details`

## 3. Run the app

```bash
npm run dev
```

Expected local URL: `http://localhost:3000`

## 4. Exercise UC-05 flow manually

1. Sign in as a registered user.
2. Open Personal Details page.
3. Edit allowed fields with valid values and save.
4. Confirm success message and persisted values.
5. Submit invalid data and verify field-level errors.
6. Simulate save failure and verify no partial update.
7. Edit without saving, navigate away, and verify confirmation prompt and discard behavior.

## 5. Validate implementation against acceptance tests

```bash
npm test -- personal-details
```

At minimum, cover:
- Main success update
- Validation rejection + correction retry
- Save failure no-partial-write behavior
- Cancel/abandon unsaved edits

## Style Compliance Checks

- Ensure HTML/CSS follows `Style Guides/google-style-guide-html-css.md`
- Ensure JavaScript follows `Style Guides/google-style-guide-javascript.md`
