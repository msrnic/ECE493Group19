# Use Case UC-26: Create custom scheduling constraints

**Goal in Context**: As a student, I want to create custom scheduling constraints (e.g., no classes before 11am, blocked times, filter for a specific professor) in the schedule generator, so that schedules avoid times I cannot attend.
**Scope**: University Student Information System (Registration & Schedule Builder)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Course Catalog Service, Timetable/Schedule Generator Service
**Trigger**: Student opens schedule constraints editor and creates/updates constraints.

## Success End Condition
* Student-defined scheduling constraints are created/updated and available for schedule generation.

## Failed End Condition
* No changes are applied (or any partial work is rolled back) and the system state remains consistent.

## Preconditions
* Student is authenticated.
* Registration/scheduling term is available.
* Course catalog data is available for the selected term.

## Main Success Scenario
1. Student opens the schedule builder.
2. Student opens the constraints editor.
3. Student creates or edits constraints (e.g., no classes before 11am, blocked times, preferred professor).
4. Student saves the constraints.
5. System validates constraint definitions and stores them for use in schedule generation.

## Extensions
* **4a**: Constraint definition is invalid (e.g., time range malformed).
    * 4a1: System rejects the constraint, highlights the error, and requests correction.
* **4b**: Constraint conflicts with another constraint.
    * 4b1: System warns the student and allows them to revise or confirm (per policy).
* **5a**: System cannot save constraints (e.g., service/database error).
    * 5a1: System reports failure and does not persist changes.

## Related Information
* **Priority**: Medium
* **Frequency**: Frequent
* **Open Issues**: Supported constraint types, validation rules, and how constraints impact ranking vs. feasibility.
