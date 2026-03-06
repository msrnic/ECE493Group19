# Use Case UC-01: Change my password

**Goal in Context**: change my password.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Registered User
**Secondary Actors**: Authentication Service, Email/SMS Service (optional)
**Trigger**: Registered User selects 'Change my password' in the application.

## Success End Condition
* Password is updated and future logins require the new password.

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The registered user has a valid account.
* The actor is authenticated OR has initiated a password reset flow.

## Main Success Scenario
1. Actor opens account security settings.
2. System prompts for current password (or verifies reset token) and a new password.
3. Actor provides required information and submits.
4. System validates password policy and confirms actor identity.
5. System updates the password and confirms completion.

## Extensions
* **3a**: Current password/reset token is invalid or expired.
    * 3a1: System rejects the request and provides recovery options.
* **4a**: New password fails policy checks.
    * 4a1: System explains requirements and asks for a new password.
* **5a**: Update fails due to system error.
    * 5a1: System keeps old password unchanged and informs actor to retry later.
* **6a**: User cancels or abandons the change password process.
    * 6a1: User navigates away or selects cancel before submitting.
    * 6a2: System discards any unsaved input and makes no changes.

## Related Information
* **Priority**: Medium
* **Frequency**: Occasional
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
