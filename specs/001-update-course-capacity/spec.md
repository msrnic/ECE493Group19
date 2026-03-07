# Feature Specification: Update Course Capacity

**Feature Branch**: `001-update-course-capacity`  
**Created**: 2026-03-06  
**Status**: Draft  
**Input**: User description: "1. Administrator opens a course offering. 2. Administrator edits the capacity value and submits. 3. System validates the new capacity against current enrollment. 4. System updates capacity and recalculates remaining seats. 5. System confirms the update. * **3a**: New capacity is below current enrollment. * 3a1: System rejects the change or requires a special override per policy. * **4a**: Update fails. * 4a1: System leaves capacity unchanged and reports failure."

## Clarifications

### Session 2026-03-06

- Q: How should the system handle concurrent capacity edits by multiple administrators? → A: Reject stale submissions and require reload/resubmit.
- Q: Should override approval be handled inside this feature or externally? → A: This feature includes requesting and approving overrides end-to-end.
- Q: Who can approve a below-enrollment override? → A: The requesting administrator can self-approve.
- Q: How long should override audit records be retained? → A: Retain override audit records for 7 years.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Update Capacity Successfully (Priority: P1)

An administrator updates the enrollment capacity of an existing course offering and receives confirmation when the change is valid.

**Why this priority**: Accurate capacity drives enrollment availability and must work for normal administrative operations.

**Independent Test**: Can be fully tested by opening an offering with active enrollment, submitting a valid higher capacity, and verifying that capacity and remaining seats update correctly.

**Source Mapping**: `Use Cases/UC-40.md`, `Acceptance Tests/UC-40-AS.md`

**Acceptance Scenarios**:

1. **Given** an administrator is viewing a course offering with capacity 40 and enrollment 35, **When** the administrator submits a new capacity of 50, **Then** the system saves 50 as capacity, recalculates remaining seats to 15, and shows a success confirmation.
2. **Given** an administrator has permission to edit offerings, **When** the administrator submits a valid capacity change, **Then** the updated capacity is reflected when the offering is re-opened.

---

### User Story 2 - Prevent Invalid Capacity Reduction (Priority: P2)

An administrator is prevented from setting capacity below current enrollment unless policy allows an approved override.

**Why this priority**: Prevents inconsistent enrollment states and enforces institutional policy.

**Independent Test**: Can be fully tested by submitting a capacity below enrollment and verifying either rejection or an override path based on policy.

**Source Mapping**: `Use Cases/UC-40.md`, `Acceptance Tests/UC-40-AS.md`

**Acceptance Scenarios**:

1. **Given** a course offering has 35 enrolled students, **When** an administrator submits a new capacity of 30 without override authority, **Then** the system rejects the update and keeps capacity unchanged.
2. **Given** a course offering has 35 enrolled students and policy allows a privileged override, **When** an authorized administrator submits a new capacity of 30 with override approval, **Then** the system records the approved exception and applies the update.
3. **Given** a course offering has 35 enrolled students and no prior override approval exists, **When** the administrator requests an override during submission and self-approves per policy, **Then** the system applies the new capacity and records request and approval details.

---

### User Story 3 - Handle Update Failures Safely (Priority: P3)

An administrator receives a clear failure result if the capacity update process cannot be completed, and the original capacity remains intact.

**Why this priority**: Preserves data integrity and reduces administrative confusion during system or transaction failures.

**Independent Test**: Can be fully tested by simulating an update failure after submission and verifying that no partial update is saved.

**Source Mapping**: `Use Cases/UC-40.md`, `Acceptance Tests/UC-40-AS.md`

**Acceptance Scenarios**:

1. **Given** an administrator submits a valid capacity update, **When** the update operation fails before completion, **Then** the system keeps the original capacity and shows a failure message.
2. **Given** a failed update attempt, **When** the administrator reloads the offering, **Then** the original capacity and remaining seats are unchanged.

### Edge Cases

- New capacity equals current enrollment, resulting in zero remaining seats.
- New capacity is unchanged from the current value, resulting in no effective update.
- Submitted capacity is blank, non-numeric, zero, or negative.
- Two administrators edit the same offering at nearly the same time.
- If the offering changes after an administrator opens it, a stale submission must be rejected and the administrator must reload before resubmitting.
- Policy disallows self-approval for the submitting administrator.
- The system detects a failure after validation but before final save confirmation.
- Any requirement change must maintain alignment with `Use Cases/UC-40.md` and `Acceptance Tests/UC-40-AS.md`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow an administrator to open an existing course offering and view current capacity, current enrollment, and remaining seats before editing.
- **FR-002**: System MUST allow an administrator to submit a new capacity value for a selected course offering.
- **FR-003**: System MUST validate that submitted capacity is a positive whole number before applying any update.
- **FR-004**: System MUST validate submitted capacity against current enrollment at submission time.
- **FR-005**: If submitted capacity is less than current enrollment and no policy-compliant override is provided, the system MUST reject the change and keep existing capacity unchanged.
- **FR-006**: If submitted capacity is less than current enrollment and a policy-compliant override is approved within this feature workflow, the system MUST allow the change and record that an override was used.
- **FR-014**: System MUST provide an in-feature override workflow for below-enrollment capacity changes, including override request submission, approver decision capture, and final decision notification.
- **FR-015**: System MUST permit the requesting administrator to approve their own below-enrollment override request when policy allows and MUST record requester and approver identities.
- **FR-016**: System MUST retain override request and approval audit records for 7 years from approval date.
- **FR-007**: On any accepted change, system MUST recalculate remaining seats as `capacity - current enrollment` and persist both updated capacity and recalculated remaining seats as one completed update.
- **FR-008**: On update failure, system MUST leave capacity and remaining seats unchanged and present a failure message to the administrator.
- **FR-009**: On successful update, system MUST present a success confirmation that includes the updated capacity and remaining seats.
- **FR-013**: If the course offering has changed since the administrator opened it, system MUST reject the stale submission, preserve current stored values, and require the administrator to reload before resubmitting.
- **FR-010**: The feature specification and acceptance coverage MUST remain aligned with `Use Cases/UC-40.md` and `Acceptance Tests/UC-40-AS.md`.
- **FR-011**: Feature work MUST NOT edit `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md` without explicit project authorization.
- **FR-012**: Feature implementation MUST comply with applicable standards in the `Style Guides/` directory.

### Key Entities *(include if feature involves data)*

- **Course Offering**: A scheduled class instance with attributes including offering identifier, capacity, current enrollment count, and remaining seats.
- **Capacity Update Request**: A submitted change containing target offering, proposed capacity, submitting administrator, submission timestamp, and optional override reference.
- **Override Authorization**: A policy-governed approval record indicating who approved an exception, when it was approved, and why it was allowed.
- **Update Result**: An outcome record that indicates success or failure and includes the message shown to the administrator.

### Assumptions

- Current enrollment count is authoritative at the moment validation occurs.
- Override behavior is policy-driven and executed through this feature's request/approval workflow, including self-approval where permitted.
- Remaining seats cannot be negative after a completed update.
- Administrators are already authenticated and authorized to access offering management.

### Dependencies

- Availability of policy rules that define when self-approval is permitted.
- Availability of current enrollment data for the selected offering.
- Existing administrator offering-management workflow where capacity edits are initiated.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of valid capacity updates are completed and confirmed to administrators within 10 seconds.
- **SC-002**: 100% of rejected below-enrollment updates without approved override leave stored capacity unchanged.
- **SC-003**: 100% of failed update attempts preserve the pre-update capacity and remaining seats.
- **SC-004**: In user acceptance testing, at least 90% of administrators complete a capacity update on first attempt without assistance.
