# Data Model: View Transaction History (UC-10)

## Entity: StudentAccount

- Description: Authenticated student context used to scope transaction-history access.
- Fields:
  - `studentId` (string, required, unique): canonical student account identifier.
  - `accountStatus` (enum: `Active`, `Suspended`, `Closed`; required): governs access eligibility.
  - `displayName` (string, required): student-facing identifier for UI context.
- Validation Rules:
  - `studentId` must be present and correspond to an authenticated session.
  - Transaction history retrieval is allowed only when `accountStatus = Active`.
- Relationships:
  - One `StudentAccount` to many `FinancialTransactionRecord`.

## Entity: FinancialTransactionRecord

- Description: One historical fee-payment transaction associated with a student account.
- Fields:
  - `transactionId` (string, required, unique): stable transaction reference.
  - `studentId` (string, required): owner account foreign key.
  - `postedAt` (datetime, required): transaction posting timestamp used for ordering.
  - `amount` (decimal, required, > 0): transaction amount.
  - `currency` (string, required): currency code for amount display.
  - `paymentMethodLabel` (string, required): user-facing method label (for example card, bank transfer).
  - `maskedMethodIdentifier` (string, optional): masked instrument suffix/token only.
  - `status` (enum: `Pending`, `Succeeded`, `Failed`, `Reversed`; required): current lifecycle state.
  - `sourceSystem` (enum: `SIS`, `PaymentProcessor`, `BankingNetwork`; required): origin of status confirmation.
- Validation Rules:
  - Record must be in-scope fee-payment transaction.
  - Full payment instrument identifiers must never be stored in display payload fields.
  - Returned result set must include all available in-scope records for the student.
  - Returned records must be ordered by `postedAt` descending by default.
- Relationships:
  - Many `FinancialTransactionRecord` belong to one `StudentAccount`.
  - One `FinancialTransactionRecord` may have one latest `ExternalPaymentConfirmation`.

## Entity: ExternalPaymentConfirmation

- Description: External status evidence used to resolve pending transactions.
- Fields:
  - `confirmationId` (string, required, unique): provider confirmation reference.
  - `transactionId` (string, required): associated transaction.
  - `provider` (enum: `PaymentProcessor`, `BankingNetwork`; required): source authority.
  - `providerStatus` (string, required): provider-native status.
  - `finalStatus` (enum: `Succeeded`, `Failed`, `Reversed`; optional): mapped final outcome.
  - `receivedAt` (datetime, required): timestamp confirmation received.
- Validation Rules:
  - A final status cannot be `Pending`.
  - Confirmation updates must target existing transaction by `transactionId`.
- Relationships:
  - Many confirmations can reference one transaction over time; latest confirmation determines current final status.

## Entity: TransactionHistoryView

- Description: Read-only presentation model for student-facing history page.
- Fields:
  - `studentId` (string, required)
  - `records` (list of `FinancialTransactionRecord`, required)
  - `isEmpty` (boolean, required)
  - `errorState` (enum: `None`, `RetrievalFailed`, `Unauthorized`; required)
  - `generatedAt` (datetime, required)
- Validation Rules:
  - `isEmpty = true` implies `records` is empty and `errorState = None`.
  - `errorState = RetrievalFailed` implies no mutation to persisted transaction/account/course data.

## State Transitions

- `Pending -> Succeeded`
- `Pending -> Failed`
- `Pending -> Reversed`
- `Succeeded -> Reversed` (for post-settlement reversal events)
- `Failed` and `Reversed` are terminal for this feature context.

## Access and Uniqueness Constraints

- Access is limited to authenticated students viewing their own records.
- `transactionId` must be unique across all records.
- Duplicate references from external providers must be de-duplicated to a single logical transaction record in the view.
