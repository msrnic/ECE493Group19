# UC-16 Acceptance Test Suite — Force Drop Priority Over Withdrawal

## Scope
Validate that when a student removes a class, the system applies **drop** when permitted (within deadline) to minimize fees; otherwise applies **withdrawal**, and that all documented failure flows behave correctly.

**Flows covered (from UC-16 + scenarios):**
- Main Success outcome A: drop applies (within deadline)
- Main Success outcome B: withdrawal applies (after deadline)
- Extension 2a: deadline/policy data cannot be determined → action blocked
- Extension 4a: update fails after action selection → schedule unchanged

---

## Assumptions / Test Data (Design-Level)
- **Student S1**: authenticated; enrolled in **Offering O_ENROLLED**.
- Term has a configured drop deadline **D_DROP**.
- Test environment supports simulating time **before** and **after** D_DROP (or test terms).
- Fault injection available for:
  - policy/deadline lookup failure
  - schedule/fees update failure

---

## Test Cases

### AT-UC16-01 — Remove Class Before Deadline → Drop Applied (Main Success A)
**Preconditions:** System online; S1 authenticated; S1 enrolled; current time before D_DROP.

**Steps:**
1. Log in as S1 and initiate removal of O_ENROLLED.
2. Confirm the action (as required by UI).
3. Verify the system applies **Drop** (not Withdrawal).
4. Verify schedule no longer includes O_ENROLLED.
5. Verify fee impact reflects drop policy (e.g., minimized fees / refund as applicable) or message indicates adjustment.

**Expected Results:**
- Drop is applied when allowed; schedule/fees updated accordingly.

---

### AT-UC16-02 — Remove Class After Deadline → Withdrawal Applied (Main Success B)
**Preconditions:** System online; S1 authenticated; S1 enrolled; current time after D_DROP.

**Steps:**
1. Initiate removal of O_ENROLLED.
2. Confirm the action.
3. Verify the system applies **Withdrawal**.
4. Verify schedule updated (class removed) and fee impact matches withdrawal policy (or message indicates impact).

**Expected Results:**
- Withdrawal is applied when drop is not allowed.

---

### AT-UC16-03 — Cannot Determine Deadline/Policy → Action Blocked (Extension 2a)
**Preconditions:** System online; S1 authenticated; fault injection causes deadline/policy lookup failure.

**Steps:**
1. Enable fault: policy/deadline cannot be determined.
2. Initiate removal of O_ENROLLED.
3. Verify system blocks the action and instructs to contact admin/registrar.
4. Verify schedule remains unchanged.
5. Disable fault and optionally retry.

**Expected Results:**
- No changes applied; clear guidance provided.

---

### AT-UC16-04 — Update Fails After Drop/Withdrawal Selected (Extension 4a)
**Preconditions:** System online; S1 authenticated; policy/deadline lookup works; fault injection causes schedule/fees update failure.

**Steps:**
1. Enable fault: update fails.
2. Initiate removal of O_ENROLLED.
3. Verify system selects drop or withdrawal based on time.
4. Verify system reports failure to complete update.
5. Verify schedule remains unchanged and fees are not modified.
6. Disable fault and optionally retry.

**Expected Results:**
- No partial changes; state remains consistent.

---

## Coverage Summary
Covers both main success outcomes + Extensions 2a and 4a (all documented flows).
