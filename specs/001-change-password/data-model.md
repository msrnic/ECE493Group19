# Data Model - 001-change-password

## Entity: UserAccount
- Purpose: Persist identity and credential state for end users and admins.
- Fields:
  - `user_id` (INTEGER, PK)
  - `email` (TEXT, unique, required)
  - `role` (TEXT, required; e.g., `student`, `admin`)
  - `password_hash` (TEXT, required)
  - `password_changed_at` (DATETIME, required)
  - `updated_at` (DATETIME, required)
- Validation rules:
  - Email must be normalized and unique.
  - Role must be one of allowed RBAC roles.
- Relationships:
  - One-to-many with `UserSession`.
  - One-to-many with `PasswordResetToken`.
  - One-to-many with `PasswordChangeAttempt` (as actor and/or target).
  - One-to-many with `UserNotification`.

## Entity: PasswordResetToken
- Purpose: Support reset-token based password change flow.
- Fields:
  - `token_id` (INTEGER, PK)
  - `user_id` (INTEGER, FK -> UserAccount.user_id, required)
  - `token_digest` (TEXT, required)
  - `issued_at` (DATETIME, required)
  - `expires_at` (DATETIME, required)
  - `consumed_at` (DATETIME, nullable)
  - `revoked_at` (DATETIME, nullable)
- Validation rules:
  - Token is valid only if `now < expires_at` and `consumed_at IS NULL` and `revoked_at IS NULL`.
- State transitions:
  - `issued -> consumed` on successful use.
  - `issued -> expired` when `now >= expires_at`.
  - `issued -> revoked` when manually invalidated.

## Entity: PasswordChangeAttempt
- Purpose: Record each password-change submission and outcome.
- Fields:
  - `attempt_id` (INTEGER, PK)
  - `actor_user_id` (INTEGER, FK -> UserAccount.user_id, nullable for reset token flow)
  - `target_user_id` (INTEGER, FK -> UserAccount.user_id, required)
  - `verification_type` (TEXT, required; `current_password`, `reset_token`, `admin_override`)
  - `outcome` (TEXT, required; `success`, `invalid_verification`, `policy_rejected`, `cooldown_blocked`, `system_error`, `cancelled`)
  - `failure_count_after_attempt` (INTEGER, required, default 0)
  - `cooldown_until` (DATETIME, nullable)
  - `request_id` (TEXT, required)
  - `created_at` (DATETIME, required)
- Validation rules:
  - `verification_type` and `outcome` must be enum members.
  - `target_user_id` must exist.
- Relationships:
  - Many-to-one with `UserAccount` (actor, target).

## Entity: VerificationCooldown
- Purpose: Persist progressive cooldown window for repeated failures.
- Fields:
  - `cooldown_id` (INTEGER, PK)
  - `scope_key` (TEXT, unique, required; actor-target or token/user context)
  - `consecutive_failures` (INTEGER, required, default 0)
  - `cooldown_until` (DATETIME, nullable)
  - `last_failure_at` (DATETIME, nullable)
  - `updated_at` (DATETIME, required)
- Validation rules:
  - `consecutive_failures >= 0`.
  - `cooldown_until` null when no active cooldown.
- State transitions:
  - Failure under threshold: increment failures.
  - Third failure: set cooldown to `now + 30s`.
  - Continued failures: backoff growth capped at 15 minutes.
  - Successful verification: reset failures and clear cooldown.

## Entity: UserSession
- Purpose: Track active sessions to support FR-014 invalidation behavior.
- Fields:
  - `session_id` (TEXT, PK)
  - `user_id` (INTEGER, FK -> UserAccount.user_id, required)
  - `created_at` (DATETIME, required)
  - `last_seen_at` (DATETIME, required)
  - `invalidated_at` (DATETIME, nullable)
  - `invalidation_reason` (TEXT, nullable)
- Validation rules:
  - Session is active if `invalidated_at IS NULL`.
- State transitions:
  - Active -> invalidated for all non-current sessions on successful password change.

## Entity: UserNotification
- Purpose: Record outbound user notifications for security-sensitive events.
- Fields:
  - `notification_id` (INTEGER, PK)
  - `user_id` (INTEGER, FK -> UserAccount.user_id, required)
  - `event_type` (TEXT, required; `password_changed`)
  - `channel` (TEXT, required; `email`, `in_app`)
  - `status` (TEXT, required; `queued`, `sent`, `failed`)
  - `payload_json` (TEXT, required)
  - `created_at` (DATETIME, required)
  - `sent_at` (DATETIME, nullable)
- Validation rules:
  - Event type must match supported security notification events.
  - Payload must omit sensitive credential material.

## Key Relationships Summary
- `UserAccount 1..* PasswordResetToken`
- `UserAccount 1..* UserSession`
- `UserAccount 1..* PasswordChangeAttempt (actor and target)`
- `UserAccount 1..* UserNotification`
- `VerificationCooldown` is keyed independently but references users through `scope_key` encoding.
