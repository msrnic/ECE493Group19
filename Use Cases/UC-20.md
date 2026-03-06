# Use Case UC-20: View my course history,

**Goal in Context**: view my course history,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Database
**Trigger**: Student selects 'View my course history,' in the application.

## Success End Condition
* Requested information is displayed to the actor.

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The student has a valid account.

## Main Success Scenario
1. Actor navigates to the relevant page from the dashboard.
2. System retrieves the requested data from storage/services.
3. System displays the information with appropriate formatting and access controls.

## Extensions
* **2a**: Requested data is unavailable or incomplete.
    * 2a1: System displays what is available and indicates missing items.
* **2b**: Actor is not authorized to view the data.
    * 2b1: System denies access and logs the authorization failure.

## Related Information
* **Priority**: Medium
* **Frequency**: Weekly
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
