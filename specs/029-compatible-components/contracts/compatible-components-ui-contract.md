# UI Contract: UC-29 Compatible Component Generation

## Purpose

Define the student-facing contract for generating schedules that automatically use only compatible lecture, lab, and tutorial combinations.

## Actors

- Authenticated student
- Schedule generation controller

## Views and Actions

### Generate Compatibility-Checked Schedules

Input:
- Selected term
- Student course selections

System behavior:
- Load component offerings and compatibility linkage rules for each selected course.
- Build only compatible component combinations for each selected course.
- Pass only valid compatible combinations into schedule generation.

Success result:
- Returned schedule options show only compatible pairings.
- No incompatible lecture/lab/tutorial combination appears.

### No Compatible Combination

Precondition:
- At least one selected course has no valid component combination.

System behavior:
- Block generation for the request.
- Identify the blocking course.
- Prompt the student to modify course or section choices before retrying.

Blocked result:
- No incompatible schedules are returned.

### Missing or Inconsistent Rules

Precondition:
- Compatibility linkage rules are unavailable or contradictory for a selected course.

System behavior:
- Block generation for the request.
- Explain that compatibility could not be verified.

Blocked result:
- No schedule options are returned from that request.

### Shared Cross-Listed Components

Precondition:
- A shared component validly satisfies both linked listings.

System behavior:
- Represent the shared component once in the schedule option.
- Treat that shared component as satisfying both linked listings for that option.
- Avoid duplicate display of the same shared component.

Success result:
- Schedule output remains understandable and free of duplicated shared components.

### Generation Failure

System behavior:
- If generation fails after compatibility filtering begins, report the failure and return no inconsistent or partial schedule results.

Failure result:
- Student sees a clear failure message and no unreliable schedules.

## Traceability

- `AT-UC29-01`: Generate schedules with compatible components
- `AT-UC29-02`: No compatible combinations exist
- `AT-UC29-03`: Missing or inconsistent linkage rules
- `AT-UC29-04`: System error during generation
- `AT-UC29-05`: Cross-listed or shared components handled without duplication
