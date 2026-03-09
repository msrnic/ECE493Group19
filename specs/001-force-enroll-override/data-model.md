# Data Model: Force Enroll Override

## Entity: Account
- Purpose: Represents authenticated user accounts, including administrators.
- Fields:
  - `account_id` (INTEGER, PK)
  - `email` (TEXT, unique, required)
  - `role` (TEXT, required, values: `ADMIN`, `STUDENT`, `PROFESSOR`)
  - `status` (TEXT, required, values: `ACTIVE`, `LOCKED`)
  - `created_at` (TEXT ISO-8601, required)
- Validation:
  - `role` and `status` constrained by CHECK clauses.
- Relationships:
  - One Account may create many `ForceEnrollRequest` and `OverrideAuditEntry` records.

## Entity: Student
- Purpose: Student profile targeted by force enroll.
- Fields:
  - `student_id` (INTEGER, PK)
  - `account_id` (INTEGER, FK -> Account.account_id, required)
  - `student_number` (TEXT, unique, required)
  - `academic_status` (TEXT, required, values: `GOOD_STANDING`, `SUSPENDED`, `INACTIVE`)
  - `active_term_id` (TEXT, required)
- Validation:
  - Must exist and be eligible for enrollment hard constraints.
- Relationships:
  - One Student has many `Enrollment` and `ScheduleEntry` records.

## Entity: CourseOffering
- Purpose: Term-specific class offering receiving enrollment.
- Fields:
  - `offering_id` (INTEGER, PK)
  - `course_code` (TEXT, required)
  - `term_id` (TEXT, required)
  - `capacity_limit` (INTEGER, required, >= 0)
  - `enrolled_count` (INTEGER, required, >= 0)
  - `status` (TEXT, required, values: `OPEN`, `CLOSED`, `CANCELLED`)
- Validation:
  - Offering must exist and be valid/open for term-based hard constraints.
- Relationships:
  - One CourseOffering has many `Enrollment` records.

## Entity: Enrollment
- Purpose: Connects a student with an offering.
- Fields:
  - `enrollment_id` (INTEGER, PK)
  - `student_id` (INTEGER, FK -> Student.student_id, required)
  - `offering_id` (INTEGER, FK -> CourseOffering.offering_id, required)
  - `source` (TEXT, required, values: `STANDARD`, `FORCE_OVERRIDE`)
  - `created_by_account_id` (INTEGER, FK -> Account.account_id, required)
  - `created_at` (TEXT ISO-8601, required)
- Validation:
  - Unique constraint on (`student_id`, `offering_id`) to prevent duplicates.
- Relationships:
  - One Enrollment has one corresponding `ScheduleEntry` update.

## Entity: ScheduleEntry
- Purpose: Student schedule projection for enrolled offerings.
- Fields:
  - `schedule_entry_id` (INTEGER, PK)
  - `student_id` (INTEGER, FK -> Student.student_id, required)
  - `offering_id` (INTEGER, FK -> CourseOffering.offering_id, required)
  - `status` (TEXT, required, values: `ENROLLED`)
  - `updated_at` (TEXT ISO-8601, required)
- Validation:
  - Must be created/updated atomically with `Enrollment`.

## Entity: ForceEnrollRequest
- Purpose: Tracks force-enroll submission lifecycle, especially over-capacity confirmation.
- Fields:
  - `request_id` (TEXT, PK UUID)
  - `initiated_by_account_id` (INTEGER, FK -> Account.account_id, required)
  - `student_id` (INTEGER, FK -> Student.student_id, required)
  - `offering_id` (INTEGER, FK -> CourseOffering.offering_id, required)
  - `reason` (TEXT, required, 10-500 chars after trim)
  - `status` (TEXT, required, values: `PENDING_CONFIRMATION`, `COMPLETED`, `REJECTED`)
  - `requires_over_capacity_confirmation` (INTEGER boolean, required)
  - `created_at` (TEXT ISO-8601, required)
  - `resolved_at` (TEXT ISO-8601, nullable)
  - `rejection_reason` (TEXT, nullable)
- Validation:
  - `PENDING_CONFIRMATION` only when offering is at/over capacity and hard constraints pass.
  - Confirmation endpoint must authenticate same `initiated_by_account_id`.

## Entity: OverrideAuditEntry
- Purpose: Immutable log of successful force-enroll overrides.
- Fields:
  - `audit_id` (INTEGER, PK)
  - `request_id` (TEXT, FK -> ForceEnrollRequest.request_id, required)
  - `admin_account_id` (INTEGER, FK -> Account.account_id, required)
  - `student_id` (INTEGER, FK -> Student.student_id, required)
  - `offering_id` (INTEGER, FK -> CourseOffering.offering_id, required)
  - `reason` (TEXT, required)
  - `prerequisite_override` (INTEGER boolean, required, always true)
  - `over_capacity_override` (INTEGER boolean, required)
  - `created_at` (TEXT ISO-8601, required)
- Validation:
  - Insert-only table; no update/delete path in application services.

## Key Relationships
- `Account (ADMIN) 1 -> * ForceEnrollRequest`
- `Student 1 -> * Enrollment`
- `CourseOffering 1 -> * Enrollment`
- `Enrollment 1 <-> 1 ScheduleEntry` for this workflow
- `ForceEnrollRequest 1 -> 0..1 OverrideAuditEntry` (created on success only)

## State Transitions
- `ForceEnrollRequest`:
  - `PENDING_CONFIRMATION` -> `COMPLETED` (same admin confirms over-capacity)
  - `PENDING_CONFIRMATION` -> `REJECTED` (cancel/timeout/invalid confirmation)
  - Direct `COMPLETED` for non-over-capacity success path
  - Direct `REJECTED` for hard-constraint failures or missing reason/entities
