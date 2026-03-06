# Acceptance Test Suite — UC-41: Registration Hold for Outstanding Fees Prevents New Enrollments

## Scope

Validate the enrollment eligibility checks described in UC-41, including how a **registration hold (for outstanding fees)** prevents new enrollments. This suite covers **every documented flow** in the UC-41 use case and UC-41 scenario set:
- Main success (eligible enrollment succeeds)
- Extension **3a** (prerequisites not met)
- Extension **3b** (course full)
- Extension **3c** (registration hold present)
- Extension **4a** (system error during enrollment)

This suite is a **design** (non-executable).

---

## Assumptions / Test Data (Design-Level)

- **Student S1 (Eligible Student)**: authenticated; no holds; meets prerequisites for the target course.
- **Student S2 (Prereq Not Met Student)**: authenticated; no holds; does not meet prerequisites for the target course.
- **Student S3 (Hold Student)**: authenticated; has an active **registration hold** due to outstanding fees.
- **Course Offering O_OPEN**: exists; has seats available; no time conflicts with student schedules.
- **Course Offering O_FULL**: exists; has 0 remaining seats.
- Environment supports simulating:
  - A system error during the enrollment transaction (DB/service error/timeout).
- “Schedule unchanged” means no enrollment record is created and the student timetable remains the same.

---

## Test Cases

### AT-UC41-01 — Enroll Succeeds When Student Is Eligible (Main Success)

**Flow covered:** Main success scenario

**Preconditions:**
- System is online.
- Student S1 is authenticated.
- S1 has **no registration holds**.
- S1 meets prerequisites for O_OPEN.
- O_OPEN has available seats.
- No schedule conflicts exist for S1 with O_OPEN.

**Steps:**
1. Log in as Student S1.
2. Find course offering **O_OPEN** (e.g., via search).
3. Select **Enroll**.
4. Observe enrollment confirmation.
5. Verify S1’s schedule reflects enrollment in O_OPEN.

**Expected Results:**
- System checks eligibility (holds, prerequisites, schedule conflicts, capacity).
- System enrolls S1 in O_OPEN.
- Student schedule is updated to include O_OPEN.
- System confirms enrollment and any relevant fee assessment changes (if applicable).

---

### AT-UC41-02 — Enrollment Blocked When Prerequisites Not Met (Extension 3a)

**Flow covered:** Extension 3a

**Preconditions:**
- System is online.
- Student S2 is authenticated.
- S2 has **no registration holds**.
- S2 does **not** meet prerequisites for O_OPEN.
- O_OPEN has available seats.

**Steps:**
1. Log in as Student S2.
2. Find course offering **O_OPEN**.
3. Select **Enroll**.
4. Observe the system response.

**Expected Results:**
- System detects prerequisites are not met.
- System blocks enrollment and displays unmet prerequisite information.
- No enrollment is created.
- Student schedule remains unchanged.

---

### AT-UC41-03 — Enrollment Blocked When Course Is Full (Extension 3b)

**Flow covered:** Extension 3b

**Preconditions:**
- System is online.
- Student S1 is authenticated.
- S1 has **no registration holds**.
- S1 meets prerequisites for O_FULL.
- O_FULL is **full** (0 seats remaining).

**Steps:**
1. Log in as Student S1.
2. Find course offering **O_FULL**.
3. Select **Enroll**.
4. Observe the system response.

**Expected Results:**
- System detects the course is full.
- System blocks enrollment and displays remaining-seat information (e.g., “0 seats remaining”).
- No enrollment is created.
- Student schedule remains unchanged.

---

### AT-UC41-04 — Enrollment Blocked When Registration Hold Exists (Outstanding Fees) (Extension 3c)

**Flow covered:** Extension 3c

**Preconditions:**
- System is online.
- Student S3 is authenticated.
- S3 has an active **registration hold** due to outstanding fees.
- O_OPEN exists (capacity available and prereqs irrelevant because hold should block first/early in eligibility checks).

**Steps:**
1. Log in as Student S3.
2. Find course offering **O_OPEN**.
3. Select **Enroll**.
4. Observe the system response.

**Expected Results:**
- System detects the registration hold.
- System blocks enrollment and explains the hold (and next steps if available, e.g., pay fees/contact admin).
- No enrollment is created.
- Student schedule remains unchanged.

---

### AT-UC41-05 — Enrollment Fails Due to System Error (Extension 4a)

**Flow covered:** Extension 4a

**Preconditions:**
- System is online.
- Student S1 is authenticated.
- S1 has **no registration holds**.
- S1 meets prerequisites for O_OPEN.
- O_OPEN has available seats.
- Fault injection enabled to cause enrollment transaction failure (DB/service error/timeout).

**Steps:**
1. Enable fault condition to force enrollment transaction to fail.
2. Log in as Student S1.
3. Find course offering **O_OPEN**.
4. Select **Enroll**.
5. Observe error messaging.
6. Disable fault condition.
7. Refresh/re-open S1 schedule and verify enrollment did not occur.
8. (Optional) Retry enrollment after fault removal.

**Expected Results:**
- System reports failure and asks the student to retry.
- No enrollment is created (or any partial work is rolled back).
- Student schedule remains unchanged.
- System state remains consistent.

---

## Coverage Summary

This acceptance test suite covers every documented UC-41 flow:
- **Main success:** eligible enrollment succeeds.
- **Extension 3a:** prerequisites not met → blocked.
- **Extension 3b:** course full → blocked.
- **Extension 3c:** registration hold (outstanding fees) → blocked.
- **Extension 4a:** system error during enrollment → no change, retry suggested.

All documented flows are addressed.
