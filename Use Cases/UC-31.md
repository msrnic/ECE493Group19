# Use Case UC-31: Show violated constraints in best-effort schedules

**Goal in Context**: As a student, I want to see which constraints were violated (if any) in “best-effort” schedules, so that I can decide if exceptions are acceptable.
**Scope**: University Student Information System (Registration & Schedule Builder)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Course Catalog Service, Timetable/Schedule Generator Service
**Trigger**: Student views a best-effort schedule result and requests violated-constraints details.

## Success End Condition
* For a best-effort schedule, the system identifies and displays which constraints were violated and how.

## Failed End Condition
* No changes are applied (or any partial work is rolled back) and the system state remains consistent.

## Preconditions
* Student is authenticated.
* Registration/scheduling term is available.
* Course catalog data is available for the selected term.

## Main Success Scenario
1. Student generates schedules with constraints enabled.
2. System returns one or more best-effort schedules (not all constraints satisfied).
3. Student selects a best-effort schedule option.
4. Student requests details on constraint satisfaction (or system shows by default).
5. System lists violated constraints and describes each violation.

## Extensions
* **2a**: No constraints were violated for the selected schedule.
    * 2a1: System indicates all constraints were satisfied.
* **4a**: Constraint evaluation cannot be completed (missing timetable data).
    * 4a1: System flags the evaluation as incomplete and indicates which parts are unknown.
* **5a**: System error occurs while evaluating constraints.
    * 5a1: System reports failure and does not display violation details.

## Related Information
* **Priority**: Medium
* **Frequency**: Occasional
* **Open Issues**: Definition of best-effort, constraint evaluation precision, and UI for explanations.
