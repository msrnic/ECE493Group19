# Data Model: Student Course Enrollment

## Overview

This model supports UC-17 enrollment behavior with atomic writes and full blocking-reason reporting.

## Entities

### StudentAccount
- Description: Authenticated student profile and academic status.
- Fields:
  - `student_id` (TEXT, PK)
  - `email` (TEXT, UNIQUE, required)
  - `first_name` (TEXT, required)
  - `last_name` (TEXT, required)
  - `status` (TEXT, required; enum: `ACTIVE`, `INACTIVE`)
  - `program_code` (TEXT, required)
  - `created_at` (DATETIME, required)
  - `updated_at` (DATETIME, required)
- Validation:
  - `email` must match valid address format.
  - `status` must be `ACTIVE` for enrollment attempts.

### RegistrationHold
- Description: Blocking holds attached to student accounts.
- Fields:
  - `hold_id` (TEXT, PK)
  - `student_id` (TEXT, FK -> StudentAccount.student_id)
  - `hold_type` (TEXT, required; enum: `FINANCIAL`, `ACADEMIC`, `ADMINISTRATIVE`)
  - `reason` (TEXT, required)
  - `is_active` (INTEGER, required; 0/1)
  - `created_at` (DATETIME, required)
  - `released_at` (DATETIME, nullable)
- Validation:
  - Enrollment blocking considers only `is_active = 1`.

### Course
- Description: Catalog-level course metadata.
- Fields:
  - `course_id` (TEXT, PK)
  - `subject_code` (TEXT, required)
  - `course_number` (TEXT, required)
  - `title` (TEXT, required)
  - `credit_hours` (INTEGER, required)

### ClassOffering
- Description: Term-specific offering of a course.
- Fields:
  - `offering_id` (TEXT, PK)
  - `course_id` (TEXT, FK -> Course.course_id)
  - `term_code` (TEXT, required)
  - `section_code` (TEXT, required)
  - `capacity` (INTEGER, required, >= 0)
  - `enrolled_count` (INTEGER, required, >= 0)
  - `schedule_json` (TEXT, required; serialized meeting pattern)
  - `enrollment_open` (INTEGER, required; 0/1)
- Validation:
  - `enrolled_count <= capacity`
  - `remaining_seats = capacity - enrolled_count`

### PrerequisiteRule
- Description: Prerequisite requirements for a course/offering.
- Fields:
  - `rule_id` (TEXT, PK)
  - `course_id` (TEXT, FK -> Course.course_id)
  - `rule_expression` (TEXT, required)
  - `effective_term` (TEXT, required)

### CompletedCourse
- Description: Student completed coursework used in prerequisite checks.
- Fields:
  - `student_id` (TEXT, FK -> StudentAccount.student_id)
  - `course_id` (TEXT, FK -> Course.course_id)
  - `grade` (TEXT, required)
  - `completed_term` (TEXT, required)
- Composite PK: (`student_id`, `course_id`)

### Enrollment
- Description: Confirmed active enrollment linking student to offering.
- Fields:
  - `enrollment_id` (TEXT, PK)
  - `student_id` (TEXT, FK -> StudentAccount.student_id)
  - `offering_id` (TEXT, FK -> ClassOffering.offering_id)
  - `status` (TEXT, required; enum: `ENROLLED`, `DROPPED`)
  - `enrolled_at` (DATETIME, required)
  - `dropped_at` (DATETIME, nullable)
- Validation:
  - Unique active enrollment per (`student_id`, `offering_id`) where `status = ENROLLED`.

### EnrollmentAttempt
- Description: Audit trail for each self-service enrollment submission.
- Fields:
  - `attempt_id` (TEXT, PK)
  - `student_id` (TEXT, required)
  - `offering_id` (TEXT, required)
  - `outcome` (TEXT, required; enum: `SUCCESS`, `BLOCKED`, `ERROR`)
  - `blocking_reasons_json` (TEXT, nullable)
  - `error_code` (TEXT, nullable)
  - `submitted_at` (DATETIME, required)
  - `completed_at` (DATETIME, required)

### FeeAssessment
- Description: Student term-level fee state surfaced after enrollment.
- Fields:
  - `assessment_id` (TEXT, PK)
  - `student_id` (TEXT, FK -> StudentAccount.student_id)
  - `term_code` (TEXT, required)
  - `total_amount` (NUMERIC, required)
  - `currency` (TEXT, required; default `CAD`)
  - `last_updated_at` (DATETIME, required)
  - `status` (TEXT, required; enum: `CURRENT`, `PENDING_REFRESH`)

## Relationships

- StudentAccount 1..* RegistrationHold
- StudentAccount 1..* CompletedCourse
- StudentAccount 1..* Enrollment
- Course 1..* ClassOffering
- Course 1..* PrerequisiteRule
- ClassOffering 1..* Enrollment
- StudentAccount 1..* EnrollmentAttempt
- StudentAccount 1..* FeeAssessment

## Enrollment State Transitions

1. `REQUESTED` (transient in controller/service)
2. `ELIGIBILITY_EVALUATED`
3. Transition:
   - To `BLOCKED` if one or more blocking reasons exist
   - To `ENROLLED` if all checks pass and transaction commits
   - To `ERROR` if persistence/processing fails and transaction rolls back

Invariant: Student schedule and enrollment rows change only on committed `ENROLLED` transition.
