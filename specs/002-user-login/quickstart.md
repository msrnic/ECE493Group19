# Quickstart: User Login Authentication

## 1. Prerequisites
- Node.js 20+ runtime
- npm
- SQLite 3

## 2. Install dependencies
- Run `npm install`
- Acceptance tests on this host use local runtime-library bundles staged under `tmp/` for Playwright Chromium.

## 3. Create and seed the SQLite schema
- Run `npm run db:migrate`
- Run `npm run db:seed:login`
- Default database path: `sis.db`

## 4. Run the full validation flow
- Run `npm test`
- Run `npm run lint`

## 5. Implemented behavior summary
- Successful login creates an authenticated session and redirects to `/dashboard`.
- Invalid credentials return a retryable `401` response and do not create a session.
- Five failed attempts lock the account for 15 minutes; valid credentials remain blocked during the lock period.
- Locked and disabled accounts are denied with next-step guidance.
- Authentication-service outages return `503`, create no session, and are recorded as failures.

## 6. Recorded validation evidence
- `npm run test:coverage`: passed with `100.00%` line, branch, and function coverage across `src/**/*.js`.
- `npm run test:acceptance`: passed `5/5` Playwright acceptance scenarios covering AT-UC02-01 through AT-UC02-05.
- `npm run lint`: passed after final implementation changes.
- SC-001 benchmark evidence: `tests/integration/login-performance.test.js` executed 20 successful logins and asserted p95 latency stayed below the `30,000 ms` threshold. Result: PASS.

## 7. SC-005 Post-Release Measurement Procedure
- Sample size: 30 first-time sign-in attempts from post-release usability sessions.
- Data source: observer worksheet plus server-side `login_attempts` rows for the same session window.
- Success definition: participant reaches `/dashboard` on the first attempt using valid credentials without facilitator intervention.
- Reporting cadence: summarize results once per release candidate and once during the first production week.
- Reporting template:
  - Release/build identifier
  - Observation window dates
  - Participant count
  - First-attempt success count and percentage
  - Common failure reasons
  - Required corrective actions
