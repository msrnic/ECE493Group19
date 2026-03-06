# UC-22 Acceptance Test Suite — Generate Possible Class Schedules

## Scope
Validate that a **Student** can generate feasible schedule options based on selected courses and constraints, and that all documented alternate/exception flows behave correctly:
- Main Success: generate and display one or more feasible schedules
- Extension **2a**: one or more selected courses have no available sections (continue with remaining courses)
- Extension **5a**: no feasible schedules can be produced (guidance to adjust constraints/courses)
- Extension **5b**: catalog/timetable data retrieval fails (error shown; no generation)

This suite is a **design** (non-executable).

---

## Assumptions / Test Data (Design-Level)
- **Student S1**: authenticated.
- **Term T1**: available for planning.
- **Courses / sections**:
  - **Course set C_FEASIBLE**: selected courses with at least one feasible combination of sections in T1.
  - **Course set C_PARTIAL**: includes at least one course with **no available sections** in T1 and at least one other course with sections.
  - **Course set C_INFEASIBLE**: courses/constraints that result in **zero feasible schedules** (e.g., forced time conflicts or overly strict constraints).
- **Constraints** (if supported): e.g., no classes before 10am, no Fridays, minimize gaps.
- Environment supports fault injection for:
  - **Catalog/timetable retrieval failure** (timeout/service error) to exercise extension 5b.

---

## Test Cases

### AT-UC22-01 — Generate Feasible Schedules Successfully (Main Success)
**Flow covered:** Main Success

**Preconditions:**
- System is online.
- S1 authenticated.
- Term T1 available.
- Catalog/timetable services healthy.
- C_FEASIBLE selected, and at least one feasible schedule exists.

**Steps:**
1. Log in as **S1**.
2. Open the **Schedule Builder**.
3. Select **Term T1**.
4. Select courses in **C_FEASIBLE**.
5. (Optional) Add constraints that still allow feasibility.
6. Select **Generate Schedules**.
7. Verify system retrieves sections/meeting times.
8. Verify one or more schedules are generated and displayed (and ranked if ranking is supported).

**Expected Results:**
- One or more feasible schedules are displayed.
- Each schedule shows key details (days/times, selected sections).
- No enrollment changes occur (planning-only).

---

### AT-UC22-02 — Selected Course Has No Available Sections → Continue With Remaining (Extension 2a)
**Flow covered:** Extension 2a

**Preconditions:**
- System is online.
- S1 authenticated.
- Term T1 available.
- C_PARTIAL selected: includes at least one course with no sections and at least one course with sections.

**Steps:**
1. Open **Schedule Builder** and select **T1**.
2. Select courses in **C_PARTIAL**.
3. Select **Generate Schedules**.
4. Verify system identifies the unschedulable course(s) and informs S1.
5. Choose **Continue** to proceed with remaining courses.
6. Verify schedules are generated (if feasible) for the remaining courses and displayed.

**Expected Results:**
- Unschedulable course(s) are clearly identified.
- Schedules are generated for remaining courses (if feasible).
- No enrollment changes occur.

---

### AT-UC22-03 — No Feasible Schedules Produced (Extension 5a)
**Flow covered:** Extension 5a

**Preconditions:**
- System is online.
- S1 authenticated.
- Term T1 available.
- C_INFEASIBLE selected and/or constraints configured so no schedule is feasible.

**Steps:**
1. Open **Schedule Builder** and select **T1**.
2. Select courses/constraints that make schedules infeasible (**C_INFEASIBLE**).
3. Select **Generate Schedules**.
4. Verify system reports that no schedules meet the criteria.
5. Verify system suggests next steps (relax constraints, change sections/courses, etc.).
6. (Optional) Adjust constraints/courses and retry to confirm schedules can be generated when feasible.

**Expected Results:**
- No schedules are displayed as valid results.
- Student receives actionable guidance to resolve infeasibility.
- System state remains consistent (planning-only).

---

### AT-UC22-04 — Catalog/Timetable Data Retrieval Fails (Extension 5b)
**Flow covered:** Extension 5b

**Preconditions:**
- System is online.
- S1 authenticated.
- Term T1 available.
- Fault injection enabled to fail catalog/timetable retrieval.

**Steps:**
1. Enable fault: catalog/timetable retrieval fails.
2. Open **Schedule Builder**, select **T1**, and choose any course set.
3. Select **Generate Schedules**.
4. Verify system reports an error and does not generate schedules.
5. Verify no partial results are presented as complete (unless explicitly labeled as partial—behavior not documented here).
6. Disable fault and optionally retry generation to confirm recovery.

**Expected Results:**
- Error is displayed clearly.
- No schedules are generated during the failure.
- System remains consistent (no enrollment changes; no partial state committed).

---

## Coverage Summary
Covers Main Success + Extensions **2a**, **5a**, and **5b** (all documented flows).
