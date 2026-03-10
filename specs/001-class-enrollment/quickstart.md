# Quickstart: 001-class-enrollment

## Goal

Run the student class enrollment flow locally with JavaScript MVC web app + SQLite and validate UC-17 acceptance behavior.

## Prerequisites

- Node.js 20+
- npm 10+
- SQLite 3 CLI

## 1. Install dependencies

```bash
cd /home/m_srnic/ece493/group_project/ECE493Group19
npm install
```

## 2. Initialize database

```bash
mkdir -p backend/data
sqlite3 backend/data/app.db < scripts/sqlite/schema.sql
sqlite3 backend/data/app.db < scripts/sqlite/seed-uc17.sql
```

## 3. Start application

```bash
npm run dev
```

Expected local URLs:
- App UI: `http://localhost:3000`
- Enrollment API base: `http://localhost:3000/api`

## 4. Execute core UC-17 scenarios

### Main success
- Log in as eligible student test user.
- Search for `O_OPEN` and click Enroll.
- Expect `201 ENROLLED`, schedule includes offering, fee assessment present or marked pending refresh.

### Blocked: prerequisite
- Use `S_PREREQ` against `O_OPEN`.
- Expect `409 BLOCKED` with `blockingReasons` containing code `PREREQUISITE`.

### Blocked: course full
- Use `S_OK` against `O_FULL`.
- Expect `409 BLOCKED` with `blockingReasons` containing `CAPACITY` and remaining seats info.

### Blocked: hold
- Use `S_HOLD` against `O_OPEN`.
- Expect `409 BLOCKED` with `blockingReasons` containing `HOLD`.

### System error rollback
- Enable fault toggle for enrollment write failure.
- Submit enroll request for eligible student.
- Expect `500 ERROR`, retry guidance, and unchanged schedule.

## 5. Verify tests

```bash
npm run test:contract
npm run test:integration
npm run test:e2e
```

## 6. Traceability check

- Use-case: `Use Cases/UC-17.md`
- Acceptance suite: `Acceptance Tests/UC-17-AS.md`
- Feature spec: `specs/001-class-enrollment/spec.md`
- Contract: `specs/001-class-enrollment/contracts/openapi.yaml`

## Style compliance

```bash
npm run lint:js
npm run lint:html
npm run lint:css
```

All lint checks must pass before merge.
