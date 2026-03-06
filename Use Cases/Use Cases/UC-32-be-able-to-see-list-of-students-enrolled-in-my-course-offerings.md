# Use Case UC-32: Be able to see list of students enrolled in my course offerings

**Goal in Context**: be able to see list of students enrolled in my course offerings.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Professor
**Secondary Actors**: Course Catalog Service, Prerequisite/Rules Engine
**Trigger**: Professor selects 'Be able to see list of students enrolled in my course offerings' in the application.

## Success End Condition
* The system has completed the requested action: be able to see list of students enrolled in my course offerings.

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The professor has a valid account.

## Main Success Scenario
1. Student finds a class offering (e.g., via search).
2. Student selects 'Enroll' for the chosen offering.
3. System checks eligibility (holds, prerequisites, schedule conflicts, and capacity).
4. System enrolls the student and updates the student’s schedule.
5. System confirms enrollment and any resulting fee assessment changes.

## Extensions
* **3a**: Prerequisites are not met.
    * 3a1: System blocks enrollment and displays unmet prerequisites.
* **3b**: Course is full.
    * 3b1: System blocks enrollment and displays remaining-seat information.
* **3c**: Student has a registration hold.
    * 3c1: System blocks enrollment and explains the hold.
* **4a**: Enrollment fails due to system error.
    * 4a1: System leaves schedule unchanged and asks student to retry.

## Related Information
* **Priority**: High
* **Frequency**: Occasional
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
