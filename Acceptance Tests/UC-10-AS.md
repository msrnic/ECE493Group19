# Acceptance Test Suite — UC-10: Records of Past Financial Transactions

## Scope

Validate that a **Student** can view records of past financial transactions to confirm payments were successful, and that the system handles the documented error flow correctly.

This suite is a **design** (non-executable) and provides coverage for every documented flow in:
- UC-10 use case (Main Success + Extension **2a**)  
- UC-10 scenarios (Scenario 1 + Scenario 2)

---

## Assumptions / Test Data (Design-Level)

- **Student S1 (Standard Student)**: valid account; has at least one historical financial transaction.
- **Student S2 (No-Transactions Student)** *(optional, if supported/expected)*: valid account; has zero historical transactions.
- **Dashboard Access**: student can reach a dashboard after login with a navigation entry to “Records of past financial transactions”.
- **Transaction Records** display includes (at minimum): date, amount, status, reference/receipt number (or equivalent).
- Environment supports simulating a **backend retrieval error** (e.g., database/payment processor connectivity issue) for the transaction history endpoint/service.
- Viewing transactions is **read-only** (no modification of transaction data occurs in this UC).

---

## Test Cases

### AT-UC10-01 — View Past Financial Transactions (Main Success)

**Flow covered:** Main success scenario (Use case steps 1–3) + Scenario 1

**Preconditions:**
- System is online.
- Student **S1** is authenticated.
- S1 has one or more historical transactions available.

**Steps:**
1. Log in as **S1**.
2. From the dashboard, select **Records of past financial transactions**.
3. Verify the system retrieves S1’s historical transaction records.
4. Verify the system displays a list of past transactions.
5. Verify each displayed transaction includes key details (e.g., date, amount, status, reference/receipt number).
6. Verify S1 can review the list and confirm payment success for at least one “successful/paid” transaction entry.

**Expected Results:**
- Transaction history loads successfully.
- Records are displayed accurately for S1 (no other student’s data is shown).
- System state remains unchanged (read-only behavior).

---

### AT-UC10-02 — System Error While Retrieving Transactions (Extension 2a)

**Flow covered:** Extension 2a + Scenario 2

**Preconditions:**
- System is online.
- Student **S1** is authenticated.
- Fault injection enabled to force transaction-history retrieval failure (DB/service/payment processor error).

**Steps:**
1. Enable the fault condition that causes transaction history retrieval to fail.
2. Log in as **S1**.
3. From the dashboard, select **Records of past financial transactions**.
4. Observe the system response.
5. Disable the fault condition.
6. (Optional) Retry the action after fault removal to confirm recovery (re-run AT-UC10-01 steps 2–4).

**Expected Results:**
- System displays an appropriate error message indicating records cannot be retrieved at this time.
- No partial/incorrect transaction data is shown as if it were complete (unless the product explicitly supports cached/partial data; not documented here).
- No transaction records are modified.
- System state remains consistent.
- Optional retry succeeds once the backend issue is resolved.

---

## Optional / Product-Dependent Tests (Only if your UI/requirements include these behaviors)

> These are **not required** by the documented UC-10 flows, but are common expectations for this feature.

### AT-UC10-03 — No Transactions Found (If Supported)

**Preconditions:**
- Student **S2** is authenticated.
- S2 has zero historical transactions.

**Steps:**
1. Log in as S2.
2. Navigate to **Records of past financial transactions**.
3. Observe the results.

**Expected Results:**
- System shows an empty state (e.g., “No transactions found”) without error.
- System state remains unchanged.

---

## Coverage Summary

This acceptance test suite covers every documented UC-10 flow:
- **Main success:** student views past transaction records to confirm payments were successful.
- **Extension 2a:** system error during retrieval → error shown, no changes applied, state remains consistent.

All documented flows are addressed.
