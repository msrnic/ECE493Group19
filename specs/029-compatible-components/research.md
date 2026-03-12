# Research: UC-29 Auto-pick Compatible Components

## Decision: Treat catalog or timetable linkage metadata as the source of truth for component compatibility

Rationale: The use case assumes the generator retrieves offerings and linkage rules before schedule generation, so compatibility should be derived from existing course and section data rather than guessed during generation.

Alternatives considered:
- Infer compatibility from section naming conventions only: rejected because naming patterns are not reliable enough to support blocking or acceptance validation.
- Require students to manually choose component links: rejected because it shifts the core UC responsibility away from automatic compatibility handling.

## Decision: Block generation when compatibility cannot be verified because linkage rules are missing or inconsistent

Rationale: Blocking is the safest default because it prevents the system from returning schedules that may look valid but contain unverifiable pairings.

Alternatives considered:
- Return flagged schedules anyway: rejected because it still exposes students to potentially invalid combinations.
- Ignore the affected course and generate around it: rejected because it violates the selected-course request and hides the actual incompatibility problem.

## Decision: When one shared component satisfies both linked listings, represent it once per schedule option

Rationale: A single shared component should not appear twice in the same returned schedule when it satisfies both linked listings, because duplication would misrepresent the actual section selection.

Alternatives considered:
- Duplicate the shared component under each listing: rejected because it inflates the schedule display and misstates the pairing.
- Hide the shared relationship entirely: rejected because students still need to understand why one component satisfies both listings.

## Decision: Consider all valid compatible combinations when more than one pairing is available

Rationale: Restricting a course to one arbitrarily chosen compatible pairing would unnecessarily reduce schedule options and conflict with the goal of schedule generation.

Alternatives considered:
- Pick the first valid compatible combination only: rejected because it discards valid schedules without a user-driven reason.
- Require manual disambiguation before generation: rejected because it moves compatibility selection burden back to the student.

## Decision: On generation failure, return no partial or inconsistent schedule results

Rationale: Returning partial schedules after compatibility-aware generation fails risks exposing students to unverified or incomplete pairings and conflicts with the failed end condition.

Alternatives considered:
- Return whatever schedules were built before the error: rejected because the student cannot know whether the partial result set is complete or trustworthy.
- Cache the previous successful results and show them as current: rejected because it could mislead students about the present request outcome.
