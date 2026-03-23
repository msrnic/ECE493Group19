# Startup Instructions

## 1. Open the project directory

In a terminal, go to the project root:

```bash
cd /home/m_srnic/ece493/group_project/ECE493Group19
```

## 2. Install dependencies if you have not already

```bash
npm install
```

## 3. Initialize the database

Run:

```bash
npm run setup
```

This creates the database schema and seeds the demo accounts into `sis.db`.

## 4. Start the application

Run:

```bash
npm start
```

This runs:

```bash
node scripts/start-server.js
```

By default, the application:

- starts on port `3000`
- uses the SQLite database file `sis.db`

When startup succeeds, the server prints a local URL similar to:

```text
http://127.0.0.1:3000/
```

Open that URL in your browser.

## Demo login credentials

If you used `npm run setup`, you can log in with:

- Student: `userA@example.com` / `CorrectPass!234`
- Admin: `admin@example.com` / `AdminPass!234`

## Optional environment variables

You can override the default startup behavior with environment variables.

### Start on a different port

```bash
PORT=4000 npm start
```

### Use a different SQLite database file

```bash
DB_PATH=custom.db npm start
```

### Force the demo data to be reseeded on startup

```bash
SEED_LOGIN_FIXTURES=1 npm start
```

### Use a custom session secret

```bash
SESSION_SECRET=my-secret-value npm start
```

## Useful commands

Start the app:

```bash
npm start
```

Recreate schema and seed data:

```bash
npm run setup
```

Run the automated test suite:

```bash
npm test
```

Run the syntax/lint check:

```bash
npm run lint
```
