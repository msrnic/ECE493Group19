# Research: UC-23 Request Multiple Schedule Results

## Decision: Use a deterministic ranking policy based on conflict-free feasibility first, then stable ordering by earliest overall start time and course identifier sequence

**Rationale**: The spec requires one consistent ranking policy but does not require preference personalization. A deterministic ordering keeps the results stable across repeated requests with unchanged source data and gives acceptance tests a predictable outcome.

**Alternatives considered**:
- Randomized ordering per request: rejected because it conflicts with the consistency requirement and makes acceptance validation brittle.
- Student-configurable ranking preferences: rejected because UC-23 does not require ranking customization and that would expand the feature scope.
- Leaving ranking undefined: rejected because it would keep a material ambiguity in implementation and testing.

## Decision: Treat the requested result count as a required positive integer input in the inclusive range 1 to 10

**Rationale**: The clarified spec now fixes the product limit at 10. Validating the input before generation prevents wasted work and aligns directly with AT-UC23-02 through AT-UC23-05.

**Alternatives considered**:
- Per-deployment configurable maximum: rejected because the spec now explicitly fixes the product limit.
- Allowing blank input to default to 10: rejected because the acceptance suite requires invalid numeric input to block submission.

## Decision: On timeout after partial progress, return the partial ranked results with an incomplete-results warning; on timeout before any results, return a failure state with retry guidance

**Rationale**: This matches UC-23 extensions 4a and acceptance tests AT-UC23-07 and AT-UC23-08 while preserving useful output when some schedules are already available.

**Alternatives considered**:
- Always fail on timeout even when partial results exist: rejected because it discards useful planning information required by the use case.
- Always return partial output even when none exists: rejected because it would misrepresent a total generation failure as a valid result.

## Decision: Reuse the existing schedule-builder domain inputs and extend them with a requested result count rather than creating a separate planning workflow

**Rationale**: UC-23 is an enhancement to schedule generation, not a separate scheduling subsystem. Reusing the existing course-selection and term context keeps MVC ownership simple and limits schema expansion to result-specific state.

**Alternatives considered**:
- Separate standalone workflow for multi-result requests: rejected because it duplicates existing selection and planning context.
- Batch asynchronous generation with background polling: rejected because neither the use case nor acceptance suite requires asynchronous job handling.

## Decision: Validate responsiveness against the first displayed ranked schedule option

**Rationale**: The student’s first usable feedback is the first ranked schedule displayed. This keeps the performance target observable and consistent with the existing schedule-builder performance pattern.

**Alternatives considered**:
- Measure total completion of all requested schedules: rejected because generation can legally stop early with fewer results or partial timeout output.
- Measure only backend compute time: rejected because the planning artifacts require user-visible, technology-agnostic outcomes.
