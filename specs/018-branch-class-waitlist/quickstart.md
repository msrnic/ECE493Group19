# Quickstart: UC-18 Join Class Waitlists

## Validation Scenarios

1. Successful waitlist join for an eligible student on a full, waitlist-enabled section.
2. Blocked waitlist request because the section is not waitlist-eligible.
3. Blocked waitlist request because the student is already enrolled or already waitlisted.
4. Blocked waitlist request because of a registration hold or closed registration term.
5. Failed waitlist recording or position assignment with no partial state change.

## Style Review Notes

- Review modified HTML/CSS against `Style Guides/google-style-guide-html-css.md`.
- Review modified JavaScript against `Style Guides/google-style-guide-javascript.md`.

## Performance Validation

- Measure whether at least 95% of waitlist attempts finish within 1 second under up to 20 concurrent requests.
