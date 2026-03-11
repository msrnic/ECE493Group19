# Feature Specification: Force Enroll Override

**Feature Branch**: `[001-force-enroll-override]`  
**Created**: 2026-03-06  
**Status**: Draft  
**Input**: User description: "1. Administrator opens a course offering management page. 2. Administrator selects a student and chooses Force Enroll. 3. System bypasses prerequisite checks but still checks hard constraints (e.g., identity, term validity). 4. System enrolls the student and updates schedule/capacity records. 5. System logs the override and confirms the forced enrollment. * **2a**: Student or offering does not exist. * 2a1: System rejects the request."

## Clarifications

### Session 2026-03-06

- Q: When an administrator uses Force Enroll, should the system allow enrollment if the course offering is already full? → A: Allow over-enrollment only after an extra explicit confirmation.
- Q: Should administrators be required to provide a reason when using Force Enroll? → A: Reason is required for every Force Enroll.
- Q: If a class is full, who can provide the final over-capacity confirmation? → A: The same authorized administrator who initiated Force Enroll confirms and completes it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Force Enroll Eligible Student (Priority: P1)

As an administrator, I can force enroll a selected student into a selected course offering so that exceptional enrollment requests can be completed without blocking on prerequisite validation.

**Traceability**: `Use Cases/UC-37.md`, `Acceptance Tests/UC-37-AS.md`

**Why this priority**: This is the primary business outcome of the feature and delivers immediate operational value to administrators.

**Independent Test**: Can be fully tested by submitting a force enrollment request where prerequisite checks would normally fail but all hard constraints are satisfied, then verifying enrollment, schedule/capacity updates, audit logging, and confirmation.

**Acceptance Scenarios**:

1. **Given** an administrator is managing a course offering and a selected student and offering both exist, **When** the administrator chooses Force Enroll and submits, **Then** the system bypasses prerequisite checks, validates hard constraints, enrolls the student, updates schedule/capacity records, logs the override, and shows a success confirmation.
2. **Given** a force enrollment request where prerequisite checks fail but hard constraints pass, **When** the request is submitted, **Then** the enrollment still succeeds and is marked as an override in the audit log.
3. **Given** the selected offering is already at capacity, **When** the administrator submits Force Enroll and provides the required additional over-capacity confirmation, **Then** the system completes enrollment and records that capacity was explicitly overridden.
4. **Given** an administrator submits Force Enroll without providing a reason, **When** the request is validated, **Then** the system rejects the request and prompts for the required reason.

---

### User Story 2 - Reject Invalid Force Enrollment Request (Priority: P2)

As an administrator, I receive a clear rejection when a force enrollment request targets a non-existent student or non-existent offering so that invalid requests do not create inconsistent records.

**Traceability**: `Use Cases/UC-37.md`, `Acceptance Tests/UC-37-AS.md`

**Why this priority**: Preventing invalid data creation is critical to preserving enrollment integrity and trust in administrative workflows.

**Independent Test**: Can be fully tested by submitting force enrollment requests with invalid student and offering identifiers and confirming request rejection with no enrollment changes.

**Acceptance Scenarios**:

1. **Given** the selected student does not exist, **When** the administrator submits Force Enroll, **Then** the system rejects the request, explains the failure, and makes no enrollment, schedule, capacity, or audit changes for a completed override.
2. **Given** the selected offering does not exist, **When** the administrator submits Force Enroll, **Then** the system rejects the request, explains the failure, and makes no enrollment, schedule, capacity, or audit changes for a completed override.

### Edge Cases

- Student is already enrolled in the selected offering.
- Offering exists but is not valid for the current/selected term.
- Enrollment would violate a non-overridable hard constraint (for example, enrollment status restrictions).
- Two administrators attempt to force enroll the same student into the same offering at nearly the same time.
- Offering is full and the administrator cancels or omits the additional over-capacity confirmation.
- Administrator attempts Force Enroll with a blank or missing reason.
- A request is partially processed and confirmation delivery fails; enrollment and audit state must remain consistent and recoverable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a Force Enroll action to authorized administrators from the course offering management workflow.
- **FR-002**: The system MUST require the administrator to select both a student and a course offering before submitting a force enrollment request.
- **FR-003**: When Force Enroll is requested, the system MUST bypass prerequisite validation rules for that enrollment attempt.
- **FR-004**: The system MUST validate hard constraints before creating enrollment, including student existence, student academic status eligibility, offering existence, offering term validity, and offering status eligibility.
- **FR-005**: If any hard constraint fails, the system MUST reject the force enrollment request and return an error response with `code`, `message`, and `details` fields.
- **FR-006**: If the selected student or selected offering does not exist, the system MUST reject the request and MUST NOT create or modify enrollment records.
- **FR-007**: On successful force enrollment, the system MUST create the enrollment record and update the student's schedule records.
- **FR-008**: On successful force enrollment, the system MUST update offering capacity usage to reflect the new enrollment.
- **FR-009**: The system MUST create an auditable override log entry for each successful force enrollment, including acting administrator, student, offering, timestamp, and reason code indicating prerequisite override.
- **FR-010**: The system MUST present an explicit success confirmation after a completed force enrollment.
- **FR-011**: The system MUST prevent duplicate enrollment of the same student in the same offering when processing force enrollment requests.
- **FR-012**: The system MUST keep enrollment, schedule, capacity, and override log state consistent so that either all success-side updates are applied together or none are applied.
- **FR-013**: If the selected offering is at capacity, the system MUST require an additional explicit over-capacity confirmation before completing a force enrollment.
- **FR-014**: If the selected offering is at capacity and the additional over-capacity confirmation is not provided, the system MUST reject the force enrollment request.
- **FR-015**: If enrollment is completed above capacity, the audit entry MUST indicate that an over-capacity override was explicitly confirmed.
- **FR-016**: The system MUST require administrators to provide a non-empty trimmed reason (10-500 characters) for every force enrollment request before processing.
- **FR-017**: If the reason is missing or violates length constraints, the system MUST reject the force enrollment request and return `VALIDATION_ERROR` with `code`, `message`, and `details.reason`.
- **FR-018**: For over-capacity force enrollment, final explicit confirmation MUST be performed by the same authorized administrator who initiated the request.

### Key Entities *(include if feature involves data)*

- **Student**: Learner record targeted by the force enrollment request; includes identity, status, and term eligibility context.
- **Course Offering**: Scheduled course instance receiving the enrollment; includes term, section identity, and capacity tracking context.
- **Enrollment**: Record linking student and course offering with enrollment state and source (forced override vs standard).
- **Override Audit Entry**: Immutable record of a successful force enrollment override with actor, target records, reason, and timestamp.

## Dependencies

- Existing administrator authorization controls are in place and can distinguish authorized users.
- Current student and course offering records are available at request time.
- Existing enrollment, schedule, and capacity records support immediate consistency checks after updates.

## Assumptions

- Force Enroll is only available to users with administrator privileges.
- Hard constraints are non-overridable and include identity and term validity at minimum.
- Capacity and schedule must still be updated as part of a successful force enrollment.
- Standard error messaging conventions for administrative workflows already exist and should be reused.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of submitted force enrollment requests for existing students and offerings that satisfy hard constraints result in successful enrollment completion and confirmation.
- **SC-002**: 100% of force enrollment requests with a non-existent student or offering are rejected without creating enrollment records.
- **SC-003**: 100% of successful force enrollments produce an override audit entry containing administrator, student, offering, and timestamp.
- **SC-004**: In user acceptance testing, at least 90% of administrators complete a force enrollment workflow in under 60 seconds.
