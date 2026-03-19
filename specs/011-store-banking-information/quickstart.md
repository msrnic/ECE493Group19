# Quickstart: Store Banking Information (UC-11)

## Preconditions
- System is online.
- Student has a valid account.
- User is signed in as student.

## Scenario A: Successful Add Bank Account
1. Open payment methods.
2. Confirm existing methods are shown.
3. Select "Add bank account".
4. Enter valid holder name, routing identifier, and account identifier.
5. Submit.
6. Verify confirmation appears and bank method is available for fee payments.
7. Verify only masked account identifier is displayed.

## Scenario B: Validation Failure
1. Open "Add bank account".
2. Submit with missing/invalid required fields.
3. Verify validation errors are shown.
4. Verify no banking method is saved.

## Scenario C: Network Rejection
1. Open "Add bank account".
2. Submit syntactically valid details that are rejected by banking network.
3. Verify rejection message appears.
4. Verify no banking method is saved.

## Scenario D: Cancel Flow
1. Open "Add bank account".
2. Enter any values.
3. Select cancel.
4. Verify return to payment methods and no saved changes.
