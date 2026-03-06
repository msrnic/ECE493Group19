# UC-21 Acceptance Test Suite — View My Transcript

## Scope
Validate that a **Student** can view their transcript and that the system correctly handles all documented alternate flows:
- Main Success: transcript displayed with appropriate formatting/access controls
- Extension **2a**: transcript data unavailable or incomplete (partial display + missing indicator)
- Extension **2b**: actor not authorized (deny access + log)

This suite is a **design** (non-executable).

---

## Assumptions / Test Data (Design-Level)
- **Student S1 (Authorized Student)**: authenticated; authorized to view their own transcript.
- **Student S2 (Unauthorized Actor)**: authenticated session that is not authorized to view the requested transcript (e.g., session mismatch / incorrect role / attempting to view another student’s transcript).
- **Transcript data**:
  - **T_FULL**: complete transcript exists for S1.
  - **T_PARTIAL**: some terms/grades/entries are missing or unavailable for S1 (simulated).
- Environment supports:
  - Simulating partial/unavailable transcript data from storage/services.
  - Observing an authorization failure being logged (audit/security log).

---

## Test Cases

### AT-UC21-01 — View Transcript Successfully (Main Success)
**Flow covered:** Main Success

**Preconditions:**
- System is online.
- S1 is authenticated and authorized.
- T_FULL is available for S1.

**Steps:**
1. Log in as **S1**.
2. From the dashboard, select **View my transcript**.
3. Verify the system retrieves transcript data.
4. Verify the system displays the transcript with appropriate formatting (e.g., by term) and access controls.
5. Verify only S1’s transcript is displayed.

**Expected Results:**
- Transcript is displayed successfully.
- No system state changes occur (read-only).
- Access controls prevent viewing other students’ transcript data.

---

### AT-UC21-02 — Transcript Data Unavailable/Incomplete (Extension 2a)
**Flow covered:** Extension 2a

**Preconditions:**
- System is online.
- S1 is authenticated and authorized.
- T_PARTIAL condition is in effect (some data missing/unavailable).

**Steps:**
1. Log in as **S1**.
2. Select **View my transcript**.
3. Verify the system attempts to retrieve transcript data.
4. Verify the system displays the available portion of the transcript.
5. Verify the system indicates missing/incomplete items (e.g., “Some terms could not be loaded” / “Some grades are unavailable”).

**Expected Results:**
- Partial data is shown (what is available).
- Missing/incomplete portions are clearly indicated.
- No changes are applied; system remains consistent.

---

### AT-UC21-03 — Not Authorized to View Transcript (Extension 2b)
**Flow covered:** Extension 2b

**Preconditions:**
- System is online.
- S2 is authenticated but **not authorized** to view the requested transcript.

**Steps:**
1. Log in as **S2**.
2. Attempt to access **View my transcript** (or attempt to access transcript data via a direct route/link if applicable).
3. Verify the system performs an authorization check.
4. Verify the system denies access and shows an authorization error.
5. Verify the authorization failure is logged (audit/security log).

**Expected Results:**
- Access is denied; no transcript data is displayed.
- Authorization failure is logged.
- No changes are applied; system remains consistent.

---

## Coverage Summary
Covers Main Success + Extensions **2a** and **2b** (all documented flows).
