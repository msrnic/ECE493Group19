# Data Model: Financial Information Dashboard

## Entity: StudentAccount
- Purpose: Authenticated student identity and authorization context used to
  determine dashboard visibility.
- Fields:
  - `student_id` (TEXT, PK): Canonical unique student identifier.
  - `account_status` (TEXT): `active | locked | disabled`.
  - `primary_role` (TEXT): Primary role label (expected `student` here).
  - `created_at` (DATETIME): Account creation timestamp.
  - `updated_at` (DATETIME): Last account update timestamp.
- Validation rules:
  - `student_id` must be non-empty and unique.
  - `account_status` must be one of allowed states.

## Entity: ModuleAssignment
- Purpose: Maps each student to permitted dashboard modules.
- Fields:
  - `assignment_id` (INTEGER, PK AUTOINCREMENT)
  - `student_id` (TEXT, FK -> StudentAccount.student_id)
  - `module_code` (TEXT): Canonical module key (e.g., `financial_summary`).
  - `is_enabled` (INTEGER/BOOLEAN): 1 if visible/permitted.
  - `assigned_at` (DATETIME)
- Validation rules:
  - Unique constraint on (`student_id`, `module_code`).
  - `module_code` must reference a valid DashboardModule entry.

## Entity: DashboardModule
- Purpose: Defines available dashboard sections and navigation metadata.
- Fields:
  - `module_code` (TEXT, PK)
  - `display_name` (TEXT)
  - `nav_path` (TEXT): Navigation target route/path.
  - `category` (TEXT): `financial | enrollment | grades | notifications`.
  - `is_financial_priority` (INTEGER/BOOLEAN): 1 for top-priority dashboard area.
- Validation rules:
  - `display_name` and `nav_path` are required.
  - `category` must be from allowed set.

## Entity: FinancialSummarySnapshot
- Purpose: Stores last confirmed financial values used for live or stale display.
- Fields:
  - `snapshot_id` (INTEGER, PK AUTOINCREMENT)
  - `student_id` (TEXT, FK -> StudentAccount.student_id)
  - `balance_due` (DECIMAL)
  - `outstanding_fees` (DECIMAL)
  - `payment_status` (TEXT): `current | overdue | pending_confirmation`.
  - `last_confirmed_at` (DATETIME): Timestamp shown in UI for stale values.
  - `source_state` (TEXT): `live | stale`.
- Validation rules:
  - Monetary fields must be non-negative.
  - `source_state` must match the rendered availability behavior.

## Entity: ModuleAvailability
- Purpose: Tracks runtime availability of each module per dashboard render.
- Fields:
  - `availability_id` (INTEGER, PK AUTOINCREMENT)
  - `student_id` (TEXT, FK -> StudentAccount.student_id)
  - `module_code` (TEXT, FK -> DashboardModule.module_code)
  - `availability_state` (TEXT): `available | unavailable | unassigned`.
  - `reason_code` (TEXT, nullable): `timeout | dependency_error | no_assignment`.
  - `observed_at` (DATETIME)
- Validation rules:
  - `availability_state` required.
  - `reason_code` required when `availability_state = unavailable`.

## Relationships
- StudentAccount 1..* ModuleAssignment
- StudentAccount 1..* FinancialSummarySnapshot
- StudentAccount 1..* ModuleAvailability
- DashboardModule 1..* ModuleAssignment
- DashboardModule 1..* ModuleAvailability

## State Transitions
- Module availability:
  - `available -> unavailable` when source dependency fails.
  - `unavailable -> available` after dependency recovery and successful refresh.
  - `unassigned` remains until role/module assignment is updated.
- Financial summary source state:
  - `live -> stale` when live retrieval fails but snapshot exists.
  - `stale -> live` once fresh financial values are successfully retrieved.

## Data Volume and Scale Assumptions
- Supports thousands of student accounts with daily dashboard access.
- Each dashboard load may record per-module availability state.
- Snapshot retention policy can be bounded operationally (e.g., keep latest N
  snapshots per student) in later implementation planning.
