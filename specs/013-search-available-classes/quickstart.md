# Quickstart Validation: Search for Available Classes (UC-13)

## Preconditions
- Student account exists and can authenticate.
- Course catalog has known matching query `Q_MATCH`.
- Fault injection can simulate catalog timeout/error.

## Main Flow Validation (AT-UC13-01)
1. Log in as student.
2. Open Search for available classes from dashboard.
3. Submit `Q_MATCH` with default active term.
4. Confirm result list displays expected matching class.
5. Open result details and verify offering information.

## Failure Flow Validation (AT-UC13-02)
1. Enable catalog fault (timeout or 500 equivalent).
2. Submit any class search query.
3. Confirm clear failure message is displayed.
4. Confirm no stale/incorrect results are shown as current.
5. Disable fault and confirm recovery search works.

## Additional Checks
- Validate sort order: earliest meeting availability, then course code.
- Validate seat availability includes last-updated timestamp.
- Confirm no protected files in `Use Cases/` or `Acceptance Tests/` changed.
