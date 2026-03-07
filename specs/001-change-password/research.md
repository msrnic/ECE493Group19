# Phase 0 Research - 001-change-password

## Decision 1: Server/runtime baseline
- Decision: Use Node.js 20 LTS with Express 4.x for MVC controller routing and server-rendered HTML views enhanced by vanilla browser JavaScript.
- Rationale: Keeps implementation within constitution-mandated HTML/CSS/JavaScript stack and supports form-driven security flows with minimal complexity.
- Alternatives considered: Client-only SPA with API backend (adds complexity without clear benefit for this feature); non-JS backend frameworks (violates stack constraint).

## Decision 2: Credential storage and verification
- Decision: Store passwords as `bcrypt` hashes with per-password salts and verify current password via constant-time hash compare.
- Rationale: Mature approach for password security in JavaScript environments and aligns with secure update semantics required by FR-006/FR-008.
- Alternatives considered: Argon2 (strong option but introduces dependency/ops variability); unsalted SHA variants (rejected as insecure).

## Decision 3: Reset token handling
- Decision: Persist reset tokens in SQLite as hashed token digests with explicit expiry and consumed timestamps.
- Rationale: Avoids storing raw tokens while enabling expiry checks and one-time use behavior for FR-002/FR-004.
- Alternatives considered: Stateless JWT reset token only (harder one-time invalidation); plaintext token storage (security risk).

## Decision 4: Progressive cooldown model
- Decision: Track consecutive failed verification attempts per actor-target context; start cooldown at 30 seconds after 3 failures and increase exponentially up to 15 minutes.
- Rationale: Directly satisfies clarified requirement and FR-015/FR-016 while reducing brute-force risk.
- Alternatives considered: Fixed lockout window (less adaptive); IP-only throttling (insufficient user/account protection).

## Decision 5: Session invalidation behavior after success
- Decision: After successful password update, invalidate all active sessions for affected user except the current session that initiated the change.
- Rationale: Implements clarified behavior with strong account takeover containment and preserves current user continuity.
- Alternatives considered: Invalidate all sessions including current (worse UX); no invalidation (security risk).

## Decision 6: Admin-initiated password changes
- Decision: Provide dedicated admin controller/service path that requires admin authorization and target-user selection, without target current-password/reset-token validation.
- Rationale: Matches clarified rule and FR-017 to FR-019 while preserving clear authorization boundaries.
- Alternatives considered: Reuse end-user endpoint with bypass flag (higher misuse risk); requiring target current password (conflicts with requirement).

## Decision 7: Notification requirements
- Decision: Emit a password-change notification record on every successful change, including admin-initiated changes.
- Rationale: Satisfies FR-020 and provides an auditable trail to affected users.
- Alternatives considered: Notify only self-service changes (incomplete requirement coverage); silent admin changes (security transparency issue).

## Decision 8: Testing strategy
- Decision: Use layered tests: unit (policy/cooldown logic), integration (endpoint + SQLite transaction behavior), acceptance smoke (critical UC-01 browser paths).
- Rationale: Covers security-critical logic and user-visible outcomes while preserving traceability to UC/AT artifacts.
- Alternatives considered: Unit-only tests (insufficient for transaction/session behaviors); full end-to-end only (slow and brittle).

## Decision 9: Open clarification resolution summary
- Decision: No unresolved technical clarifications remain for Phase 1 design.
- Rationale: Stack, runtime, data model direction, security behaviors, and interface shape are now explicit.
- Alternatives considered: Deferring cooldown/session details to implementation (would violate planning completeness).
