# Feature Specification: UC-18 Join Class Waitlists

**Feature Branch**: `[018-branch-class-waitlist]`  
**Created**: 2026-03-10  
**Status**: Draft  
**Input**: User description: "UC-18 like previously and make a new branch with same convention"

## Clarifications

### Session 2026-03-10

- Q: Does UC-18 include only joining the waitlist, or does it also include later seat-opening fulfillment such as auto-enrollment or offer acceptance? → A: Limit UC-18 to joining and recording the waitlist entry only; later seat-opening fulfillment is out of scope for this feature.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Join an Eligible Waitlist (Priority: P1)

As a student, I want to join the waitlist for a full class so I can keep my recorded place in the waitlist for any later enrollment process that is handled outside this feature if a seat opens.

**Source Artifacts**: [UC-18.md](/home/thaia/ECE493Group19/Use%20Cases/UC-18.md), [UC-18-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-18-AS.md), `AT-UC18-01`

**Why this priority**: This is the main user outcome of the use case and the minimum value the feature must deliver during registration.

**Independent Test**: Can be fully tested by selecting a full, waitlist-enabled section as an eligible authenticated student and verifying that the student is added to the waitlist with status and position information.

**Acceptance Scenarios**:

1. **Given** an authenticated student has access to the registration term and selects a full section that is waitlist-enabled, **When** the student chooses to join the waitlist, **Then** the system validates eligibility before creating the waitlist entry.
2. **Given** an eligible student joins the waitlist for a full section, **When** the waitlist entry is recorded successfully, **Then** the system confirms that the student is waitlisted and shows the section status and assigned waitlist position when the section uses numeric positions.
3. **Given** an eligible student joins the waitlist for a full section that does not use numeric waitlist positions, **When** the waitlist entry is recorded successfully, **Then** the system confirms that the student is waitlisted and shows waitlist status without inventing or displaying a position number.

---

### User Story 2 - Block Waitlisting When the Section Cannot Be Waitlisted (Priority: P2)

As a student, I want to know when a full section cannot be waitlisted so I can stop trying that section and consider alternatives.

**Source Artifacts**: [UC-18.md](/home/thaia/ECE493Group19/Use%20Cases/UC-18.md), [UC-18-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-18-AS.md), `AT-UC18-02`

**Why this priority**: Students need a clear answer when a full section does not support waitlisting at all.

**Independent Test**: Can be fully tested by selecting a full section with waitlisting disabled and verifying that the system blocks the request, creates no waitlist entry, and offers alternative sections or courses.

**Acceptance Scenarios**:

1. **Given** an authenticated student selects a full section with waitlisting disabled, **When** the student chooses to join the waitlist, **Then** the system blocks the request and states that the section is not waitlist-eligible.
2. **Given** a section cannot be waitlisted, **When** the system blocks the request, **Then** the system offers at least one relevant alternative by showing another section of the same course when one is available or another course option when no alternate section is available, and leaves the student's registration state unchanged.

---

### User Story 3 - Prevent Duplicate or Ineligible Waitlist Requests (Priority: P3)

As a student, I want the system to explain why I cannot join a waitlist when I already have that section status or when my registration status blocks the request.

**Source Artifacts**: [UC-18.md](/home/thaia/ECE493Group19/Use%20Cases/UC-18.md), [UC-18-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-18-AS.md), `AT-UC18-03`, `AT-UC18-04`

**Why this priority**: Duplicate and ineligible requests are common during registration and must be rejected without creating conflicting records.

**Independent Test**: Can be fully tested by attempting to join a waitlist when the student is already enrolled, already waitlisted, has a registration hold, or is outside an open term, and verifying that the request is rejected with the correct reason and no state change.

**Acceptance Scenarios**:

1. **Given** an authenticated student is already enrolled in or already waitlisted for the selected section, **When** the student chooses to join the waitlist, **Then** the system prevents duplication and explains the existing status.
2. **Given** an authenticated student is ineligible to waitlist because of a registration hold or a closed registration term, **When** the student chooses to join the waitlist, **Then** the system rejects the request, states the reason, and gives next-step guidance that matches the blocker: resolve the hold before retrying for a hold, or wait for an open registration term for a closed-term case.

---

### User Story 4 - Preserve State When Waitlist Recording Fails (Priority: P4)

As a student, I want the system to leave my registration state unchanged if waitlist recording fails so I do not believe I joined a waitlist when the request did not complete.

**Source Artifacts**: [UC-18.md](/home/thaia/ECE493Group19/Use%20Cases/UC-18.md), [UC-18-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-18-AS.md), `AT-UC18-05`

**Why this priority**: Waitlist failures must not create partial entries or misleading status during high-stakes registration periods.

**Independent Test**: Can be fully tested by forcing a waitlist-recording failure for an otherwise eligible request and verifying that no waitlist entry is created, no position is assigned, and the student sees a clear failure message.

**Acceptance Scenarios**:

1. **Given** an authenticated eligible student selects a full, waitlist-enabled section, **When** the system cannot record the waitlist entry, **Then** the system reports the failure and states that no waitlist entry was created.
2. **Given** a waitlist-recording failure occurs, **When** the student views the result, **Then** the student is not shown as waitlisted and no waitlist position is assigned.

### Edge Cases

- What happens when a full section becomes no longer waitlist-eligible after the student opens it but before the student selects `Join Waitlist`? The system blocks the request, states that waitlisting is unavailable for that section, and leaves the student's registration state unchanged.
- What happens when the student submits the same waitlist request more than once before the first result returns? The system returns one authoritative result and does not create duplicate waitlist entries or duplicate positions.
- What happens when the student is already enrolled in the course but attempts to waitlist the same section? The system rejects the request and identifies the existing enrolled or waitlisted status.
- What happens when multiple blocking conditions apply, such as a registration hold and a closed term? The system rejects the request, shows every blocking reason that applies, and provides next-step guidance.
- What happens when a waitlist position cannot be assigned even though the entry would otherwise be created? The system treats the request as failed, creates no partial waitlist entry, and tells the student that the request did not complete.
- What happens when a section supports waitlisting but does not assign numeric positions? The system confirms that the student is waitlisted, shows waitlist status, and does not show a fabricated waitlist position.
- What happens when a seat opens after the student has already joined the waitlist? This feature ends once the waitlist join request is confirmed or rejected; any later seat-offer or auto-enrollment process is outside the scope of UC-18.
- How does this story remain compliant with its mapped `UC-18` and `UC-18-AS` artifacts when requirements evolve? Any future change must continue to support successful waitlisting, not-waitlist-eligible blocking, duplicate-status blocking, ineligibility blocking, and rollback on waitlist-recording failure.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow an authenticated student to request waitlisting for a selected class section that is full and waitlist-enabled within the active registration term.
- **FR-002**: Before creating a waitlist entry, the system MUST validate section waitlist eligibility, registration-term access, registration holds, and whether the student is already enrolled in or already waitlisted for the section.
- **FR-003**: The system MUST create a waitlist entry only when all waitlist eligibility checks pass.
- **FR-004**: After successful waitlist creation, the system MUST confirm that the student is waitlisted and show the resulting waitlist status.
- **FR-005**: After successful waitlist creation, the system MUST show the student's waitlist position when the section assigns numeric positions and MUST show waitlist status without a position number when the section does not assign positions.
- **FR-006**: If the selected section is not waitlist-eligible, the system MUST block the request, explain that waitlisting is unavailable for the section, and offer at least one relevant alternative by showing another section of the same course when one is available or another course option when no alternate section is available.
- **FR-007**: If the student is already enrolled in or already waitlisted for the selected section, the system MUST block the request and explain the existing status.
- **FR-008**: If the student is ineligible to join the waitlist because of a registration hold or closed registration term, the system MUST block the request, explain the reason, and provide next-step guidance that matches the blocker by telling the student to resolve the hold before retrying or to wait for an open registration term, respectively.
- **FR-009**: Whenever the system blocks a waitlist request, the student's registration and waitlist state MUST remain unchanged.
- **FR-010**: If the system cannot record the waitlist entry or cannot assign the required waitlist position, the system MUST report failure, state that no waitlist entry was created, and leave the student's registration and waitlist state unchanged.
- **FR-011**: The system MUST prevent duplicate processing when the same waitlist request is submitted more than once before the first result completes.
- **FR-012**: This feature MUST end when the waitlist join request is confirmed or rejected and MUST NOT include later seat-opening fulfillment such as auto-enrollment or offer acceptance.
- **FR-013**: This feature specification MUST remain traceable to [Use Cases/UC-18.md](/home/thaia/ECE493Group19/Use%20Cases/UC-18.md) and [Acceptance Tests/UC-18-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-18-AS.md).

### Non-Functional Requirements

- **NFR-001**: For at least 95% of eligible waitlist requests under up to 20 concurrent waitlist attempts, the student MUST receive a final success or blocked result within 1 second of selecting `Join Waitlist`.
- **NFR-002**: The success, blocked, and failure waitlist results MUST support keyboard-only navigation and expose status messages in a form that assistive technologies can announce.
- **NFR-003**: The system MUST retain an auditable record of each successful, blocked, and failed waitlist request, including the final outcome and blocking or failure reason.
- **NFR-004**: The terms `waitlisted`, `waitlist position`, `waitlist unavailable`, `already enrolled`, `already waitlisted`, `registration hold`, and `term closed` MUST be used consistently across student-facing requirements and messages.
- **NFR-005**: If required dependency data is unavailable, stale, or cannot be confirmed at request time, the system MUST return a failure result that states the request could not be completed, MUST avoid creating or changing any waitlist state, and MUST tell the student to retry after data becomes available.

### Assumptions

- The student is already authenticated before starting the waitlist action.
- The class section was already found through an existing search, browse, or registration workflow outside the scope of this feature.
- A full section can still accept waitlist requests when the section is flagged as waitlist-enabled.
- Some sections assign an explicit numeric waitlist position while others only confirm waitlist status with no position number.

### Dependencies

- The system depends on existing class-section availability data that identifies whether a section is full and whether waitlisting is enabled.
- The system depends on registration-term access, hold status, and existing enrollment or waitlist status data being available when the request is evaluated.
- The system depends on waitlist recording rules that can store the student's waitlist status and assigned position when applicable.

### Key Entities *(include if feature involves data)*

- **Student**: The authenticated user attempting to join a waitlist for a class section.
- **Class Section**: A specific section with seat status, waitlist eligibility, and registration-term context.
- **Waitlist Request**: The student's attempt to join the waitlist for a selected full section.
- **Waitlist Entry**: The recorded waitlist status for a student and section, including assigned position when applicable.
- **Waitlist Eligibility Result**: The outcome of checks that determine whether the student can be added to the waitlist.
- **Waitlist Audit Record**: The persisted audit record for each waitlist request, including request identifier, student, section, final outcome, blocking or failure reason, and request timestamp.

### Traceability

| Requirement Area | Acceptance Coverage |
|--------|--------|
| `FR-001` to `FR-005` | `AT-UC18-01` |
| `FR-006` | `AT-UC18-02` |
| `FR-007` | `AT-UC18-03` |
| `FR-008` to `FR-009` | `AT-UC18-04` |
| `FR-010` | `AT-UC18-05` |
| `FR-011` | Duplicate-request validation derived from `AT-UC18-03` and waitlist state protection rules |
| `FR-012` | Scope validation against the UC-18 main success and documented extensions for join-waitlist behavior only |
| `FR-013` | `AT-UC18-01` to `AT-UC18-05` |
| `NFR-001` | `SC-005` |
| `NFR-002` | Accessibility validation derived from waitlist success, blocked, and failure flows |
| `NFR-003` | Audit validation derived from successful, blocked, and failed waitlist attempts |
| `NFR-004` | Terminology review across student-facing waitlist requirements |
| `NFR-005` | Failure-path validation derived from blocked and failed waitlist attempts with unchanged-state protection |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of eligible students who select `Join Waitlist` for a full, waitlist-enabled section are added to the waitlist and shown their status.
- **SC-002**: In acceptance testing, 100% of blocked requests for not-waitlist-eligible sections, duplicate status, registration holds, or closed terms create no waitlist entry and leave registration state unchanged.
- **SC-003**: In acceptance testing, 100% of blocked waitlist requests present a reason that identifies the applicable blocking condition and any next-step guidance required by the scenario.
- **SC-004**: In acceptance testing, 100% of simulated waitlist-recording failures leave no partial waitlist entry and show a clear failure result.
- **SC-005**: In scenario-based validation, at least 95% of students receive a final waitlist result within 1 second of selecting `Join Waitlist` under peak traffic of up to 20 concurrent waitlist attempts.
