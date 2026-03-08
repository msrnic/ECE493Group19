# Quickstart: 001-dashboard-data-view

## Prerequisites

- Node.js 20+
- npm 10+
- SQLite 3 CLI (`sqlite3`)

## 1) Install dependencies

```bash
cd /home/m_srnic/ece493/group_project/ECE493Group19
npm install express ejs better-sqlite3 express-session
npm install -D vitest supertest playwright eslint eslint-config-google
```

## 2) Initialize SQLite schema

```bash
cd /home/m_srnic/ece493/group_project/ECE493Group19
mkdir -p server/db
sqlite3 server/db/sis.db < server/db/schema.sql
```

## 3) Seed baseline data

- Insert test accounts for roles: `registered_user`, `student`, `professor`.
- Insert courses, enrollments, and dashboard page metadata for `UC-06`, `UC-20`, `UC-21`, `UC-33`, `UC-36`.
- Insert a mix of `PageDataItem` records with statuses `available` and `missing`, and some `may_be_outdated` freshness states.

## 4) Run application

```bash
cd /home/m_srnic/ece493/group_project/ECE493Group19
node server/app.js
```

Open the dashboard and navigate to each in-scope page.

## 5) Validate required behavior

- Authorized actor can load each page and view allowed fields only.
- Missing items are explicitly indicated while available data still renders.
- If all requested items are missing, no-data state appears with retry guidance.
- Items with unknown freshness show a clear may-be-outdated indicator.
- Unauthorized access attempts are denied and logged in `access_audit_log`.

## 6) Run tests

```bash
cd /home/m_srnic/ece493/group_project/ECE493Group19
npx vitest run
npx playwright test
```

## 7) Verify audit logs

```bash
cd /home/m_srnic/ece493/group_project/ECE493Group19
sqlite3 server/db/sis.db "SELECT actor_account_id,page_id,occurred_at,reason_code FROM access_audit_log ORDER BY occurred_at DESC LIMIT 20;"
```

Confirm each denied attempt includes actor, page, timestamp, and reason code.
