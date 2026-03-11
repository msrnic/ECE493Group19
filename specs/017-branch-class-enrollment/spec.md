# Feature Specification: UC-17 Enroll in Found Classes

**Feature Branch**: `[017-branch-class-enrollment]`  
**Created**: 2026-03-10  
**Status**: Draft  
**Input**: User description: "UC-17 and acceptance tests in Acceptance Test folder"

## Clarifications

### Session 2026-03-10

- Q: Should schedule-conflict checks remain part of UC-17 scope even though the acceptance suite does not call them out as a separate test? → A: Keep schedule-conflict checks in scope as a required enrollment blocker.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enroll in an Eligible Class (Priority: P1)

As a student, I want to enroll in a class I found so it is added to my schedule when I meet all enrollment requirements.

**Source Artifacts**: [UC-17.md](/home/thaia/ECE493Group19/Use%20Cases/UC-17.md), [UC-17-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-17-AS.md), `AT-UC17-01`

**Why this priority**: This is the core value of the use case and the primary success outcome students expect from class search and registration.

**Independent Test**: Can be fully tested by selecting an open class for an eligible student and verifying that enrollment succeeds, the schedule updates, and any fee change is communicated.

**Acceptance Scenarios**:

1. **Given** an authenticated student has found a class with available seats, satisfied prerequisites, no registration hold, and no schedule conflict, **When** the student selects enroll, **Then** the system performs eligibility checks before creating the enrollment.
2. **Given** an authenticated eligible student selects enroll for an open class, **When** enrollment succeeds, **Then** the class appears on the student's schedule and the system confirms the class name, schedule placement, enrollment status, and resulting fee assessment summary.

---

### User Story 2 - Block Enrollment When Requirements Are Not Met (Priority: P2)

As a student, I want to know why enrollment is blocked when I am not eligible so I can understand what prevents me from registering.

**Source Artifacts**: [UC-17.md](/home/thaia/ECE493Group19/Use%20Cases/UC-17.md), [UC-17-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-17-AS.md), `AT-UC17-02`, `AT-UC17-04`

**Why this priority**: Students need actionable feedback when enrollment cannot proceed due to prerequisites, holds, or schedule restrictions.

**Independent Test**: Can be fully tested by attempting to enroll in a class with unmet prerequisites or a registration hold and verifying the system blocks enrollment with a clear explanation while leaving the schedule unchanged.

**Acceptance Scenarios**:

1. **Given** an authenticated student does not meet the prerequisites for a found class, **When** the student selects enroll, **Then** the system blocks enrollment and displays the unmet prerequisites.
2. **Given** an authenticated student has a registration hold, **When** the student selects enroll for a found class, **Then** the system blocks enrollment and explains the hold.

---

### User Story 3 - Block Enrollment for Full Classes (Priority: P3)

As a student, I want to know when a class is full so I do not assume registration succeeded when no seat is available.

**Source Artifacts**: [UC-17.md](/home/thaia/ECE493Group19/Use%20Cases/UC-17.md), [UC-17-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-17-AS.md), `AT-UC17-03`

**Why this priority**: Capacity is a common enrollment failure and students need immediate clarity about seat availability.

**Independent Test**: Can be fully tested by attempting to enroll in a full class and verifying the system blocks enrollment, shows remaining-seat information, and leaves the schedule unchanged.

**Acceptance Scenarios**:

1. **Given** an authenticated student selects enroll for a class with no available seats, **When** the system evaluates capacity, **Then** the system blocks enrollment and shows that zero seats remain and the class cannot accept additional enrollment.
2. **Given** an authenticated student attempts to enroll in a full class, **When** the system blocks the request, **Then** no enrollment is created and the student's schedule remains unchanged.

---

### User Story 4 - Preserve State When Enrollment Fails (Priority: P4)

As a student, I want the system to leave my schedule unchanged if enrollment fails due to a system problem so I can retry without worrying about partial changes.

**Source Artifacts**: [UC-17.md](/home/thaia/ECE493Group19/Use%20Cases/UC-17.md), [UC-17-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-17-AS.md), `AT-UC17-05`

**Why this priority**: State consistency matters for enrollment and fee handling when write operations fail after eligibility is confirmed.

**Independent Test**: Can be fully tested by forcing the enrollment update to fail and verifying the system reports the failure, suggests retrying, and leaves the schedule unchanged.

**Acceptance Scenarios**:

1. **Given** an authenticated eligible student selects enroll for an open class and an enrollment update error occurs, **When** the system attempts to create the enrollment, **Then** the system reports the failure, tells the student that no enrollment was created, and asks the student to retry after refreshing the schedule.
2. **Given** an authenticated eligible student encounters an enrollment system error, **When** the failure is reported, **Then** no partial enrollment appears on the schedule.
3. **Given** an authenticated student encounters a blocked or failed enrollment attempt, **When** the result message is shown, **Then** the system tells the student whether to choose a different class, resolve an eligibility issue, or retry after refreshing the schedule.

### Edge Cases

- What happens when a class becomes full after the student selected enroll but before enrollment is committed? The system blocks enrollment, leaves the schedule unchanged, and communicates that zero seats remain.
- What happens when multiple eligibility issues exist at the same time, such as a hold and unmet prerequisites? The system blocks enrollment and displays every blocking issue that prevents enrollment in a single result message.
- What happens when a schedule conflict is detected during eligibility checking? The system blocks enrollment as part of the core eligibility rules and identifies the conflicting class or time period.
- What happens when a student submits the same enrollment request more than once before the first result is returned? The system returns a single authoritative enrollment outcome and does not create duplicate enrollment records.
- What happens when schedule data changes between eligibility checking and enrollment commit? The system cancels the enrollment attempt, leaves the schedule unchanged, and tells the student to refresh before retrying.
- How does this story remain compliant with its mapped `UC-17` and `UC-17-AS` artifacts when requirements evolve? Any future change must continue to support successful enrollment, prerequisite failure, full-class failure, registration-hold failure, and system-error rollback behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow an authenticated student to enroll in a class the student has found through class search or catalog browsing within the registration experience.
- **FR-002**: Before completing enrollment, the system MUST check whether the student meets prerequisites, has any registration hold, has a schedule conflict, and whether the class has available capacity.
- **FR-003**: The system MUST create the enrollment only when all required eligibility checks pass.
- **FR-004**: After successful enrollment, the system MUST update the student's schedule to include the enrolled class.
- **FR-005**: After successful enrollment, the system MUST confirm the enrollment result by showing the class name, enrollment status, schedule placement, and fee assessment summary.
- **FR-006**: Schedule-conflict checks are part of the same eligibility rule set as prerequisites, holds, and capacity and MUST block self-service enrollment when a conflict exists.
- **FR-007**: If prerequisites are not met, the system MUST block enrollment and display the unmet prerequisite information.
- **FR-008**: If the class has no available seats, the system MUST block enrollment and display that zero seats remain and that enrollment cannot proceed.
- **FR-009**: If the student has a registration hold, the system MUST block enrollment and explain the hold.
- **FR-010**: If a schedule conflict is detected, the system MUST block enrollment and explain that the class conflicts with the student's current schedule.
- **FR-011**: Whenever enrollment is blocked by an eligibility rule, the system MUST leave the student's schedule unchanged.
- **FR-012**: If enrollment fails because of a system error after eligibility checks pass, the system MUST report the failure, state that no enrollment was created, and ask the student to retry after refreshing the schedule.
- **FR-013**: If enrollment fails because of a system error, the system MUST leave the student's schedule unchanged.
- **FR-014**: The system MUST prevent duplicate processing when the same enrollment request is submitted more than once before the first result completes.
- **FR-015**: This feature specification MUST remain traceable to [Use Cases/UC-17.md](/home/thaia/ECE493Group19/Use%20Cases/UC-17.md) and [Acceptance Tests/UC-17-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-17-AS.md).

### Non-Functional Requirements

- **NFR-001**: For at least 95% of enrollment attempts under up to 20 concurrent enrollment requests, the student MUST receive a success or blocked result within 1 second of selecting enroll.
- **NFR-002**: The enrollment confirmation, blocked-result, and system-error experiences MUST support keyboard-only navigation and expose status messages in a form that assistive technologies can announce.
- **NFR-003**: The system MUST retain an auditable record of each successful, blocked, and failed enrollment attempt, including the final outcome and blocking or failure reason.
- **NFR-004**: The terms `enrolled`, `blocked`, `retry after refreshing`, `registration hold`, `prerequisites`, `schedule conflict`, and `full class` MUST be used consistently across student-facing requirements and messages.

### Assumptions

- The student is already authenticated before starting the enrollment action.
- The class was already found through an existing search or catalog experience outside the scope of this feature.
- A class with available capacity has at least one enrollable seat when the system checks eligibility.
- Fee changes are communicated as part of the enrollment confirmation when the enrollment succeeds, and a no-change message is shown when enrollment adds no new fee impact.

### Dependencies

- The system depends on an existing class search or catalog-browse capability that provides the class offering selected for enrollment.
- The system depends on prerequisite, registration-hold, schedule, and capacity data being available at the time eligibility is evaluated.
- The system depends on fee-assessment data that can determine whether enrollment changes student charges or leaves charges unchanged.

### Key Entities *(include if feature involves data)*

- **Student**: The authenticated user attempting to enroll in a found class.
- **Class Offering**: A specific enrollable class instance with seat availability, prerequisite rules, and schedule details.
- **Enrollment Request**: The student's attempt to register for a class offering, subject to eligibility checks.
- **Eligibility Check Result**: The outcome of prerequisite, hold, capacity, and conflict evaluation used to allow or block enrollment.
- **Fee Assessment Change**: The financial impact communicated to the student after a successful enrollment.

### Traceability

| Requirement Area | Acceptance Coverage |
|--------|--------|
| `FR-001` to `FR-005` | `AT-UC17-01` |
| `FR-006` to `FR-007` | `AT-UC17-02` and eligibility-rule validation |
| `FR-008` | `AT-UC17-03` |
| `FR-009` | `AT-UC17-04` |
| `FR-010` to `FR-011` | Eligibility-rule unit validation and blocked-enrollment integration validation for schedule conflicts |
| `FR-012` to `FR-013` | `AT-UC17-05` |
| `FR-014` | Duplicate-request validation derived from enrollment state protection rules |
| `FR-015` | `AT-UC17-01` to `AT-UC17-05` |
| `NFR-001` | `SC-005` |
| `NFR-002` | Accessibility validation derived from enrollment confirmation and error flows |
| `NFR-003` | Audit validation derived from successful, blocked, and failed enrollment attempts |
| `NFR-004` | Terminology review across student-facing enrollment requirements |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of eligible students who select enroll for an open class are successfully added to the class and see the class on their schedule.
- **SC-002**: In acceptance testing, 100% of blocked enrollment attempts caused by unmet prerequisites, full classes, registration holds, or schedule conflicts leave the student's schedule unchanged.
- **SC-003**: In acceptance testing, 100% of blocked enrollment attempts present a reason that identifies the applicable blocking condition.
- **SC-004**: In acceptance testing, 100% of simulated system-error failures leave the student's schedule unchanged and tell the student to retry.
- **SC-005**: In scenario-based validation, at least 95% of students receive a final enrollment result within 1 second of selecting enroll under peak enrollment traffic of up to 20 concurrent requests.
