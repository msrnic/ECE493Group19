# Use Case UC-36: View a summary of submitted grades,

**Goal in Context**: view a summary of submitted grades,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Professor
**Secondary Actors**: Academic Records Service
**Trigger**: Professor selects 'View a summary of submitted grades,' in the application.

## Success End Condition
* Requested information is displayed to the actor.

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The professor has a valid account.
* The professor is assigned to the course offering.

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
* **Priority**: High
* **Frequency**: Weekly
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
