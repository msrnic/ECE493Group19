# Feature Specification: UC-24 Warn About Time Conflicts in Candidate Schedules

**Feature Branch**: `[024-branch-conflict-warnings]`  
**Created**: 2026-03-11  
**Status**: Draft  
**Input**: User description: "UC-24 with corresponding acceptance tests in Acceptance Test folder and create a new branch. the naming convention of the branch is xxx-branch-feature and xxx is number from UC-XX"

## Clarifications

### Session 2026-03-11

- Q: How should time conflicts be defined for UC-24? → A: A conflict exists only when scheduled meeting times overlap; back-to-back meetings are not conflicts.
- Q: What requirement gaps were closed during checklist review? → A: Conflict analysis applies to one selected candidate schedule at a time; conflict warnings must show course code, section, and overlap details; unavailable analysis requires retry-later messaging without a dedicated retry control; accessibility, privacy, and 2-second result-display requirements are now explicit.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Detect Conflicts in a Candidate Schedule (Priority: P1)

As a student, I want the system to identify time conflicts in a candidate schedule so I can avoid building an impossible timetable.

**Source Artifacts**: [UC-24.md](/home/thaia/ECE493Group19/Use%20Cases/UC-24.md), [UC-24-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-24-AS.md), `AT-UC24-01`

**Why this priority**: Conflict detection is the primary value of UC-24 and is the minimum useful outcome for the feature.

**Independent Test**: Can be fully tested by selecting one generated candidate schedule with overlapping sections, requesting conflict analysis, and confirming each overlap is identified with clear warnings naming the conflicting course codes, section identifiers, and overlapping meeting times.

**Acceptance Scenarios**:

1. **Given** an authenticated student has generated a candidate schedule with overlapping meeting times, **When** the student requests conflict analysis for that schedule, **Then** the system identifies every detected overlap and displays a warning for each conflict.
2. **Given** conflict warnings are displayed for a candidate schedule, **When** the student reviews the analysis, **Then** each warning names the conflicting course codes, section identifiers, and overlapping meeting-time window and allows the student to decide whether to modify selections or constraints and re-generate.

---

### User Story 2 - Confirm When a Schedule Is Conflict-Free (Priority: P2)

As a student, I want the system to tell me when a candidate schedule has no conflicts so I can proceed with confidence.

**Source Artifacts**: [UC-24.md](/home/thaia/ECE493Group19/Use%20Cases/UC-24.md), [UC-24-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-24-AS.md), `AT-UC24-02`

**Why this priority**: Positive confirmation improves trust in the analysis, but it depends on the same conflict-detection workflow established by the primary story.

**Independent Test**: Can be fully tested by selecting one generated conflict-free schedule, requesting analysis, and confirming the system explicitly reports that the schedule is conflict-free.

**Acceptance Scenarios**:

1. **Given** an authenticated student has generated a candidate schedule with no overlapping meeting times, **When** the student requests conflict analysis, **Then** the system indicates that the schedule is conflict-free.

---

### User Story 3 - Handle Incomplete or Unavailable Conflict Analysis (Priority: P3)

As a student, I want clear guidance when conflict analysis cannot be completed so I understand whether I need to retry later or review uncertain schedule components.

**Source Artifacts**: [UC-24.md](/home/thaia/ECE493Group19/Use%20Cases/UC-24.md), [UC-24-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-24-AS.md), `AT-UC24-03`, `AT-UC24-04`

**Why this priority**: Incomplete-analysis and unavailable-data handling is important for trust, but it depends on the primary analysis flow already being defined.

**Independent Test**: Can be fully tested once with one selected candidate schedule containing unknown or partial meeting times and once with timetable data unavailable after schedule generation, confirming the system flags incomplete analysis or blocks conflict checking with retry-later guidance.

**Acceptance Scenarios**:

1. **Given** a candidate schedule contains one or more components with unknown, TBA, or partial meeting times, **When** the student requests conflict analysis, **Then** the system flags those components and indicates that conflict evaluation is incomplete for them.
2. **Given** timetable data required for conflict analysis is unavailable, **When** the student requests conflict analysis, **Then** the system reports that conflict checking cannot be completed and suggests retrying later without leaving the planning state inconsistent.

### Edge Cases

- What happens when a candidate schedule contains exactly one course component? The system reports the schedule as conflict-free if no overlap can exist.
- What happens when multiple conflicts exist within the same candidate schedule? The system displays a separate warning for each detected conflict.
- What happens when meeting times touch without overlapping, such as one class ending exactly when another begins? The system treats the schedule as conflict-free unless meeting times overlap.
- What happens when one or more components have unknown, TBA, or partial meeting times? The system flags those components and reports that conflict analysis is incomplete for them.
- What happens when timetable data needed for conflict analysis is unavailable? The system reports that conflict checking cannot be completed and suggests retrying later.
- What happens when timetable data becomes unavailable after candidate schedules have already been generated? The system treats the request as unavailable analysis, does not present a misleading conflict-free result, and instructs the student to retry later.
- What happens when the student changes course selections or constraints after reviewing warnings? The student can re-generate schedules and request a new conflict analysis.
- How does this story remain compliant with its mapped `UC-24` and `UC-24-AS` artifacts when requirements evolve? Any future change must continue to support detected conflicts, conflict-free confirmation, incomplete-analysis warnings, and unavailable-data handling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow an authenticated student to request conflict analysis for one selected generated candidate schedule in an available scheduling term.
- **FR-002**: The system MUST evaluate all scheduled meeting times in the candidate schedule and detect conflicts only when meeting times overlap. Meetings that touch without overlap, such as one class ending exactly when another begins, are not conflicts in this feature.
- **FR-003**: For each detected conflict, the system MUST display a separate warning that identifies the conflicting course code, section identifier, and overlapping meeting-time window for the conflicting components.
- **FR-004**: If no conflicts are found, the system MUST explicitly indicate that the candidate schedule is conflict-free.
- **FR-005**: If one or more schedule components have unknown, TBA, or partial meeting times, the system MUST flag those components and indicate that conflict analysis is incomplete for them.
- **FR-006**: If timetable data required for conflict analysis is unavailable, including after schedules have already been generated, the system MUST report that conflict checking cannot be completed, present retry-later guidance as user-visible messaging, and avoid implying that a dedicated retry control is guaranteed by this feature.
- **FR-007**: Conflict analysis in this feature MUST be advisory only and MUST NOT enroll, drop, reserve, or otherwise change the student's registration state.
- **FR-008**: The student MUST be able to request a new conflict analysis after changing course selections or constraints and re-generating schedules.
- **FR-009**: Every user story in this specification MUST remain traceable to [UC-24.md](/home/thaia/ECE493Group19/Use%20Cases/UC-24.md) and [UC-24-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-24-AS.md).

### Non-Functional Requirements

- **NFR-001**: In normal operating conditions, the system MUST display the conflict-analysis result for the selected candidate schedule within 2 seconds after the student requests analysis.
- **NFR-002**: The system MUST present conflict warnings, conflict-free confirmations, incomplete-analysis messages, and unavailable-analysis messages in a keyboard-accessible and screen-reader-readable form.
- **NFR-003**: The system MUST ensure that only the authenticated student can inspect conflict analysis for that student's own candidate schedules.

### Assumptions

- Students are already authenticated before entering the protected schedule-analysis flow.
- Candidate schedules already exist before conflict analysis is requested.
- Conflict detection is based on overlapping scheduled meeting times only; non-overlapping back-to-back meetings are not treated as conflicts.
- Unknown or partial meeting times are treated as incomplete analysis rather than confirmed conflicts.

### Dependencies

- The system depends on an available scheduling term.
- The system depends on generated candidate schedules with course components and meeting-time data.
- The system depends on timetable data being available for the selected term when conflict analysis is requested.

### Key Entities *(include if feature involves data)*

- **Candidate Schedule**: A generated schedule option that the student can inspect for conflicts.
- **Meeting Component**: A scheduled class component with course identity, section identity, and meeting-time information.
- **Conflict Warning**: A user-visible warning identifying a pair or set of meeting components whose scheduled meeting times overlap, including the course code, section identifier, and overlapping meeting-time window.
- **Conflict Analysis Outcome**: The user-visible result stating whether the schedule is conflict-free, contains conflicts, is incomplete, or could not be analyzed. This outcome is computed for display during the request and does not require separate persisted result records for this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of candidate schedules with overlapping meeting times display warnings for all detected conflicts.
- **SC-002**: In acceptance testing, 100% of conflict-free candidate schedules explicitly display a conflict-free confirmation.
- **SC-003**: In acceptance testing, 100% of schedules containing unknown, TBA, or partial meeting times flag the affected components and indicate incomplete analysis.
- **SC-004**: In acceptance testing, 100% of timetable-data-unavailable scenarios report that conflict checking cannot be completed and suggest retrying later.
- **SC-005**: In normal operating conditions, 95% of conflict-analysis requests display a result state for the selected candidate schedule within 2 seconds.
- **SC-006**: In review against accessibility requirements, 100% of conflict-analysis states provide keyboard-accessible and screen-reader-readable messaging.
