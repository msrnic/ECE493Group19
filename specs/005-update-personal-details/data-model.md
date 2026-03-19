# Data Model: Update Personal Details

## Entity: Account

- Purpose: Authenticated user identity and account boundary required by constitution.
- Storage: SQLite table `accounts`.
- Fields:
  - `account_id` INTEGER PRIMARY KEY
  - `username` TEXT UNIQUE NOT NULL
  - `sign_in_email` TEXT UNIQUE NOT NULL (read-only in this feature)
  - `password_hash` TEXT NOT NULL (read-only in this feature)
  - `created_at` TEXT NOT NULL
  - `updated_at` TEXT NOT NULL
- Validation rules:
  - `sign_in_email` and `password_hash` cannot be edited in this feature (FR-013).

## Entity: Course

- Purpose: Course-information persistence boundary required by constitution.
- Storage: SQLite table `courses`.
- Fields:
  - `course_id` INTEGER PRIMARY KEY
  - `course_code` TEXT NOT NULL
  - `course_name` TEXT NOT NULL
  - `term_code` TEXT NOT NULL
  - `created_at` TEXT NOT NULL
  - `updated_at` TEXT NOT NULL
- Validation rules:
  - Not modified by this feature; included to satisfy mandatory system data boundary.

## Entity: PersonalDetailsProfile

- Purpose: User-owned editable personal details record for UC-05.
- Storage: SQLite table `personal_details`.
- Fields:
  - `account_id` INTEGER PRIMARY KEY REFERENCES `accounts(account_id)`
  - `legal_first_name` TEXT NOT NULL
  - `legal_last_name` TEXT NOT NULL
  - `date_of_birth` TEXT NOT NULL (ISO `YYYY-MM-DD`)
  - `country_of_origin` TEXT NOT NULL
  - `phone_number` TEXT NULL
  - `address_line_1` TEXT NULL
  - `address_line_2` TEXT NULL
  - `city` TEXT NULL
  - `province_or_state` TEXT NULL
  - `postal_code` TEXT NULL
  - `last_updated_at` TEXT NOT NULL
- Validation rules:
  - Required: `legal_first_name`, `legal_last_name`, `date_of_birth`, `country_of_origin`.
  - `date_of_birth` must be parseable date and not in the future.
  - Max lengths enforced per field (implementation constants).
  - Read-only fields from account credentials are excluded from edit payload.

## Entity: EditableFieldRule

- Purpose: Defines editability, required status, and format constraints used by validation.
- Storage: Application-level config module (or SQLite table `editable_field_rules` if runtime configurability is needed).
- Fields:
  - `field_name` TEXT PRIMARY KEY
  - `is_editable` INTEGER NOT NULL
  - `is_required` INTEGER NOT NULL
  - `format_type` TEXT NOT NULL
  - `max_length` INTEGER NULL

## Entity: UpdateAttempt

- Purpose: Logical record of a submission outcome for auditing/diagnostics.
- Storage: SQLite table `personal_detail_update_attempts` (optional but recommended).
- Fields:
  - `attempt_id` INTEGER PRIMARY KEY
  - `account_id` INTEGER NOT NULL
  - `submitted_at` TEXT NOT NULL
  - `outcome` TEXT NOT NULL CHECK(outcome IN ('SUCCESS','VALIDATION_ERROR','SAVE_ERROR','CANCELED'))
  - `error_summary` TEXT NULL

## Relationships

- `accounts` 1:1 `personal_details` via `account_id`.
- `accounts` 1:N `personal_detail_update_attempts`.
- `courses` remains independent for this feature but persists in same SQLite database per constitution.

## State Transitions: UpdateAttempt

- `DRAFT_EDITING` -> `VALIDATION_ERROR` on invalid submit.
- `DRAFT_EDITING` -> `SAVE_ERROR` on transactional write failure.
- `DRAFT_EDITING` -> `CANCELED` on user cancel/confirmed navigation away before submit.
- `DRAFT_EDITING` -> `SUCCESS` on valid submit + committed transaction.
- Concurrency rule: concurrent `SUCCESS` transitions follow last-write-wins by commit timestamp (FR-012).
