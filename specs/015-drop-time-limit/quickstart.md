# Quickstart Validation: Time Limit for Dropping from a Class (UC-15)

## Preconditions
- Student account exists and can authenticate.
- Term `T1` has configured deadline `D1`.
- Test environment can simulate times before and after `D1`.
- Fault injection available for deadline retrieval/evaluation.

## Before Deadline Validation (AT-UC15-01)
1. Set time before `D1`.
2. Open Add/Drop Deadlines or drop entry page.
3. Verify deadline displays correctly.
4. Verify drop action is allowed.

## After Deadline Validation (AT-UC15-02)
1. Set time after `D1`.
2. Open Add/Drop Deadlines or drop entry page.
3. Verify deadline shown as passed.
4. Attempt drop and verify block with clear explanation.

## Error Flow Validation (AT-UC15-03)
1. Enable deadline retrieval/evaluation fault.
2. Open deadline/drop page.
3. Verify cannot-confirm-deadline message shown.
4. Verify no schedule change occurs and drop action remains blocked.
5. Disable fault and verify recovery.

## Additional Checks
- Confirm strict cutoff behavior at exact cutoff timestamp.
- Confirm display timezone and evaluation timezone are consistent.
- Confirm protected files in `Use Cases/` and `Acceptance Tests/` are unchanged.
