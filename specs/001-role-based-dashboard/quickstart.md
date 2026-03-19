# Quickstart: Role-Based Dashboard Access

## 1. Prerequisites
- Node.js 20+
- SQLite 3
- npm 10+

## 2. Initialize project structure
```bash
mkdir -p app/{controllers,models,views/layouts,views/dashboard,views/auth,public/css,public/js,routes,db/migrations} tests/{unit,integration,contract}
```

## 3. Create SQLite schema
- Add `app/db/schema.sql` with tables from `data-model.md`:
  - `accounts`, `courses`, `roles`, `role_assignments`
  - `modules`, `role_modules`, `dashboard_sections`
  - `dashboard_section_states`, `dashboard_load_events`
- Apply schema to local DB:
```bash
sqlite3 app/db/app.db < app/db/schema.sql
```

## 4. Implement MVC layers
- Models:
  - Add query methods for account lookup, active roles, role-module expansion, section load state, and event logging.
- Controllers:
  - `dashboard-controller.js` must orchestrate independent section loads and compute outcomes `success|partial|failure`.
  - `auth-controller.js` must enforce login and return-to behavior for session expiry.
- Views:
  - Dashboard HTML template must render enabled and disabled-unavailable navigation entries.
  - Add explicit UI states: empty-access, role-data-error, partial, and full failure.
- Client JS:
  - Retry button posts only unavailable section IDs to `/dashboard/retry` and keeps available section DOM unchanged.

## 5. Implement API contract
- Build routes for:
  - `GET /dashboard`
  - `POST /dashboard/retry`
- Ensure payload shape matches `contracts/dashboard-api.yaml`.

## 6. Validation and tests
- Unit tests (`tests/unit`):
  - Role merge without duplicates
  - Unauthorized module filtering
  - Section outcome classification
- Integration tests (`tests/integration`):
  - Login -> dashboard render flow
  - Partial-load handling and section retry behavior
  - Session expiration redirect and post-login return
- Contract tests (`tests/contract`):
  - Verify response schema for success/partial/failure/auth_error

## 7. Style-guide compliance gate
- Verify HTML/CSS follows `Style Guides/google-style-guide-html-css.md`.
- Verify JavaScript follows `Style Guides/google-style-guide-javascript.md`.
- Add lint/check scripts before merge and fail CI on violations.

## 8. Acceptance alignment
- Validate against:
  - `Acceptance Tests/UC-03-AS.md`
  - `Acceptance Tests/UC-09-AS.md`
  - Relevant login-return flow checks from `Acceptance Tests/UC-02-AS.md`
