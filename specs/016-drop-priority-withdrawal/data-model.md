# Data Model: UC-16 Drop Priority Over Withdrawal

## Student

- **Purpose**: Represents the authenticated student performing class removal.
- **Key fields**:
  - `student_id`: unique identifier
  - `account_status`: indicates whether self-service actions are allowed
  - `name`: display name used in confirmation views
- **Relationships**:
  - One student can have many enrollment records.

## Course Offering

- **Purpose**: Represents a specific class instance in a term.
- **Key fields**:
  - `offering_id`: unique identifier
  - `course_code`: catalog reference
  - `term_id`: academic term association
  - `section_status`: availability or administrative status
- **Relationships**:
  - One course offering can have many enrollment records.
  - One course offering belongs to one academic term.

## Enrollment Record

- **Purpose**: Represents a student's current registration state in a course offering.
- **Key fields**:
  - `enrollment_id`: unique identifier
  - `student_id`: references Student
  - `offering_id`: references Course Offering
  - `removal_status`: `active`, `dropped`, or `withdrawn`
  - `status_changed_at`: timestamp of the most recent removal-state change
- **Validation rules**:
  - Only `active` enrollments are eligible for a removal request.
  - An enrollment cannot be both dropped and withdrawn.
- **Relationships**:
  - Many enrollment records belong to one student.
  - Many enrollment records belong to one course offering.
- **State transitions**:
  - `active -> dropped` when request occurs before the deadline
  - `active -> withdrawn` when request occurs at or after the deadline
  - `active -> active` when policy lookup fails or update fails

## Deadline Policy

- **Purpose**: Defines the term-level rule that determines whether a removal is treated as a drop or withdrawal.
- **Key fields**:
  - `policy_id`: unique identifier
  - `term_id`: associated academic term
  - `drop_deadline_at`: authoritative timestamp for drop eligibility
  - `policy_status`: indicates whether policy data is valid and usable
- **Validation rules**:
  - Each term used for self-service removal must have at most one active deadline policy.
  - Requests submitted exactly at `drop_deadline_at` are classified as withdrawal.
- **Relationships**:
  - One deadline policy governs many course offerings in the same term.

## Removal Decision

- **Purpose**: Captures the evaluated result of a removal request before persistence.
- **Key fields**:
  - `decision_type`: `drop`, `withdrawal`, or `blocked`
  - `decision_reason`: deadline rule, policy lookup failure, or ineligible enrollment
  - `evaluated_at`: timestamp of decision
- **Validation rules**:
  - `blocked` must be used when policy data cannot be determined.
  - `drop` must take precedence whenever the request is before the deadline.

## Fee Outcome

- **Purpose**: Records the financial effect associated with a successful class removal or confirms no change on failure.
- **Key fields**:
  - `fee_outcome_id`: unique identifier
  - `enrollment_id`: references Enrollment Record
  - `outcome_type`: `drop_adjustment`, `withdrawal_adjustment`, or `no_change`
  - `effective_at`: timestamp of fee outcome
  - `summary_message`: user-facing fee explanation
- **Validation rules**:
  - `no_change` must be preserved when the removal request is blocked or update processing fails.
  - Fee outcome must match the persisted removal status when removal succeeds.
- **Relationships**:
  - One enrollment record has zero or more fee outcomes over its lifecycle, but only one current outcome after a completed removal action.
