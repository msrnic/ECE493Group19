# Use Case UC-23: Request multiple schedule results

**Goal in Context**: As a student, I want to request multiple schedule results (e.g., top 10), so that I have alternatives if one section fills up.
**Scope**: University Student Information System (Registration & Schedule Builder)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Course Catalog Service, Timetable/Schedule Generator Service
**Trigger**: Student requests more than one schedule result (e.g., top 10) in the generator.

## Success End Condition
* System returns the requested number of distinct schedule options (up to system limits).
* Results are displayed and can be reviewed.

## Failed End Condition
* No changes are applied (or any partial work is rolled back) and the system state remains consistent.

## Preconditions
* Student is authenticated.
* Registration/scheduling term is available.
* Course catalog data is available for the selected term.

## Main Success Scenario
1. Student opens the schedule builder with selected courses.
2. Student sets the desired number of results (e.g., 10).
3. Student selects “Generate Schedules.”
4. System generates and ranks schedule options.
5. System displays up to the requested number of schedule options.

## Extensions
* **2a**: Requested number exceeds system maximum.
    * 2a1: System caps the request to the maximum and informs the student.
* **5a**: Fewer feasible schedules exist than requested.
    * 5a1: System returns all feasible schedules found and informs the student of the reduced count.
* **4a**: Schedule generation times out or exceeds compute limits.
    * 4a1: System returns partial results if available, otherwise reports failure and suggests narrowing choices.

## Related Information
* **Priority**: Medium
* **Frequency**: Frequent
* **Open Issues**: System max results, pagination, and ranking stability across runs.
