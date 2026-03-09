# Data Model: 001-force-withdrawal

## Entity: Account
- Purpose: Represents authenticated users, including administrators.
- Fields:
  - `account_id` (TEXT, PK)
  - `role` (TEXT, enum: `ADMIN`, `STUDENT`, `STAFF`)
  - `status` (TEXT, enum: `ACTIVE`, `DISABLED`)
- Validation:
  - Only `ACTIVE` accounts with `ADMIN` role may execute forced withdrawal (FR-016).

## Entity: CourseOffering
- Purpose: Represents an offering in a term/section.
- Fields:
  - `offering_id` (TEXT, PK)
  - `course_code` (TEXT)
  - `term_code` (TEXT)
  - `offering_status` (TEXT, enum: `OPEN`, `CLOSED`, `ARCHIVED`)
- Validation:
  - `offering_id` must exist before workflow proceeds.

## Entity: Enrollment
- Purpose: Student enrollment status per offering.
- Fields:
  - `enrollment_id` (TEXT, PK)
  - `student_id` (TEXT, FK -> Account.account_id)
  - `offering_id` (TEXT, FK -> CourseOffering.offering_id)
  - `status` (TEXT, enum: `ENROLLED`, `WITHDRAWN`)
  - `updated_at` (TEXT, ISO-8601)
  - `withdrawal_action_id` (TEXT, nullable FK -> ForcedWithdrawalAction.action_id)
- Constraints:
  - Unique active enrollment per (`student_id`, `offering_id`, `status='ENROLLED'`).
- Validation:
  - Forced withdrawal allowed only when current status is `ENROLLED` (FR-003).

## Entity: ScheduleEntry
- Purpose: Timetable rows tied to enrollment and linked components.
- Fields:
  - `schedule_entry_id` (TEXT, PK)
  - `student_id` (TEXT, FK -> Account.account_id)
  - `offering_id` (TEXT, FK -> CourseOffering.offering_id)
  - `component_type` (TEXT, enum: `LECTURE`, `LAB`, `TUTORIAL`, `OTHER`)
  - `status` (TEXT, enum: `ACTIVE`, `REMOVED`)
  - `updated_at` (TEXT, ISO-8601)
- Validation:
  - All entries for withdrawn offering are transitioned to `REMOVED` atomically (FR-008).

## Entity: TranscriptEntry
- Purpose: Official academic record row per offering/student.
- Fields:
  - `transcript_entry_id` (TEXT, PK)
  - `student_id` (TEXT, FK -> Account.account_id)
  - `offering_id` (TEXT, FK -> CourseOffering.offering_id)
  - `notation` (TEXT, e.g., `W`, `WD`)
  - `updated_at` (TEXT, ISO-8601)
- Validation:
  - Notation update follows institutional policy rules on successful force withdrawal (FR-009).

## Entity: FeeLedgerEntry
- Purpose: Student fee/accounting changes due to withdrawal.
- Fields:
  - `fee_ledger_entry_id` (TEXT, PK)
  - `student_id` (TEXT, FK -> Account.account_id)
  - `offering_id` (TEXT, FK -> CourseOffering.offering_id)
  - `amount_delta_cents` (INTEGER)
  - `entry_type` (TEXT, enum: `CHARGE`, `REVERSAL`, `ADJUSTMENT`)
  - `created_at` (TEXT, ISO-8601)
- Validation:
  - Fee policy updates are applied in same transaction as enrollment/schedule/transcript (FR-010, FR-014).

## Entity: ForcedWithdrawalAction
- Purpose: Business transaction record for a force-withdraw operation.
- Fields:
  - `action_id` (TEXT, PK)
  - `student_id` (TEXT, FK -> Account.account_id)
  - `offering_id` (TEXT, FK -> CourseOffering.offering_id)
  - `admin_id` (TEXT, FK -> Account.account_id)
  - `reason` (TEXT, required, min length 1)
  - `status` (TEXT, enum: `PENDING_CONFIRMATION`, `COMPLETED`, `REJECTED_NOT_ENROLLED`, `FAILED`, `PENDING_AUDIT`)
  - `idempotency_key` (TEXT, required)
  - `created_at` (TEXT, ISO-8601)
  - `completed_at` (TEXT, nullable ISO-8601)
- Constraints:
  - Unique (`student_id`, `offering_id`, `idempotency_key`).
- Validation:
  - `reason` required for confirm endpoint (FR-006).

## Entity: AuditEvent
- Purpose: Immutable admin action audit record.
- Fields:
  - `audit_event_id` (TEXT, PK)
  - `action_id` (TEXT, FK -> ForcedWithdrawalAction.action_id)
  - `admin_id` (TEXT, FK -> Account.account_id)
  - `student_id` (TEXT)
  - `offering_id` (TEXT)
  - `action_type` (TEXT, fixed `FORCE_WITHDRAWAL`)
  - `reason_provided` (INTEGER, 0/1)
  - `event_status` (TEXT, enum: `LOGGED`, `PENDING_RETRY`)
  - `occurred_at` (TEXT, ISO-8601)
- Validation:
  - If initial write fails, retry queue entry is required (FR-018/FR-019).

## Entity: PendingAuditQueue
- Purpose: Retry tracking for failed audit writes.
- Fields:
  - `pending_audit_id` (TEXT, PK)
  - `action_id` (TEXT, FK -> ForcedWithdrawalAction.action_id, unique)
  - `next_retry_at` (TEXT, ISO-8601)
  - `retry_count` (INTEGER)
  - `last_error` (TEXT)
  - `status` (TEXT, enum: `PENDING`, `RETRYING`, `RESOLVED`)
- Validation:
  - Created only when withdrawal succeeds but audit logging fails (FR-018).

## Relationships
- `Account (admin)` 1..* `ForcedWithdrawalAction`.
- `Account (student)` 1..* `Enrollment`, `ScheduleEntry`, `TranscriptEntry`, `FeeLedgerEntry`.
- `CourseOffering` 1..* `Enrollment`, `ScheduleEntry`, `TranscriptEntry`, `FeeLedgerEntry`, `ForcedWithdrawalAction`.
- `ForcedWithdrawalAction` 1..0..1 `AuditEvent` and 1..0..1 `PendingAuditQueue`.

## State Transitions

### ForcedWithdrawalAction
- `PENDING_CONFIRMATION` -> `COMPLETED`: all core updates succeed and audit logs successfully.
- `PENDING_CONFIRMATION` -> `PENDING_AUDIT`: core updates succeed, audit write fails, retry queued.
- `PENDING_CONFIRMATION` -> `REJECTED_NOT_ENROLLED`: pre-check fails.
- `PENDING_CONFIRMATION` -> `FAILED`: transactional update fails and rollback completes.

### Enrollment
- `ENROLLED` -> `WITHDRAWN` only once per student/offering for force withdrawal operation.
