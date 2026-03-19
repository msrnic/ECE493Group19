# Research: Store Banking Information

## Decision 1: Validation + Network Acceptance Strategy
- Decision: Use two-stage acceptance: local required-field validation first, then banking-network acceptance check before persistence.
- Rationale: Aligns with UC-11 extension 4a and prevents invalid data persistence.
- Alternatives considered: Local-only validation (rejected: weak verification); delayed asynchronous acceptance (rejected: unclear immediate availability state).

## Decision 2: Duplicate Bank Account Handling
- Decision: Reject exact duplicate bank-account methods per student account.
- Rationale: Prevents redundant records and confusion during fee payment selection.
- Alternatives considered: Allow duplicates (rejected: poor UX); auto-merge duplicates (rejected: increased complexity, unclear merge rules).

## Decision 3: Displayed Banking Information
- Decision: Display only holder name and masked account identifier after save.
- Rationale: Minimizes exposure of sensitive information while confirming successful setup.
- Alternatives considered: Display full account number (rejected: security/privacy risk); display no identifier (rejected: weak user confirmation).

## Decision 4: Failure and Cancel State Management
- Decision: Guarantee no database mutation on cancel, validation failure, or banking-network rejection.
- Rationale: Matches UC failed end condition and extension 3a/4a behavior.
- Alternatives considered: Draft-save partial entries (rejected: conflicts with no-change requirement).
