# UC-29 Acceptance Test Suite — Auto-pick Compatible Components

## Coverage Map
- Main Success Scenario
- Extension 3a: No compatible combinations
- Extension 3b: Cross-listed or shared components
- Extension 4a: Missing or inconsistent linkage rules
- Extension 5a: System error

## AT-UC29-01 — Generate schedules with compatible components
Preconditions: Authenticated student; valid term; catalog available; course with lecture/lab/tutorial structure
Steps:
1. Select course with required components.
2. Select Generate Schedules.
Expected Results:
- All generated schedules contain valid lecture/lab/tutorial pairings.
- No incompatible combinations appear.

## AT-UC29-02 — No compatible combinations exist
Steps:
1. Select course configuration with no valid component pairings.
2. Select Generate Schedules.
Expected Results:
- System informs student no compatible combinations exist.
- Student prompted to modify course selection.

## AT-UC29-03 — Missing or inconsistent linkage rules
Steps:
1. Simulate missing linkage rules in catalog.
2. Select Generate Schedules.
Expected Results:
- System blocks generation or flags results per policy.
- Clear message explains inability to ensure compatibility.

## AT-UC29-04 — System error during generation
Steps:
1. Simulate generator service failure.
Expected Results:
- System reports failure.
- No inconsistent schedules returned.

## AT-UC29-05 — Cross-listed or shared components handled without duplication
Preconditions: Authenticated student; valid term; catalog includes cross-listed course pair or shared component rules; catalog available
Steps:
1. Select a cross-listed course (or two cross-listed course codes that share components) requiring lecture/lab/tutorial selection.
2. Select Generate Schedules.
3. Review each returned schedule option for component selection.
Expected Results:
- Schedules only include compatible lecture/lab/tutorial pairings under the shared linkage rules.
- Shared components are not duplicated within a schedule option.
- If a shared component satisfies requirements for both cross-listed listings, the system represents it consistently according to policy.
