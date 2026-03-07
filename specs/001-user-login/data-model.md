# Data Model: User Login Authentication

## Entity: Account
- Purpose: Represents user identity and authentication/authorization status.
- Storage: SQLite table `accounts`.
- Fields:
  - `id` (INTEGER, PK)
  - `email` (TEXT, UNIQUE, NOT NULL)
  - `username` (TEXT, UNIQUE, NOT NULL)
  - `password_hash` (TEXT, NOT NULL)
  - `status` (TEXT, NOT NULL, enum: `active|locked|disabled`)
  - `failed_attempt_count` (INTEGER, NOT NULL, default `0`)
  - `locked_until` (DATETIME, nullable)
  - `created_at` (DATETIME, NOT NULL)
  - `updated_at` (DATETIME, NOT NULL)
- Validation Rules:
  - Either `email` or `username` must match submitted account identifier.
  - `status=disabled` always denies login.
  - `status=locked` denies login while `locked_until > now`.
  - `failed_attempt_count` resets to `0` after successful login or lock expiry handling.

## Entity: Course
- Purpose: Persist course information per constitution requirements.
- Storage: SQLite table `courses`.
- Fields:
  - `id` (INTEGER, PK)
  - `course_code` (TEXT, UNIQUE, NOT NULL)
  - `title` (TEXT, NOT NULL)
  - `credits` (INTEGER, NOT NULL)
  - `created_at` (DATETIME, NOT NULL)
  - `updated_at` (DATETIME, NOT NULL)
- Validation Rules:
  - `course_code` must be unique and non-empty.
  - `credits` must be positive.

## Entity: AccountCourse
- Purpose: Optional linkage for enrolled courses (supports dashboard/account context).
- Storage: SQLite table `account_courses`.
- Fields:
  - `account_id` (INTEGER, FK -> `accounts.id`, NOT NULL)
  - `course_id` (INTEGER, FK -> `courses.id`, NOT NULL)
  - `role` (TEXT, NOT NULL, enum: `student|instructor|ta`)
  - `created_at` (DATETIME, NOT NULL)
- Constraints:
  - Composite PK (`account_id`, `course_id`, `role`).

## Entity: LoginAttempt
- Purpose: Audit each submitted login attempt and outcome.
- Storage: SQLite table `login_attempts`.
- Fields:
  - `id` (INTEGER, PK)
  - `account_id` (INTEGER, FK -> `accounts.id`, nullable for unknown identifier)
  - `submitted_identifier` (TEXT, NOT NULL)
  - `outcome` (TEXT, NOT NULL, enum: `success|invalid_credentials|locked|disabled|service_unavailable`)
  - `source_ip` (TEXT, nullable)
  - `user_agent` (TEXT, nullable)
  - `attempted_at` (DATETIME, NOT NULL)
- Validation Rules:
  - One record per submitted login request.
  - `success` outcome requires non-null `account_id`.

## Entity: UserSession
- Purpose: Represent authenticated session created after successful login.
- Storage: SQLite table `user_sessions` (in addition to session middleware store metadata if required).
- Fields:
  - `id` (TEXT, PK)
  - `account_id` (INTEGER, FK -> `accounts.id`, NOT NULL)
  - `created_at` (DATETIME, NOT NULL)
  - `expires_at` (DATETIME, NOT NULL)
  - `revoked_at` (DATETIME, nullable)
- Validation Rules:
  - Active session has `revoked_at IS NULL` and `expires_at > now`.

## Relationships
- `Account 1..* LoginAttempt`
- `Account 1..* UserSession`
- `Account *..* Course` through `AccountCourse`

## State Transitions (Account Login-Relevant)
- `active` -> `active`: successful login; failed counter reset.
- `active` -> `locked`: failed attempts reach 5; set `locked_until = now + 15 minutes`.
- `locked` -> `active`: lock duration expires and next evaluation clears lock.
- `active|locked` -> `disabled`: admin action outside this feature.
- `disabled` -> `disabled`: all login attempts denied.
