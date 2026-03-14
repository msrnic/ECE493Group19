# Research: Search for Available Classes (UC-13)

## Decision 1: Default Search Scope
- Decision: Default search to active registration term with optional term override.
- Rationale: Matches typical student intent and reduces noise from unrelated
  terms while preserving control.
- Alternatives considered: Require explicit term every time; search across all
  terms by default.

## Decision 2: Result Ordering
- Decision: Order results by earliest meeting availability, then course code.
- Rationale: Provides predictable ordering and aligns to practical schedule
  planning.
- Alternatives considered: Alphabetic by course title; relevance-only ranking.

## Decision 3: Availability Freshness
- Decision: Treat seat availability as current only if snapshot timestamp is
  within 60 seconds; otherwise label as stale.
- Rationale: Balances reliability with external catalog update variability.
- Alternatives considered: No freshness guarantee; strict real-time only.

## Decision 4: Failure Handling
- Decision: On catalog timeout/error, return clear user-safe error and avoid
  presenting stale data as current.
- Rationale: Satisfies UC-13 failed end condition and extension 2a expectations.
- Alternatives considered: Show last cached data without stale indicator;
  suppress error detail entirely.
