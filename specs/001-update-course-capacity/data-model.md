# Data Model: Update Course Capacity

## Entity: Account
- Purpose: Represents authenticated administrative users interacting with capacity updates.
- Fields:
- `account_id` (TEXT, PK)
- `username` (TEXT, unique, required)
- `role` (TEXT, required, expected values include `administrator`)
- `status` (TEXT, required, e.g., `active`/`disabled`)
- `created_at` (DATETIME, required)
- `updated_at` (DATETIME, required)
- Validation Rules:
- `role` must authorize course offering management for this workflow.
- Relationships:
- One `Account` can submit many `CapacityUpdateRequest` records.
- One `Account` can approve many `OverrideAuthorization` records.

## Entity: CourseOffering
- Purpose: Persisted course instance with editable capacity.
- Fields:
- `offering_id` (TEXT, PK)
- `course_code` (TEXT, required)
- `term_code` (TEXT, required)
- `capacity` (INTEGER, required, > 0)
- `current_enrollment` (INTEGER, required, >= 0)
- `remaining_seats` (INTEGER, required, >= 0)
- `version` (INTEGER, required, default 1)
- `updated_at` (DATETIME, required)
- Validation Rules:
- `capacity` must be a positive whole number.
- `remaining_seats` must equal `capacity - current_enrollment` after successful commit.
- `capacity < current_enrollment` requires approved override.
- Relationships:
- One `CourseOffering` can have many `CapacityUpdateRequest` records.

## Entity: CapacityUpdateRequest
- Purpose: Auditable record of each submitted capacity update attempt.
- Fields:
- `request_id` (TEXT, PK)
- `offering_id` (TEXT, FK -> `CourseOffering.offering_id`, required)
- `submitted_by_account_id` (TEXT, FK -> `Account.account_id`, required)
- `submitted_capacity` (INTEGER, required)
- `submitted_version` (INTEGER, required)
- `override_request_id` (TEXT, FK nullable)
- `status` (TEXT, required: `pending`, `applied`, `rejected`, `failed`, `stale`)
- `status_message` (TEXT, required)
- `created_at` (DATETIME, required)
- `resolved_at` (DATETIME, nullable)
- Validation Rules:
- `submitted_capacity` positive integer.
- `submitted_version` must match current offering version for apply path.
- State Transitions:
- `pending -> applied`
- `pending -> rejected`
- `pending -> stale`
- `pending -> failed`

## Entity: OverrideAuthorization
- Purpose: Policy-compliant approval trail when applying below-enrollment capacity.
- Fields:
- `override_request_id` (TEXT, PK)
- `request_id` (TEXT, FK -> `CapacityUpdateRequest.request_id`, required)
- `offering_id` (TEXT, FK -> `CourseOffering.offering_id`, required)
- `requested_by_account_id` (TEXT, FK -> `Account.account_id`, required)
- `approved_by_account_id` (TEXT, FK -> `Account.account_id`, nullable until decision)
- `decision` (TEXT, required: `requested`, `approved`, `denied`)
- `reason` (TEXT, required)
- `allow_self_approval` (BOOLEAN, required)
- `approved_at` (DATETIME, nullable)
- `retention_until` (DATETIME, nullable, set to `approved_at + 7 years` when approved)
- `created_at` (DATETIME, required)
- Validation Rules:
- If `decision = approved`, `approved_by_account_id` and `approved_at` are required.
- If requester equals approver, `allow_self_approval` must be true.
- State Transitions:
- `requested -> approved`
- `requested -> denied`

## Entity: UpdateResult (View Model)
- Purpose: Controller/view output payload for user feedback.
- Fields:
- `result_type` (`success` | `error`)
- `message_code` (`UPDATED` | `VALIDATION_ERROR` | `OVERRIDE_REQUIRED` | `STALE_SUBMISSION` | `UPDATE_FAILED`)
- `capacity` (INTEGER)
- `remaining_seats` (INTEGER)
- `request_id` (TEXT)
- Notes:
- Derived for response/UI rendering; persistent history is represented by `CapacityUpdateRequest`.
