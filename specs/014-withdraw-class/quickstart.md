# Quickstart Validation: Withdraw from a Class (UC-14)

## Preconditions
- Student account exists and is authenticated.
- Student is enrolled in test offering `O_ENROLLED`.
- Fault injection can simulate withdrawal update failure.

## Main Flow Validation (AT-UC14-01)
1. Open current schedule and select Withdraw for `O_ENROLLED`.
2. Confirm implication summary includes transcript notation and fees.
3. Confirm withdrawal.
4. Verify confirmation shown and class removed from schedule.

## Cancel Flow Validation (AT-UC14-02)
1. Open Withdraw for `O_ENROLLED`.
2. Choose Cancel at confirmation step.
3. Verify class remains in schedule and no withdrawal entry created.

## Failure Flow Validation (AT-UC14-03)
1. Enable withdrawal processing fault.
2. Attempt and confirm withdrawal for `O_ENROLLED`.
3. Verify clear failure feedback and class remains enrolled.
4. Disable fault and retry to verify recovery.

## Additional Checks
- Validate duplicate confirm submissions are idempotent.
- Validate concurrent state change returns safe already-removed feedback.
- Confirm protected files in `Use Cases/` and `Acceptance Tests/` are unchanged.
