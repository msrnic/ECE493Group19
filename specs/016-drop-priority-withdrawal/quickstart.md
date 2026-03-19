# Quickstart: UC-16 Drop Priority Over Withdrawal

## Goal

Implement and validate the UC-16 class-removal workflow in a way that preserves traceability to the use case and acceptance tests.

## Implementation Steps

1. Create MVC scaffolding under `app/controllers`, `app/models`, and `app/views/class-removal`.
2. Add SQLite schema changes for students, course offerings, enrollments, deadline policies, and fee outcomes if they do not already exist.
3. Implement controller logic that:
   - loads the active enrollment
   - retrieves the applicable deadline policy
   - classifies the request as drop, withdrawal, or blocked
   - executes schedule and fee updates as one transaction
4. Build HTML views for:
   - removal form and confirmation
   - successful drop result
   - successful withdrawal result
   - failure states for policy lookup or update errors
5. Add CSS and client-side JavaScript only as needed for form behavior and status messaging.

## Validation Steps

1. Run unit tests covering:
   - before-deadline classification
   - exact-deadline classification as withdrawal
   - after-deadline classification
   - blocked result when policy lookup fails
2. Run integration tests covering:
   - successful drop updates enrollment and fee outcome
   - successful withdrawal updates enrollment and fee outcome
   - update failure leaves schedule and fee state unchanged
3. Execute the UC-16 acceptance checklist against [Acceptance Tests/UC-16-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-16-AS.md).

## Style and Governance Checks

1. Review HTML/CSS against [google-style-guide-html-css.md](/home/thaia/ECE493Group19/Style%20Guides/google-style-guide-html-css.md).
2. Review JavaScript against [google-style-guide-javascript.md](/home/thaia/ECE493Group19/Style%20Guides/google-style-guide-javascript.md).
3. Confirm no edits were made to protected files under `Use Cases/` or `Acceptance Tests/`.
4. Confirm implementation artifacts still map back to [UC-16.md](/home/thaia/ECE493Group19/Use%20Cases/UC-16.md) and the generated plan/spec documents.
