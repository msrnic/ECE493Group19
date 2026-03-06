# Use Case UC-40: Edit course capacity for any course

**Goal in Context**: edit course capacity for any course.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Administrator
**Secondary Actors**: Database
**Trigger**: Administrator selects 'Edit course capacity for any course' in the application.

## Success End Condition
* Course capacity is updated and remaining seats reflect the new value.

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The administrator is authenticated and authorized.

## Main Success Scenario
1. Administrator opens a course offering.
2. Administrator edits the capacity value and submits.
3. System validates the new capacity against current enrollment.
4. System updates capacity and recalculates remaining seats.
5. System confirms the update.

## Extensions
* **3a**: New capacity is below current enrollment.
    * 3a1: System rejects the change or requires a special override per policy.
* **4a**: Update fails.
    * 4a1: System leaves capacity unchanged and reports failure.

## Related Information
* **Priority**: Medium
* **Frequency**: Weekly
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
