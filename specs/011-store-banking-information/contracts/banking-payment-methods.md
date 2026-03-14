# Contract: Banking Payment Methods

## Purpose
Define controller/service interaction contract for UC-11 bank account storage flow.

## Operations

### 1. List Payment Methods
- Action: Retrieve student payment methods.
- Input:
  - `student_id`
- Output:
  - List of payment methods, including active bank methods with masked identifiers.

### 2. Add Bank Account Payment Method
- Action: Submit banking details for storage.
- Input:
  - `student_id`
  - `bank_holder_name`
  - `routing_identifier`
  - `account_identifier`
- Validation Rules:
  - Required-field checks must pass.
  - Duplicate account fingerprint for same student must be rejected.
  - Banking network must accept details before persistence.
- Output on success:
  - `status: active`
  - `payment_method_id`
  - `account_identifier_masked`
  - confirmation message that method is available for fee payments.
- Output on failure:
  - `status: validation_error` with field-level errors, or
  - `status: network_rejected` with rejection reason.

### 3. Cancel Add Bank Account
- Action: Exit add flow without persistence.
- Input:
  - `student_id`
- Output:
  - return to payment methods view.
  - explicit no-change outcome.
