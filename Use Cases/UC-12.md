# Use Case UC-12: Store credit card information,

**Goal in Context**: store credit card information,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Payment Processor
**Trigger**: Student selects 'Store credit card information,' in the application.

## Success End Condition
* The system has completed the requested action: store credit card information,. (fees can be paid via credit card)

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The student has a valid account.

## Main Success Scenario
1. Student opens payment methods.
2. Student selects 'Add credit card' and enters card details.
3. System sends card details to the Payment Processor for tokenization.
4. System stores only the token and last-4/expiry metadata.
5. System confirms the credit card payment method is available.

## Extensions
* **3a**: Payment Processor rejects the card.
    * 3a1: System displays the reason (when safe) and allows retry.
* **3b**: Payment Processor is unavailable.
    * 3b1: System asks student to try again later or use another method.

## Related Information
* **Priority**: Medium
* **Frequency**: Occasional
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
