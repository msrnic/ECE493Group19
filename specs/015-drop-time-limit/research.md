# Research: Time Limit for Dropping from a Class (UC-15)

## Decision 1: Canonical Timezone
- Decision: Evaluate all drop deadlines in university official academic calendar
  timezone and display that timezone explicitly.
- Rationale: Prevents inconsistent outcomes across student local time zones.
- Alternatives considered: Student-local timezone evaluation; UTC-only display
  without campus context.

## Decision 2: Cutoff Policy
- Decision: Enforce strict cutoff at published timestamp with no grace period.
- Rationale: Aligns with registrar policy interpretation and reduces ambiguity.
- Alternatives considered: Grace window (e.g., 5-15 minutes) after cutoff.

## Decision 3: Failure Safety
- Decision: When deadline retrieval/evaluation fails, block drop action and show
  cannot-confirm-deadline guidance.
- Rationale: Preserves consistent state and satisfies UC-15 extension 2a.
- Alternatives considered: Allow best-effort drop on stale policy cache.

## Decision 4: Consistency of Display and Evaluation
- Decision: Use same canonical deadline value for UI display and eligibility
  check response.
- Rationale: Eliminates display/decision mismatch risks and improves trust.
- Alternatives considered: Separate display cache and evaluation source.
