# UC-17 Acceptance Test Suite — Enroll in Found Classes

## Scope
Validate that a **Student** can enroll in a class they found and that all documented alternate/exception flows behave correctly.

**Flows covered (from UC-17 + scenarios):**
- Main Success: enroll succeeds; schedule updated; fee changes communicated
- Extension 3a: prerequisites not met
- Extension 3b: course is full
- Extension 3c: registration hold exists
- Extension 4a: system error during enrollment

---

## Assumptions / Test Data (Design-Level)
- **Student S_OK**: authenticated; no holds; meets prerequisites; no schedule conflicts.
- **Student S_PREREQ**: does not meet prerequisites for target offering.
- **Student S_HOLD**: has registration hold.
- **Offerings**:
  - **O_OPEN**: has seats available.
  - **O_FULL**: is full (0 seats).
- Fault injection available for enrollment update failure.

---

## Test Cases

### AT-UC17-01 — Enroll Successfully (Main Success)
**Preconditions:** System online; S_OK authenticated; O_OPEN available; prereqs satisfied; no holds/conflicts.

**Steps:**
1. Log in as S_OK.
2. Find O_OPEN (via search/catalog) and select **Enroll**.
3. Verify system performs eligibility checks.
4. Verify enrollment succeeds and schedule updates to include O_OPEN.
5. Verify confirmation includes any fee assessment changes (if applicable).

**Expected Results:**
- Student enrolled; schedule updated; confirmation shown.

---

### AT-UC17-02 — Prerequisites Not Met (Extension 3a)
**Preconditions:** System online; S_PREREQ authenticated; O_OPEN requires unmet prerequisites.

**Steps:**
1. Find O_OPEN and select **Enroll**.
2. Verify system blocks enrollment and shows unmet prerequisites.
3. Verify schedule unchanged.

**Expected Results:**
- No enrollment created; clear prerequisite message.

---

### AT-UC17-03 — Course Full (Extension 3b)
**Preconditions:** System online; S_OK authenticated; O_FULL is full.

**Steps:**
1. Select **Enroll** on O_FULL.
2. Verify system blocks enrollment and shows remaining-seat info.
3. Verify schedule unchanged.

**Expected Results:**
- No enrollment created; capacity message shown.

---

### AT-UC17-04 — Registration Hold (Extension 3c)
**Preconditions:** System online; S_HOLD authenticated; O_OPEN exists.

**Steps:**
1. Select **Enroll** on O_OPEN.
2. Verify system blocks enrollment and explains hold.
3. Verify schedule unchanged.

**Expected Results:**
- No enrollment created; hold explanation shown.

---

### AT-UC17-05 — Enrollment Fails Due to System Error (Extension 4a)
**Preconditions:** System online; S_OK eligible; fault injection causes enrollment write failure.

**Steps:**
1. Enable fault: enrollment update fails.
2. Attempt to enroll in O_OPEN.
3. Verify system reports failure and suggests retry.
4. Verify schedule unchanged (no partial enrollment).
5. Disable fault and optionally retry.

**Expected Results:**
- No changes applied; clear error and retry guidance.

---

## Coverage Summary
Covers Main Success + Extensions 3a, 3b, 3c, and 4a (all documented flows).
