# Startup Instructions

## Start from the project root

Open a terminal in:

```bash
cd /home/m_srnic/ece493/group_project/ECE493Group19
```

## Install dependencies if needed

```bash
npm install
```

## Recommended clean startup flow

If you want a clean database with the default demo accounts, run:

```bash
npm run setup
npm start
```

This is the safest day-to-day workflow because `npm run setup` recreates the seeded project data before startup.

## What `npm start` does

`npm start` runs:

```bash
node scripts/start-server.js
```

On startup, the server:

- applies the latest schema automatically
- uses `sis.db` by default
- starts on port `3000` by default
- seeds the demo accounts automatically only if the database is empty, or if you explicitly force reseeding

When startup succeeds, the app is available at:

```text
http://127.0.0.1:3000/
```

## Demo accounts

After `npm run setup` or a forced reseed, you can log in with:

- Student: `userA@example.com` / `CorrectPass!234`
- Professor: `professor@example.com` / `CorrectPass!234`
- Admin: `admin@example.com` / `AdminPass!234`

## Useful startup options

Start on a different port:

```bash
PORT=4000 npm start
```

Use a different database file:

```bash
DB_PATH=custom.db npm start
```

Force the demo data to be reseeded on startup:

```bash
SEED_LOGIN_FIXTURES=1 npm start
```

Use a custom session secret:

```bash
SESSION_SECRET=my-secret-value npm start
```

## Useful project commands

- Cleanly recreate schema and demo data: `npm run setup`
- Start the app: `npm start`
- Run coverage, contract, integration, and unit tests: `npm run test:coverage`
- Run acceptance tests: `npm run test:acceptance`
- Run the full automated suite: `npm test`
- Run lint: `npm run lint`
