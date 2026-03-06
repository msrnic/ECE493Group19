# Acceptance Test Suite — UC-39: Add/Delete Course Offerings

## Scope

Validate that an **Administrator** can add and delete course offerings, and that all documented alternate/exception flows behave correctly: deletion blocked due to active enrollments, invalid offering data, system error during add/delete, and administrator cancellation of add/delete actions.

This suite is a **design** (non-executable) and focuses on coverage of every documented flow in the updated use case and scenario set.

---

## Assumptions / Test Data (Design-Level)

- **Administrator AdminA**: authenticated; authorized to manage course offerings.
- **Offering O_NEW**: a valid set of offering details (term, instructor, capacity, schedule) that does not already exist.
- **Offering O_EMPTY**: an existing offering eligible for deletion (no active enrollments).
- **Offering O_ACTIVE**: an existing offering with active enrollments (not eligible for deletion without a special workflow).
- Environment supports:
  - Viewing the course catalog to confirm offering presence/absence.
  - Simulating system errors during persistence (DB/service timeout) for add and delete operations.
  - Validating form-level errors and preventing persistence until corrected.
- “Delete” may be implemented as hard delete or soft delete/inactivation; expected results are phrased accordingly.

---

## Test Cases

### AT-UC39-01 — Add Course Offering (Main Success)

**Flow covered:** Main success (Add)

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- O_NEW does not already exist.

**Steps:**
1. Log in as AdminA.
2. Open **Course Offerings Administration**.
3. Select **Add Offering**.
4. Enter valid offering details for O_NEW (term, instructor, capacity, schedule).
5. Submit the form.
6. Verify O_NEW is visible in the catalog/admin list.
7. Verify system shows a success confirmation and the change is logged (if log view is available).

**Expected Results:**
- System validates inputs and creates the new offering.
- Offering is visible in the catalog/admin list.
- Operation is logged and success is confirmed.
- System state remains consistent.

---

### AT-UC39-02 — Delete Course Offering (Main Success)

**Flow covered:** Main success (Delete)

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- O_EMPTY exists and is eligible for deletion (no active enrollments).

**Steps:**
1. Log in as AdminA.
2. Open **Course Offerings Administration**.
3. Locate O_EMPTY and select **Delete Offering**.
4. Confirm deletion if prompted.
5. Verify O_EMPTY is removed from the catalog/admin list (or marked inactive per implementation).
6. Verify system shows confirmation and the change is logged (if log view is available).

**Expected Results:**
- System validates deletion constraints and removes/inactivates the offering.
- Offering is no longer available for selection in the catalog.
- Operation is logged and success is confirmed.
- System state remains consistent.

---

### AT-UC39-03 — Delete Blocked Due to Active Enrollments (Extension 2a)

**Flow covered:** Extension 2a

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- O_ACTIVE exists and has active enrollments.

**Steps:**
1. Log in as AdminA.
2. Open **Course Offerings Administration**.
3. Locate O_ACTIVE and select **Delete Offering**.
4. Proceed to attempt deletion (confirm if prompted).

**Expected Results:**
- System detects active enrollments.
- System blocks deletion (or redirects to a special workflow/approval process per policy).
- Offering remains present/active.
- No enrollment or catalog data is changed by the blocked delete attempt.
- System state remains consistent.

---

### AT-UC39-04 — Add Offering with Invalid Data → Corrected and Added (Extension 3a)

**Flow covered:** Extension 3a

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.

**Steps:**
1. Log in as AdminA.
2. Open **Course Offerings Administration** and select **Add Offering**.
3. Enter invalid data (e.g., missing instructor, invalid term, negative capacity, invalid/overlapping schedule format) and submit.
4. Confirm the system shows validation errors and does not create the offering.
5. Correct the data to valid values.
6. Resubmit.
7. Verify the offering is created and visible in the catalog/admin list.

**Expected Results:**
- No offering is created while data is invalid.
- System highlights errors and requests correction.
- After correction, offering is created successfully and logged.
- System state remains consistent.

---

### AT-UC39-05 — System Error During Add Operation (Extension 4a / Scenario Set “System Error” Add Case)

**Flow covered:** Use case extension 4a (system error), Add variant

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Fault injection enabled to cause add/save failure (DB/service error/timeout).

**Steps:**
1. Enable the fault condition for add/save.
2. Log in as AdminA and open **Course Offerings Administration**.
3. Select **Add Offering**.
4. Enter valid offering details for O_NEW and submit.
5. Observe error messaging.
6. Disable the fault condition.
7. Verify O_NEW was **not** created (no partial offering present).
8. Optionally retry add after fault removal.

**Expected Results:**
- System reports failure.
- No partial offering is created; catalog/admin list remains unchanged.
- Any partial work is rolled back.
- System state remains consistent.

---

### AT-UC39-06 — System Error During Delete Operation (Extension 4a / Scenario Set “System Error” Delete Case)

**Flow covered:** Use case extension 4a (system error), Delete variant

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- O_EMPTY exists and is eligible for deletion.
- Fault injection enabled to cause delete failure (DB/service error/timeout).

**Steps:**
1. Enable the fault condition for delete.
2. Log in as AdminA and open **Course Offerings Administration**.
3. Select **Delete Offering** for O_EMPTY and confirm.
4. Observe error messaging.
5. Disable the fault condition.
6. Verify O_EMPTY still exists/is still active (no partial deletion).
7. Optionally retry delete after fault removal.

**Expected Results:**
- System reports failure.
- Offering is not deleted/inactivated.
- Any partial work is rolled back.
- System state remains consistent.

---

### AT-UC39-07 — Administrator Cancels Add Offering (Extension 5a — Add Cancel Variant)

**Flow covered:** Extension 5a (cancel action), Add variant

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.

**Steps:**
1. Log in as AdminA.
2. Open **Course Offerings Administration** and select **Add Offering**.
3. Enter offering details but select **Cancel** before submitting.
4. Return to offerings list/catalog view.
5. Verify that no new offering was created.

**Expected Results:**
- System discards unsaved input.
- No offering is created.
- System state remains consistent.

---

### AT-UC39-08 — Administrator Cancels Delete Offering (Extension 5a — Delete Cancel Variant)

**Flow covered:** Extension 5a (cancel action), Delete variant

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- O_EMPTY exists and is eligible for deletion.

**Steps:**
1. Log in as AdminA.
2. Open **Course Offerings Administration**.
3. Select **Delete Offering** for O_EMPTY.
4. When prompted for confirmation, select **Cancel**.
5. Verify O_EMPTY remains present/active.

**Expected Results:**
- System aborts deletion.
- Offering remains unchanged.
- System state remains consistent.

---

## Coverage Summary

This acceptance test suite covers every documented UC-39 flow from the updated use case and scenario file:
- **Main success:** Add offering; Delete offering.
- **Extension 2a:** Delete blocked due to active enrollments.
- **Extension 3a:** Invalid offering data → correction → success.
- **Extension 4a:** System error during add/delete → rollback/no partial changes.
- **Extension 5a:** Administrator cancels add/delete → no changes.

All documented flows are addressed.
