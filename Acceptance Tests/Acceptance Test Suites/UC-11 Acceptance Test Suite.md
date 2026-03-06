# UC-11 Acceptance Test Suite — Store Banking Information

## Scope
Validate that a **Student** can add and securely store banking information as a payment method, and that all documented alternate flows behave correctly.

**Flows covered (from UC-11 + scenarios):**
- Main Success: add bank account successfully
- Extension 3a: student cancels entry (no save)
- Extension 4a: validation fails / banking info rejected

---

## Assumptions / Test Data (Design-Level)
- **Student S1**: authenticated, authorized to manage payment methods.
- **Banking details**:
  - **B_VALID**: valid routing/transit + account number (and any required metadata).
  - **B_INVALID**: missing/invalid fields (e.g., invalid account number format).
- UI has **Payment Methods** screen and **Add bank account** flow.
- “Securely stored” is verified behaviorally (method appears and can be selected); storage security itself is out of scope for UI acceptance tests.

---

## Test Cases

### AT-UC11-01 — Add Bank Account Successfully (Main Success)
**Preconditions:** System online; S1 authenticated.

**Steps:**
1. Log in as S1.
2. Navigate to **Payment Methods**.
3. Select **Add bank account**.
4. Enter **B_VALID** and submit.
5. Verify confirmation is shown.
6. Verify bank method appears in the payment methods list and is selectable for fee payment.

**Expected Results:**
- Bank payment method is added and available.
- No unintended changes to other payment methods.

---

### AT-UC11-02 — Cancel During Entry (Extension 3a)
**Preconditions:** System online; S1 authenticated.

**Steps:**
1. Navigate to **Payment Methods** → **Add bank account**.
2. Begin entering banking details.
3. Select **Cancel/Back** before submitting.
4. Verify return to Payment Methods.
5. Verify no new bank payment method was added.

**Expected Results:**
- No banking info is stored.
- System state remains unchanged.

---

### AT-UC11-03 — Validation Fails / Bank Info Rejected (Extension 4a)
**Preconditions:** System online; S1 authenticated.

**Steps:**
1. Navigate to **Payment Methods** → **Add bank account**.
2. Enter **B_INVALID** and submit.
3. Verify validation/rejection message and highlighted fields.
4. Verify no new bank method appears in the list.
5. Correct details to **B_VALID** and resubmit (or cancel, depending on UI).
6. If resubmitted, verify success as in AT-UC11-01.

**Expected Results:**
- Invalid info is not stored.
- Errors are clear and actionable.
- If corrected, banking info is stored successfully.

---

## Coverage Summary
Covers Main Success + Extensions 3a and 4a (all documented flows).
