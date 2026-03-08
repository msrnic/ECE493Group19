# Phase 0 Research: Update Personal Details

## Decision 1: Use server-rendered MVC with JavaScript controllers/models and HTML/CSS views

- Decision: Implement backend MVC in Node.js JavaScript with Express; render HTML views and attach client-side JavaScript for form behavior.
- Rationale: Satisfies mandatory HTML/CSS/JS stack while keeping clear MVC boundaries required by constitution.
- Alternatives considered:
  - SPA frontend + JSON API only: valid, but unnecessary complexity for a single form workflow.
  - Non-MVC patterns: rejected due to constitution requirement.

## Decision 2: Use SQLite with transactional updates for personal details persistence

- Decision: Store account, course, and personal-details data in SQLite and execute update writes inside explicit transactions.
- Rationale: SQLite is mandatory; transactions guarantee no partial writes on system failure (FR-007, SC-004).
- Alternatives considered:
  - In-memory/session-only storage: rejected because persistence is required.
  - External DB engines (Postgres/MySQL): rejected by constitution stack gate.

## Decision 3: Field-level validation split between client UX and server authority

- Decision: Run immediate client-side checks for usability and enforce final validation server-side before any save.
- Rationale: Meets FR-003/FR-004 while preventing bypass of browser-only checks.
- Alternatives considered:
  - Client-only validation: rejected as insecure and bypassable.
  - Server-only validation with no inline feedback: rejected for weaker user correction flow.

## Decision 4: Concurrency handling uses last-write-wins by commit order

- Decision: Accept concurrent valid submissions and persist whichever successful commit happens most recently.
- Rationale: Matches clarified requirement in spec and FR-012.
- Alternatives considered:
  - Optimistic version conflict prompts: rejected because requirement explicitly chooses last-write-wins.
  - Pessimistic locking: rejected as unnecessary complexity for this scope.

## Decision 5: Navigation-away handling with dirty-state confirmation

- Decision: Track unsaved edits in the browser and trigger confirmation prompt on cancel/navigation before save.
- Rationale: Directly implements FR-009a and UC-05 extension flow 6a.
- Alternatives considered:
  - Silent discard on navigation: rejected because confirmation is explicitly required.
  - Auto-save drafts: rejected because unsaved edits must be discardable.

## Decision 6: Test approach maps directly to UC-05-AS flows

- Decision: Create integration tests for main success, validation failure/retry, simulated DB save failure, and cancel/abandon flow.
- Rationale: Provides one-to-one traceability demanded by constitution and FR-011.
- Alternatives considered:
  - Unit tests only: rejected because cross-layer behavior is the key risk.
  - Manual-only verification: rejected for insufficient regression coverage.
