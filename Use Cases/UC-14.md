# Use Case UC-14: Withdraw from a class,

**Goal in Context**: withdraw from a class,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Database
**Trigger**: Student selects 'Withdraw from a class,' in the application.

## Success End Condition
* The system has completed the requested action: withdraw from a class,. (it is no longer a part of my schedule (regardless of when this occurs))

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The student has a valid account.

## Main Success Scenario
1. Student opens their current schedule.
2. Student selects a class and chooses 'Withdraw'.
3. System displays withdrawal implications (e.g., transcript notation, fees).
4. Student confirms withdrawal.
5. System updates the schedule and records the withdrawal.

## Extensions
* **4a**: Student cancels the withdrawal.
    * 4a1: System leaves schedule unchanged.
* **5a**: System cannot process withdrawal.
    * 5a1: System leaves schedule unchanged and informs student.

## Related Information
* **Priority**: High
* **Frequency**: Occasional
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
