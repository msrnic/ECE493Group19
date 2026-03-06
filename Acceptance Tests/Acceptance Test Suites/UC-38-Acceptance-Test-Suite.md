# Acceptance Test Suite — UC-27: Force Withdraw Student from a Class

## Scope

Validate that an administrator can forcibly withdraw a student from a course offering, and that all documented alternate/exception flows behave correctly: student not enrolled, administrator cancellation, and system failure during processing. The operation must be auditable and must maintain system consistency on failure.

---

## Assumptions / Test Data (Design-Level)

- **Administrator AdminA**: authenticated; authorized to manage enrollments/withdrawals.
- **Student S1 (Valid Student)**: exists.
- **Offering O1 (Valid Offering)**: exists; active for the term.
- **Enrollment State Variants:**
  - S1 is enrolled in O1 (for main success and cancel/system-failure tests).
  - S1 is not enrolled in O1 (for “student not enrolled” test).
- Environment supports:
  - Viewing/confirming enrollment status (roster, student schedule).
  - Verifying audit log/record creation for administrative actions.
  - Simulating system error during withdrawal persistence (DB error/timeout) and verifying rollback/no partial updates.
- If the UI requires a **reason** for forced withdrawal, tests will include entering a reason (design-level).

---

## Test Cases

### AT-UC27-01 — Force Withdraw Succeeds (Main Success)

**Flow covered:** Main success scenario

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Student S1 exists.
- Offering O1 exists.
- S1 is currently enrolled in O1.

**Steps:**
1. Log in as AdminA.
2. Open course enrollment administration (course offering management or student enrollment record).
3. Select Offering O1 and Student S1.
4. Choose **Force Withdraw**.
5. Review withdrawal implications shown by the system (e.g., transcript/fees) and provide a reason if prompted.
6. Confirm the forced withdrawal.
7. Verify that S1 is no longer enrolled in O1 (check O1 roster and/or S1 schedule).
8. Verify that an audit record was created for the administrative action.

**Expected Results:**
- System processes withdrawal successfully.
- S1 is withdrawn from O1 and no longer appears as enrolled.
- Enrollment/schedule records are updated accordingly.
- An audit record exists for the forced withdrawal action.
- System confirms completion to AdminA.

---

### AT-UC27-02 — Student Not Enrolled (Extension 3a)

**Flow covered:** Extension 3a (student not currently enrolled)

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Student S1 exists.
- Offering O1 exists.
- S1 is **not** enrolled in O1.

**Steps:**
1. Log in as AdminA.
2. Open enrollment administration.
3. Select Offering O1 and Student S1.
4. Choose **Force Withdraw**.
5. Attempt to proceed with the withdrawal action (confirm if the UI allows reaching confirmation).

**Expected Results:**
- System detects S1 is not enrolled in O1.
- System rejects the request and informs AdminA.
- No enrollment/schedule records change.
- System state remains consistent.

---

### AT-UC27-03 — Administrator Cancels Force Withdraw (Extension 4a)

**Flow covered:** Extension 4a (administrator cancels at confirmation)

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Student S1 exists.
- Offering O1 exists.
- S1 is enrolled in O1.

**Steps:**
1. Log in as AdminA.
2. Open enrollment administration and select Offering O1 and Student S1.
3. Choose **Force Withdraw**.
4. When the system displays implications and requests confirmation, select **Cancel** (or navigate away) instead of confirming.
5. Return to the enrollment view for O1 and S1.

**Expected Results:**
- No withdrawal is performed.
- S1 remains enrolled in O1.
- No enrollment/schedule records change.
- System state remains consistent.

---

### AT-UC27-04 — System Cannot Process Withdrawal (Extension 6a)

**Flow covered:** Extension 6a (system error during update, rollback/no partial updates)

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Student S1 exists.
- Offering O1 exists.
- S1 is enrolled in O1.
- Fault injection is enabled to cause failure during withdrawal update (e.g., DB write error/timeout).

**Steps:**
1. Enable the fault condition that causes the withdrawal update to fail.
2. Log in as AdminA.
3. Open enrollment administration and select Offering O1 and Student S1.
4. Choose **Force Withdraw**.
5. Confirm the forced withdrawal.
6. Observe system error messaging.
7. Disable the fault condition.
8. Verify enrollment status and records (roster/schedule) for S1 and O1.
9. Optionally retry the operation after fault removal.

**Expected Results:**
- System reports failure to AdminA.
- Any partial work is rolled back (no partial withdrawal state remains).
- S1 remains enrolled in O1 (since the withdrawal failed).
- Enrollment/schedule records are unchanged.
- System state remains consistent.
- After fault removal, a retry can succeed (optional).

---

## Coverage Summary

This acceptance test suite covers every documented UC-27 flow:
- **Main success:** administrator confirms force withdrawal → student withdrawn; audit record created.
- **Extension 3a:** student not enrolled → request rejected; no changes.
- **Extension 4a:** administrator cancels → no changes.
- **Extension 6a:** system error during withdrawal → rollback/no partial updates; no changes.

All documented flows in UC-27 are addressed.
