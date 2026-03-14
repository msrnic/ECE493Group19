# Quickstart: Validate UC-12 End-to-End

## Prerequisites

- Student test account exists and can sign in.
- Payment processor sandbox is configurable for success/rejection/unavailable
  responses.
- Application is running with SQLite configured.

## Scenario 1: Main Success (AT-UC12-01)

1. Sign in as test student.
2. Open Payment Methods.
3. Select Add Credit Card.
4. Enter valid test card details and submit.
5. Confirm success message appears.
6. Confirm stored method appears with only last4 + expiry.
7. Confirm stored method is selectable in fee payment flow.

## Scenario 2: Processor Rejection (AT-UC12-02)

1. Configure processor to reject card.
2. Submit Add Credit Card with rejected test card.
3. Confirm safe rejection message.
4. Confirm no new stored method was added.
5. Retry with valid card and verify success.

## Scenario 3: Processor Unavailable (AT-UC12-03)

1. Configure processor timeout/unavailable fault.
2. Submit Add Credit Card.
3. Confirm unavailability guidance (try later/alternate method).
4. Confirm no new stored method was added.
5. Restore processor availability and retry.

## Expected Outcomes

- UC-12 main and extension flows pass.
- No full PAN storage or display is observed.
- Duplicate active entries for the same token are not created.
