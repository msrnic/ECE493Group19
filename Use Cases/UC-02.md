# Use Case UC-02: Be able to login

**Goal in Context**: be able to login.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Registered User
**Secondary Actors**: Authentication Service
**Trigger**: Actor attempts to access the application and is prompted to authenticate.

## Success End Condition
* Actor is authenticated and can access account functions.

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The actor has a valid account.
* The actor is not currently logged in.

## Main Success Scenario
1. Actor navigates to the login page.
2. Actor enters credentials (e.g., username/email and password).
3. System validates credentials with the Authentication Service.
4. System establishes a session and loads the actor’s main dashboard.

## Extensions
* **3a**: Credentials are invalid.
    * 3a1: System displays an error and allows retry.
    * 3a2: After repeated failures, system may temporarily lock the account.
* **3b**: Account is locked or disabled.
    * 3b1: System informs actor and provides next steps (e.g., contact support).
* **3c**: Authentication Service is unavailable.
    * 3c1: System displays a service-unavailable message and logs the failure.

## Related Information
* **Priority**: High
* **Frequency**: Daily
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
