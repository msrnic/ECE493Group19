# Research: UC-21 View My Transcript

## Transcript View States

- Decision: Model transcript viewing as five distinct states: full, partial, empty, unavailable, and denied.
- Rationale: The spec and `UC-21-AS` differentiate between successful viewing, incomplete data, and unauthorized access, and the clarification session established full-source unavailability as a separate outcome from partial and empty transcript results.
- Alternatives considered: Treating unavailable as partial was rejected because it would blur operational failure with partial academic data; treating unavailable as empty was rejected because it would mislead students about whether transcript data exists.

## Minimum Transcript Display Content

- Decision: Display transcript entries grouped by academic term and include course identifier, course title, credits, and final grade or equivalent result for each available entry.
- Rationale: These fields are sufficient to satisfy transcript review needs in UC-21 while staying technology-agnostic and testable from the acceptance suite’s expectation of appropriate formatting and transcript visibility.
- Alternatives considered: Showing only course title and grade was rejected because it weakens transcript usefulness; including additional derived academic metrics was rejected because UC-21 does not require them.

## Partial-Data Messaging

- Decision: For partial transcript results, show a page-level missing-data indicator and identify the affected term or transcript entry when that information is known.
- Rationale: This preserves student trust by making the missing-data condition explicit without blocking access to available transcript information.
- Alternatives considered: A generic banner without affected-term detail was rejected because it reduces troubleshooting value; suppressing the warning entirely was rejected because it would make partial data appear complete.

## Denied-Access Audit Recording

- Decision: Record requesting identity, attempted target identity when known, timestamp, and denial reason for each denied transcript access attempt.
- Rationale: These fields are the minimum required to support audit review and validate UC-21 extension 2b without expanding scope into broader security analytics.
- Alternatives considered: Logging only a generic failure event was rejected because it would not support meaningful review; capturing more operational telemetry was deferred to future security-focused work.

## Performance Validation Targets

- Decision: Validate that 95% of authorized students can reach the transcript page within 30 seconds from the dashboard and that 95% of transcript loads render first state-appropriate content within 2 seconds under normal operating conditions.
- Rationale: These targets are already present in the specification and provide a practical, user-facing validation boundary for planning and later task decomposition.
- Alternatives considered: Stricter sub-second guarantees were rejected as unsupported by current requirements; omitting measurable thresholds was rejected because it would weaken acceptance readiness.
