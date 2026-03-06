# UC-24 Acceptance Test Suite — Warn About Time Conflicts

## Coverage Map
- Main Success Scenario
- Extension 3a: No conflicts
- Extension 3b: Ambiguous/partial meeting times
- Extension 4a: Timetable data unavailable

## AT-UC24-01 — Detect and display conflicts
Preconditions: Authenticated student; valid term; timetable data available
Steps:
1. Generate schedule with overlapping sections.
2. Request conflict analysis.
Expected Results:
- All overlapping meetings identified.
- Clear warnings displayed per conflict.

## AT-UC24-02 — No conflicts
Steps:
1. Generate conflict-free schedule.
2. Request analysis.
Expected Results:
- System indicates schedule is conflict-free.

## AT-UC24-03 — Ambiguous or partial meeting times
Steps:
1. Generate schedule containing TBA or partial time data.
2. Request analysis.
Expected Results:
- Affected components flagged.
- Warning indicates incomplete conflict evaluation.

## AT-UC24-04 — Timetable data unavailable
Steps:
1. Simulate timetable service failure.
2. Request conflict analysis.
Expected Results:
- System reports conflict checking cannot be completed.
- No inconsistent state created.

---