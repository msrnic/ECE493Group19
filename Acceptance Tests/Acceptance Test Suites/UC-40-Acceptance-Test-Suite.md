# Acceptance Test Suite — UC-40: Edit Course Capacity for Any Course

## Scope

Validate that an **Administrator** can edit the capacity of a course offering and that the system correctly enforces constraints and failure handling for all documented flows:
- Main success (capacity updated and remaining seats recalculated)
- Extension **3a** (new capacity below current enrollment)
- Extension **4a** (system error during update)

This suite is a **design** (non-executable) and focuses on complete coverage of the documented use case and scenario set.

---

## Assumptions / Test Data (Design-Level)

- **Administrator AdminA**: authenticated; authorized to edit course offerings.
- **Offering O1**: existing course offering with:
  - **Current capacity** = C1 (e.g., 50)
  - **Current enrollment** = E1 (e.g., 30)
- **Offering O2 (Over-enrolled candidate)**: existing course offering with:
  - **Current enrollment** = E2 (e.g., 40)
  - Use a proposed capacity value **C2** where C2 < E2 (e.g., set capacity to 35)
- System tracks and displays **remaining seats** either:
  - directly as a stored field, or
  - derived from capacity − enrollment.
- Environment supports simulating a system error on update (DB/service error/timeout).
- “Recalculate remaining seats” means the UI/derived values reflect the new capacity consistently.

---

## Test Cases

### AT-UC40-01 — Update Capacity Successfully (Main Success)

**Flow covered:** Main success scenario

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Offering O1 exists.
- Enrollment E1 is known and E1 ≤ new capacity.

**Steps:**
1. Log in as AdminA.
2. Open course offering **O1**.
3. Record current values: capacity (C1), enrollment (E1), and remaining seats (R1).
4. Change capacity to a valid new value **C1'** such that C1' ≥ E1 (e.g., C1' = 60).
5. Submit/save the capacity change.
6. Verify the system confirms success.
7. Refresh/re-open O1 and verify capacity and remaining seats.

**Expected Results:**
- System validates the new capacity against current enrollment.
- Capacity is updated to C1'.
- Remaining seats reflect the updated capacity (e.g., R1' = C1' − E1, if derived).
- No unintended offering fields are changed.
- System state remains consistent.

---

### AT-UC40-02 — Reject Capacity Below Current Enrollment (Extension 3a)

**Flow covered:** Extension 3a

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Offering O2 exists with enrollment E2.
- Proposed new capacity C2 is below current enrollment (C2 < E2).

**Steps:**
1. Log in as AdminA.
2. Open course offering **O2**.
3. Record current capacity, enrollment, and remaining seats.
4. Enter a new capacity value **C2** such that C2 < E2 (e.g., E2 = 40, set capacity to 35).
5. Submit/save the change.

**Expected Results:**
- System detects the new capacity is below current enrollment.
- System **rejects** the change (or indicates an override workflow is required, if applicable by policy).
- Capacity remains unchanged.
- Remaining seats remain consistent with the unchanged capacity.
- System state remains consistent.

---

### AT-UC40-03 — Update Fails Due to System Error (Extension 4a)

**Flow covered:** Extension 4a

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Offering O1 exists.
- Fault injection is enabled to cause update failure (DB/service error/timeout).

**Steps:**
1. Enable fault condition to force the capacity update to fail.
2. Log in as AdminA.
3. Open course offering **O1**.
4. Record current capacity and remaining seats.
5. Enter a valid new capacity value and submit/save.
6. Observe error messaging.
7. Disable fault condition.
8. Refresh/re-open O1 and verify the stored capacity and remaining seats.

**Expected Results:**
- System reports failure to AdminA.
- Capacity remains unchanged (or any partial work is rolled back).
- Remaining seats remain consistent with the unchanged capacity.
- System state remains consistent.
- (Optional) After fault removal, a retry can succeed.

---

## Coverage Summary

This acceptance test suite covers every documented UC-40 flow from the updated use case and scenario file:
- **Main success:** capacity updated; remaining seats recalculated.
- **Extension 3a:** capacity below enrollment → rejected (or requires override workflow).
- **Extension 4a:** system error during update → rollback/no change, error reported.

All documented flows are addressed.
