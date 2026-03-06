# UC-18 Acceptance Test Suite — Join Class Waitlists

## Scope
Validate that a **Student** can join a waitlist for a full section and that all documented alternate/exception flows behave correctly.

**Flows covered (from UC-18 + scenarios):**
- Main Success: join waitlist and receive position/status
- Extension 3a: section not waitlist-eligible
- Extension 4a: already enrolled or already waitlisted (prevent duplicate)
- Extension 4b: student ineligible to waitlist (hold/term closed)
- Extension 5a: system cannot record waitlist entry

---

## Assumptions / Test Data (Design-Level)
- **Student S_OK**: authenticated; eligible; not enrolled/waitlisted for target section.
- **Student S_DUP**: already enrolled or already waitlisted for target section.
- **Student S_INELIG**: ineligible (e.g., registration hold or term closed).
- **Sections**:
  - **SEC_WL**: full and waitlist-enabled.
  - **SEC_NOWL**: full and waitlist-disabled.
- Fault injection available for waitlist service/database failure.

---

## Test Cases

### AT-UC18-01 — Join Waitlist Successfully (Main Success)
**Preconditions:** System online; S_OK authenticated; SEC_WL is full and waitlist-enabled.

**Steps:**
1. Log in as S_OK.
2. Open SEC_WL details; verify seats full and waitlist option available.
3. Select **Join Waitlist**.
4. Verify eligibility validation passes.
5. Verify system confirms waitlist entry and shows position/status.
6. Verify the waitlist entry is visible in the student’s schedule/registration status area (if provided).

**Expected Results:**
- Student is added to waitlist; position/status shown.

---

### AT-UC18-02 — Section Not Waitlist-Eligible (Extension 3a)
**Preconditions:** System online; S_OK authenticated; SEC_NOWL is full but waitlist disabled.

**Steps:**
1. Open SEC_NOWL and attempt **Join Waitlist**.
2. Verify system blocks waitlisting and offers alternatives (other sections/courses).

**Expected Results:**
- No waitlist entry created; state unchanged.

---

### AT-UC18-03 — Already Enrolled/Waitlisted (Extension 4a)
**Preconditions:** System online; S_DUP authenticated; SEC_WL is waitlist-enabled; S_DUP already enrolled or already waitlisted.

**Steps:**
1. Attempt **Join Waitlist** for SEC_WL.
2. Verify system prevents duplicate entry and informs student of existing status.

**Expected Results:**
- No duplicate created; state unchanged.

---

### AT-UC18-04 — Student Ineligible to Waitlist (Extension 4b)
**Preconditions:** System online; S_INELIG authenticated; SEC_WL waitlist-enabled.

**Steps:**
1. Attempt **Join Waitlist**.
2. Verify system rejects request and displays reason + next steps (resolve hold / choose another term/section).

**Expected Results:**
- No waitlist entry created; state unchanged.

---

### AT-UC18-05 — Cannot Record Waitlist Entry (Extension 5a)
**Preconditions:** System online; S_OK eligible; fault injection causes waitlist record failure.

**Steps:**
1. Enable fault: waitlist service/database error.
2. Attempt **Join Waitlist** for SEC_WL.
3. Verify system reports failure and confirms no entry created.
4. Verify student is not shown as waitlisted; position/status not assigned.
5. Disable fault and optionally retry.

**Expected Results:**
- No partial entry; state consistent; clear error.

---

## Coverage Summary
Covers Main Success + Extensions 3a, 4a, 4b, and 5a (all documented flows).
