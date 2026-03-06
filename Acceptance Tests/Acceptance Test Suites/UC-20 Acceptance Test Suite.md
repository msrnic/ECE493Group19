# UC-20 Acceptance Test Suite — View My Course History

## Scope
Validate that a **Student** can view their course history and that the system correctly handles all documented alternate flows:
- Main Success: course history displayed with appropriate formatting/access controls
- Extension **2a**: course history data unavailable or incomplete (partial display + missing indicator)
- Extension **2b**: actor not authorized (deny access + log)

This suite is a **design** (non-executable).

---

## Assumptions / Test Data (Design-Level)
- **Student S1 (Authorized Student)**: authenticated; authorized to view their own course history.
- **Student S2 (Unauthorized Actor)**: authenticated session that is not authorized to view the requested course history (e.g., session mismatch / incorrect role / attempting to view another student’s data).
- **Course history data**:
  - **H_FULL**: complete course history exists for S1.
  - **H_PARTIAL**: some terms/records are missing or unavailable for S1 (simulated).
- Environment supports:
  - Simulating partial/unavailable data from storage/services.
  - Observing an authorization failure being logged (audit log, security log, or admin log view).

---

## Test Cases

### AT-UC20-01 — View Complete Course History (Main Success)
**Flow covered:** Main Success

**Preconditions:**
- System is online.
- S1 is authenticated and authorized.
- H_FULL is available for S1.

**Steps:**
1. Log in as **S1**.
2. From the dashboard, select **View my course history**.
3. Verify the system retrieves course history data.
4. Verify the system displays course history with appropriate formatting (e.g., by term) and access controls.
5. Verify only S1’s own course history is displayed.

**Expected Results:**
- Course history is displayed successfully.
- No system state changes occur (read-only).
- Access controls prevent viewing other students’ data.

---

### AT-UC20-02 — Course History Data Unavailable/Incomplete (Extension 2a)
**Flow covered:** Extension 2a

**Preconditions:**
- System is online.
- S1 is authenticated and authorized.
- H_PARTIAL condition is in effect (some records missing/unavailable).

**Steps:**
1. Log in as **S1**.
2. Select **View my course history**.
3. Verify the system attempts to retrieve course history.
4. Verify the system displays the available portion of the course history.
5. Verify the system indicates missing/incomplete items (e.g., “Some terms could not be loaded”).

**Expected Results:**
- Partial data is shown (what is available).
- Missing/incomplete portions are clearly indicated.
- No changes are applied; system remains consistent.

---

### AT-UC20-03 — Not Authorized to View Course History (Extension 2b)
**Flow covered:** Extension 2b

**Preconditions:**
- System is online.
- S2 is authenticated but **not authorized** to view the requested course history.

**Steps:**
1. Log in as **S2**.
2. Attempt to access **View my course history** (or attempt to access course history data via a direct route/link if applicable).
3. Verify the system performs an authorization check.
4. Verify the system denies access and shows an authorization error.
5. Verify the authorization failure is logged (audit/security log).

**Expected Results:**
- Access is denied; no course history data is displayed.
- Authorization failure is logged.
- No changes are applied; system remains consistent.

---

## Coverage Summary
Covers Main Success + Extensions **2a** and **2b** (all documented flows).
