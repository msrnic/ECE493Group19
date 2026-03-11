# Research: UC-20 View Course History

## Decision 1: Course history includes all past enrollments with final outcomes

- **Decision**: Treat course history as the student's past enrollments with final outcomes, including completed, failed, and withdrawn records.
- **Rationale**: This matches the clarification captured in the feature spec, aligns with student expectations for historical academic review, and avoids later redefinition of what counts as history.
- **Alternatives considered**:
  - Only completed courses: rejected because it hides meaningful historical outcomes.
  - Transcript-only entries: rejected because the use case refers to course history broadly, not only transcript formatting.

## Decision 2: Distinguish empty history from partial history

- **Decision**: Use a dedicated empty-history state when no course-history records exist, and a separate partial-history state when some records cannot be retrieved.
- **Rationale**: These conditions have different meanings for the student and need different validation paths. Distinguishing them prevents a missing-data problem from being mistaken for a legitimate empty record set.
- **Alternatives considered**:
  - Reuse the partial-history warning for empty history: rejected because it incorrectly implies unavailable data rather than no history.
  - Show a blank table for empty history: rejected because it provides poor guidance and weak acceptance evidence.

## Decision 3: Denied access must be logged as an authorization failure record

- **Decision**: Record each denied course-history access attempt in a dedicated authorization-failure record linked to the requesting identity and attempted target.
- **Rationale**: UC-20-AS explicitly requires denial logging. A distinct audit record supports verification without changing academic data and preserves read-only behavior.
- **Alternatives considered**:
  - Only show an error without logging: rejected because it violates acceptance coverage.
  - Log within generic server output only: rejected because it is harder to validate and less traceable.

## Decision 4: Use MVC web views with server-backed SQLite reads

- **Decision**: Implement the feature as MVC web views backed by SQLite models for student accounts, course-history records, and authorization-failure logging.
- **Rationale**: This directly satisfies the constitution's stack and architecture requirements and keeps account and course data explicitly persisted in SQLite.
- **Alternatives considered**:
  - Single-page client-only state: rejected because it does not clearly model required SQLite-backed data boundaries.
  - Non-MVC routing structure: rejected because it conflicts with the constitution.

## Decision 5: Validate responsiveness at student self-service scale

- **Decision**: Plan for course-history page loads to complete within 2 seconds in normal operation and for dashboard-to-history completion within 30 seconds for at least 95% of authorized users during validation.
- **Rationale**: These targets align with the success criteria while staying realistic for a read-heavy student self-service feature.
- **Alternatives considered**:
  - No explicit responsiveness target: rejected because it weakens validation and planning.
  - More aggressive sub-second end-to-end target: rejected because the current scope and repository maturity do not justify it.
