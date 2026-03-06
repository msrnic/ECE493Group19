# UC-14 Acceptance Test Suite — Withdraw from a Class

## Scope
Validate that a **Student** can withdraw from an enrolled class (class removed from schedule), and that all documented alternate flows behave correctly.

**Flows covered (from UC-14 + scenarios):**
- Main Success: withdraw successfully
- Extension 4a: student cancels withdrawal
- Extension 5a: system cannot process withdrawal

---

## Assumptions / Test Data (Design-Level)
- **Student S1**: authenticated; enrolled in **Offering O_ENROLLED**.
- UI provides **Current Schedule** and a **Withdraw** action with implications + confirmation.
- Environment supports fault injection for withdrawal update failure (DB/service error/timeout).

---

## Test Cases

### AT-UC14-01 — Withdraw Successfully (Main Success)
**Preconditions:** System online; S1 authenticated; S1 enrolled in O_ENROLLED.

**Steps:**
1. Log in as S1.
2. Open **Current Schedule** and locate O_ENROLLED.
3. Select **Withdraw**.
4. Verify implications are shown (fees/transcript notation).
5. Confirm withdrawal.
6. Verify confirmation is shown.
7. Verify O_ENROLLED is removed from schedule.

**Expected Results:**
- Withdrawal is recorded.
- Class is no longer on the schedule.

---

### AT-UC14-02 — Cancel Withdrawal After Reviewing Implications (Extension 4a)
**Preconditions:** System online; S1 authenticated; S1 enrolled in O_ENROLLED.

**Steps:**
1. Open **Current Schedule** → select **Withdraw** for O_ENROLLED.
2. At the implications/confirmation step, select **Cancel**.
3. Verify return to schedule and O_ENROLLED remains enrolled.

**Expected Results:**
- No withdrawal recorded; schedule unchanged.

---

### AT-UC14-03 — Withdrawal Fails Due to System Error (Extension 5a)
**Preconditions:** System online; S1 authenticated; O_ENROLLED exists; fault injection enabled to fail withdrawal update.

**Steps:**
1. Enable fault: withdrawal update fails.
2. Attempt to withdraw from O_ENROLLED and confirm.
3. Verify error message indicates withdrawal could not be completed.
4. Verify O_ENROLLED remains on schedule.
5. Disable fault and optionally retry.

**Expected Results:**
- No partial withdrawal applied; state remains consistent.

---

## Coverage Summary
Covers Main Success + Extensions 4a and 5a (all documented flows).
