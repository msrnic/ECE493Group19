# Use Case UC-25: Enroll in all courses from a chosen schedule option

**Goal in Context**: As a student, I want to enroll in all courses from a chosen schedule option with one action, so that enrollment is fast and consistent.
**Scope**: University Student Information System (Registration & Schedule Builder)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Enrollment Service, Payment/Holds Service, Course Catalog Service
**Trigger**: Student selects a generated schedule option and chooses “Enroll All”.

## Success End Condition
* Student is enrolled in all enrollable sections from the chosen schedule option.
* System reports any sections that could not be enrolled and why.

## Failed End Condition
* No changes are applied (or any partial work is rolled back) and the system state remains consistent.

## Preconditions
* Student is authenticated and eligible to enroll in the term.
* Student has selected a schedule option containing specific section selections.
* Enrollment period is open.

## Main Success Scenario
1. Student selects a schedule option.
2. Student chooses “Enroll All.”
3. System validates enrollment eligibility (holds, term rules).
4. System attempts to enroll the student in each section in the schedule (lecture/lab/tutorial as applicable).
5. System confirms enrollments and displays a summary of successes/failures.

## Extensions
* **4a**: One or more sections are full at enrollment time.
    * 4a1: System enrolls the remaining sections where possible and reports which ones failed due to capacity.
* **4b**: Enrollment causes a time conflict due to real-time changes.
    * 4b1: System prevents conflicting enrollments, reports the conflict, and preserves a consistent state.
* **4c**: Enrollment fails due to holds/prerequisites for one or more sections.
    * 4c1: System rejects the affected enrollments and reports the reasons; other enrollments proceed only if safe.
* **5a**: System error occurs during batch enrollment.
    * 5a1: System rolls back partial enrollment where required to preserve consistency and reports failure.

## Related Information
* **Priority**: High
* **Frequency**: Occasional to Frequent during registration
* **Open Issues**: Atomicity rules (all-or-nothing vs. best-effort), waitlist integration, transaction/rollback behavior.
