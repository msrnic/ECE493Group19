# Use Case UC-19: Receive notifications in a built-in inbox,

**Goal in Context**: receive notifications in a built-in inbox,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Notification Service
**Trigger**: System detects an event requiring student notification.

## Success End Condition
* Notification is available in the student’s built-in inbox.

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The student has a valid account.

## Main Success Scenario
1. A relevant event occurs (course update, grade update, academic standing change).
2. System generates a notification addressed to the student.
3. System delivers the notification to the student’s built-in inbox.
4. Student opens the inbox to view the notification.

## Extensions
* **3a**: Delivery fails.
    * 3a1: System retries delivery and logs the failure.
* **4a**: Student has disabled or restricted inbox access.
    * 4a1: System stores notification for later viewing and shows status when possible.

## Related Information
* **Priority**: Medium
* **Frequency**: Daily
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
