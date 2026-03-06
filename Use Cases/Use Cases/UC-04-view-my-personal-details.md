# Use Case UC-04: View my personal details,

**Goal in Context**: view my personal details,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Registered User
**Secondary Actors**: Database
**Trigger**: Registered User selects 'View my personal details,' in the application.

## Success End Condition
* Requested information is displayed to the actor.

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The registered user has a valid account.

## Main Success Scenario
1. Actor navigates to the relevant page from the dashboard.
2. System retrieves the requested data from storage/services.
3. System displays the information with appropriate formatting and access controls.

## Extensions
* **2a**: Requested data is unavailable or incomplete.
    * 2a1: System displays what is available and indicates missing items.

## Related Information
* **Priority**: Medium
* **Frequency**: Occasional
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
