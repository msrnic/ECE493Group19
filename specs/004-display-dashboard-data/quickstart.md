# Quickstart: 004-display-dashboard-data

## 1. Implement MVC scaffolding
1. Create model modules for `Account`, `Course`, `Enrollment`, `TeachingAssignment`, `DashboardPage`, and `DataItemDefinition` using SQLite.
2. Create controller flow for `GET /dashboard/pages/{pageId}`:
   - authenticate actor
   - authorize page access
   - query data items
   - apply field-level role filtering
   - return `complete|partial|none` response model
3. Create views for each in-scope page (`UC-06`, `UC-20`, `UC-21`, `UC-33`, `UC-36`) and shared components for missing-item indicators/no-data state.

## 2. Initialize SQLite schema
1. Add tables/constraints described in `data-model.md`.
2. Seed page metadata for the five in-scope `pageId` values and UC mappings.
3. Seed role-based field visibility rules for each page.

## 3. Validate functional requirements
1. Verify authorized actors can navigate and see expected fields (FR-001..FR-004).
2. Verify field visibility differs by role where configured (FR-004a).
3. Simulate missing fields and confirm partial rendering + missing-item indicators (FR-005, FR-006).
4. Simulate zero available items and confirm dedicated no-data state with retry guidance (FR-011).
5. Verify unauthorized users receive denial with no restricted data exposed (FR-007).

## 4. Validate traceability and constraints
1. Map each implemented flow to `UC-06`, `UC-20`, `UC-21`, `UC-33`, and `UC-36` plus matching acceptance tests (`UC-06-AS`, `UC-20-AS`, `UC-21-AS`, `UC-33-AS`, `UC-36-AS`) (FR-008, FR-009).
2. Confirm no additional logging obligations were introduced for authorization failures (FR-010).
3. Confirm no edits were made to protected `Use Cases/` or `Acceptance Tests/` files.

## 5. Style and quality checks
1. Run JavaScript style checks aligned with `Style Guides/google-style-guide-javascript.md`.
2. Run HTML/CSS style checks aligned with `Style Guides/google-style-guide-html-css.md`.
3. Execute automated model/controller/contract tests and capture evidence per mapped acceptance flow.
