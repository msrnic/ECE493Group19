# Feature Specification: UC-25 Enroll in All Courses from a Chosen Schedule Option

**Feature Branch**: `[025-branch-enroll-all]`  
**Created**: 2026-03-11  
**Status**: Draft  
**Input**: User description: "UC-25 with corresponding acceptance tests in Acceptance Test folder and create a new branch. the naming convention of the branch is xxx-branch-feature and xxx is number from UC-XX"

## Clarifications

### Session 2026-03-11

- Q: What is the default batch-enrollment policy for UC-25? → A: Partial success is the default behavior; full-batch cancellation applies only when atomic enrollment policy is explicitly enabled.
- Q: What requirement gaps were closed during checklist review? → A: The enrollment summary must show each section's course code, section identifier, and outcome reason; safe partial success means unaffected sections may proceed only when they do not require rollback to preserve consistency; final-state consistency now distinguishes accepted partial completion from rollback-required failure; dependency outages or unusable enrollment inputs must return a failure state instead of partial enrollment.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enroll in a Selected Schedule Option (Priority: P1)

As a student, I want to enroll in all sections from one selected schedule option with one action so that enrollment is fast and consistent.

**Source Artifacts**: [UC-25.md](/home/thaia/ECE493Group19/Use%20Cases/UC-25.md), [UC-25-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-25-AS.md), `AT-UC25-01`

**Why this priority**: Bulk enrollment from a chosen schedule option is the core value of UC-25 and the minimum useful deliverable.

**Independent Test**: Can be fully tested by selecting a valid schedule option, choosing Enroll All, and confirming that all enrollable sections are added with a summary listing each section's course code, section identifier, and final outcome.

**Acceptance Scenarios**:

1. **Given** an authenticated student is eligible to enroll, enrollment is open, and a selected schedule option contains enrollable sections, **When** the student chooses Enroll All, **Then** the system attempts enrollment for every section in that selected schedule option and displays a summary of successful enrollments with each section's course code, section identifier, and final outcome.
2. **Given** the selected schedule option includes linked lecture, lab, or tutorial sections, **When** the student chooses Enroll All, **Then** the system treats those linked sections as part of the same batch request and reports each section outcome in the summary.

---

### User Story 2 - Report Section-Level Enrollment Failures Safely (Priority: P2)

As a student, I want clear reasons for any sections that fail during Enroll All so that I can understand what needs to change.

**Source Artifacts**: [UC-25.md](/home/thaia/ECE493Group19/Use%20Cases/UC-25.md), [UC-25-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-25-AS.md), `AT-UC25-02`, `AT-UC25-03`, `AT-UC25-04`

**Why this priority**: Section-level failures are common during registration and must be explained clearly without leaving the student uncertain about the resulting enrollment state.

**Independent Test**: Can be fully tested by selecting a schedule option where one section becomes full, one conflicts in real time, or one fails due to holds or prerequisites, then confirming the system reports exactly which sections failed, which sections still enrolled, and why.

**Acceptance Scenarios**:

1. **Given** one or more sections in the selected schedule option are full at enrollment time and atomic enrollment policy is not enabled, **When** the student chooses Enroll All, **Then** the system enrolls only unaffected sections that do not require rollback to preserve a consistent final state and reports the capacity failure for each affected section.
2. **Given** a real-time time conflict is detected at enrollment time, **When** the student chooses Enroll All, **Then** the system blocks the conflicting enrollment, preserves a consistent state, and reports the conflict reason.
3. **Given** one or more sections fail because of an active hold or unmet prerequisite and atomic enrollment policy is not enabled, **When** the student chooses Enroll All, **Then** the system rejects the affected sections, reports the reason for each failure, and allows only unaffected sections to proceed when doing so does not require rollback to preserve a consistent final state.

---

### User Story 3 - Preserve Consistent State During Batch Failure (Priority: P3)

As a student, I want the system to preserve a consistent enrollment state when batch enrollment hits a system error or atomic-enrollment cancellation so that I am not left with hidden partial changes.

**Source Artifacts**: [UC-25.md](/home/thaia/ECE493Group19/Use%20Cases/UC-25.md), [UC-25-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-25-AS.md), `AT-UC25-05`, `AT-UC25-06`

**Why this priority**: Consistency during batch failure is critical for trust and correctness, but it depends on the core batch-enrollment flow already being defined.

**Independent Test**: Can be fully tested by simulating a system error during batch enrollment and by enabling atomic enrollment policy for a batch with at least one failing section, then confirming the system preserves or restores a consistent final state and reports the outcome.

**Acceptance Scenarios**:

1. **Given** a system error occurs during Enroll All processing, **When** the batch request fails, **Then** the system rolls back partial enrollment where required to preserve consistency and reports the failure to the student.
2. **Given** atomic enrollment policy is enabled and at least one section in the selected schedule option fails validation or enrollment, **When** the student chooses Enroll All, **Then** the system cancels the entire batch, leaves the student's enrollment state unchanged, and reports the failing section and reason.

### Edge Cases

- What happens when the selected schedule option contains a mix of enrollable and non-enrollable sections? The system uses partial success by default, enrolls only the safe sections when atomic enrollment policy is not enabled, and reports each rejected section with its reason.
- What happens when a section becomes full between schedule generation and enrollment? The system reports the section as a capacity failure and preserves a consistent final state.
- What happens when a real-time conflict appears during enrollment even though the schedule option was previously conflict-free? The system blocks the conflicting section, reports the conflict, and preserves a consistent final state.
- What happens when a hold, prerequisite, or term rule blocks part of the batch? The system rejects the affected section or cancels the batch according to the active enrollment policy and reports the reason.
- What happens when atomic enrollment policy is enabled and one section fails? The system enrolls no sections from that request and reports that the batch was cancelled because atomic policy was active.
- What happens when a system error occurs after some tentative enrollment work has started? The system rolls back partial enrollment where required and reports failure without leaving the student in an unknown state.
- What happens when enrollment, holds/payment, or course data is unavailable or unusable at request time? The system returns a failure state for the batch request, performs no unsafe partial enrollment, and reports that the request could not be completed because required enrollment inputs were unavailable.
- How does this story remain compliant with its mapped `UC-25` and `UC-25-AS` artifacts when requirements evolve? Any future change must continue to support successful batch enrollment, section-level failure reporting, system-error consistency, and atomic rollback behavior when that policy is enabled.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow an authenticated and term-eligible student to choose Enroll All for one selected schedule option during an open enrollment period.
- **FR-002**: The system MUST validate enrollment eligibility for the selected schedule option before attempting section enrollment, including holds, prerequisites, and term rules relevant to the selected sections.
- **FR-003**: The system MUST attempt enrollment for each section in the selected schedule option, including linked lecture, lab, and tutorial sections when applicable.
- **FR-004**: After processing Enroll All, the system MUST display a summary that identifies each section by course code and section identifier, marks it as enrolled, rejected, blocked, or cancelled, and provides a user-visible reason for each non-success outcome.
- **FR-005**: When one or more sections are full at enrollment time and atomic enrollment policy is not enabled, the system MUST report each capacity failure and MUST enroll remaining sections only when those unaffected sections can complete without requiring rollback to preserve a consistent final state.
- **FR-006**: When real-time enrollment conflicts are detected, the system MUST prevent conflicting enrollments, report the conflict reason, and preserve a consistent final enrollment state.
- **FR-007**: When holds, prerequisites, or other eligibility rules block one or more sections and atomic enrollment policy is not enabled, the system MUST reject the affected sections, report the reason for each failure, and allow other sections to proceed only when doing so does not require rollback to preserve a consistent final state.
- **FR-008**: When a system error occurs during batch enrollment, or when required enrollment, holds/payment, or course data becomes unavailable or unusable during the request, the system MUST roll back partial enrollment where required to preserve consistency and MUST report batch failure to the student.
- **FR-009**: When atomic enrollment policy is enabled and any section in the selected schedule option fails validation or enrollment, the system MUST cancel the entire batch and leave the student's enrollment state unchanged from before the request.
- **FR-010**: The system MUST treat the selected schedule option as the only scope of the Enroll All request and MUST NOT alter sections outside that selected option.
- **FR-011**: Every user story in this specification MUST remain traceable to [UC-25.md](/home/thaia/ECE493Group19/Use%20Cases/UC-25.md) and [UC-25-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-25-AS.md).

### Non-Functional Requirements

- **NFR-001**: In normal operating conditions, the system MUST display a final enrollment summary or failure state for Enroll All within 10 seconds after the student submits the request.
- **NFR-002**: The system MUST present enrollment summaries, failure reasons, and cancellation messages in a keyboard-accessible and screen-reader-readable form.
- **NFR-003**: The system MUST ensure that only the authenticated student can submit and view Enroll All results for that student's own selected schedule option.

### Assumptions

- The student is already authenticated before entering the protected enrollment flow.
- A selected schedule option already exists and contains specific section selections.
- The default enrollment policy for this feature is partial success when safe, and atomic cancellation applies only when atomic enrollment policy is explicitly enabled.
- Waitlist behavior is out of scope for this feature.

### Dependencies

- The system depends on an open enrollment period for the relevant term.
- The system depends on enrollment, payment/holds, and course catalog data being available and usable at request time; otherwise the batch must end in a reported failure state.
- The system depends on the selected schedule option containing concrete section selections rather than abstract course placeholders.

### Key Entities *(include if feature involves data)*

- **Selected Schedule Option**: The student-chosen schedule option that contains the exact sections targeted by Enroll All.
- **Enrollment Batch Request**: One Enroll All submission covering all sections in the selected schedule option under the active enrollment policy.
- **Section Enrollment Outcome**: The per-section result showing whether the section was enrolled, rejected, blocked, or cancelled, along with the reason.
- **Batch Enrollment Summary**: The user-visible final result that summarizes all section outcomes, including course code, section identifier, outcome status, and reason, and states whether the batch completed partially, completely, or not at all.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of valid Enroll All requests add all enrollable sections from the selected schedule option and display a summary of enrollments.
- **SC-002**: In acceptance testing, 100% of section-full, real-time-conflict, and holds-or-prerequisites scenarios report the affected section and reason while preserving a consistent final state.
- **SC-003**: In acceptance testing, 100% of system-error scenarios preserve or restore a consistent enrollment state and report failure to the student.
- **SC-004**: In acceptance testing, 100% of atomic-policy scenarios cancel the full batch and leave the student's enrollment state unchanged when any section fails.
- **SC-005**: In normal operating conditions, at least 95% of Enroll All requests display a final summary or failure state within 10 seconds.
