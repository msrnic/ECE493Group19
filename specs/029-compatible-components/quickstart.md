# Quickstart: UC-29 Auto-pick Compatible Components

## Purpose

Provide a concise path for implementing and validating compatibility-aware schedule generation within the project's HTML/CSS/JavaScript and SQLite MVC structure.

## Preconditions

- Work on branch `029-compatible-components`.
- Keep `Use Cases/UC-29.md` and `Acceptance Tests/UC-29-AS.md` unchanged.
- Preserve MVC boundaries between backend compatibility logic and frontend schedule-generation result handling.

## Implementation Outline

1. Add compatibility-linkage data access for section offerings in the selected term.
2. Add backend filtering that builds only compatible component combinations before schedule generation.
3. Add frontend schedule-generation result states for successful compatible schedules, blocked requests, and generation failures.
4. Record traceability from FR/NFR items to acceptance evidence for UC-29.

## Validation Scenarios

### Compatible Generation

1. Select a course requiring lecture, lab, and tutorial components.
2. Generate schedules.
3. Review each returned schedule option.
4. Confirm each option contains only compatible component pairings.

### No Compatible Combinations

1. Select a course configuration with no valid compatible pairing.
2. Generate schedules.
3. Confirm the system identifies the blocking course.
4. Confirm no incompatible schedule options are returned.

### Missing or Inconsistent Rules

1. Simulate missing or inconsistent linkage metadata for a selected course.
2. Generate schedules.
3. Confirm the system blocks generation.
4. Confirm the explanation says compatibility could not be verified.

### Shared Cross-Listed Components

1. Select a cross-listed or shared-component scenario.
2. Generate schedules.
3. Review returned schedule options.
4. Confirm one shared component appears once and satisfies both linked listings when applicable.

### Generation Failure

1. Simulate generator failure after compatibility filtering begins.
2. Generate schedules.
3. Confirm the system reports failure.
4. Confirm no partial or inconsistent schedule results are returned.
