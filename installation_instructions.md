# Installation Instructions

## What must be installed

To run this project locally, install:

1. `Node.js 20 LTS`
2. `npm` (normally included with Node.js)

You do **not** need to install SQLite separately. The project uses the `better-sqlite3` Node package and creates a local database file named `sis.db` in the project root by default.

## Project dependencies

After installing Node.js and npm, open a terminal in the project root and run:

```bash
npm install
```

This installs the application dependencies defined in `package.json`, including:

- `express`
- `express-session`
- `better-sqlite3`
- `bcrypt`

It also installs development dependencies used for testing:

- `@playwright/test`
- `supertest`

## Optional installation for acceptance tests

If you want to run the Playwright acceptance tests, install the Playwright browser binaries after `npm install`:

```bash
npx playwright install
```

Depending on your machine, Playwright may also require system libraries. Those are only needed for the acceptance test suite, not for normal application startup.

## Database setup

The project includes scripts to create and seed the database:

```bash
npm run setup
```

That command does both of the following:

1. Applies the SQLite schema
2. Seeds demo login data

The same schema setup is also performed automatically when the app starts, but running `npm run setup` first gives you a clean initialized database.

## Demo accounts created by the seed script

After running `npm run setup`, these demo credentials are available:

- Student: `userA@example.com` / `CorrectPass!234`
- Admin: `admin@example.com` / `AdminPass!234`

## Summary

Minimum required installation:

```bash
npm install
npm run setup
```

Optional for full test execution:

```bash
npx playwright install
```
