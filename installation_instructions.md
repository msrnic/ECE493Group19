# Installation Instructions

## Prerequisites

Install the following before running the project:

1. Node.js 20 LTS
2. npm

You do not need to install SQLite separately. The app uses the `better-sqlite3` package and creates a local SQLite database file for you.

## Install dependencies

From the project root, run:

```bash
npm install
```

This installs the application dependencies and the development tools used by the test suites.

## Initialize the database

To create a clean local database and reseed the demo data, run:

```bash
npm run setup
```

This script:

1. Applies the current SQLite schema
2. Reseeds the demo login, role, module, dashboard, and password-reset fixture data

## Demo accounts created by setup

After `npm run setup`, these accounts are available:

- Student: `userA@example.com` / `CorrectPass!234`
- Professor: `professor@example.com` / `CorrectPass!234`
- Admin: `admin@example.com` / `AdminPass!234`

## Optional setup for acceptance tests

If you want to run the Playwright acceptance suite, install the browser binaries after `npm install`:

```bash
npx playwright install
```

Depending on your machine, Playwright may also require additional system libraries. Those are only needed for the acceptance tests.

## Recommended install flow

```bash
npm install
npm run setup
```

## Optional validation commands

- Run coverage, contract, integration, and unit tests: `npm run test:coverage`
- Run acceptance tests: `npm run test:acceptance`
- Run the full automated suite: `npm test`
- Run lint: `npm run lint`
