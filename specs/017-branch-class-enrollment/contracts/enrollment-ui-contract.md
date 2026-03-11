# Enrollment UI Contract: UC-17

## Enrollment Form

- Shows selected class information and an `Enroll` action.
- Shows deadline-independent eligibility messaging only after evaluation.

## Success Result

- Shows enrolled status, class name, schedule placement, and fee assessment summary.

## Blocked Result

- Shows one or more blocking reasons for prerequisites, registration hold, schedule conflict, or full class.
- Leaves current schedule unchanged.

## Failure Result

- States that no enrollment was created.
- Tells the student to retry after refreshing the schedule.

## Accessibility Notes

- Status and result messaging must be keyboard reachable and available to assistive technologies.
