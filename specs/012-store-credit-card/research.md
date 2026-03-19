# Research: Store Credit Card Information (UC-12)

## Decision 1: Tokenization and Sensitive Data Handling

- Decision: Use payment processor tokenization as the only path for card
  persistence and store only token + last4 + expiry metadata.
- Rationale: Aligns with UC-12 and acceptance criteria while reducing risk by
  preventing full card storage.
- Alternatives considered:
  - Store encrypted PAN locally: rejected due to higher security burden and
    conflict with UC-12 tokenization intent.
  - Do not persist any metadata: rejected because students need identifiable
    stored methods for future fee payments.

## Decision 2: Duplicate Card Policy

- Decision: Enforce one active payment method per unique token per student.
- Rationale: Prevents duplicate entries and keeps payment method lists clean.
- Alternatives considered:
  - Allow duplicates: rejected due to poor UX and reconciliation complexity.
  - Block all repeated submissions by last4 only: rejected because last4 alone
    is insufficiently unique.

## Decision 3: Rejection Message Safety

- Decision: Show generic user-safe decline feedback and suppress processor
  internal diagnostics in student-facing UI.
- Rationale: Supports safe messaging requirement and avoids exposing sensitive
  operational details.
- Alternatives considered:
  - Show raw processor errors: rejected for safety and user-comprehension risk.
  - Hide all reasons entirely: rejected because retry guidance is needed.

## Decision 4: Unavailability Timeout

- Decision: Treat tokenization calls exceeding 10 seconds as unavailable.
- Rationale: Matches clarification outcome and provides deterministic UX/error
  handling.
- Alternatives considered:
  - 5-second timeout: rejected as too aggressive for transient network delays.
  - 30-second timeout: rejected as too slow for responsive user flows.

## Decision 5: MVC Responsibility Split

- Decision: Implement add-card flow via controller orchestration, service-level
  processor interaction, and model-level SQLite persistence.
- Rationale: Preserves constitution-mandated MVC boundaries and testability.
- Alternatives considered:
  - Controller direct database writes: rejected because it breaks layering.
  - View-triggered direct processor calls with DB updates in browser: rejected
    for security and architecture reasons.
