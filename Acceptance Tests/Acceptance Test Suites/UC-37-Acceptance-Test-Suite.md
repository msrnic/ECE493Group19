# Acceptance Test Suite — UC-26: Force Enroll Student Regardless of Prerequisite Compliance

## Scope

Validate that an administrator can **force enroll** a student into a course offering **even when prerequisites are not met**, while still enforcing hard constraints, maintaining system consistency on failure, and creating an audit record for overrides.

---

## Assumptions / Test Data (Design-Level)

- **Administrator AdminA**: authenticated; authorized to manage enrollments.
- **Student S1 (Valid Student)**: exists; eligible identity; not currently enrolled in the target offering.
- **Student S404 (Invalid Student)**: does not exist.
- **Offering O1 (Valid Offering)**: exists; open/valid for the term; has capacity tracking enabled.
- **Offering O404 (Invalid Offering)**: does not exist (or is not resolvable).
- **Prerequisites:** S1 does **not** meet prerequisites for O1 (ensures override is meaningful).
- Environment supports:
  - Detecting hard-constraint violations (e.g., term invalid, inactive student record).
  - Simulating system errors during enrollment persistence (DB error/timeout).
  - Verifying audit logs/records of administrative overrides.
- Testers can verify enrollment outcome via roster/schedule/capacity views and/or database queries (design-level).

---

## Test Cases

### AT-UC26-01 — Force Enroll Overrides Prerequisites (Main Success)

**Flow covered:** Main success scenario (force enroll with audit record)

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Student S1 exists.
- Offering O1 exists and is valid for the term.
- S1 does not meet prerequisites for O1.
- S1 is not enrolled in O1.

**Steps:**
1. Log in as AdminA.
2. Open the course offering management page.
3. Select Offering O1.
4. Select Student S1 and choose **Force Enroll**.
5. Confirm the action if a confirmation prompt is shown.
6. Check enrollment results (e.g., course roster for O1 and/or S1 schedule).
7. Review audit record/log for the override.

**Expected Results:**
- System bypasses prerequisite checks for the force-enroll operation.
- System enrolls S1 into O1.
- Schedule and capacity records are updated accordingly.
- An audit record exists indicating an administrative override.
- System confirms completion to AdminA.

---

### AT-UC26-02 — Student Does Not Exist (Extension 2a — Student Missing)

**Flow covered:** Extension 2a (student does not exist)

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Offering O1 exists and is valid.
- Student S404 does not exist.

**Steps:**
1. Log in as AdminA.
2. Open course offering management for Offering O1.
3. Attempt to force enroll Student S404 (by ID/search).
4. Submit/confirm the force-enroll action.

**Expected Results:**
- System cannot resolve the student record and rejects the request.
- No enrollment is created.
- Capacity/schedule records are unchanged.
- System state remains consistent and an error is shown to AdminA.

---

### AT-UC26-03 — Course Offering Does Not Exist (Extension 2a — Offering Missing)

**Flow covered:** Extension 2a (offering does not exist)

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Student S1 exists.
- Offering O404 does not exist (or is not resolvable).

**Steps:**
1. Log in as AdminA.
2. Attempt to navigate to/select Offering O404 in course offering management.
3. Select Student S1 and attempt **Force Enroll** (if UI allows reaching the action).
4. Submit/confirm the action.

**Expected Results:**
- System rejects the request because the offering cannot be resolved.
- No enrollment is created.
- Capacity/schedule records are unchanged.
- System state remains consistent and an error is shown to AdminA.

---

### AT-UC26-04 — Hard Constraint Fails (Extension 3a)

**Flow covered:** Extension 3a (hard constraint fails even though prerequisites are bypassed)

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Student S1 exists and Offering O1 exists.
- Configure at least one hard constraint violation, such as:
  - Student record is inactive/suspended, **or**
  - Offering term is invalid/closed for enrollment, **or**
  - Identity/term validity check fails per business rules.

**Steps:**
1. Enable the hard constraint violation condition.
2. Log in as AdminA.
3. Open course offering management and select Offering O1.
4. Select Student S1 and choose **Force Enroll**.
5. Submit/confirm the action.
6. Verify enrollment/records.

**Expected Results:**
- System bypasses prerequisite checks but detects the hard constraint failure.
- System rejects the request and provides an appropriate reason.
- No enrollment is created.
- Capacity/schedule records are unchanged.
- System state remains consistent.

---

### AT-UC26-05 — Enrollment Fails Due to System Error (Extension 4a)

**Flow covered:** Extension 4a (system error during enrollment persistence)

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Student S1 exists; Offering O1 exists and is valid.
- S1 is not enrolled in O1.
- Fault injection is enabled to cause enrollment persistence/update failure (DB error/timeout).

**Steps:**
1. Enable the fault condition that causes the enrollment write/update to fail.
2. Log in as AdminA.
3. Open course offering management and select Offering O1.
4. Select Student S1 and choose **Force Enroll**.
5. Submit/confirm the action.
6. Disable the fault condition.
7. Verify that S1 is not enrolled in O1 (roster/schedule/capacity unchanged).
8. Optionally retry force enrollment after fault removal.

**Expected Results:**
- System reports the failure and does not complete the enrollment.
- No partial updates remain (any partial work is rolled back).
- Capacity/schedule records are unchanged.
- System state remains consistent.
- After fault removal, retry can succeed (optional).

---

## Coverage Summary

This acceptance test suite covers every documented UC-26 flow:
- **Main success:** force enroll bypasses prerequisites and creates an audit record.
- **Extension 2a:** student or offering does not exist → request rejected.
- **Extension 3a:** hard constraint fails → request rejected, no changes applied.
- **Extension 4a:** system error during enrollment → no changes applied, failure reported.

All documented flows in UC-26 are addressed.
