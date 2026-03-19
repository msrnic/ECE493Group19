# Phase 0 Research: View Transaction History (UC-10)

## Decision 1: Read-only retrieval interaction

- Decision: Use a read-only transaction-history retrieval flow (idempotent fetch) and support retry by repeating the same read action.
- Rationale: UC-10 and UC-10-AS require no state mutation on failure and explicit recovery by retry.
- Alternatives considered:
  - Triggering data refresh writes on view load (rejected: violates read-only expectation).
  - Caching stale results as authoritative (rejected: risks incorrect payment confirmation during faults).

## Decision 2: In-scope transaction domain

- Decision: Include only tuition and fee payment transactions processed through the SIS.
- Rationale: Clarification session fixed scope to fee-payment records and excluded non-fee activities.
- Alternatives considered:
  - Include all financial systems (rejected: expands beyond UC-10 scope).
  - Restrict to current term only (rejected: conflicts with full history clarification).

## Decision 3: History range and ordering

- Decision: Return all available in-scope records and display in reverse chronological order by default.
- Rationale: Supports fastest verification of latest payment while preserving complete audit visibility.
- Alternatives considered:
  - Time-boxed history (12 months/current term) (rejected: conflicts with clarification).
  - Oldest-first default (rejected: slows primary payment confirmation task).

## Decision 4: Payment method visibility and privacy

- Decision: Expose payment method label plus masked identifier only; never expose full instrument identifiers.
- Rationale: Meets confirmation needs while protecting sensitive payment data.
- Alternatives considered:
  - Full instrument display (rejected: privacy risk).
  - No payment-method info at all (rejected: weakens student confirmation confidence).

## Decision 5: Status lifecycle modeling

- Decision: Support `Pending`, `Succeeded`, `Failed`, and `Reversed` statuses, with pending records updated to final outcome when received.
- Rationale: Aligns with clarified behavior and acceptance requirements for accurate payment-state communication.
- Alternatives considered:
  - Hide pending states until finalization (rejected: creates visibility gaps and support burden).
  - Treat pending as failure-like state (rejected: semantically incorrect).

## Decision 6: External dependency failure behavior

- Decision: On retrieval failure from database/payment integrations, return explicit error outcome and preserve existing persisted state unchanged.
- Rationale: Directly maps to UC-10 extension 2a and failed end condition.
- Alternatives considered:
  - Silent failure with empty list (rejected: misleading and harms trust).
  - Partial data marked complete (rejected: can misrepresent payment confirmation).

## Decision 7: Style and architecture compliance

- Decision: Keep MVC separation and enforce style-guide checks for HTML/CSS and JavaScript before implementation completion.
- Rationale: Required by constitution and quality gates.
- Alternatives considered:
  - Ad hoc organization without MVC ownership (rejected: violates constitution).
  - Deferring style compliance to post-merge (rejected: avoidable review churn).
