# Feature Specification: UC-16 Drop Priority Over Withdrawal

**Feature Branch**: `[016-drop-priority-withdrawal]`  
**Created**: 2026-03-09  
**Status**: Draft  
**Input**: User description: "UC-16, corresponding acceptance tests are in Acceptance Tests folder with the same use case number, create a branch that matches the use case number"

## Clarifications

### Session 2026-03-09

- Q: How should the system classify a class removal request submitted at the exact drop deadline timestamp? → A: Treat the exact deadline timestamp as withdrawal.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Apply Drop Before Withdrawal (Priority: P1)

As a student, I want the system to apply a class drop whenever it is still allowed so the system does not process my request as a withdrawal when a drop is still permitted.

**Source**: UC-16, AT-UC16-01

**Why this priority**: This is the core policy behavior for the use case and directly affects student fees and academic records.

**Independent Test**: Can be fully tested by initiating class removal before the drop deadline and verifying the system applies a drop, removes the class, and reflects the drop-related fee outcome.

**Acceptance Scenarios**:

1. **Given** an authenticated student is enrolled in a class and the current time is before the applicable drop deadline, **When** the student initiates removal of that class, **Then** the system displays the deadline date and time, the student's current eligibility status, and a summary of the drop fee treatment before confirmation.
2. **Given** an authenticated student is enrolled in a class and the current time is before the applicable drop deadline, **When** the student confirms class removal, **Then** the system applies a drop rather than a withdrawal, removes the class from the student's schedule, and shows the resulting fee treatment summary.

---

### User Story 2 - Fall Back to Withdrawal After Deadline (Priority: P2)

As a student, I want the system to switch to withdrawal when drop is no longer allowed so my class removal request still follows university policy.

**Source**: UC-16, AT-UC16-02

**Why this priority**: Students still need a valid removal path after the deadline, but it must use the correct policy outcome.

**Independent Test**: Can be fully tested by initiating class removal after the drop deadline and verifying the system applies withdrawal, updates the schedule, and shows the withdrawal-related impact.

**Acceptance Scenarios**:

1. **Given** an authenticated student is enrolled in a class and the current time is after the applicable drop deadline, **When** the student initiates removal of that class, **Then** the system displays the passed deadline and indicates that the request will be processed as a withdrawal.
2. **Given** an authenticated student is enrolled in a class and the current time is after the applicable drop deadline, **When** the student confirms class removal, **Then** the system removes the class from the schedule and communicates the resulting withdrawal fee outcome.

---

### User Story 3 - Block Removal When Policy Cannot Be Determined (Priority: P3)

As a student, I want the system to stop the transaction when it cannot determine whether drop or withdrawal applies so I do not receive an incorrect academic or fee outcome.

**Source**: UC-16, AT-UC16-03

**Why this priority**: When policy status is unknown, blocking the action is safer than applying the wrong removal type.

**Independent Test**: Can be fully tested by forcing deadline or policy lookup to fail and verifying the system blocks the action, shows guidance, and leaves the schedule unchanged.

**Acceptance Scenarios**:

1. **Given** an authenticated student is enrolled in a class and deadline or policy data cannot be determined because the lookup is temporarily unavailable, **When** the student initiates class removal, **Then** the system blocks the action and instructs the student to retry later.
2. **Given** an authenticated student is enrolled in a class and deadline or policy data cannot be determined, **When** the system blocks the action, **Then** the student's schedule and fee state remain unchanged.
3. **Given** an authenticated student is enrolled in a class and deadline or policy data is missing or invalid for the term, **When** the student initiates class removal, **Then** the system blocks the action and instructs the student to contact administrative staff.

---

### User Story 4 - Preserve State on Update Failure (Priority: P4)

As a student, I want the system to avoid partial updates if the removal action fails after the correct outcome is chosen so my schedule and fees stay consistent.

**Source**: UC-16, AT-UC16-04

**Why this priority**: Consistency matters after policy selection, especially when schedule and fee changes must either both succeed or both fail.

**Independent Test**: Can be fully tested by forcing the schedule or fee update to fail after the system selects drop or withdrawal and verifying no partial changes are committed.

**Acceptance Scenarios**:

1. **Given** an authenticated student initiates class removal and the system has correctly selected drop or withdrawal, **When** the schedule or fee update fails, **Then** the system reports the failure and leaves the student's schedule unchanged.
2. **Given** an authenticated student initiates class removal and the system has correctly selected drop or withdrawal, **When** the update fails, **Then** no fee change is applied.
3. **Given** an authenticated student experiences a blocked or failed removal attempt, **When** the error message is shown, **Then** the system tells the student whether to retry, refresh the schedule, or contact administrative staff.

### Edge Cases

- What happens when the current time is exactly at the drop deadline? The system treats the request as a withdrawal and communicates that the drop deadline has been reached.
- How does system handle a class removal request when the student is no longer enrolled in the selected class? The system rejects the request without changing schedule or fees and explains that the class is not eligible for removal.
- What happens when no active deadline policy exists for the class term? The system blocks the action, makes no changes, and instructs the student to contact administrative staff.
- What happens when the policy lookup is temporarily unavailable? The system blocks the action, makes no changes, and tells the student to retry later.
- What happens when a student submits the same removal request multiple times? The system prevents duplicate processing and returns a single authoritative result.
- What happens when the enrollment changes after policy evaluation but before commit? The system aborts the update, keeps schedule and fee state unchanged, and requires the student to refresh before trying again.
- How does this story remain compliant with its mapped `UC-16` and `UC-16-AS` artifacts when requirements evolve? Any future changes must preserve the four validated behaviors: drop before deadline, withdrawal after deadline, block on policy lookup failure, and no partial changes on update failure.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow only an authenticated student to request removal of classes from that student's own schedule.
- **FR-002**: Before a student confirms class removal, the system MUST display the applicable term deadline date and time, the current removal classification (`drop` or `withdrawal`), and a fee-treatment summary for that classification.
- **FR-003**: The system MUST determine removal classification by comparing the request timestamp against one active term-level drop deadline policy for the class's academic term.
- **FR-004**: The system MUST apply drop when the student removes a class before the applicable drop deadline.
- **FR-005**: The system MUST apply withdrawal when the student removes a class at the exact drop deadline timestamp or after the applicable drop deadline.
- **FR-006**: For self-service class removal governed by the term deadline policy, no additional student-selectable override may change the `drop` versus `withdrawal` result determined by `FR-003`.
- **FR-007**: After the system applies drop or withdrawal successfully, it MUST update the student's schedule to reflect that the class has been removed.
- **FR-008**: After a successful class removal, the system MUST present the resulting fee outcome as one of: reduced/refunded per drop policy, adjusted per withdrawal policy, or no additional change required.
- **FR-009**: If policy lookup is temporarily unavailable, the system MUST block the class removal request, preserve schedule and fee state, and instruct the student to retry later.
- **FR-010**: If deadline or policy data is missing or invalid for the term, the system MUST block the class removal request, preserve schedule and fee state, and instruct the student to contact administrative staff.
- **FR-011**: If the schedule or fee update fails after drop or withdrawal has been selected, the system MUST report the failure, leave schedule and fee state unchanged, and tell the student to retry after refreshing the schedule.
- **FR-012**: The system MUST reject removal attempts for classes that are not in an active enrolled state, including not enrolled, already dropped, already withdrawn, or administratively locked records.
- **FR-013**: The system MUST prevent duplicate processing when a student submits the same removal request more than once before the first request is resolved.
- **FR-014**: If the enrollment state changes after policy evaluation but before the update is committed, the system MUST cancel the transaction, preserve schedule and fee state, and require the student to refresh before retrying.
- **FR-015**: The system MUST record an auditable outcome for each completed, blocked, or failed removal attempt, including the evaluated removal classification and the reason for the final result.
- **FR-016**: This feature specification MUST remain traceable to [Use Cases/UC-16.md](/home/thaia/ECE493Group19/Use%20Cases/UC-16.md) and [Acceptance Tests/UC-16-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-16-AS.md).

### Non-Functional Requirements

- **NFR-001**: For at least 95% of class-removal requests under a load of up to 20 concurrent removal attempts, the student MUST receive the final drop, withdrawal, or blocked result within 1 second of confirmation.
- **NFR-002**: The system MUST make failure messages available whenever policy lookup or update processing fails, even if the removal request cannot be completed.
- **NFR-003**: The removal confirmation, success, and error experiences MUST support keyboard-only navigation and expose status messages in a form that assistive technologies can announce.
- **NFR-004**: The terms `drop`, `withdrawal`, `blocked`, `retry later`, and `contact administrative staff` MUST be used consistently across student-facing requirements and messages.

### Assumptions

- The institution has a defined drop deadline that separates drop from withdrawal for the relevant class and term.
- The authoritative request timestamp is the same time source used to evaluate the term deadline policy.

### Dependencies

- The system depends on one authoritative term-level deadline policy source for each class term used in self-service removal.
- The system depends on one authoritative fee policy source capable of classifying the result as drop policy, withdrawal policy, or no additional change.
- The system depends on a single authoritative request timestamp for deadline evaluation and audit records.

### Key Entities *(include if feature involves data)*

- **Student**: The authenticated user requesting removal of an enrolled class.
- **Enrollment Record**: The student's current registration state for a specific class, including whether removal is possible.
- **Removal Policy Decision**: The determined outcome of a class removal request, identifying whether the request should be processed as a drop or withdrawal.
- **Fee Outcome**: The financial effect communicated to the student after a class removal succeeds or remains unchanged when the action fails.

### Traceability

| Requirement Area | Acceptance Coverage |
|--------|--------|
| `FR-001` | `AT-UC16-01` to `AT-UC16-04` |
| `FR-002` to `FR-006` | `AT-UC16-01`, `AT-UC16-02` |
| `FR-007` to `FR-008` | `AT-UC16-01`, `AT-UC16-02` |
| `FR-009` to `FR-010` | `AT-UC16-03` |
| `FR-012` to `FR-013` | Additional edge-case validation derived from UC-16 scope |
| `FR-011`, `FR-014`, `FR-015` | `AT-UC16-04` |
| `FR-016` | `AT-UC16-01` to `AT-UC16-04` |
| `NFR-001` | `SC-005` plus performance validation derived from plan constraints |
| `NFR-002` | `AT-UC16-03`, `AT-UC16-04` |
| `NFR-003` | Accessibility validation derived from confirmation, result, and error flows |
| `NFR-004` | Copy review across student-facing removal messages |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of class removal requests initiated before the drop deadline are processed as drops rather than withdrawals.
- **SC-002**: In acceptance testing, 100% of class removal requests initiated after the drop deadline are processed as withdrawals.
- **SC-003**: In acceptance testing, 100% of simulated deadline or policy lookup failures block the transaction and leave schedule and fee state unchanged.
- **SC-004**: In acceptance testing, 100% of simulated update failures after policy selection leave the student's schedule and fee state unchanged.
- **SC-005**: In scenario-based validation, at least 95% of students receive a final removal result within 1 second of confirming the request under standard peak registration traffic of up to 20 concurrent removal attempts.
