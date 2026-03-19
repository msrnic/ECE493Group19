# Feature Specification: Time Limit for Dropping from a Class

**Feature Branch**: `015-drop-time-limit`  
**Created**: 2026-03-14  
**Status**: Draft  
**Input**: User description: "UC-15: A time limit for dropping from a class"

## Clarifications

### Session 2026-03-14

- Q: Which timezone should deadline evaluation use? -> A: Evaluate deadlines in the university's official academic calendar timezone.
- Q: Is there a grace period after deadline expiration? -> A: No grace period; deadline enforcement is strict at the published cutoff timestamp.
- Q: What should happen when deadline data cannot be retrieved? -> A: Block drop action, show cannot-confirm-deadline message, and keep schedule unchanged.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Deadline and Drop Before Cutoff (Priority: P1)

A student can view the add/drop deadline and proceed with drop when current time
is before the cutoff.

**Why this priority**: This is the primary functional value of UC-15 and enables
policy-compliant class management.

**Independent Test**: Can be fully tested by executing
`Acceptance Tests/UC-15-AS.md` test case `AT-UC15-01`.

**Acceptance Scenarios**:

1. **Given** student is authenticated and current time is before deadline,
   **When** student opens add/drop deadline context,
   **Then** system displays deadline and marks drop as allowed.
2. **Given** drop is allowed before deadline,
   **When** student attempts drop,
   **Then** system allows continuation to drop flow.

Source mapping: `Use Cases/UC-15.md` (Main Success Scenario),
`Acceptance Tests/UC-15-AS.md` (`AT-UC15-01`).

---

### User Story 2 - Block Drop After Cutoff (Priority: P2)

A student sees that deadline has passed and is prevented from dropping class.

**Why this priority**: Enforces institutional policy and prevents invalid state
changes after deadline.

**Independent Test**: Can be fully tested by executing
`Acceptance Tests/UC-15-AS.md` test case `AT-UC15-02`.

**Acceptance Scenarios**:

1. **Given** current time is after deadline,
   **When** student opens deadline or drop entry point,
   **Then** system marks deadline as passed and blocks drop action.
2. **Given** student attempts drop after deadline,
   **When** request is evaluated,
   **Then** system denies request with policy explanation and no schedule change.

Source mapping: `Use Cases/UC-15.md` (System performs requested action),
`Acceptance Tests/UC-15-AS.md` (`AT-UC15-02`).

---

### User Story 3 - Handle Deadline Retrieval/Evaluation Errors (Priority: P3)

A student receives clear message when deadline cannot be confirmed, and no
schedule mutation occurs.

**Why this priority**: Required to satisfy extension 2a and failed end
condition for safe behavior.

**Independent Test**: Can be fully tested by executing
`Acceptance Tests/UC-15-AS.md` test case `AT-UC15-03` with fault injection.

**Acceptance Scenarios**:

1. **Given** deadline retrieval/evaluation failure occurs,
   **When** student opens deadline or drop flow,
   **Then** system reports deadline confirmation unavailable.
2. **Given** deadline cannot be confirmed,
   **When** student attempts drop,
   **Then** system blocks action and leaves schedule unchanged.

Source mapping: `Use Cases/UC-15.md` (Extension 2a),
`Acceptance Tests/UC-15-AS.md` (`AT-UC15-03`).

### Edge Cases

- Student time zone differs from university timezone: displayed/evaluated policy
  uses university official timezone consistently.
- Request arrives exactly at cutoff timestamp: treated as after deadline when
  timestamp is at or beyond cutoff.
- Deadline configuration missing for term: drop action blocked with support
  guidance.
- Deadline retrieval latency causes uncertainty: action blocked until explicit
  deadline decision is available.
- Requirements remain traceable to `Use Cases/UC-15.md` and
  `Acceptance Tests/UC-15-AS.md`; downstream artifacts must update if scope
  changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display add/drop deadline information for the
  student's relevant term.
- **FR-002**: System MUST evaluate drop eligibility using the university's
  official academic calendar timezone.
- **FR-003**: If current time is before deadline, system MUST allow drop action
  to proceed.
- **FR-004**: If current time is at or after deadline, system MUST block drop
  action and provide policy explanation.
- **FR-005**: System MUST enforce strict cutoff behavior with no grace period
  after published deadline.
- **FR-006**: System MUST clearly indicate deadline status (upcoming/passed)
  where drop decision is shown.
- **FR-007**: If deadline retrieval or evaluation fails, system MUST report
  inability to confirm deadline and MUST block drop action.
- **FR-008**: On deadline-evaluation failure, system MUST leave schedule and
  enrollment state unchanged.
- **FR-009**: Deadline display and decision logic MUST use the same canonical
  deadline value for consistency.
- **FR-010**: Feature scope and acceptance criteria MUST map to
  `Use Cases/UC-15.md` and `Acceptance Tests/UC-15-AS.md`.
- **FR-011**: The solution MUST use HTML/CSS/JavaScript with SQLite and preserve
  MVC boundaries.
- **FR-012**: Feature work MUST NOT modify `Use Cases/UC-*.md` or
  `Acceptance Tests/UC-*-AS.md` without explicit authorization.
- **FR-013**: HTML/CSS and JavaScript implementation MUST comply with
  `Style Guides/google-style-guide-html-css.md` and
  `Style Guides/google-style-guide-javascript.md`.

### Key Entities *(include if feature involves data)*

- **DropDeadlineRule**: Term-specific deadline policy containing cutoff timestamp,
  timezone identifier, and status metadata.
- **DeadlineEvaluationResult**: Decision artifact for a requested drop action
  containing allowed/blocked/error outcome and rationale.
- **TermCalendar**: Academic term configuration source for add/drop windows.
- **DropAttemptAudit**: Read-only record of eligibility checks and outcomes for
  policy traceability.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of before-deadline scenarios show
  deadline and permit drop progression (`AT-UC15-01`).
- **SC-002**: In acceptance testing, 100% of after-deadline scenarios block drop
  with clear reason (`AT-UC15-02`).
- **SC-003**: In fault-injected tests, 100% of deadline retrieval/evaluation
  failures block drop and keep state unchanged (`AT-UC15-03`).
- **SC-004**: Students can determine drop eligibility status in under 15 seconds
  after opening the deadline/drop page.
