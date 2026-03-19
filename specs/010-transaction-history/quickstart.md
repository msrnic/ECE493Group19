# Quickstart: View Transaction History (UC-10)

## 1. Preconditions

- Work on branch `010-transaction-history`.
- Do not edit protected artifacts:
  - `Use Cases/UC-*.md`
  - `Acceptance Tests/UC-*-AS.md`
- Reference style guides:
  - `Style Guides/google-style-guide-html-css.md`
  - `Style Guides/google-style-guide-javascript.md`

## 2. Implement by MVC responsibility

- Model:
  - Add/extend transaction-history read model using SQLite-backed fee-payment records.
  - Enforce status domain: `Pending`, `Succeeded`, `Failed`, `Reversed`.
- Controller:
  - Add read-only retrieval action for student transaction history.
  - Enforce student ownership and authenticated access.
  - Return explicit retrieval error without mutating state.
- View:
  - Render newest-first list of all available in-scope fee-payment records.
  - Show payment method label plus masked identifier only.
  - Render clear empty state and retrieval-failure state.

## 3. Contract alignment

- Implement endpoint behavior matching:
  - `contracts/transaction-history.openapi.yaml`
- Verify response guarantees:
  - In-scope fee records only
  - Full available history
  - Newest-first ordering
  - Pending/final status visibility

## 4. Validation checklist

- Map tests to UC artifacts:
  - `Use Cases/UC-10.md`
  - `Acceptance Tests/UC-10-AS.md`
- Validate scenarios:
  - Main success: records visible with confirmation details
  - Empty state: clear no-records message
  - Failure extension 2a: error shown, no state change, retry works
- Validate privacy:
  - No full payment instrument identifiers in UI or API responses

## 5. Suggested execution sequence

1. Implement model read/query rules and status mapping.
2. Implement controller retrieval/error handling.
3. Implement view rendering for normal/empty/error states.
4. Run unit/integration/contract tests.
5. Run acceptance scenario walkthrough for UC-10 and UC-10-AS.
