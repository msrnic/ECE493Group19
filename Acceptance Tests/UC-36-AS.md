# UC-36 Acceptance Test Suite — View Summary of Submitted Grades

## Coverage Map
- Main Success Scenario
- Extension 2a: Data unavailable or incomplete
- Extension 2b: Unauthorized access

## AT-UC36-01 — View summary successfully
Preconditions: Authenticated professor; assigned to offering
Steps:
1. Navigate to summary page.
2. Request grade summary.
Expected Results:
- System retrieves and displays grade distribution and metrics.
- Formatting and access control enforced.

## AT-UC36-02 — Data incomplete or unavailable
Steps:
1. Simulate missing or partial grade data.
2. Request summary.
Expected Results:
- System displays available data.
- Missing elements indicated.

## AT-UC36-03 — Unauthorized access
Steps:
1. Attempt to view summary for unassigned offering.
Expected Results:
- System denies access.
- Authorization failure logged.