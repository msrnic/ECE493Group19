# Quickstart: UC-24 Warn About Time Conflicts in Candidate Schedules

## Goal

Validate that the UC-24 planning scope covers all required acceptance outcomes before task generation and implementation.

## Preconditions

- An authenticated student account exists.
- A scheduling term is available.
- Candidate schedules can be loaded for the authenticated student.
- Timetable data exists unless the scenario explicitly simulates unavailable data.

## Scenario 1: Detect and display conflicts

Source: `AT-UC24-01`

1. Load a candidate schedule containing at least two meeting components whose times overlap on one or more days.
2. Request conflict analysis for that schedule.
3. Confirm the result state is `conflicts_found`.
4. Confirm each overlapping pair or set produces a separate warning naming the conflicting components.

## Scenario 2: Confirm a conflict-free schedule

Source: `AT-UC24-02`

1. Load a candidate schedule whose meeting components do not overlap.
2. Request conflict analysis.
3. Confirm the result state is `conflict_free`.
4. Confirm the UI explicitly states that the schedule is conflict-free.

## Scenario 3: Flag incomplete analysis

Source: `AT-UC24-03`

1. Load a candidate schedule containing one or more components with unknown, TBA, or partial meeting times.
2. Request conflict analysis.
3. Confirm the result state is `incomplete`.
4. Confirm affected components are flagged and the UI explains that conflict analysis is incomplete for them.

## Scenario 4: Handle unavailable timetable data

Source: `AT-UC24-04`

1. Simulate missing or unavailable timetable data for the selected term.
2. Request conflict analysis.
3. Confirm the result state is `unavailable`.
4. Confirm the UI reports that conflict checking cannot be completed and suggests retrying later.

## Notes

- Back-to-back meetings are not conflicts unless meeting times overlap.
- Conflict analysis is advisory only and must not modify registration state.
