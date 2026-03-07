# Phase 0 Research: User Login Authentication

## Decision 1: Use server-rendered MVC with Express controllers and HTML views
- Decision: Implement login in a Node.js/Express MVC app where controllers coordinate model/services and render HTML views.
- Rationale: Keeps architecture explicitly MVC, uses required HTML/CSS/JavaScript stack, and cleanly maps UC-02 login flows to controller actions and view states.
- Alternatives considered: Client-only SPA authentication flow (rejected because server-side session and lockout enforcement is clearer and safer in MVC server logic).

## Decision 2: Use bcrypt password-hash verification against SQLite-stored hashes
- Decision: Store password hashes in SQLite accounts table and verify using bcrypt during authentication.
- Rationale: Avoids plaintext password storage, is standard practice in JS ecosystems, and supports deterministic invalid-credentials behavior for UC-02.
- Alternatives considered: Custom hash functions (rejected due to weaker security posture and maintenance risk).

## Decision 3: Enforce lockout policy in model/service layer
- Decision: Lock account for 15 minutes after 5 consecutive failed attempts, tracked per account in SQLite.
- Rationale: Matches clarified requirement exactly and keeps enforcement independent from UI/client behavior.
- Alternatives considered: In-memory attempt counters (rejected because counters would reset on restart and break policy consistency).

## Decision 4: Persist login attempts and sessions for auditability and recovery
- Decision: Record each login attempt and each authenticated session in SQLite tables (`login_attempts`, `user_sessions`).
- Rationale: Required by FR-011 and supports troubleshooting of outage/lockout behavior.
- Alternatives considered: Application log files only (rejected because they are harder to query for per-account policy decisions).

## Decision 5: Keep Authentication Service as an internal service boundary
- Decision: Model credential validation through an `auth-service` abstraction invoked by controller; service can later map to external provider without controller changes.
- Rationale: Satisfies spec dependency while preserving testability and allowing outage simulation for UC-02 extension 3c.
- Alternatives considered: Direct model checks inside controller (rejected because it mixes controller and authentication-domain logic).

## Decision 6: Include course persistence in SQLite baseline schema
- Decision: Define a `courses` table and account-to-course linkage in the same SQLite schema, even though login does not modify course records.
- Rationale: Constitution requires persistent storage for account and course information.
- Alternatives considered: Deferring course table to later features (rejected due to constitution non-compliance risk).

## Decision 7: Testing strategy spans unit, integration, and E2E acceptance
- Decision: Use Node test runner for model/service unit tests, Supertest for HTTP flow integration, and Playwright for browser login scenarios.
- Rationale: Covers controller/model contracts and end-user workflows in UC-02-AS.
- Alternatives considered: Unit tests only (rejected because acceptance outcomes depend on multi-layer behavior).
