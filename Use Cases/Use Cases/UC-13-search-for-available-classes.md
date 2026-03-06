# Use Case UC-13: Search for available classes,

**Goal in Context**: search for available classes,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Course Catalog Service
**Trigger**: Student selects 'Search for available classes,' in the application.

## Success End Condition
* The system has completed the requested action: search for available classes,. (I can find the class I am interested in)

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The student has a valid account.

## Main Success Scenario
1. Actor initiates the use case from the dashboard.
2. System performs the requested action.
3. System confirms completion.

## Extensions
* **2a**: System error occurs.
    * 2a1: System reports failure and leaves state unchanged.

## Related Information
* **Priority**: Medium
* **Frequency**: Daily
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
