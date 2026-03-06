# UC-30 Acceptance Test Suite — Re-generate Schedules When Class Becomes Full

## Coverage Map
- Main Success Scenario
- Extension 2a: No alternatives
- Extension 2b: Automatic re-generation triggered by capacity change
- Extension 4a: Capacity data unavailable
- Extension 5a: System error

## AT-UC30-01 — Successful re-generation
Preconditions: Authenticated student; existing schedule; valid term
Steps:
1. Select schedule containing section that becomes full.
2. Choose Re-generate schedules.
Expected Results:
- System excludes or deprioritizes full section.
- New viable schedules displayed.

## AT-UC30-02 — No alternative schedules exist
Steps:
1. Trigger re-generation where no viable alternatives exist.
Expected Results:
- System informs student no alternatives are available.
- Suggestions provided (modify constraints or waitlist).

## AT-UC30-03 — Capacity data unavailable
Steps:
1. Simulate capacity service outage.
2. Attempt re-generation.
Expected Results:
- System warns viability cannot be guaranteed.
- No corrupted state occurs.

## AT-UC30-04 — System error during re-generation
Steps:
1. Simulate generator failure.
Expected Results:
- Failure message displayed.
- Previous schedule options remain unchanged.

## AT-UC30-05 — Automatic re-generation without user action
Preconditions: Authenticated student; existing schedule option includes a section with capacity that can transition to full; automatic re-generation feature enabled by policy
Steps:
1. While the student is viewing saved schedule options, simulate the selected section becoming full (capacity update received).
2. Do not click any re-generate action.
3. Observe system behavior after the capacity change is detected.
Expected Results:
- System detects the section is full and triggers re-generation automatically.
- Full section is excluded or deprioritized according to policy.
- Updated viable schedules are displayed or made available to the student.
- Student receives a clear notification that re-generation occurred automatically due to capacity change.
