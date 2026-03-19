# Data Model: Role-Based Dashboard Access

## Entity: Account
- Purpose: Represents authenticated actors and core account state.
- Fields:
  - `account_id` (INTEGER, PK)
  - `username` (TEXT, unique, required)
  - `password_hash` (TEXT, required)
  - `status` (TEXT, required; enum: `active`, `locked`, `disabled`)
  - `created_at` (TEXT datetime, required)
  - `updated_at` (TEXT datetime, required)
- Validation rules:
  - `username` must be non-empty and unique.
  - `status` must be one of allowed enum values.

## Entity: Course
- Purpose: Persistent course information required by constitution.
- Fields:
  - `course_id` (INTEGER, PK)
  - `course_code` (TEXT, unique, required)
  - `title` (TEXT, required)
  - `term` (TEXT, required)
  - `status` (TEXT, required; enum: `open`, `closed`, `archived`)
  - `created_at` (TEXT datetime, required)
  - `updated_at` (TEXT datetime, required)
- Validation rules:
  - `course_code` must follow institutional pattern (non-empty, uppercase code string).
  - `title` must be non-empty.

## Entity: Role
- Purpose: Security role assigned to accounts.
- Fields:
  - `role_id` (INTEGER, PK)
  - `role_code` (TEXT, unique, required)
  - `display_name` (TEXT, required)
  - `is_active` (INTEGER boolean, required; 0/1)

## Entity: RoleAssignment
- Purpose: Join table mapping account-role membership.
- Fields:
  - `role_assignment_id` (INTEGER, PK)
  - `account_id` (INTEGER, FK -> `accounts.account_id`, required)
  - `role_id` (INTEGER, FK -> `roles.role_id`, required)
  - `is_active` (INTEGER boolean, required; 0/1)
  - `assigned_at` (TEXT datetime, required)
- Validation rules:
  - (`account_id`, `role_id`) must be unique for active assignments.

## Entity: Module
- Purpose: Dashboard feature module available to one or more roles.
- Fields:
  - `module_id` (INTEGER, PK)
  - `module_key` (TEXT, unique, required)
  - `display_name` (TEXT, required)
  - `route_path` (TEXT, required)
  - `is_enabled` (INTEGER boolean, required; 0/1)

## Entity: RoleModule
- Purpose: Join table defining module permissions by role.
- Fields:
  - `role_module_id` (INTEGER, PK)
  - `role_id` (INTEGER, FK -> `roles.role_id`, required)
  - `module_id` (INTEGER, FK -> `modules.module_id`, required)
  - `is_active` (INTEGER boolean, required; 0/1)
- Validation rules:
  - (`role_id`, `module_id`) must be unique for active mappings.

## Entity: DashboardSection
- Purpose: Configurable dashboard sections linked to modules and rendered independently.
- Fields:
  - `section_id` (INTEGER, PK)
  - `module_id` (INTEGER, FK -> `modules.module_id`, required)
  - `section_key` (TEXT, unique, required)
  - `section_title` (TEXT, required)
  - `sort_order` (INTEGER, required)
  - `is_enabled` (INTEGER boolean, required; 0/1)

## Entity: DashboardSectionState
- Purpose: Per-account latest section availability state.
- Fields:
  - `section_state_id` (INTEGER, PK)
  - `account_id` (INTEGER, FK -> `accounts.account_id`, required)
  - `section_id` (INTEGER, FK -> `dashboard_sections.section_id`, required)
  - `availability_status` (TEXT, required; enum: `available`, `unavailable`)
  - `status_reason` (TEXT, nullable)
  - `last_attempt_at` (TEXT datetime, required)
  - `last_success_at` (TEXT datetime, nullable)
- Validation rules:
  - (`account_id`, `section_id`) unique.
  - `status_reason` required when `availability_status = unavailable`.

## Entity: DashboardLoadEvent
- Purpose: Operational monitoring log for FR-012.
- Fields:
  - `dashboard_load_event_id` (INTEGER, PK)
  - `account_id` (INTEGER, FK -> `accounts.account_id`, required)
  - `request_type` (TEXT, required; enum: `initial_load`, `retry`)
  - `outcome` (TEXT, required; enum: `success`, `partial`, `failure`, `auth_error`)
  - `attempted_sections` (INTEGER, required)
  - `successful_sections` (INTEGER, required)
  - `failed_sections` (INTEGER, required)
  - `occurred_at` (TEXT datetime, required)

## Relationships
- `Account` 1..* `RoleAssignment` *..1 `Role`
- `Role` 1..* `RoleModule` *..1 `Module`
- `Module` 1..* `DashboardSection`
- `Account` 1..* `DashboardSectionState` *..1 `DashboardSection`
- `Account` 1..* `DashboardLoadEvent`
- `Course` remains persistent core domain entity (independent of dashboard rendering but required by constitution)

## State Transitions
- Dashboard section state:
  - `unavailable` -> `available` on successful section load/retry.
  - `available` -> `unavailable` on section load/retry failure.
- Dashboard request outcome:
  - `success`: all attempted sections loaded.
  - `partial`: at least one section loaded and at least one failed.
  - `failure`: no section loaded.
  - `auth_error`: session invalid/expired before completion.
