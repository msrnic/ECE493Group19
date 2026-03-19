# Quickstart: Student Inbox Notifications

## Purpose

Implement and validate UC-42 (`Send notifications to students' inboxes`) using HTML/CSS/JavaScript + SQLite in MVC architecture.

## Preconditions

- You are on branch `042-student-inbox-notifications`.
- SQLite schema includes constitution-required account/course tables.
- You have seeded data for:
  - one admin account with notification permission,
  - at least three student accounts,
  - one course roster and one predefined group.

## Implementation Steps

1. Add SQLite migrations for:
   - `notification_message`
   - `send_request`
   - `delivery_attempt`
   - any required group membership lookup tables (if missing)
2. Create MVC backend components:
   - models for send request/message/delivery attempt
   - services for recipient resolution, validation/authorization, delivery, retry
   - controller + routes for preview/send/summary/retry
3. Create admin notifications view:
   - HTML compose form for recipient targeting + subject + body
   - CSS style following `Style Guides/google-style-guide-html-css.md`
   - JavaScript form behavior and async summary updates following `Style Guides/google-style-guide-javascript.md`
4. Implement retry rule:
   - retry only failed recipients
   - reject retry after 24 hours
5. Implement retention maintenance for delivery logs older than 1 year.

## Contract Validation

1. Ensure implementation matches `contracts/openapi.yaml` endpoints.
2. Add contract tests for:
   - `POST /api/admin/notifications/preview-recipients`
   - `POST /api/admin/notifications/send`
   - `GET /api/admin/notifications/send-requests/{sendRequestId}`
   - `POST /api/admin/notifications/send-requests/{sendRequestId}/retry`

## Scenario Validation (UC-42-AS Alignment)

1. Main success flow:
   - send to valid recipients
   - verify inbox delivery and per-recipient logs
2. Invalid/empty recipient flow:
   - attempt send with empty selection
   - attempt send with invalid group/roster
   - verify block and corrective feedback
3. Partial failure + retry flow:
   - force one recipient delivery failure
   - verify partial success summary and failed-recipient list
   - retry and verify only failed recipient is retried
4. Retry expiry flow:
   - set time beyond 24h window
   - verify retry is rejected with explicit message

## Constitution Compliance Checklist

- Stack remains HTML/CSS/JavaScript + SQLite.
- MVC ownership documented in code modules.
- Account/course data remains persisted in SQLite.
- No edits to `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md`.
- HTML/CSS and JavaScript style-guide compliance checks are run before merge.
