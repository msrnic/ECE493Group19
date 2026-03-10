# Data Model: Student Inbox Notifications

## Overview

This feature extends the SQLite domain model with notification send orchestration while preserving constitution-required persistence of account and course information.

## Entities

### 1) Account (existing, required by constitution)

- Purpose: Represents authenticated users (including administrators and students).
- Key fields:
  - `account_id` (PK, UUID or integer)
  - `role` (`admin|student|...`)
  - `status` (`active|disabled`)
  - `inbox_access_enabled` (boolean)
- Relationships:
  - One-to-many with `send_request` via `sender_account_id` for admin senders.
  - One-to-many with `delivery_attempt` via `recipient_account_id` for student recipients.
- Validation rules:
  - Senders must be active admin accounts.
  - Recipients must be active student accounts.

### 2) Course (existing, required by constitution)

- Purpose: Source of roster targeting for recipient resolution.
- Key fields:
  - `course_id` (PK)
  - `course_code`
  - `term`
  - `status`
- Relationships:
  - Many-to-many with `account` through enrollment tables (existing).
- Validation rules:
  - Only active enrollments resolve as target recipients.

### 3) Recipient Group (existing or new lookup)

- Purpose: Predefined grouping target for admin message sends.
- Key fields:
  - `group_id` (PK)
  - `group_name`
  - `is_active`
- Relationships:
  - Many-to-many with `account` through `group_membership`.
- Validation rules:
  - Group must exist and be active.
  - Resolved group membership may not be empty.

### 4) Notification Message

- Purpose: Canonical message payload authored by administrator.
- Table: `notification_message`
- Key fields:
  - `message_id` (PK)
  - `subject` (TEXT, required, max length from policy settings)
  - `body` (TEXT, required, max length from policy settings)
  - `created_by` (FK -> `account.account_id`)
  - `created_at` (UTC timestamp)
- Relationships:
  - One-to-one or one-to-many with `send_request` (one message per send in this feature).
- Validation rules:
  - Subject and body are non-empty after trim.
  - Length limits enforced server-side.

### 5) Send Request

- Purpose: Single admin action for distribution with aggregate metrics.
- Table: `send_request`
- Key fields:
  - `send_request_id` (PK)
  - `message_id` (FK -> `notification_message.message_id`)
  - `sender_account_id` (FK -> `account.account_id`)
  - `status` (`processing|completed|completed_with_failures|failed`)
  - `total_unique_recipients` (integer)
  - `duplicate_recipients_removed` (integer)
  - `successful_deliveries` (integer)
  - `failed_deliveries` (integer)
  - `sent_at` (UTC timestamp)
  - `retry_expires_at` (UTC timestamp = `sent_at + 24h`)
  - `last_error` (nullable TEXT)
- Relationships:
  - One-to-many with `delivery_attempt`.
- Validation rules:
  - Must have at least one resolved unique recipient.
  - Authorization check must pass for all resolved recipients before insert finalization.

### 6) Delivery Attempt

- Purpose: Per-recipient delivery tracking and retry eligibility.
- Table: `delivery_attempt`
- Key fields:
  - `delivery_attempt_id` (PK)
  - `send_request_id` (FK -> `send_request.send_request_id`)
  - `recipient_account_id` (FK -> `account.account_id`)
  - `attempt_sequence` (integer, starts at 1)
  - `status` (`pending|sent|failed`)
  - `failure_reason` (nullable TEXT)
  - `attempted_at` (UTC timestamp)
  - `delivered_at` (nullable UTC timestamp)
- Relationships:
  - Many-to-one with `send_request`.
  - Many-to-one with `account` as recipient.
- Validation rules:
  - Unique constraint on (`send_request_id`, `recipient_account_id`, `attempt_sequence`).
  - Retry insert allowed only if prior attempt status is `failed` and retry window not expired.

## Derived Views / Read Models

### Send Summary View

- Inputs: `send_request` + latest `delivery_attempt` per recipient.
- Outputs:
  - Total unique recipients
  - Successful/failed counts
  - Duplicate count removed
  - Failed recipient list with reasons
  - Retry eligibility flag (`has_failures && now <= retry_expires_at`)

## State Transitions

### Send Request Lifecycle

- `processing` -> `completed` when all recipient deliveries succeed.
- `processing` -> `completed_with_failures` when at least one recipient fails.
- `processing` -> `failed` when critical failure occurs (e.g., inability to persist delivery status).

### Delivery Attempt Lifecycle

- `pending` -> `sent` on successful inbox persistence.
- `pending` -> `failed` on delivery error.
- `failed` -> new row with incremented `attempt_sequence` on retry.

## Retention Rules

- `delivery_attempt` rows retained for 1 year minimum.
- Scheduled cleanup removes rows older than 1 year (or archives if auditing policy requires external retention).
- `send_request` and `notification_message` retention follows broader auditing policy but must preserve linkage for active retention window.
