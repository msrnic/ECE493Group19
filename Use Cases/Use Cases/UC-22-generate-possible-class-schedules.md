# Use Case UC-22: Generate possible class schedules

**Goal in Context**: As a student, I want to be able to generate a set of possible class schedules based on a selection of courses, so that I can anticipate what my semester will look like based on my circumstances.
**Scope**: University Student Information System (Registration & Schedule Builder)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Course Catalog Service, Timetable/Schedule Generator Service
**Trigger**: Student selects courses and chooses “Generate Schedules.”

## Success End Condition
* System produces one or more feasible schedule options based on selected courses and constraints.
* Schedule options are displayed to the student.

## Failed End Condition
* No changes are applied (or any partial work is rolled back) and the system state remains consistent.

## Preconditions
* Student is authenticated.
* Registration/scheduling term is available.
* Course catalog data is available for the selected term.

## Main Success Scenario
1. Student opens the schedule builder.
2. Student selects a term and chooses a set of desired courses.
3. Student (optionally) configures scheduling constraints.
4. Student selects “Generate Schedules.”
5. System retrieves available sections and meeting times for the selected courses.
6. System generates feasible schedule options and ranks them (if ranking is supported).
7. System displays the generated schedule options to the student.

## Extensions
* **2a**: One or more selected courses have no available sections in the term.
    * 2a1: System informs the student which courses cannot be scheduled and offers to continue with remaining courses.
* **5a**: Schedule generator cannot produce any feasible schedules.
    * 5a1: System informs the student no schedules meet the criteria and suggests relaxing constraints or changing sections/courses.
* **5b**: Catalog/timetable data retrieval fails.
    * 5b1: System reports an error and does not generate schedules.

## Related Information
* **Priority**: High
* **Frequency**: Frequent during planning/registration
* **Open Issues**: Definition of “feasible,” ranking criteria, max search time/limits.
