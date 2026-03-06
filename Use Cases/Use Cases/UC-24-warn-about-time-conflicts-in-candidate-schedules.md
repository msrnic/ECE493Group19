# Use Case UC-24: Warn about time conflicts in candidate schedules

**Goal in Context**: As a student, I want the schedule generator to warn me about time conflicts in my candidate schedule, so that I don’t build impossible timetables.
**Scope**: University Student Information System (Registration & Schedule Builder)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Course Catalog Service, Timetable/Schedule Generator Service
**Trigger**: Student generates schedules and requests conflict analysis/warnings.

## Success End Condition
* Any time conflicts in a candidate schedule are identified and displayed to the student.

## Failed End Condition
* No changes are applied (or any partial work is rolled back) and the system state remains consistent.

## Preconditions
* Student is authenticated.
* Registration/scheduling term is available.
* Course catalog data is available for the selected term.

## Main Success Scenario
1. Student generates one or more schedule options.
2. Student selects a schedule option to inspect (or requests analysis while generating).
3. System checks all meetings in the schedule for overlaps (including travel-time rules if applicable).
4. System displays a warning for each detected conflict with the conflicting course components.
5. Student can modify selections or constraints and re-generate if desired.

## Extensions
* **3a**: No conflicts are found.
    * 3a1: System indicates the schedule is conflict-free.
* **3b**: Conflict rules are ambiguous (e.g., unknown meeting times).
    * 3b1: System flags the affected components and indicates that conflict analysis is incomplete.
* **4a**: Timetable data required for conflict detection is unavailable.
    * 4a1: System reports that conflict checking cannot be completed and suggests retrying later.

## Related Information
* **Priority**: High
* **Frequency**: Frequent
* **Open Issues**: Definition of conflict (exact overlap vs. buffer), handling of TBA times.
