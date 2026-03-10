# Data Model: Administrative Account Creation

## Overview

This feature persists account-creation data in SQLite with MVC model ownership. It explicitly maintains both required constitutional data domains:
- Account information (`user_accounts`, `credentials`, `roles`, `user_role_assignments`, `notification_attempts`)
- Course information (`courses`, `course_offerings`) as existing persistent domain tables, referenced for boundary completeness.

## Entities

## 1) `user_accounts`

Purpose: Canonical user identity and lifecycle state.

Fields:
- `id` (INTEGER, PK, autoincrement)
- `institutional_id` (TEXT, NOT NULL, UNIQUE)
- `full_name` (TEXT, NOT NULL)
- `login_identifier_raw` (TEXT, NOT NULL)
- `login_identifier_normalized` (TEXT, NOT NULL, UNIQUE)  
  Rule: `trim(input).toLowerCase()`
- `status` (TEXT, NOT NULL, default `active`)  
  Allowed: `active`, `disabled`
- `must_change_password` (INTEGER, NOT NULL, default 1)  
  Allowed: `0` or `1`; new accounts always `1`
- `created_by_admin_id` (INTEGER, NOT NULL, FK -> `administrators.id` or `user_accounts.id` for admin actor)
- `created_at` (TEXT, NOT NULL, ISO-8601 UTC)
- `updated_at` (TEXT, NOT NULL, ISO-8601 UTC)

Validation:
- `full_name` required, non-empty after trim.
- Exactly one unique login identifier is required in request (email or username input path).
- `login_identifier_normalized` unique constraint enforces duplicate prevention + race safety.

## 2) `roles`

Purpose: Assignable role catalog.

Fields:
- `id` (INTEGER, PK, autoincrement)
- `role_name` (TEXT, NOT NULL, UNIQUE)
- `is_assignable` (INTEGER, NOT NULL, default 1)
- `created_at` (TEXT, NOT NULL)

Validation:
- Role must exist and be assignable at submit time.
- Admin actor must have permission to assign selected role.

## 3) `user_role_assignments`

Purpose: Effective role mapping for user accounts.

Fields:
- `id` (INTEGER, PK, autoincrement)
- `user_account_id` (INTEGER, NOT NULL, FK -> `user_accounts.id` ON DELETE CASCADE)
- `role_id` (INTEGER, NOT NULL, FK -> `roles.id`)
- `assigned_by_admin_id` (INTEGER, NOT NULL)
- `assigned_at` (TEXT, NOT NULL)

Constraints:
- UNIQUE(`user_account_id`) for single-role assignment required by FR-003.

## 4) `credentials`

Purpose: Credential storage and security flags.

Fields:
- `id` (INTEGER, PK, autoincrement)
- `user_account_id` (INTEGER, NOT NULL, UNIQUE, FK -> `user_accounts.id` ON DELETE CASCADE)
- `password_hash` (TEXT, NOT NULL)
- `hash_algorithm` (TEXT, NOT NULL, default `bcrypt`)
- `password_set_at` (TEXT, NOT NULL)
- `temporary_password_issued` (INTEGER, NOT NULL, default 0)

Validation:
- Password hash never null and never plain text.
- For generated temporary passwords, `temporary_password_issued = 1`.

## 5) `notification_attempts`

Purpose: Audit post-create notification outcome.

Fields:
- `id` (INTEGER, PK, autoincrement)
- `user_account_id` (INTEGER, NOT NULL, FK -> `user_accounts.id` ON DELETE CASCADE)
- `channel` (TEXT, NOT NULL)  
  Allowed: `email`, `in_app`
- `status` (TEXT, NOT NULL)  
  Allowed: `sent`, `failed`, `skipped_disabled`
- `error_code` (TEXT, NULL)
- `error_message` (TEXT, NULL)
- `attempted_at` (TEXT, NOT NULL)

Behavior:
- Created after successful account transaction commits.
- `failed` does not trigger rollback.

## 6) `courses` (existing domain boundary table)

Purpose: Persistent course catalog (constitution-required course data domain).

Fields (minimum boundary representation):
- `id` (INTEGER, PK)
- `course_code` (TEXT, UNIQUE, NOT NULL)
- `title` (TEXT, NOT NULL)
- `active` (INTEGER, NOT NULL)

## 7) `course_offerings` (existing domain boundary table)

Purpose: Persistent term-based course offerings.

Fields (minimum boundary representation):
- `id` (INTEGER, PK)
- `course_id` (INTEGER, NOT NULL, FK -> `courses.id`)
- `term_code` (TEXT, NOT NULL)
- `capacity` (INTEGER, NOT NULL)

## Relationships

- `user_accounts` 1:1 `credentials`
- `user_accounts` 1:1 `user_role_assignments` (for this feature’s single selected role)
- `roles` 1:N `user_role_assignments`
- `user_accounts` 1:N `notification_attempts`
- `courses` 1:N `course_offerings`

## Transactional Boundaries

Create-account transaction includes:
1. Insert `user_accounts`
2. Insert `credentials`
3. Insert `user_role_assignments`

Post-commit side-effect:
4. Insert `notification_attempts` based on delivery result (or skipped when disabled)

## State Transitions

## Account Lifecycle (for this feature)

- `new request` -> `validated`
- `validated` -> `created_active` (`status=active`, `must_change_password=1`)
- `validated` -> `rejected_validation` (field/role/password/duplicate)
- `validated` -> `failed_system_error` (transaction rolled back)
- `created_active` -> `created_active_with_notification_failed` (only notification state changes)

## Notification State

- `not_attempted` -> `sent`
- `not_attempted` -> `failed`
- `not_attempted` -> `skipped_disabled`
