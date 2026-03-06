# Use Case UC-16: Force class drop priority over class withdrawal,

**Goal in Context**: force class drop priority over class withdrawal,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Database
**Trigger**: Student selects 'Force class drop priority over class withdrawal,' in the application.

## Success End Condition
* System applies drop when permitted, minimizing unnecessary fees; otherwise applies withdrawal.

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The student has a valid account.

## Main Success Scenario
1. Student initiates removal of a class from their schedule.
2. System determines whether the action qualifies as a 'drop' (within deadline) or 'withdrawal' (after deadline).
3. System selects 'drop' when allowed, otherwise defaults to 'withdrawal'.
4. System applies the chosen action and updates fees accordingly.
5. System confirms the result to the student.

## Extensions
* **2a**: Deadline/policy data cannot be determined.
    * 2a1: System blocks the action and requests administrative assistance.
* **4a**: Update fails.
    * 4a1: System leaves schedule unchanged and informs student.

## Related Information
* **Priority**: High
* **Frequency**: Occasional
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
