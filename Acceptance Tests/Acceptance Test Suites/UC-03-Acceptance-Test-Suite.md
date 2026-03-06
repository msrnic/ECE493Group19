# Acceptance Test Suite — UC-03: Main Dashboard Upon Logging In

## Scope

Verify that after a successful login, the system:
- Loads and displays the main dashboard as the central navigation hub.
- Supports navigation to permitted features based on the user’s roles/modules.
- Handles the documented degraded case where dashboard data cannot be loaded by showing a partial dashboard and indicating unavailable sections.

---

## Assumptions / Test Data (Design-Level)

- Registered User A: active account, valid credentials.
- User A has at least one role/module assignment (e.g., Student) that grants access to dashboard navigation items.
- The environment can simulate a dashboard data load failure (e.g., DB/service timeout/error for dashboard widgets/modules data).
- Authentication is functioning (successful login is a prerequisite for this use case).

---

## Test Cases

### AT-UC03-01 — Dashboard Loads After Login (Main Success)

**Preconditions:**
- System is online.
- Registered user has a valid account.

**Steps:**
1. Log in as Registered User A.
2. Verify the system routes the user to the dashboard upon successful login.
3. Verify the system retrieves and applies the user’s roles/modules to determine available navigation items.
4. Verify the dashboard renders navigation options corresponding to permitted features.
5. Select at least one permitted feature from the dashboard navigation.
6. Verify the selected feature loads successfully.

**Expected Results:**
- Dashboard is displayed immediately after login.
- Navigation options reflect the user’s available/permitted features.
- Navigation selection routes to the requested feature without errors.
- System remains consistent (no unintended changes caused by dashboard rendering).

---

### AT-UC03-02 — Dashboard Data Cannot Be Loaded → Partial Dashboard (Extension)

**Preconditions:**
- System is online.
- Registered user has a valid account.
- A dashboard data source required for full rendering is unavailable or returns an error.

**Steps:**
1. Enable a fault condition that prevents full dashboard data from loading (e.g., simulate DB/service timeout).
2. Log in as Registered User A.
3. Observe the dashboard rendering.
4. Verify the system displays a partial dashboard rather than failing completely.
5. Verify the system clearly indicates unavailable sections (e.g., message/banner/placeholder).
6. Verify that any dashboard navigation items that do load remain usable (select one and confirm navigation works).
7. Disable the fault condition and refresh or re-enter the dashboard.

**Expected Results:**
- System displays a partial dashboard when full dashboard data cannot be loaded.
- Unavailable sections are explicitly indicated to the user.
- Any available navigation continues to function.
- System state remains consistent (no unintended changes).
- After fault removal, dashboard loads normally on refresh/re-entry (where applicable).

---

## Coverage Summary

This acceptance test suite covers every documented UC-03 flow:
- Main success flow: dashboard loads after login with navigation to permitted features.
- Extension flow: dashboard data cannot be loaded resulting in a partial dashboard with unavailable sections indicated.
