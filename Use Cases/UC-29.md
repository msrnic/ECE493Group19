# Use Case UC-29: Auto-pick compatible lecture/lab/tutorial combinations

**Goal in Context**: As a student, I want the schedule generator to automatically pick the correct lecture/lab/tutorial combinations, so that I don’t accidentally enroll in incompatible sections.
**Scope**: University Student Information System (Registration & Schedule Builder)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Course Catalog Service, Timetable/Schedule Generator Service
**Trigger**: Student generates schedules including courses with multiple component types (lecture/lab/tutorial).

## Success End Condition
* Generated schedules only include compatible lecture/lab/tutorial combinations for each course.

## Failed End Condition
* No changes are applied (or any partial work is rolled back) and the system state remains consistent.

## Preconditions
* Student is authenticated.
* Registration/scheduling term is available.
* Course catalog data is available for the selected term.

## Main Success Scenario
1. Student selects courses that have required component types (lecture/lab/tutorial).
2. Student selects “Generate Schedules.”
3. System retrieves section offerings and linkage rules (e.g., lab must match lecture).
4. System generates schedules ensuring component compatibility for each course.
5. System displays schedule options with correctly paired components.

## Extensions
* **3a**: No compatible component combinations exist for a selected course.
    * 3a1: System informs the student and offers to remove or change the course/sections.
* **4a**: Linkage rules are missing or inconsistent.
    * 4a1: System reports it cannot ensure compatibility and blocks generation (or flags results) per policy.
* **5a**: System error occurs during generation.
    * 5a1: System reports failure and returns no schedules (or partial schedules) per policy.

## Related Information
* **Priority**: High
* **Frequency**: Frequent
* **Open Issues**: Definition/source of compatibility rules, how cross-listed components are handled.
