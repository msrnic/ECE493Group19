# UC-12 Acceptance Test Suite — Store Credit Card Information

## Scope
Validate that a **Student** can store a credit card for fee payments using tokenization, and that all documented alternate flows behave correctly.

**Flows covered (from UC-12 + scenarios):**
- Main Success: card token stored (token + last-4/expiry metadata)
- Extension 3a: payment processor rejects card (retry allowed)
- Extension 3b: payment processor unavailable (try later / use another method)

---

## Assumptions / Test Data (Design-Level)
- **Student S1**: authenticated.
- **Cards**:
  - **CC_VALID**: valid card that tokenizes successfully.
  - **CC_REJECTED**: card details that the processor rejects (e.g., invalid number).
- **Payment Processor** supports tokenization and can be fault-injected to return:
  - a rejection response
  - a service unavailable/timeout response
- UI has **Payment Methods** → **Add credit card** flow.
- Token storage is verified behaviorally (method appears with last-4/expiry); full card data storage is out of scope.

---

## Test Cases

### AT-UC12-01 — Add Credit Card Successfully (Main Success)
**Preconditions:** System online; S1 authenticated; processor healthy.

**Steps:**
1. Log in as S1.
2. Navigate to **Payment Methods**.
3. Select **Add credit card**.
4. Enter **CC_VALID** and submit.
5. Verify success confirmation.
6. Verify a new card method appears showing **last-4/expiry**.
7. Verify card method can be selected for fee payment.

**Expected Results:**
- Card method is added; token + limited metadata stored.
- No full card number is displayed or retrievable via UI.

---

### AT-UC12-02 — Processor Rejects Card (Extension 3a)
**Preconditions:** System online; S1 authenticated; processor returns rejection for CC_REJECTED.

**Steps:**
1. Navigate to **Payment Methods** → **Add credit card**.
2. Enter **CC_REJECTED** and submit.
3. Verify safe rejection feedback is shown.
4. Verify no new card method is added.
5. Retry with corrected/valid details (**CC_VALID**) and submit.
6. Verify success as in AT-UC12-01.

**Expected Results:**
- Rejected card is not stored.
- Student can retry safely.

---

### AT-UC12-03 — Processor Unavailable (Extension 3b)
**Preconditions:** System online; S1 authenticated; processor unavailable (timeout/service error).

**Steps:**
1. Enable fault: processor unavailable.
2. Navigate to **Payment Methods** → **Add credit card**.
3. Enter card details and submit.
4. Verify system indicates processor is unavailable and suggests **try later** / **use another method**.
5. Verify no new card method is added.
6. Disable fault and optionally retry with **CC_VALID**.

**Expected Results:**
- No token stored during downtime.
- Clear guidance provided; system state remains consistent.

---

## Coverage Summary
Covers Main Success + Extensions 3a and 3b (all documented flows).
