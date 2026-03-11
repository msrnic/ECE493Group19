# Research: UC-22 Generate Possible Class Schedules

## Feasible Schedule Definition

- Decision: Treat a feasible schedule as a schedule option that includes only selected courses with available sections, contains no overlapping meeting times among included sections, and satisfies any student-selected constraints supported by the builder.
- Rationale: This matches the use case goal of practical semester planning while staying bounded enough for validation and implementation planning.
- Alternatives considered: Leaving “feasible” undefined was rejected because it would create inconsistent generation logic and test ambiguity; including ranking quality in feasibility was rejected because ranking is explicitly out of scope.

## Unschedulable-Course Continuation

- Decision: If some selected courses have no available sections, identify those courses and let the student continue generation with only the remaining schedulable courses.
- Rationale: The use case and acceptance suite explicitly require continuation behavior, and this preserves planning value instead of failing the entire request.
- Alternatives considered: Failing the entire generation request on any unschedulable course was rejected because it conflicts with extension 2a; silently dropping unschedulable courses was rejected because it would hide critical planning information.

## No-Feasible-Schedule Guidance

- Decision: When no feasible schedule can be produced, present a distinct no-results outcome with actionable guidance to relax constraints or change courses/sections.
- Rationale: This keeps infeasibility separate from data failure and gives the student a clear recovery path.
- Alternatives considered: Showing a generic error for infeasibility was rejected because it conflates user-driven planning conflicts with system faults.

## Catalog/Timetable Retrieval Failure

- Decision: Treat catalog or timetable retrieval failure as a distinct error outcome that prevents schedule generation and does not present partial retrieval output as complete schedules.
- Rationale: The acceptance suite explicitly requires clear error handling with no misleading results during service failure.
- Alternatives considered: Displaying partially generated schedules from incomplete retrieval was rejected because the acceptance suite warns against presenting incomplete results as complete.

## Performance Validation Target

- Decision: Validate that 95% of feasible schedule-generation requests present the first user-visible result within 10 seconds under normal operating conditions.
- Rationale: This target is already in the specification and is appropriate for a combinational planning feature that may search multiple section combinations.
- Alternatives considered: A shorter fixed target was rejected as unsupported by the current feature scope; leaving performance unspecified was rejected because it would weaken readiness for planning and task generation.
