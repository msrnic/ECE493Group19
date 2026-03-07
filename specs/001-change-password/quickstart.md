# Quickstart - 001-change-password

## Purpose
Validate the password change feature end-to-end for self-service, reset-token, and admin-initiated flows while preserving constitution constraints.

## Prerequisites
- JavaScript web stack implementation (HTML/CSS/JS) with MVC boundaries.
- SQLite database initialized with users, sessions, reset tokens, and notification tables.
- At least one test user account and one admin account.

## Setup
1. Apply SQLite schema and migrations.
2. Seed:
   - `userA@example.com` with known current password.
   - `admin@example.com` with admin role.
   - One valid reset token for `userA` and one expired token.
3. Start the web app and confirm account security route is reachable.

## Validation Flows
1. Authenticated user success
- Open account security settings.
- Submit correct current password and policy-compliant new password.
- Verify success message.
- Verify old password fails login and new password succeeds.
- Verify other sessions for the same user are invalidated while current session remains active.

2. Reset token success
- Open reset-password page with valid token.
- Submit policy-compliant new password.
- Verify success and token marked consumed.

3. Invalid verification
- Submit incorrect current password (or expired token).
- Verify rejection, recovery guidance, and no password change.

4. Password policy failure
- Submit non-compliant new password.
- Verify requirement-specific error feedback.
- Re-submit compliant password and verify success.

5. Progressive cooldown
- Trigger 3 consecutive verification failures.
- Verify 30-second cooldown response with retry-after.
- Continue failing after cooldown windows and verify escalation up to max 15 minutes.

6. System failure rollback
- Simulate update failure during submission.
- Verify old password remains valid and user receives retry-later message.

7. User cancellation
- Enter values then cancel/navigate away before submit.
- Verify no password update and unsaved form values cleared.

8. Admin-initiated password change
- Authenticate as admin and open target user password reset flow.
- Submit compliant new password without target current password/token.
- Verify authorization enforcement, successful update, and user notification.

## Compliance Checks
- Confirm no edits to `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md`.
- Confirm style alignment with:
  - `Style Guides/google-style-guide-html-css.md`
  - `Style Guides/google-style-guide-javascript.md`
- Confirm all acceptance evidence maps back to `UC-01-AS` (and admin flow references used by feature scope).
