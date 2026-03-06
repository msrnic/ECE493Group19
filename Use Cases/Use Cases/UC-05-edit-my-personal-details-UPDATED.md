# Use Case UC-05: Edit my personal details,

**Goal in Context**: edit my personal details,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Registered User
**Secondary Actors**: Database
**Trigger**: Registered User selects 'Edit my personal details,' in the application.

## Success End Condition
* The system has completed the requested action: edit my personal details,. (my stored information is correct)

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The registered user has a valid account.

## Main Success Scenario
1. Actor opens personal details.
2. System displays current stored personal details.
3. Actor edits allowed fields and submits changes.
4. System validates the data and saves updates.
5. System confirms the updated personal details.

## Extensions
* **3a**: Actor submits invalid data (e.g., missing required fields).
    * 3a1: System highlights errors and requests correction.
* **4a**: Save fails due to system error.
    * 4a1: System does not apply changes and informs actor to retry.
* **6a**: User cancels or abandons the edit process.
    * 6a1: User selects cancel or navigates away before submitting changes.
    * 6a2: System discards any unsaved modifications.

## Related Information
* **Priority**: Medium
* **Frequency**: Occasional
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
