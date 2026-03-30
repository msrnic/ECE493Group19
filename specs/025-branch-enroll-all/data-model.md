# Data Model: UC-25 Enroll in All Courses from a Chosen Schedule Option

## SelectedScheduleOption

Description: One student-selected schedule option containing the exact sections targeted by Enroll All.

Fields:
- `schedule_option_id`: unique identifier
- `student_account_id`: foreign key to the owning student account
- `term_code`: academic term identifier
- `selected_section_ids`: ordered list of selected section identifiers
- `generated_at`: timestamp of schedule generation
- `selection_status`: enum (`ready`, `stale`, `invalid`)

Relationships:
- One `SelectedScheduleOption` belongs to one student account.
- One `SelectedScheduleOption` can produce one or more `EnrollmentBatchRequest` records over time.

Validation rules:
- Must belong to the authenticated student who submits Enroll All.
- Must contain concrete section selections, not abstract course placeholders.
- Must reference a term with an open enrollment window.

## EnrollmentBatchRequest

Description: One Enroll All submission for a selected schedule option under a single active enrollment policy.

Fields:
- `batch_request_id`: unique identifier
- `schedule_option_id`: foreign key to `SelectedScheduleOption`
- `student_account_id`: foreign key to the authenticated student account
- `policy_mode`: enum (`partial_success`, `atomic`)
- `submitted_at`: request timestamp
- `batch_state`: enum (`submitted`, `completed`, `partial`, `cancelled`, `failed`)

Relationships:
- One `EnrollmentBatchRequest` belongs to one `SelectedScheduleOption`.
- One `EnrollmentBatchRequest` has many `SectionEnrollmentOutcome` records.
- One `EnrollmentBatchRequest` produces one `BatchEnrollmentSummary`.

Validation rules:
- `policy_mode = atomic` applies only when atomic enrollment policy is explicitly enabled.
- `batch_state = cancelled` requires at least one failing section under atomic policy.
- `batch_state = failed` requires system-error or unrecoverable consistency-preservation handling.

## SectionEnrollmentOutcome

Description: The result for one section attempted or evaluated within a batch enrollment request.

Fields:
- `section_outcome_id`: unique identifier
- `batch_request_id`: foreign key to `EnrollmentBatchRequest`
- `section_id`: section identifier
- `component_type`: enum (`lecture`, `lab`, `tutorial`, `seminar`, `other`)
- `outcome_status`: enum (`enrolled`, `rejected`, `blocked`, `cancelled`)
- `outcome_reason`: user-visible reason code or message

Relationships:
- Many `SectionEnrollmentOutcome` records belong to one `EnrollmentBatchRequest`.

Validation rules:
- Every targeted section in the selected schedule option must have one outcome.
- `outcome_status = cancelled` is used when atomic policy cancels the full batch.
- `outcome_status = rejected` or `blocked` requires an explicit reason.

## BatchEnrollmentSummary

Description: The final user-visible summary for one Enroll All request.

Fields:
- `batch_request_id`: foreign key to `EnrollmentBatchRequest`
- `summary_state`: enum (`success`, `partial_success`, `atomic_cancelled`, `failure`)
- `enrolled_count`: integer
- `failed_count`: integer
- `cancelled_count`: integer
- `primary_message`: user-visible summary message
- `consistency_preserved`: boolean

Relationships:
- One `BatchEnrollmentSummary` belongs to one `EnrollmentBatchRequest`.

Validation rules:
- `summary_state = success` requires all targeted sections to be enrolled.
- `summary_state = partial_success` requires at least one enrolled section and at least one rejected or blocked section.
- `summary_state = atomic_cancelled` requires zero enrolled sections and atomic policy enabled.
- `consistency_preserved` must be true for all final states returned to the student.
