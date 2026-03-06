# UC-15 Acceptance Test Suite — Time Limit for Dropping from a Class

## Scope
Validate that university add/drop deadlines are displayed and enforced, and that the documented error flow is handled correctly.

**Flows covered (from UC-15 + scenarios):**
- Main Success: student views deadline and system enforces allowed vs not allowed
- Extension 2a: system error retrieving/evaluating deadlines

---

## Assumptions / Test Data (Design-Level)
- **Student S1**: authenticated.
- **Term T1** has a configured add/drop deadline **D1**.
- The UI displays deadlines via **Add/Drop Deadlines** page (or drop/withdraw page that shows the deadline).
- Test environment supports time control (or using test terms) to simulate:
  - a time **before** D1
  - a time **after** D1
- Deadline retrieval can be fault-injected (DB/service error).

---

## Test Cases

### AT-UC15-01 — Deadline Displayed and Drop Allowed Before Deadline (Main Success — Before)
**Preconditions:** System online; S1 authenticated; current time before D1.

**Steps:**
1. Log in as S1.
2. Navigate to **Add/Drop Deadlines** (or drop page).
3. Verify deadline D1 is displayed.
4. Attempt to drop a class (or verify the UI indicates dropping is allowed).
5. Verify the system indicates drop is allowed (and proceeds to next step in drop flow if applicable).

**Expected Results:**
- Deadline is displayed accurately.
- System enforces that dropping is allowed before D1.

---

### AT-UC15-02 — Drop Not Allowed After Deadline (Main Success — After)
**Preconditions:** System online; S1 authenticated; current time after D1.

**Steps:**
1. Navigate to **Add/Drop Deadlines** (or drop page).
2. Verify deadline D1 is displayed and marked as passed.
3. Attempt to drop a class.
4. Verify system blocks the drop and explains why (deadline passed).

**Expected Results:**
- System prevents drops after D1 and communicates the rule clearly.

---

### AT-UC15-03 — Error Retrieving/Evaluating Deadlines (Extension 2a)
**Preconditions:** System online; S1 authenticated; fault injection enabled for deadline retrieval/evaluation.

**Steps:**
1. Enable fault: deadline retrieval/evaluation fails.
2. Navigate to **Add/Drop Deadlines** (or drop page).
3. Verify the system reports it cannot confirm deadline information at this time.
4. Verify no enrollment/schedule changes occur as part of this failure.
5. Disable fault and optionally retry.

**Expected Results:**
- Clear error is shown; state remains consistent.

---

## Coverage Summary
Covers Main Success (before + after deadline outcomes) + Extension 2a (all documented flows).
