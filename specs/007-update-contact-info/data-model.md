# Data Model — 007-update-contact-info

## Overview

The feature persists user-editable basic and emergency contact information for authenticated users. Storage is SQLite and remains aligned with required account/course persistence boundaries.

## Entities

### 1) Account

- Purpose: Authenticated identity owning contact information.
- Table: `accounts`
- Key fields:
  - `account_id` (INTEGER, PK)
  - `email_login` (TEXT, unique)
  - `status` (TEXT)
  - `created_at` (TEXT datetime)
  - `updated_at` (TEXT datetime)
- Relationships:
  - 1:1 with `contact_profiles` (`contact_profiles.account_id` unique FK)
  - 1:N with `courses` enrollment/ownership relations (existing project boundary)

### 2) Course

- Purpose: Maintained persistent boundary required by constitution; not directly edited by this feature.
- Table: `courses`
- Key fields:
  - `course_id` (INTEGER, PK)
  - `course_code` (TEXT)
  - `course_name` (TEXT)
  - `term` (TEXT)
- Relationships:
  - N:M with `accounts` through existing enrollment mapping

### 3) ContactProfile

- Purpose: Basic contact information for an account.
- Table: `contact_profiles`
- Key fields:
  - `contact_profile_id` (INTEGER, PK)
  - `account_id` (INTEGER, unique FK -> accounts.account_id)
  - `email` (TEXT)
  - `phone` (TEXT)
  - `address_line1` (TEXT)
  - `address_line2` (TEXT, nullable)
  - `city` (TEXT)
  - `region` (TEXT)
  - `postal_code` (TEXT)
  - `country` (TEXT)
  - `version` (INTEGER, default 1)
  - `updated_at` (TEXT datetime)
  - `updated_by_account_id` (INTEGER FK -> accounts.account_id)
- Validation rules:
  - `email` must match approved email format.
  - `phone` must match approved phone format.
  - Address fields required by policy must be non-empty after trim.

### 4) EmergencyContact

- Purpose: Emergency contact information associated with one account.
- Table: `emergency_contacts`
- Key fields:
  - `emergency_contact_id` (INTEGER, PK)
  - `account_id` (INTEGER, unique FK -> accounts.account_id)
  - `full_name` (TEXT)
  - `relationship` (TEXT)
  - `phone` (TEXT)
  - `email` (TEXT, nullable)
  - `address_line1` (TEXT, nullable)
  - `address_line2` (TEXT, nullable)
  - `city` (TEXT, nullable)
  - `region` (TEXT, nullable)
  - `postal_code` (TEXT, nullable)
  - `country` (TEXT, nullable)
  - `updated_at` (TEXT datetime)
- Validation rules:
  - `phone` must match approved phone format.
  - `email` must match approved email format when present.
  - Address fields must pass approved format rules when provided.

### 5) ContactUpdateEvent

- Purpose: Optional audit/conflict metadata for save outcome and conflict notices.
- Table: `contact_update_events`
- Key fields:
  - `event_id` (INTEGER, PK)
  - `account_id` (INTEGER FK -> accounts.account_id)
  - `submitted_version` (INTEGER)
  - `stored_version_before` (INTEGER)
  - `stored_version_after` (INTEGER)
  - `conflict_detected` (INTEGER boolean 0/1)
  - `save_status` (TEXT: success|failed_validation|failed_persistence)
  - `created_at` (TEXT datetime)

## Relationships Summary

- `accounts` 1:1 `contact_profiles`
- `accounts` 1:1 `emergency_contacts`
- `accounts` 1:N `contact_update_events`
- `accounts` and `courses` remain persisted in SQLite per constitution requirement

## State Transitions

1. `Loaded` -> `Editing`: User opens contact page with current profile/emergency values.
2. `Editing` -> `ValidationFailed`: Submitted data fails format rules; no DB change.
3. `Editing` -> `SaveFailed`: Persistence/transaction error; no DB change.
4. `Editing` -> `Saved`: Transaction commits both profile and emergency changes.
5. `Saved` -> `SavedWithConflictNotice`: Save succeeded and concurrent change was detected; last-write-wins notice shown.
6. `Editing` -> `Canceled`: User cancels/navigates away; unsaved data discarded.

## Transaction Rules

- All editable basic + emergency fields are persisted in one atomic SQLite transaction.
- Any validation failure or SQL failure triggers rollback.
- Successful commit increments `contact_profiles.version` and updates `updated_at`.
