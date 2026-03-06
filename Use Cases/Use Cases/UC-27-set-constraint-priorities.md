# Use Case UC-27: Set constraint priorities

**Goal in Context**: As a student, I want to set priorities to certain constraints over others in the schedule generator, so that the system knows what matters most when tradeoffs exist.
**Scope**: University Student Information System (Registration & Schedule Builder)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Course Catalog Service, Timetable/Schedule Generator Service
**Trigger**: Student assigns priorities/weights to existing constraints.

## Success End Condition
* Constraint priorities are stored and influence schedule generation and ranking.

## Failed End Condition
* No changes are applied (or any partial work is rolled back) and the system state remains consistent.

## Preconditions
* Student is authenticated.
* Registration/scheduling term is available.
* Course catalog data is available for the selected term.

## Main Success Scenario
1. Student opens the constraints editor.
2. Student selects one or more existing constraints.
3. Student assigns a priority/weight to each selected constraint.
4. Student saves priority settings.
5. System stores priorities and uses them during schedule generation/ranking.

## Extensions
* **3a**: Student assigns an invalid priority value (out of range/duplicate levels).
    * 3a1: System rejects the change and requests correction.
* **5a**: System cannot save priority settings.
    * 5a1: System reports failure and leaves prior priorities unchanged.

## Related Information
* **Priority**: Medium
* **Frequency**: Frequent
* **Open Issues**: Priority model (ordinal vs. numeric weights), tie-breaking behavior.
