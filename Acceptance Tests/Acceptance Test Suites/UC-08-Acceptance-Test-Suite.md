# Acceptance Test Suite — UC-08: View Enrollment Capacity and Remaining Seats for My Courses

## Scope

Validate that a registered user can view enrollment capacity and remaining seats for their relevant course(s), and that the system correctly handles the documented degraded flow when some capacity/seat data is unavailable or incomplete.

---

## Assumptions / Test Data (Design-Level)

- **Registered User A**: active account; authenticated; authorized to view capacity/remaining seats for their courses.
- User A is associated with at least one “relevant course” in the UI context (e.g., currently enrolled course list, current schedule, or course details pages accessible to the user).
- Capacity/seat data fields include (at minimum):
  - Course capacity
  - Current enrollment count and/or remaining seats
- The environment supports simulating:
  - Missing capacity value for a course
  - Missing enrollment count / remaining seats for a course
  - Partial service failure (Course Catalog Service returns partial results)
  - Timeout or error from the data source for one or more courses
- This use case is **read-only**: viewing capacity/seats must not modify any stored data.

---

## Test Cases

### AT-UC08-01 — View Enrollment Capacity and Remaining Seats (Main Success)

**Flow covered:** Main success flow (requested information is displayed)

**Preconditions:**
- System is online.
- Registered User A has a valid account and is authenticated.
- Capacity/enrollment data exists and is available for the relevant course(s).

**Steps:**
1. Log in as Registered User A.
2. From the dashboard, navigate to the course list / schedule / course details area that provides capacity/remaining seats.
3. Select a course (or view a list) where capacity and enrollment information should be shown.
4. Observe the displayed capacity and remaining seats values.

**Expected Results:**
- System retrieves requested data from storage/services.
- System displays capacity and remaining seats (or capacity + enrollment count from which remaining seats are derived).
- Display is correctly formatted and visible to the user.
- No updates are applied to course or enrollment records (read-only operation).
- System state remains consistent.

---

### AT-UC08-02 — Capacity/Seat Data Unavailable or Incomplete (Extension 2a)

**Flow covered:** Extension 2a (requested data is unavailable or incomplete → system displays what is available and indicates missing items)

**Preconditions:**
- System is online.
- Registered User A has a valid account and is authenticated.
- For at least one relevant course, capacity/seat data is missing or cannot be retrieved (e.g., capacity missing OR enrollment count missing OR service returns partial data).

**Steps:**
1. Configure test state so that at least one relevant course has incomplete/unavailable capacity/seat data (e.g., remove capacity value for Course X or simulate partial Course Catalog Service failure).
2. Log in as Registered User A.
3. Navigate to the capacity/remaining seats view from the dashboard.
4. Observe the capacity/remaining seats display across all relevant courses.

**Expected Results:**
- System displays available capacity/seat information for courses where data is available.
- For courses/fields where data is missing or unavailable, the system clearly indicates the missing items (e.g., “Remaining seats unavailable”).
- The page does not crash or show unhandled errors.
- No data is modified (read-only operation).
- System state remains consistent.

---

## Coverage Summary

This acceptance test suite covers every documented UC-08 flow:
- **Main success flow:** requested capacity/remaining seats information is displayed.
- **Extension 2a:** data unavailable/incomplete → system shows what it can and indicates missing items.

All documented flows in UC-08 are addressed.
