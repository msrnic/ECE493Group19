# Use Case UC-11: Store banking information,

**Goal in Context**: store banking information,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Banking Network
**Trigger**: Student selects 'Store banking information,' in the application.

## Success End Condition
* The system has completed the requested action: store banking information,. (fees can be paid by contacting my bank)

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The student has a valid account.

## Main Success Scenario
1. Student opens payment methods.
2. System displays existing payment methods (if any).
3. Student selects 'Add bank account' and enters banking details.
4. System validates required fields and stores the banking information securely.
5. System confirms the bank payment method is available for fee payments.

## Extensions
* **3a**: Student cancels entry.
    * 3a1: System returns to payment methods without saving.
* **4a**: Validation fails or banking info is rejected.
    * 4a1: System displays an error and requests corrections.

## Related Information
* **Priority**: Medium
* **Frequency**: Occasional
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
