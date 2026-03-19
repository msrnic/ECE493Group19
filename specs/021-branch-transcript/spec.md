# Feature Specification: UC-21 View My Transcript

**Feature Branch**: `[021-branch-transcript]`  
**Created**: 2026-03-11  
**Status**: Draft  
**Input**: User description: "UC-21 with corresponding acceptance tests in Acceptance Test folder and create a new branch. the naming convention of the branch is xxx-branch-feature and xxx is number from UC-XX"

## Clarifications

### Session 2026-03-11

- Q: How should the system handle full transcript-source unavailability? → A: Use a distinct unavailable state separate from partial and empty transcript states.
- Q: What minimum details must be recorded for denied transcript access attempts? → A: Record requesting identity, attempted target identity when known, timestamp, and denial reason.
- Q: How specific should missing-data indicators be for partial transcript results? → A: Show a page-level missing-data indicator and identify the affected term or transcript entry when known.
- Q: What additional requirement gaps should be resolved from the transcript checklist review? → A: Define authorized self-only access explicitly, treat direct-link transcript access as unauthorized when applicable, require retry-later behavior for unavailable state, and make the 2-second visible-content target measurable per transcript state.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Full Transcript (Priority: P1)

As a student, I want to open my transcript and review my full academic record so I can confirm my completed coursework and results in one place.

**Source Artifacts**: [UC-21.md](/home/thaia/ECE493Group19/Use%20Cases/UC-21.md), [UC-21-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-21-AS.md), `AT-UC21-01`

**Why this priority**: This is the primary outcome of UC-21 and the minimum user value the feature must deliver.

**Independent Test**: Can be fully tested by signing in as an authorized student with a complete transcript and verifying the student can open and review only their own transcript.

**Acceptance Scenarios**:

1. **Given** a student has a valid account and a complete transcript is available, **When** the student selects `View my transcript` from the dashboard, **Then** the system displays that student's transcript.
2. **Given** a complete transcript is displayed for an authorized student, **When** the student reviews the page, **Then** the transcript is grouped by academic term and shows only that student's transcript entries with the expected academic details for each available entry.

---

### User Story 2 - View Available Transcript When Data Is Incomplete (Priority: P2)

As a student, I want to see the available parts of my transcript when some data cannot be retrieved so I can still use what the system can provide.

**Source Artifacts**: [UC-21.md](/home/thaia/ECE493Group19/Use%20Cases/UC-21.md), [UC-21-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-21-AS.md), `AT-UC21-02`

**Why this priority**: Partial transcript access preserves student self-service when some information is temporarily unavailable, but it builds on the core viewing flow.

**Independent Test**: Can be fully tested by signing in as an authorized student with incomplete transcript data and verifying the system shows the available entries and identifies what is missing.

**Acceptance Scenarios**:

1. **Given** a student is authorized to view a transcript and some transcript data is unavailable, **When** the student selects `View my transcript`, **Then** the system displays the available portion of the transcript.
2. **Given** only part of the student's transcript is available, **When** the system displays the results, **Then** the system clearly indicates at the page level that some terms, grades, or transcript entries are missing or unavailable and identifies the affected term or transcript entry when that detail is known.

---

### User Story 3 - Block Unauthorized Transcript Access (Priority: P3)

As the institution, I want transcript access restricted to authorized viewers so a student's academic record is not exposed to the wrong person.

**Source Artifacts**: [UC-21.md](/home/thaia/ECE493Group19/Use%20Cases/UC-21.md), [UC-21-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-21-AS.md), `AT-UC21-03`

**Why this priority**: Transcript privacy is mandatory, but it depends on the same viewing flow established for authorized students.

**Independent Test**: Can be fully tested by attempting to access transcript data through an authenticated but unauthorized session and verifying access is denied and the attempt is recorded.

**Acceptance Scenarios**:

1. **Given** an authenticated actor is not authorized to view the requested transcript, **When** the actor attempts to access the transcript view, **Then** the system denies access and does not display transcript data.
2. **Given** an unauthorized transcript access attempt occurs, **When** the system blocks the request, **Then** the system records the authorization failure for later review.

### Edge Cases

- What happens when a student has no transcript entries yet? The system shows a dedicated no-transcript-yet message and does not display placeholder rows.
- What happens when some terms or grades cannot be retrieved? The system shows the available transcript entries and identifies the missing or unavailable portions.
- What happens when all transcript data is temporarily unavailable? The system shows a distinct unavailable-state message rather than presenting the result as an empty transcript.
- What happens when a student attempts to access another student's transcript through a direct link or manipulated navigation path? The system denies access and records the failed authorization attempt.
- What happens when a signed-in account is authenticated but lacks self-service permission to view the requested transcript? The system treats the request as unauthorized and follows the same denial and logging requirements.
- What happens when the same student opens the transcript multiple times in one session? The system consistently returns the same authorized read-only view without altering transcript data.
- How does this story remain compliant with its mapped `UC-21` and `UC-21-AS` artifacts when requirements evolve? Any future change must continue to support transcript viewing, incomplete-data handling, and unauthorized-access denial.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a signed-in student to open the `View my transcript` function from the dashboard.
- **FR-002**: The system MUST retrieve and display the requesting student's own transcript when that student is authorized to view it.
- **FR-003**: The system MUST present transcript entries grouped by academic term and MUST show, for each available entry, the academic term, course identifier, course title, credits, and final grade or equivalent result when available; equivalent result means a bounded non-grade academic outcome such as pass, fail, withdrawal, or transfer credit.
- **FR-004**: The system MUST ensure that only the authorized student can view that student's transcript; for this feature, authorized means a signed-in student accessing only that student's own self-service transcript, and staff, proxy, or other viewer roles are out of scope unless explicitly added by a future feature.
- **FR-005**: If some transcript entries or transcript fields are unavailable or incomplete, the system MUST display the available transcript entries and clearly indicate that some information is missing or unavailable, while `FR-005a` defines the required missing-data indicator detail for partial transcript results.
- **FR-005a**: When transcript data is partially unavailable, the system MUST show a page-level missing-data indicator and identify the affected term or transcript entry when that detail is known.
- **FR-006**: If the student has no transcript entries, the system MUST show a dedicated no-transcript-yet message and MUST NOT show placeholder transcript rows.
- **FR-006a**: If no transcript data can be retrieved because the transcript source is temporarily unavailable, the system MUST show a distinct unavailable-state message, allow the student to retry later through the same transcript entry point, and MUST NOT present the result as either an empty transcript or a partial transcript.
- **FR-007**: If the actor is not authorized to view the requested transcript, including direct-link access, manipulated navigation paths, or signed-in accounts without self-service transcript permission, the system MUST deny access and MUST NOT display transcript data.
- **FR-008**: The system MUST record each denied transcript access attempt for audit or security review, including the requesting identity, attempted target identity when known, timestamp, and denial reason.
- **FR-009**: Viewing a transcript MUST be read-only and MUST NOT alter transcript data or related student academic records.
- **FR-010**: The feature specification MUST remain traceable to [UC-21.md](/home/thaia/ECE493Group19/Use%20Cases/UC-21.md) and [UC-21-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-21-AS.md).

### Non-Functional Requirements

- **NFR-001**: Transcript views, including full, partial, empty, unavailable, and denied states, MUST support keyboard-only navigation and provide headings, missing-data indicators, and state messages in text that assistive technologies can announce.
- **NFR-002**: Transcript viewing MUST preserve student privacy by ensuring that no view state exposes another student's transcript details.
- **NFR-003**: In normal operating conditions, at least 95% of authorized students MUST be able to reach the transcript page within 30 seconds of selecting `View my transcript` from the dashboard.
- **NFR-004**: In normal operating conditions, at least 95% of transcript page loads MUST render the first state-appropriate user-visible content within 2 seconds after the transcript view is requested. State-appropriate content means the first transcript term group for full or partial states, the dedicated no-transcript-yet message for the empty state, the unavailable-state message for the unavailable state, or the denied-access message for the denied state.

### Assumptions

- Students are already authenticated before attempting to view a transcript.
- Transcript data already exists in institutional academic records outside the scope of this feature.
- Staff and proxy access patterns are outside the scope of UC-21 unless introduced by a separate feature.
- Transcript viewing remains read-only for all supported scenarios in this feature.

### Dependencies

- The system depends on student identity and authorization status being available when a transcript is requested.
- The system depends on transcript records being retrievable from existing academic record sources.
- The system depends on audit or security review capabilities being available for denied access events.

### Key Entities *(include if feature involves data)*

- **Student Account**: The student identity used to determine whether the requester may view a specific transcript.
- **Transcript Entry**: An academic record entry associated with one student, including academic term, course identifier, course title, credits, and final grade or equivalent result when available.
- **Transcript View**: The student-facing presentation of transcript results in one of five states: full, partial, empty, unavailable, or denied.
- **Authorization Failure Record**: A record of a denied attempt to access transcript data without proper authorization.

### Traceability

| Requirement Area | Story / Acceptance Coverage |
|--------|--------|
| `FR-001` to `FR-004` | User Story 1, `AT-UC21-01` |
| `FR-005` to `FR-006a` | User Story 2, `AT-UC21-02` |
| `FR-007` to `FR-008` | User Story 3, `AT-UC21-03` |
| `FR-009` | User Stories 1-3, read-only expectation across `AT-UC21-01` to `AT-UC21-03` |
| `FR-010` | `UC-21.md`, `UC-21-AS.md`, `AT-UC21-01` to `AT-UC21-03` |
| `NFR-001` | Accessibility review across transcript view states |
| `NFR-002` | Privacy validation across authorized and denied-access scenarios |
| `NFR-003` to `NFR-004` | Transcript responsiveness validation |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of authorized students with available transcript data can open and view only their own transcript.
- **SC-002**: In acceptance testing, 100% of incomplete-transcript scenarios show the available entries and clearly indicate that some information is missing or unavailable.
- **SC-003**: In acceptance testing, 100% of unauthorized transcript access attempts are denied and recorded.
- **SC-004**: In scenario-based validation, at least 95% of authorized students can reach the transcript page within 30 seconds of selecting `View my transcript` from the dashboard.
- **SC-005**: In scenario-based validation, at least 90% of authorized students can correctly identify whether they are viewing a full, partial, or empty transcript on first review.
- **SC-006**: In scenario-based validation, at least 95% of transcript page loads present their first state-appropriate user-visible content within 2 seconds after the transcript view is requested.
