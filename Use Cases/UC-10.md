# Use Case UC-10: Records of past financial transactions,

**Goal in Context**: records of past financial transactions,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Payment Processor, Banking Network
**Trigger**: Student selects 'Records of past financial transactions,' in the application.

## Success End Condition
* The system has completed the requested action: records of past financial transactions,. (I can confirm that payments were successful)

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
* **Frequency**: Occasional
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
