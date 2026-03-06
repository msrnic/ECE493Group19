# Use Case UC-07: Edit my contact information,

**Goal in Context**: edit my contact information,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Registered User
**Secondary Actors**: Database
**Trigger**: Registered User selects 'Edit my contact information,' in the application.

## Success End Condition
* The system has completed the requested action: edit my contact information,. (my stored information is correct)

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The registered user has a valid account.

## Main Success Scenario
1. Actor opens contact information.
2. System displays current basic and emergency contact information.
3. Actor edits allowed fields and submits changes.
4. System validates formats (email/phone/address) and saves updates.
5. System confirms the updated contact information.

## Extensions
* **3a**: Invalid contact formats.
    * 3a1: System highlights fields requiring correction.
* **4a**: Save fails.
    * 4a1: System does not apply changes and asks actor to retry later.
* **5a**: User cancels or abandons the edit process.
    * 5a1: User selects cancel or navigates away before submitting changes.
    * 5a2: System discards any unsaved modifications.

## Related Information
* **Priority**: Medium
* **Frequency**: Occasional
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
