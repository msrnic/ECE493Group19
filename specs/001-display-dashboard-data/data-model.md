# Phase 1 Data Model: 001-display-dashboard-data

## Entity: Account
- Purpose: Represents authenticated actors and their base identity.
- Fields:
  - `account_id` (INTEGER, PK)
  - `username` (TEXT, unique, required)
  - `email` (TEXT, unique, required)
  - `display_name` (TEXT, required)
  - `role` (TEXT, required; enum: `registered_user`, `student`, `professor`, `admin`)
  - `status` (TEXT, required; enum: `active`, `inactive`, `locked`)
  - `created_at` (DATETIME, required)
  - `updated_at` (DATETIME, required)
- Validation rules:
  - `email` must be valid format.
  - `status` must be `active` to access dashboard pages.

## Entity: Course
- Purpose: Stores course information required by course history/transcript/grade summary pages.
- Fields:
  - `course_id` (INTEGER, PK)
  - `course_code` (TEXT, required)
  - `title` (TEXT, required)
  - `term` (TEXT, required)
  - `section` (TEXT, required)
  - `created_at` (DATETIME, required)
  - `updated_at` (DATETIME, required)
- Validation rules:
  - `course_code + term + section` unique.

## Entity: Enrollment
- Purpose: Links students to courses and stores outcome data for course history/transcript.
- Fields:
  - `enrollment_id` (INTEGER, PK)
  - `account_id` (INTEGER, FK -> Account.account_id, required)
  - `course_id` (INTEGER, FK -> Course.course_id, required)
  - `final_grade` (TEXT, nullable)
  - `credits` (INTEGER, required)
  - `completion_status` (TEXT, required; enum: `in_progress`, `completed`, `withdrawn`)
- Validation rules:
  - Student role required for referenced `account_id`.
  - Grade may be null when course is in progress.

## Entity: TeachingAssignment
- Purpose: Links professors to course offerings used for UC-36 and UC-33 authorization scopes.
- Fields:
  - `assignment_id` (INTEGER, PK)
  - `account_id` (INTEGER, FK -> Account.account_id, required)
  - `course_id` (INTEGER, FK -> Course.course_id, required)
  - `active` (BOOLEAN, required)
- Validation rules:
  - Professor role required for referenced `account_id`.

## Entity: DashboardPage
- Purpose: Defines each in-scope page and its required permission key.
- Fields:
  - `page_id` (TEXT, PK; values: `contact-info`, `course-history`, `transcript`, `student-info`, `grade-summary`)
  - `uc_id` (TEXT, required; enum: `UC-06`, `UC-20`, `UC-21`, `UC-33`, `UC-36`)
  - `title` (TEXT, required)
  - `permission_key` (TEXT, required)

## Entity: DataItemDefinition
- Purpose: Defines each renderable field and role visibility rules per page.
- Fields:
  - `item_id` (INTEGER, PK)
  - `page_id` (TEXT, FK -> DashboardPage.page_id, required)
  - `field_key` (TEXT, required)
  - `label` (TEXT, required)
  - `source_table` (TEXT, required)
  - `source_column` (TEXT, required)
  - `visible_to_roles` (TEXT, required; serialized role set)
  - `required_for_complete` (BOOLEAN, required)
- Validation rules:
  - `page_id + field_key` unique.

## Entity: RetrievalSnapshot
- Purpose: Captures retrieval result status for rendering complete/partial/no-data states.
- Fields:
  - `snapshot_id` (INTEGER, PK)
  - `account_id` (INTEGER, FK -> Account.account_id, required)
  - `page_id` (TEXT, FK -> DashboardPage.page_id, required)
  - `status` (TEXT, required; enum: `complete`, `partial`, `none`, `unauthorized`)
  - `available_count` (INTEGER, required)
  - `missing_count` (INTEGER, required)
  - `generated_at` (DATETIME, required)
- Validation rules:
  - `status = none` implies `available_count = 0`.
  - `status = complete` implies `missing_count = 0`.

## Relationships
- Account 1..* Enrollment
- Course 1..* Enrollment
- Account 1..* TeachingAssignment
- Course 1..* TeachingAssignment
- DashboardPage 1..* DataItemDefinition
- Account 1..* RetrievalSnapshot
- DashboardPage 1..* RetrievalSnapshot

## State Transitions

### Retrieval state machine
1. `requested` -> `unauthorized` when page-level access fails.
2. `requested` -> `none` when query returns zero available items.
3. `requested` -> `partial` when at least one requested item is missing.
4. `requested` -> `complete` when all required visible items are present.

### Account access state constraints
- `inactive` or `locked` accounts cannot transition into any display state other than `unauthorized`.
