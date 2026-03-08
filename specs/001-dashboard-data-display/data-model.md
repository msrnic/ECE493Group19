# Data Model: Dashboard Data Display

## Entity: Account

- Purpose: Represents authenticated users who can access dashboard-linked pages.
- Storage: SQLite table `accounts`.
- Fields:
  - `account_id` (TEXT, PK)
  - `username` (TEXT, UNIQUE, NOT NULL)
  - `display_name` (TEXT, NOT NULL)
  - `role_code` (TEXT, NOT NULL)
  - `status` (TEXT, NOT NULL; `active|inactive`)
  - `created_at` (DATETIME, NOT NULL)
  - `updated_at` (DATETIME, NOT NULL)
- Validation rules:
  - `username` must be non-empty and unique.
  - `role_code` must map to an existing access policy rule.
  - Inactive accounts cannot access the course-list page.

## Entity: Course

- Purpose: Represents course items shown on the in-scope course list page.
- Storage: SQLite table `courses`.
- Fields:
  - `course_id` (TEXT, PK)
  - `course_code` (TEXT, NOT NULL)
  - `course_title` (TEXT, NOT NULL)
  - `term_code` (TEXT, NOT NULL)
  - `capacity` (INTEGER, NULLABLE)
  - `enrolled_count` (INTEGER, NULLABLE)
  - `updated_at` (DATETIME, NOT NULL)
- Validation rules:
  - `course_code`, `course_title`, `term_code` required for displayable records.
  - If `capacity` is present, it must be >= 0.
  - If both `capacity` and `enrolled_count` are present, `enrolled_count` must be >= 0.

## Entity: AccessPolicy

- Purpose: Existing role/permission mapping reused as-is for page and element-level visibility.
- Storage: SQLite table `access_policies`.
- Fields:
  - `policy_id` (TEXT, PK)
  - `role_code` (TEXT, NOT NULL)
  - `resource_key` (TEXT, NOT NULL)  
    Example: `page.course_list`, `field.course.capacity`
  - `can_view` (INTEGER, NOT NULL; 0|1)
- Validation rules:
  - No new role codes introduced in this feature.
  - `(role_code, resource_key)` must be unique.

## Entity: DataViewRequest

- Purpose: Tracks each user request to view the course list page.
- Storage: SQLite table `data_view_requests`.
- Fields:
  - `request_id` (TEXT, PK)
  - `account_id` (TEXT, FK -> `accounts.account_id`, NOT NULL)
  - `target_page` (TEXT, NOT NULL; fixed value `course_list`)
  - `requested_at` (DATETIME, NOT NULL)
  - `completed_at` (DATETIME, NULLABLE)
  - `retrieval_status` (TEXT, NOT NULL; `complete|partial|none`)
  - `missing_item_count` (INTEGER, NOT NULL, default 0)
  - `denied` (INTEGER, NOT NULL; 0|1)
- Validation rules:
  - `target_page` must equal `course_list` for this feature scope.
  - `retrieval_status = none` implies no displayable data rows are returned.
  - `denied = 1` implies no course data included in response payload.

## Entity: DataElementStatus

- Purpose: Records per-field availability for partial-data messaging and diagnostics.
- Storage: SQLite table `data_element_statuses`.
- Fields:
  - `element_status_id` (TEXT, PK)
  - `request_id` (TEXT, FK -> `data_view_requests.request_id`, NOT NULL)
  - `resource_key` (TEXT, NOT NULL)
  - `state` (TEXT, NOT NULL; `available|missing|restricted`)
  - `message` (TEXT, NULLABLE)
- Validation rules:
  - `state=missing` must include a user-displayable message.
  - `state=restricted` must not include protected value content.

## Relationships

- `Account 1 -> many DataViewRequest`
- `DataViewRequest 1 -> many DataElementStatus`
- `Account role_code many -> many AccessPolicy.resource_key` (logical mapping)
- `Course` records are filtered by `AccessPolicy` before rendering.

## Retrieval Status State Transitions

- `requested` -> `complete` when all required data elements are available and authorized.
- `requested` -> `partial` when at least one required element is missing but at least one data element is displayable.
- `requested` -> `none` when no data is displayable (all sources unavailable or full access denial).

