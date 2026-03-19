# Quickstart: UC-17 Enroll in Found Classes

## Validation Scenarios

1. Successful enrollment for an eligible student in an open class.
2. Blocked enrollment for unmet prerequisites.
3. Blocked enrollment for registration hold.
4. Blocked enrollment for schedule conflict.
5. Blocked enrollment for full class.
6. Failed enrollment write with unchanged schedule and retry guidance.

## Style Review Notes

- Review modified HTML/CSS against `Style Guides/google-style-guide-html-css.md`.
- Review modified JavaScript against `Style Guides/google-style-guide-javascript.md`.

## Performance Validation

- Measure whether at least 95% of enrollment attempts finish within 1 second under up to 20 concurrent requests.
