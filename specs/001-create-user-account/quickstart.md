# Quickstart: 001-create-user-account

## Goal

Deliver UC-43 account creation in MVC using HTML/CSS/JavaScript + SQLite, with transactional account persistence and notification-failure warning behavior.

## Prerequisites

- Node.js 20+
- SQLite 3+
- Working tree on branch `001-create-user-account`
- No edits to protected files:
  - `Use Cases/UC-*.md`
  - `Acceptance Tests/UC-*-AS.md`

## 1. Create MVC skeleton

1. Add model files under `app/models/`:
   - `userAccountModel.js`
   - `roleModel.js`
   - `credentialModel.js`
   - `courseModel.js` (boundary persistence module)
2. Add controller `app/controllers/adminAccountController.js`.
3. Add route module `app/routes/adminAccountRoutes.js`.
4. Add view `app/views/admin/create-account.html`.
5. Add static assets:
   - `app/public/css/admin-account.css`
   - `app/public/js/create-account.js`

## 2. Initialize SQLite schema

1. Create/extend `app/db/schema.sql` with entities from `data-model.md`:
   - `user_accounts`, `roles`, `user_role_assignments`, `credentials`, `notification_attempts`
   - ensure existing `courses` and `course_offerings` remain persistent.
2. Add migrations under `app/db/migrations/`.
3. Enforce DB constraints:
   - unique `login_identifier_normalized`
   - foreign keys on role/credential/notification mappings.

## 3. Implement controller flows

1. `GET /api/admin/accounts/form-metadata`
   - return assignable roles + password policy + notification setting.
2. `POST /api/admin/accounts`
   - validate required fields and role permission
   - enforce password policy for preset mode
   - normalize identifier (`trim + lowercase`) and check uniqueness
   - execute account/credential/role write in one transaction
   - attempt notification post-commit when enabled
   - return `201` even when notification fails, with warning payload.

## 4. Build validation UX

1. Render field-level errors on invalid submit.
2. Preserve non-sensitive values after failure (`fullName`, `institutionalId`, `loginIdentifier`, `roleId`, `passwordMode`, `sendNotification`).
3. Never preserve or re-display raw password input.

## 5. Verify against UC-43 and acceptance scope

1. Main success: account created + role assigned + confirmation shown.
2. Invalid identity (4a): blocked until corrected.
3. Invalid/disallowed role (5a): blocked until corrected.
4. Invalid password (6a): blocked until corrected.
5. Duplicate identifier (8a): blocked with conflict error.
6. System failure (9a): rollback with error logging.
7. Notification failure (11a): account persists, failure notice shown, no resend/copy workflow.

## 6. Testing workflow

1. Unit tests: normalization, password policy, role-assignment permission.
2. Integration tests: controller + SQLite transaction behavior.
3. Contract tests: ensure responses match `contracts/openapi.yaml`.
4. E2E tests: one success path + one correction path.
5. Style checks: validate HTML/CSS and JavaScript against required Google style guides.
