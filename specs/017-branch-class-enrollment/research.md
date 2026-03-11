# Research: UC-17 Enroll in Found Classes

## Decision: Eligibility rules are evaluated before any enrollment write

Rationale: UC-17 requires prerequisites, registration holds, schedule conflicts, and capacity to block enrollment without changing state.

Alternatives considered: Evaluating some checks after partial write was rejected because it increases rollback risk and contradicts the use case.

## Decision: Enrollment failures must be atomic

Rationale: The acceptance flow for system error requires no partial enrollment and no partial fee impact.

Alternatives considered: Best-effort cleanup after partial save was rejected because the failed end condition requires consistent state.

## Decision: Performance validation will use representative concurrent enrollment scenarios

Rationale: The spec sets a measurable 1-second target for 95% of attempts under up to 20 concurrent requests.

Alternatives considered: Leaving performance implicit was rejected because the success criteria require explicit validation evidence.
