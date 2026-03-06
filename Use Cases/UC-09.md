# Use Case UC-09: View a financial information dashboard,

**Goal in Context**: view a financial information dashboard,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Payment Processor, Banking Network
**Trigger**: Actor completes login and is routed to the dashboard.

## Success End Condition
* Actor sees a dashboard and can navigate to permitted features.

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The student has a valid account.

## Main Success Scenario
1. Actor logs in successfully.
2. System retrieves the actor’s role(s) and relevant modules.
3. System displays the main dashboard with navigation to available features.

## Extensions
* **2a**: Actor has no assigned roles/modules.
    * 2a1: System displays a minimal dashboard and an admin-contact message.
* **2b**: System cannot load dashboard data.
    * 2b1: System displays a partial dashboard and indicates unavailable sections.

## Related Information
* **Priority**: Medium
* **Frequency**: Daily
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
