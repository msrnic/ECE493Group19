# Research: UC-16 Drop Priority Over Withdrawal

## Decision 1: Implement the feature as a plain MVC web workflow

- **Decision**: Use server-rendered HTML views with JavaScript controllers/models and lightweight client-side JavaScript only for form submission feedback.
- **Rationale**: The constitution mandates HTML/CSS/JavaScript and MVC. A plain MVC workflow minimizes unnecessary framework complexity and keeps controller decisions around drop versus withdrawal easy to trace to acceptance tests.
- **Alternatives considered**:
  - Single-page application: rejected because it adds routing and state complexity without improving the UC-16 acceptance flows.
  - API-first service plus separate frontend: rejected because the repo does not yet contain that split architecture and the use case can be satisfied within one MVC app.

## Decision 2: Store enrollment, deadline, and fee-impact state in SQLite

- **Decision**: Persist students, course offerings, enrollments, deadline policy records, and fee outcomes in SQLite.
- **Rationale**: SQLite is required by the constitution, and UC-16 needs durable reads and writes for account data, course data, deadline lookups, and fee/schedule consistency checks.
- **Alternatives considered**:
  - Flat files: rejected because transactional consistency for schedule and fee updates would be weaker.
  - In-memory data only: rejected because acceptance flows require persistent state and failure recovery behavior.

## Decision 3: Use controller-orchestrated policy evaluation before any mutation

- **Decision**: The controller should retrieve the applicable deadline policy first, classify the action as drop or withdrawal, and only then invoke schedule and fee updates.
- **Rationale**: This ordering matches UC-16 and its acceptance tests, supports the clarified boundary rule that exact-deadline timestamps are treated as withdrawal, and makes blocking behavior explicit when policy lookup fails.
- **Alternatives considered**:
  - Infer policy after schedule removal: rejected because it risks partial updates before the correct policy outcome is known.
  - Let the database infer all policy outcomes implicitly: rejected because business-rule traceability would be harder to validate in tests.

## Decision 4: Treat schedule and fee updates as one transactional unit

- **Decision**: Apply schedule change and fee outcome update within one SQLite transaction boundary.
- **Rationale**: UC-16 requires no partial changes when an update fails after the removal type is selected. A transaction is the clearest way to preserve consistent schedule and fee state.
- **Alternatives considered**:
  - Sequential non-transactional writes: rejected because partial success would violate the spec.
  - Deferred fee recalculation job: rejected because delayed updates would complicate acceptance validation and user messaging.

## Decision 5: Validate the feature with unit, integration, and acceptance-oriented tests

- **Decision**: Cover policy classification with unit tests, end-to-end SQLite-backed removal flow with integration tests, and UC-16 traceability with an acceptance checklist mapped to the provided acceptance suite.
- **Rationale**: This balances fast logic validation with end-to-end confidence and keeps tests aligned with the project’s use-case-driven workflow.
- **Alternatives considered**:
  - Manual testing only: rejected because boundary and failure-path behavior need repeatable validation.
  - End-to-end tests only: rejected because controller/model logic would be harder to isolate when failures occur.
