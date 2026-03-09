# Data Model: 001-manage-course-offerings

## Entity: Account

- Purpose: Persistent administrator account identity and authorization source.
- Storage: SQLite table `accounts`.

### Fields

- `account_id` (TEXT, PK)
- `email` (TEXT, unique, required)
- `role` (TEXT, required; enum: `ADMIN`, `STUDENT`, `PROFESSOR`)
- `status` (TEXT, required; enum: `ACTIVE`, `DISABLED`)
- `created_at` (TEXT ISO-8601, required)
- `updated_at` (TEXT ISO-8601, required)

### Validation Rules

- Only `role=ADMIN` with `status=ACTIVE` may execute add/delete offering actions.

## Entity: CourseOffering

- Purpose: Catalog entry for a course instance in a term.
- Storage: SQLite table `course_offerings`.

### Fields

- `offering_id` (TEXT, PK)
- `course_id` (TEXT, required)
- `term_id` (TEXT, required)
- `instructor_id` (TEXT, required, FK -> `accounts.account_id`)
- `section` (TEXT, required)
- `capacity` (INTEGER, required)
- `schedule_days` (TEXT, required; e.g., `MWF`)
- `schedule_start_time` (TEXT, required; `HH:MM` 24h)
- `schedule_end_time` (TEXT, required; `HH:MM` 24h)
- `status` (TEXT, required; enum: `ACTIVE`, `INACTIVE`, `DELETED`)
- `created_at` (TEXT ISO-8601, required)
- `updated_at` (TEXT ISO-8601, required)

### Validation Rules

- Uniqueness: composite unique index on (`course_id`, `term_id`, `instructor_id`, `section`) [FR-015].
- `capacity` must be in range `1..999`.
- `schedule_start_time < schedule_end_time`.
- Instructor schedule may not overlap another active offering in same term.

### State Transitions

- `ACTIVE -> DELETED` via successful delete.
- `ACTIVE -> ACTIVE` on failed/blocked/cancelled delete (no mutation).
- Creation initializes `status=ACTIVE`.

## Entity: EnrollmentRecord

- Purpose: Tracks student enrollment status for an offering.
- Storage: SQLite table `enrollments`.

### Fields

- `enrollment_id` (TEXT, PK)
- `offering_id` (TEXT, required, FK -> `course_offerings.offering_id`)
- `student_id` (TEXT, required, FK -> `accounts.account_id`)
- `status` (TEXT, required; enum: `ENROLLED`, `WAITLIST_RESERVED`, `WITHDRAWN`, `DROPPED`)
- `created_at` (TEXT ISO-8601, required)
- `updated_at` (TEXT ISO-8601, required)

### Validation Rules

- Active-enrollment check for delete blocker uses statuses: `ENROLLED`, `WAITLIST_RESERVED`.
- Deleting an offering requires no active enrollments unless override path confirmed.

## Entity: OfferingChangeLog

- Purpose: Auditable record of add/delete actions and outcomes.
- Storage: SQLite table `offering_change_logs`.

### Fields

- `log_id` (TEXT, PK)
- `offering_id` (TEXT, required)
- `action_type` (TEXT, required; enum: `ADD`, `DELETE`)
- `actor_account_id` (TEXT, required)
- `occurred_at` (TEXT ISO-8601, required)
- `outcome` (TEXT, required; enum: `SUCCESS`, `FAILURE`, `BLOCKED`, `CONFLICT`)
- `override_used` (INTEGER, required; 0/1)
- `override_reason` (TEXT, nullable)
- `failure_reason` (TEXT, nullable)

### Validation Rules

- `override_reason` required when `override_used=1`.
- `outcome` and `failure_reason` must be coherent (`failure_reason` required for `FAILURE`/`BLOCKED`/`CONFLICT`).

## Entity: AuditRetryQueue

- Purpose: Durable queue of audit entries that failed primary write.
- Storage: SQLite table `audit_retry_queue`.

### Fields

- `retry_id` (TEXT, PK)
- `payload_json` (TEXT, required)
- `attempt_count` (INTEGER, required, default 0)
- `next_attempt_at` (TEXT ISO-8601, required)
- `last_error` (TEXT, nullable)
- `created_at` (TEXT ISO-8601, required)
- `updated_at` (TEXT ISO-8601, required)

### Validation Rules

- `payload_json` contains complete audit event data for replay.
- Retry attempts use bounded exponential backoff.

## Relationships

- `accounts (1) -> (many) course_offerings` via `instructor_id`.
- `course_offerings (1) -> (many) enrollments` via `offering_id`.
- `course_offerings (1) -> (many) offering_change_logs` via `offering_id`.
- `accounts (1) -> (many) offering_change_logs` via `actor_account_id`.

## Transaction Boundaries

- Add offering: validate -> insert offering -> insert audit log (same transaction when possible).
- Delete offering: final recheck -> delete/update offering -> insert audit log (same transaction when possible).
- Audit fail fallback: if catalog mutation committed but audit insert fails post-commit, enqueue retry record and raise alert [FR-016].
