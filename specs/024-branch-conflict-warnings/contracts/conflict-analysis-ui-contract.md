# UI Contract: UC-24 Conflict Analysis

## Route

- `GET /schedule-conflict/:scheduleId`

Purpose: Render the conflict-analysis result for a selected candidate schedule owned by the authenticated student.

## Controller Inputs

- Authenticated student session
- `scheduleId` path parameter
- Active academic term context

## View States

### `conflicts_found`

Required view data:
- Candidate schedule summary
- One warning block per detected conflict
- Conflicting course and section identifiers for each warning
- Overlap description for each warning
- Advisory note that analysis does not change registration

### `conflict_free`

Required view data:
- Candidate schedule summary
- Positive confirmation that no overlapping meeting times were found
- Advisory note that analysis is informational only

### `incomplete`

Required view data:
- Candidate schedule summary
- Flagged components with unknown, TBA, or partial meeting times
- Message that conflict analysis is incomplete for affected components
- Any confirmed conflict warnings that can still be shown from complete meeting-time data

### `unavailable`

Required view data:
- Candidate schedule summary when available
- Message that timetable data required for conflict analysis is unavailable
- Retry-later guidance
- No conflict-free confirmation and no misleading zero-conflict state

## Controller Responsibilities

- Verify the schedule belongs to the authenticated student.
- Load candidate schedule and meeting-component records from SQLite-backed models.
- Invoke the overlap-only conflict-analysis service.
- Select exactly one of the four result states.
- Pass only display-ready state data to the view.

## Model Responsibilities

- Persist account, course, timetable, and generated schedule data in SQLite.
- Normalize meeting-time completeness and overlap-comparison inputs.

## View Responsibilities

- Render state-specific messaging and warnings.
- Keep conflict analysis advisory only.
- Follow the HTML/CSS and JavaScript style guides named in the constitution.

## Acceptance Traceability

- `AT-UC24-01` -> `conflicts_found`
- `AT-UC24-02` -> `conflict_free`
- `AT-UC24-03` -> `incomplete`
- `AT-UC24-04` -> `unavailable`
