# Acceptance Test Suite — UC-09: View a Financial Information Dashboard

## Scope

Validate that a **Student** can view a financial information dashboard after login, and that the system handles documented alternate flows correctly:
- Main success (dashboard loads with permitted financial features)
- Extension **2a** (student has no assigned roles/modules)
- Extension **2b** (system cannot load dashboard data; partial dashboard shown)

This suite is a **design** (non-executable) and focuses on covering every documented flow.

---

## Assumptions / Test Data (Design-Level)

- **Student S1 (Standard Student)**: valid account; has one or more assigned roles/modules that grant access to financial dashboard features.
- **Student S2 (No-Module Student)**: valid account; **no assigned roles/modules**.
- **Credentials**: valid login credentials exist for S1 and S2.
- The system provides a visible **Financial Information Dashboard** view after login.
- The dashboard shows:
  - Navigation to **permitted features** (modules/sections), when available.
  - A **minimal dashboard** and **admin-contact message** when no roles/modules exist.
  - A **partial dashboard** and indication of **unavailable sections** when data cannot be loaded.
- The test environment supports simulating a dashboard data retrieval failure (e.g., service down / timeout / API error) for the financial dashboard sections.

---

## Test Cases

### AT-UC09-01 — Dashboard Loads After Login (Main Success)

**Flow covered:** Main success scenario

**Preconditions:**
- System is online.
- Student **S1** has a valid account.
- S1 has assigned roles/modules for financial dashboard features.

**Steps:**
1. Log in as **S1** with valid credentials.
2. Verify the system retrieves S1’s role(s) and relevant modules (observable via available dashboard features/modules).
3. Verify the system displays the **Financial Information Dashboard**.
4. Verify the dashboard includes navigation to the features/modules S1 is permitted to access.
5. Select at least one permitted feature link/module and verify navigation works (high-level check).

**Expected Results:**
- Dashboard is displayed successfully.
- Permitted features are visible and navigable.
- System state remains consistent.

---

### AT-UC09-02 — No Assigned Roles/Modules (Extension 2a)

**Flow covered:** Extension 2a

**Preconditions:**
- System is online.
- Student **S2** has a valid account.
- S2 has **no assigned roles/modules**.

**Steps:**
1. Log in as **S2** with valid credentials.
2. Verify the system attempts to retrieve S2’s role(s) and modules.
3. Verify the system determines there are no assigned roles/modules.
4. Verify the system displays a **minimal dashboard** (basic shell/navigation without financial modules).
5. Verify the system displays an **admin-contact message** indicating the account is not configured for dashboard modules.

**Expected Results:**
- Student is not shown unavailable/unauthorized modules.
- Student receives clear guidance to contact an administrator.
- No changes are applied; system remains consistent.

---

### AT-UC09-03 — Dashboard Data Cannot Be Loaded (Extension 2b)

**Flow covered:** Extension 2b

**Preconditions:**
- System is online.
- Student **S1** has a valid account.
- S1 has assigned roles/modules.
- Dashboard data retrieval is forced to fail for one or more financial sections (fault injection: service/API error/timeout).

**Steps:**
1. Enable the fault condition causing one or more dashboard data sources to fail.
2. Log in as **S1** with valid credentials.
3. Verify the system displays the **Financial Information Dashboard**.
4. Verify the dashboard is **partial** (some modules/sections appear, but at least one expected section does not load).
5. Verify the system indicates which sections are **unavailable** (and, if present, shows a suggestion to retry later).
6. Verify that any available/permitted features remain navigable.
7. Disable the fault condition.
8. (Optional) Refresh/re-login and verify the full dashboard loads normally when data sources recover.

**Expected Results:**
- Dashboard renders in a degraded state (partial) rather than failing completely.
- Unavailable sections are clearly indicated.
- Available/permitted features remain accessible.
- System state remains consistent.

---

## Coverage Summary

This acceptance test suite covers every documented UC-09 flow:
- **Main success:** dashboard loads after login with navigation to permitted features.
- **Extension 2a:** no assigned roles/modules → minimal dashboard + admin-contact message.
- **Extension 2b:** dashboard data load failure → partial dashboard + unavailable sections indicated.

All documented flows are addressed.
