# Data Model: Store Credit Card Information (UC-12)

## Entity: StudentAccount

- Purpose: Existing authenticated student identity that owns payment methods.
- Key fields:
  - `id` (unique student identifier)
  - `status` (active/inactive)
- Relationships:
  - One-to-many with `PaymentMethod`.

## Entity: PaymentMethod

- Purpose: Persisted student payment option for fee payment.
- Key fields:
  - `id` (unique record identifier)
  - `student_id` (foreign key to StudentAccount)
  - `processor_token` (tokenized card reference)
  - `last4` (masked card digits)
  - `expiry_month`
  - `expiry_year`
  - `status` (`active`, `inactive`)
  - `created_at`
  - `updated_at`
- Validation rules:
  - `processor_token`, `last4`, `expiry_month`, `expiry_year` required.
  - `last4` must be exactly 4 numeric characters.
  - (`student_id`, `processor_token`, `status=active`) must be unique to avoid
    duplicate active stored methods.
- State transitions:
  - `active` on successful tokenization and persistence.
  - `inactive` if method is later removed or replaced.

## Entity: PaymentTokenizationRequest (Transient)

- Purpose: Non-persisted request payload sent to processor.
- Key fields:
  - card details entered by student (sensitive, transient only)
  - billing context if required by processor
- Validation rules:
  - Required card fields must be present before processor call.

## Entity: PaymentTokenizationResult (Transient)

- Purpose: Processor response for card tokenization.
- Key fields:
  - `outcome` (`success`, `rejected`, `unavailable`)
  - `token` (present on success)
  - `last4`, `expiry_month`, `expiry_year` (present on success)
  - `safe_reason` (optional, safe rejection text for user)
- State impact:
  - `success` -> create or update `PaymentMethod`.
  - `rejected` -> no persistence, retry allowed.
  - `unavailable` -> no persistence, guide student to try later/alternate method.
