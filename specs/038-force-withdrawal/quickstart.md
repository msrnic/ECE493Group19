# Quickstart: 038-force-withdrawal

## Prerequisites
- Node.js 20+
- npm 10+
- SQLite 3 CLI (`sqlite3`)

## 1. Initialize database schema
```bash
sqlite3 ./backend/data/sis.sqlite < ./backend/src/db/schema.sql
```

## 2. Start application
```bash
npm install
npm run dev
```

## 3. Execute force-withdrawal happy path
1. Sign in as an account with `ADMIN` role.
2. Open enrollment administration and select a student + course offering where enrollment status is `ENROLLED`.
3. Choose `Force Withdraw`.
4. Confirm implications are visible (transcript + fee impact).
5. Enter required reason and confirm.
6. Verify success response, enrollment removal, schedule update, transcript notation update, and fee ledger update.

## 4. Validate key exception flows
1. Not enrolled: submit force-withdrawal for student not enrolled in offering; expect rejection and no data changes.
2. Cancel at confirmation: cancel before submit; expect no data changes.
3. Failure rollback: inject DB failure in transaction; expect rollback with unchanged enrollment/schedule/transcript/fee state.
4. Audit failure: simulate audit write failure; expect withdrawal success with `pendingAudit=true` and queued retry record.
5. Concurrency: submit two confirms concurrently for same student/offering; expect one success and one `409`/not-enrolled outcome.

## 5. Run tests
```bash
npm test
```

## 6. Acceptance traceability
- Use case: `Use Cases/UC-38.md`
- Acceptance tests: `Acceptance Tests/UC-38-AS.md`
- Feature spec: `specs/038-force-withdrawal/spec.md`
