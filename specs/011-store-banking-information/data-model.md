# Data Model: Store Banking Information

## Entity: StudentPaymentProfile
- Purpose: Aggregates all payment methods for a student and supports fee payment method availability.
- Key Fields:
  - `student_id` (unique identifier)
  - `has_bank_method` (derived availability flag)
  - `updated_at`
- Relationships:
  - One `StudentPaymentProfile` has many `BankAccountPaymentMethod` records.

## Entity: BankAccountPaymentMethod
- Purpose: Represents a stored bank-account payment method for fee payments.
- Key Fields:
  - `payment_method_id` (unique identifier)
  - `student_id` (foreign key)
  - `bank_holder_name`
  - `routing_identifier`
  - `account_identifier_masked`
  - `account_identifier_fingerprint` (for duplicate detection)
  - `status` (`pending_validation`, `active`, `rejected`)
  - `created_at`
  - `updated_at`
- Validation Rules:
  - Required fields: holder name, routing identifier, account identifier.
  - Must pass local validation and banking-network acceptance before `active`.
  - Duplicate fingerprint for same `student_id` is not allowed.

## Entity: BankingValidationResult
- Purpose: Captures result of local+network validation during add-bank flow.
- Key Fields:
  - `request_id`
  - `student_id`
  - `result` (`accepted`, `validation_error`, `network_rejected`)
  - `field_errors` (zero or more)
  - `rejection_reason` (optional)
  - `evaluated_at`

## State Transitions
- `pending_validation` -> `active` when local and network checks pass.
- `pending_validation` -> `rejected` when network check fails.
- Cancel action creates no state transition because no record is persisted.
