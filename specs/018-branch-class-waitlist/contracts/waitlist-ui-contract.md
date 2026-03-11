# Waitlist UI Contract: UC-18

## Waitlist Entry Point

- Shows selected section details, full-seat status, and a `Join Waitlist` action only when the section is full.
- Distinguishes between waitlist-enabled and not-waitlist-eligible sections before final submission.

## Success Result

- Shows waitlisted status for the selected section.
- Shows waitlist position when one is assigned.

## Blocked Result

- Shows the specific blocking reason for waitlist-unavailable, existing enrolled or waitlisted status, registration hold, or closed term.
- Shows next-step guidance when the student can resolve the blocker or choose an alternative section or course.

## Failure Result

- States that no waitlist entry was created.
- States that no waitlist position was assigned.
- Tells the student that the request did not complete and can be retried if appropriate.

## Accessibility Notes

- Status and result messaging must be keyboard reachable and available to assistive technologies.
