# Research: UC-18 Join Class Waitlists

## Decision: Waitlist scope ends at recording or rejecting the waitlist join request

Rationale: The use case and acceptance suite cover joining the waitlist, blocked waitlist requests, and failed recording only. They do not cover later seat fulfillment, offer acceptance, or auto-enrollment behavior.

Alternatives considered: Including later seat-opening fulfillment was rejected because it expands scope beyond the documented flows and would blur responsibility with a separate fulfillment feature.

## Decision: Duplicate-status validation must treat existing enrollment and existing waitlist status as separate blockers with one authoritative result

Rationale: UC-18 explicitly requires the system to prevent duplicate requests when the student is already enrolled or already waitlisted. Handling both conditions in the same validation step keeps state consistent and avoids multiple partially processed outcomes.

Alternatives considered: Relying only on client-side duplicate-submit prevention was rejected because duplicate status can already exist in persistent data and must be enforced server-side.

## Decision: Waitlist entry creation and waitlist-position assignment must succeed atomically

Rationale: The failed end condition requires no partial work and consistent state. If a position is required but cannot be assigned, the entire request must fail with no waitlist entry created.

Alternatives considered: Creating a partial waitlist entry without a final position was rejected because it would leave ambiguous registration state and conflict with the failure scenario.

## Decision: Validation evidence should include representative concurrent waitlist attempts for the 1-second target

Rationale: The spec sets a measurable response-time target under up to 20 concurrent waitlist attempts. Planning should therefore include a reproducible validation approach rather than leaving the target implicit.

Alternatives considered: Treating performance as a non-validated aspiration was rejected because the success criteria require measurable proof.
