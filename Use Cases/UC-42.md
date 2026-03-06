# Use Case UC-42: Send notifications to students’ inboxes,

**Goal in Context**: send notifications to students’ inboxes,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Administrator
**Secondary Actors**: Notification Service
**Trigger**: Administrator selects 'Send notifications to students’ inboxes,' in the application.

## Success End Condition
* Selected students have the message in their inboxes; delivery is logged.

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The administrator has a valid account.

## Main Success Scenario
1. Administrator opens the notifications tool.
2. Administrator selects target students (individuals, course roster, or group) and composes a message.
3. System validates permissions and message content constraints.
4. System delivers the message to each target student’s built-in inbox.
5. System logs delivery status and confirms send completion.

## Extensions
* **2a**: Target selection is invalid/empty.
    * 2a1: System prompts admin to correct the recipient list.
* **4a**: Some deliveries fail.
    * 4a1: System reports partial success and provides a retry option.

## Related Information
* **Priority**: Medium
* **Frequency**: Daily
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
