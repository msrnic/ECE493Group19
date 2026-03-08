# Data Model: 001-dashboard-data-view

## Overview

This feature uses SQLite persistence and MVC ownership where models are the only layer that reads/writes database tables. It explicitly persists account and course information per constitution requirements.

## Entities

### Account

- Purpose: Represents authenticated actors (registered user, student, professor).
- Fields:
- `account_id` (TEXT, PK, UUID)
- `username` (TEXT, UNIQUE, NOT NULL)
- `email` (TEXT, UNIQUE, NOT NULL)
- `role` (TEXT, NOT NULL; enum: `registered_user`, `student`, `professor`, `admin`)
- `is_active` (INTEGER, NOT NULL, default 1)
- `created_at` (TEXT, NOT NULL, ISO-8601 timestamp)
- Validation:
- Username length 3-64, alphanumeric + `_`/`.`.
- Email must match standard email pattern.
- Role must be from enum.

### Course

- Purpose: Persistent course metadata required for course history/transcript/grade pages.
- Fields:
- `course_id` (TEXT, PK)
- `course_code` (TEXT, NOT NULL)
- `title` (TEXT, NOT NULL)
- `term_code` (TEXT, NOT NULL)
- `instructor_account_id` (TEXT, FK -> `account.account_id`)
- Validation:
- `course_code` non-empty and upper-case formatted (e.g., `CPSC493`).
- `term_code` must match institutional term format (e.g., `2026W`).

### Enrollment

- Purpose: Maps students to courses and stores grade outcomes.
- Fields:
- `enrollment_id` (TEXT, PK, UUID)
- `student_account_id` (TEXT, FK -> `account.account_id`, NOT NULL)
- `course_id` (TEXT, FK -> `course.course_id`, NOT NULL)
- `grade_letter` (TEXT, nullable)
- `grade_points` (REAL, nullable)
- `grade_submitted_at` (TEXT, nullable)
- Validation:
- Unique constraint on (`student_account_id`, `course_id`).
- `grade_points` range 0.0 to 4.0 when present.

### DashboardPage

- Purpose: Defines fixed in-scope dashboard pages mapped to use cases.
- Fields:
- `page_id` (TEXT, PK; enum: `UC-06`, `UC-20`, `UC-21`, `UC-33`, `UC-36`)
- `page_name` (TEXT, NOT NULL)
- `required_roles` (TEXT, NOT NULL, comma-separated role list)
- Validation:
- `page_id` must be one of the five in-scope IDs.

### PageDataItem

- Purpose: Stores retrievable data fields rendered on dashboard pages.
- Fields:
- `item_id` (TEXT, PK, UUID)
- `page_id` (TEXT, FK -> `dashboard_page.page_id`, NOT NULL)
- `subject_account_id` (TEXT, FK -> `account.account_id`, nullable)
- `subject_course_id` (TEXT, FK -> `course.course_id`, nullable)
- `field_key` (TEXT, NOT NULL)
- `field_value` (TEXT, nullable)
- `status` (TEXT, NOT NULL; enum: `available`, `missing`)
- `missing_reason` (TEXT, nullable)
- `freshness_state` (TEXT, NOT NULL; enum: `fresh`, `may_be_outdated`, `unknown`)
- `updated_at` (TEXT, nullable)
- Validation:
- If `status = missing`, `field_value` must be null.
- If `status = available`, `field_key` and `field_value` must both be populated.
- If `freshness_state = may_be_outdated`, UI must render stale indicator.

### AccessAuditLog

- Purpose: Audits denied access attempts.
- Fields:
- `audit_id` (TEXT, PK, UUID)
- `actor_account_id` (TEXT, FK -> `account.account_id`, NOT NULL)
- `page_id` (TEXT, FK -> `dashboard_page.page_id`, NOT NULL)
- `occurred_at` (TEXT, NOT NULL, ISO-8601 timestamp)
- `reason_code` (TEXT, NOT NULL; enum: `NOT_AUTHENTICATED`, `ROLE_DENIED`, `SUBJECT_SCOPE_DENIED`, `SESSION_MISMATCH`)
- Validation:
- All four FR-011 fields are mandatory and immutable after insert.

## Relationships

- One `Account` can instruct many `Course` records.
- One `Account` (student) can have many `Enrollment` records.
- One `Course` can have many `Enrollment` records.
- One `DashboardPage` can have many `PageDataItem` records.
- One `Account` can have many `AccessAuditLog` deny records.

## State Transitions

### PageDataItem status

1. `available` -> `missing` when retrieval returns null/unavailable for required field.
2. `missing` -> `available` when source recovers and value is present.
3. `available` with `freshness_state=fresh` -> `available` with `freshness_state=may_be_outdated` when freshness check fails.

### Access decision states (request-level)

1. `authorized` -> render filtered data view.
2. `denied` -> record `AccessAuditLog`, show deny view with no restricted data.
