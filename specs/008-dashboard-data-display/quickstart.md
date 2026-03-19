# Quickstart: Dashboard Data Display

## 1. Scope and Traceability Setup

1. Confirm feature scope is limited to dashboard-linked course list page only.
2. Confirm traceability links:
   - `Use Cases/UC-08.md` <-> `Acceptance Tests/UC-08-AS.md`
   - `Use Cases/UC-20.md` <-> `Acceptance Tests/UC-20-AS.md` (authorization-denied behavior)
3. Confirm no edits are made to protected use-case/acceptance files.

## 2. MVC Implementation Steps

1. Add route `GET /dashboard/course-list` in `src/routes/courseListRoutes.js`.
2. Implement controller in `src/controllers/courseListController.js`:
   - Read authenticated account context.
   - Enforce existing access policy.
   - Retrieve latest course data from model layer.
   - Compute `complete|partial|none` status.
   - Persist request outcome in SQLite.
3. Implement model queries in:
   - `src/models/accountModel.js`
   - `src/models/courseModel.js`
   - `src/models/retrievalStatusModel.js`
4. Render view `src/views/courses/course-list.ejs` with compliant HTML/CSS formatting and explicit unavailable indicators.

## 3. SQLite Schema Requirements

1. Ensure persistent tables exist for:
   - Accounts
   - Courses
   - Access policies
   - Data-view requests
   - Data-element statuses
2. Add indexes on:
   - `data_view_requests(requested_at)`
   - `data_view_requests(account_id, target_page)`
   - `access_policies(role_code, resource_key)`

## 4. Validation Checklist

1. Main success:
   - Authorized user navigates from dashboard and sees course list data.
2. Partial data:
   - Available rows render and missing items are explicitly marked.
3. No data available:
   - No rows displayed; clear data-unavailable message displayed.
4. Unauthorized user:
   - Access denied message only; no course data leakage.
5. Logging:
   - Each request stores `complete|partial|none` in SQLite.
6. Performance:
   - Validate p95 page results <= 5 seconds in test conditions.

## 5. Style and Quality Gates

1. Validate HTML/CSS against `Style Guides/google-style-guide-html-css.md`.
2. Validate JavaScript against `Style Guides/google-style-guide-javascript.md`.
3. Execute unit, integration, and contract tests for this feature before merge.

