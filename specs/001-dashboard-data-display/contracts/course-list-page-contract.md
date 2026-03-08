# Contract: Course List Page Data Display

## Purpose

Define the interface contract for dashboard navigation to the course list page and the resulting rendered behavior for complete, partial, unavailable, and unauthorized outcomes.

## Route Contract

- Method: `GET`
- Path: `/dashboard/course-list`
- Authentication: Required
- Authorization: Existing role/permission rules; no new roles.

## Request Inputs

- Session-derived:
  - `account_id` (required)
  - `role_code` (required)
- Query (optional):
  - `term` (string)

## Response Contract

- Content type: `text/html`
- View template: `views/courses/course-list.ejs`
- Render model fields:
  - `pageTitle` (string)
  - `retrievalStatus` (`complete|partial|none`)
  - `courses` (array of displayable course rows)
  - `missingItems` (array of `{ resourceKey, message }`)
  - `isDenied` (boolean)
  - `userMessage` (string, optional)

## Behavioral Rules

1. Navigation from dashboard opens the route in one action (FR-001).
2. Controller fetches latest available course data each page load (FR-002).
3. Authorization check occurs before rendering each data section (FR-004/FR-005).
4. Partial data must render with explicit missing indicators (FR-006/FR-007).
5. If no requested data is available, render no data rows and show clear unavailable message (FR-008/FR-011).
6. Every request logs summary retrieval status (`complete|partial|none`) in SQLite (FR-010).

## Example Render Outcomes

### Complete

- `retrievalStatus=complete`
- `courses.length > 0`
- `missingItems=[]`
- `userMessage` omitted

### Partial

- `retrievalStatus=partial`
- `courses.length > 0`
- `missingItems.length > 0`
- `userMessage="Some data is currently unavailable."`

### None (Data Unavailable)

- `retrievalStatus=none`
- `courses=[]`
- `missingItems` may include required fields not retrieved
- `userMessage="Course list data is currently unavailable."`

### Unauthorized

- `isDenied=true`
- `courses=[]`
- `retrievalStatus=none`
- `userMessage="You do not have permission to view this page."`

## Validation and Logging Requirements

- Unauthorized attempts must not leak restricted field values.
- Controller writes one `data_view_requests` row per page load attempt.
- `missing_item_count` equals count of `missing` elements for each request.
- Response-time telemetry must support p95 <= 5s checks.

