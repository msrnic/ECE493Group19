# Research: UC-25 Enroll in All Courses from a Chosen Schedule Option

## Decision: Use partial success as the default enrollment policy

Rationale: The clarified specification and UC-25 extensions for full sections and eligibility failures assume that unaffected sections may still proceed. This keeps the default batch behavior aligned with the main use case while reserving all-or-nothing cancellation for the explicit atomic-policy scenario.

Alternatives considered:
- Make all batch enrollment requests atomic by default.
- Choose policy dynamically without a fixed default.

## Decision: Apply atomic rollback only when atomic enrollment policy is explicitly enabled

Rationale: `AT-UC25-06` treats atomic rollback as a separate policy-driven scenario. Making it explicit avoids ambiguity in acceptance coverage and lets the controller/service report a distinct cancelled-batch outcome.

Alternatives considered:
- Always roll back the full batch after any failure.
- Never support atomic rollback.

## Decision: Preserve consistent final state by rolling back tentative changes on system-error paths

Rationale: `UC-25` and `AT-UC25-05` require consistency when a system error occurs mid-batch. The service should treat tentative enrollment work as reversible until the final outcome is safe to present.

Alternatives considered:
- Leave partially completed enrollments in place after system error.
- Block all batch attempts unless every downstream dependency pre-confirms success.

## Decision: Represent section-level outcomes and batch summary as separate domain records

Rationale: The feature must report per-section outcomes and a final batch-level state. Splitting these concepts improves traceability for acceptance results and supports both partial-success and atomic-cancelled outcomes.

Alternatives considered:
- Use only one final summary message with no section-level record structure.
- Persist only per-section records with no explicit batch summary model.

## Decision: Use server-rendered MVC views with minimal JavaScript enhancement

Rationale: The constitution fixes the stack and requires MVC ownership. Server-rendered summary pages with small JavaScript enhancements keep success, partial, and failure states easy to test and consistent with style-guide compliance.

Alternatives considered:
- Client-only batch enrollment flow.
- API-only enrollment endpoint with no dedicated view contract.
