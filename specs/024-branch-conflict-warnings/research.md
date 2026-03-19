# Research: UC-24 Warn About Time Conflicts in Candidate Schedules

## Decision: Detect conflicts only on overlapping meeting times

Rationale: The clarified specification states that conflicts exist only when scheduled meeting times overlap. This keeps the feature aligned with acceptance coverage, avoids inventing institutional travel-buffer policy, and makes conflict detection objectively testable.

Alternatives considered:
- Include travel-time or buffer rules between adjacent meetings.
- Make conflict rules configurable per deployment.

## Decision: Treat unknown, TBA, or partial meeting times as incomplete analysis

Rationale: UC-24 and `AT-UC24-03` require affected components to be flagged while avoiding false-positive conflict warnings. Incomplete analysis is a separate user-visible state from confirmed conflicts and conflict-free confirmation.

Alternatives considered:
- Assume unknown times do not conflict.
- Treat unknown times as hard failures that block all analysis.

## Decision: Render distinct unavailable and incomplete views

Rationale: Timetable-data outages and incomplete meeting-time inputs represent different recovery paths. A distinct unavailable view supports retry-later messaging for `AT-UC24-04`, while an incomplete view preserves any analyzable context for `AT-UC24-03`.

Alternatives considered:
- Use one generic error page for all non-success cases.
- Collapse incomplete analysis into the same view as conflict warnings.

## Decision: Keep conflict analysis advisory and side-effect free

Rationale: UC-24 explicitly warns about impossible timetables; it does not change enrollment state. The controller and service design should read from SQLite-backed account/course/timetable/generated-schedule data and return analysis results without persisting registration mutations.

Alternatives considered:
- Auto-remove conflicting sections.
- Save conflict-resolution choices during analysis.

## Decision: Use server-rendered MVC pages with small JavaScript enhancements

Rationale: The constitution mandates HTML/CSS/JavaScript and MVC. Server-rendered state views with minimal client-side behavior keep the feature testable, style-guide compliant, and easy to trace to acceptance scenarios.

Alternatives considered:
- Client-only conflict analysis in a single-page app.
- Exposing conflict analysis only through an API without a dedicated view contract.
